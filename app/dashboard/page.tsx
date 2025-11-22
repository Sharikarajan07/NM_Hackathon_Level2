'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Calendar, Download, QrCode, Ticket, User, Plus, Loader2, Bell } from 'lucide-react'
import { registrationApi, ticketsApi, eventsApi } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { QRCodeSVG } from 'qrcode.react'

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('')
  const [tickets, setTickets] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [eventsMap, setEventsMap] = useState<{[key: string]: any}>({})
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userId = localStorage.getItem('userId')
    
    if (!token) {
      router.push('/login')
      return
    }

    if (!userId) {
      console.error('User ID not found in localStorage')
      router.push('/login')
      return
    }

    const name = localStorage.getItem('userName') || 'User'
    const email = localStorage.getItem('userEmail') || ''
    const role = localStorage.getItem('userRole') || 'USER'
    
    setUserName(name)
    setUserEmail(email)
    setUserRole(role)
    
    loadUserData(userId)
  }, [router])

  const loadUserData = async (userId: string) => {
    try {
      setLoading(true)
      
      const [userRegs, userTickets] = await Promise.all([
        registrationApi.getUserRegistrations(userId),
        ticketsApi.getUserTickets(userId)
      ]) as [any[], any[]]
      
      setRegistrations(userRegs)
      setTickets(userTickets)
      
      const eventIds = [...new Set([...userRegs.map((r: any) => r.eventId), ...userTickets.map((t: any) => t.eventId)])]
      const events = await Promise.all(eventIds.map(id => eventsApi.getById(id.toString())))
      
      const eventsMapping: {[key: string]: any} = {}
      events.forEach((event: any) => {
        eventsMapping[event.id] = event
      })
      setEventsMap(eventsMapping)
      
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getShortTicketNumber = (ticketNumber: string) => {
    return ticketNumber.substring(0, 8).toUpperCase()
  }

  // Group tickets by event
  const groupedTickets = tickets.reduce((acc, ticket) => {
    const eventId = ticket.eventId
    if (!acc[eventId]) {
      acc[eventId] = []
    }
    acc[eventId].push(ticket)
    return acc
  }, {} as { [key: string]: any[] })

  const groupedTicketsList = Object.entries(groupedTickets).map(([eventId, eventTickets]) => ({
    eventId,
    tickets: eventTickets as any[],
    count: (eventTickets as any[]).length,
    firstTicket: (eventTickets as any[])[0]
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'used':
        return 'outline'
      default:
        return 'default'
    }
  }

  const handleViewQRCode = (ticket: any) => {
    setSelectedTicket(ticket)
    setQrDialogOpen(true)
  }

  const generateTicketQRData = (ticket: any) => {
    // Encode ticket and event data in URL for offline validation
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : 'http://localhost:3000'
    
    const event = eventsMap[ticket.eventId]
    const ticketData = {
      tn: ticket.ticketNumber,
      ei: ticket.eventId,
      et: event?.title || 'Event',
      ed: event?.startDate || '',
      el: event?.location || '',
      s: ticket.status,
      p: ticket.price || 0,
      ui: ticket.userId
    }
    
    // Encode data as base64 to keep URL clean
    const encoded = btoa(JSON.stringify(ticketData))
    return `${baseUrl}/validate/${ticket.ticketNumber}?d=${encoded}`
  }

  const handleDownloadTicket = async (ticket: any, ticketCount: number = 1) => {
    try {
      const event = eventsMap[ticket.eventId]
      
      // Generate short professional ticket number
      const shortTicketNumber = ticket.ticketNumber.substring(0, 8).toUpperCase()
      
      // Format date and time
      const eventDate = event ? new Date(event.startDate) : new Date()
      const formattedDate = eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      
      const ticketHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Ticket - ${event?.title || 'Event'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: 'Segoe UI', 'Arial', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ticket-container {
      background: white;
      max-width: 900px;
      width: 100%;
      border-radius: 24px;
      box-shadow: 0 25px 70px rgba(0,0,0,0.35);
      overflow: hidden;
      position: relative;
    }
    
    .ticket-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 45px 50px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .ticket-header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 3s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .ticket-title {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 3px;
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
      text-transform: uppercase;
    }
    
    .ticket-subtitle {
      font-size: 16px;
      font-weight: 300;
      letter-spacing: 2px;
      opacity: 0.95;
      position: relative;
      z-index: 1;
    }
    
    .ticket-body {
      padding: 50px;
    }
    
    .event-name {
      font-size: 40px;
      font-weight: 900;
      color: #1a202c;
      margin-bottom: 40px;
      text-align: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;
      margin-bottom: 35px;
    }
    
    .info-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 25px;
      border-radius: 16px;
      border: 2px solid #e2e8f0;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .info-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }
    
    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
    }
    
    .info-icon {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .info-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    
    .info-value {
      font-size: 20px;
      color: #1a202c;
      font-weight: 700;
      line-height: 1.3;
    }
    
    .ticket-id-section {
      background: linear-gradient(135deg, #667eea08, #764ba208);
      padding: 30px;
      border-radius: 16px;
      margin-bottom: 35px;
      border: 3px dashed #667eea;
      text-align: center;
    }
    
    .ticket-id-label {
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    
    .ticket-id-value {
      font-size: 42px;
      color: #667eea;
      font-weight: 900;
      font-family: 'Courier New', monospace;
      letter-spacing: 6px;
      text-shadow: 2px 2px 4px rgba(102, 126, 234, 0.1);
    }
    
    .status-badge {
      display: inline-block;
      padding: 10px 25px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    
    .status-active {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .status-other {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
    
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent);
      margin: 35px 0;
    }
    
    .ticket-footer {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 35px 50px;
      border-top: 4px solid #667eea;
    }
    
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
      align-items: center;
    }
    
    .footer-info {
      
    }
    
    .footer-title {
      font-weight: 800;
      font-size: 18px;
      color: #1a202c;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .footer-text {
      color: #475569;
      font-size: 14px;
      line-height: 1.8;
    }
    
    .footer-logo {
      text-align: center;
    }
    
    .company-name {
      font-size: 24px;
      font-weight: 900;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 5px;
    }
    
    .company-tagline {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 600;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .ticket-container {
        box-shadow: none;
        max-width: 100%;
        border-radius: 0;
      }
      
      .info-card:hover {
        transform: none;
      }
    }
    
    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .footer-grid {
        grid-template-columns: 1fr;
        text-align: center;
      }
      
      .ticket-header {
        padding: 30px 25px;
      }
      
      .ticket-title {
        font-size: 28px;
      }
      
      .event-name {
        font-size: 28px;
      }
      
      .ticket-body {
        padding: 30px 25px;
      }
      
      .ticket-footer {
        padding: 25px;
      }
      
      .ticket-id-value {
        font-size: 32px;
        letter-spacing: 3px;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="ticket-header">
      <div class="ticket-title">🎫 Official Event Pass</div>
      <div class="ticket-subtitle">Premium Access Ticket</div>
    </div>
    
    <div class="ticket-body">
      <div class="event-name">
        ${event?.title || 'Event Name'}
      </div>
      
      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">📅</div>
          <div class="info-label">Date</div>
          <div class="info-value">${formattedDate}</div>
        </div>
        
        <div class="info-card">
          <div class="info-icon">🕒</div>
          <div class="info-label">Time</div>
          <div class="info-value">${formattedTime}</div>
        </div>
        
        <div class="info-card">
          <div class="info-icon">📍</div>
          <div class="info-label">Location</div>
          <div class="info-value">${event?.location || 'Venue TBD'}</div>
        </div>
        
                <div class="info-card">
                    <div class="info-icon">🎟️</div>
                    <div class="info-label">Tickets</div>
                    <div class="info-value">${ticketCount} Ticket${ticketCount !== 1 ? 's' : ''}</div>
                </div>
                
                <div class="info-card">
                    <div class="info-icon">💰</div>
                    <div class="info-label">Total Amount</div>
                    <div class="info-value">$${(ticket.price * ticketCount)?.toFixed(2) || '0.00'}</div>
                </div>        <div class="info-card">
          <div class="info-icon">✓</div>
          <div class="info-label">Status</div>
          <div class="info-value">
            <span class="status-badge ${ticket.status.toUpperCase() === 'ACTIVE' ? 'status-active' : 'status-other'}">
              ${ticket.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="ticket-id-section">
        <div class="ticket-id-label">Ticket ID</div>
        <div class="ticket-id-value">${shortTicketNumber}</div>
      </div>
    </div>
    
    <div class="ticket-footer">
      <div class="footer-grid">
        <div class="footer-info">
          <div class="footer-title">⚠️ Important Notice</div>
          <div class="footer-text">
            This ticket is valid for one (1) person only. Present this ticket at the venue entrance for verification. 
            Keep your ticket ID safe and do not share it with others. For any queries or support, please contact the event organizers.
          </div>
        </div>
        <div class="footer-logo">
          <div class="company-name">EventHub</div>
          <div class="company-tagline">Premium Events Platform</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`

      const blob = new Blob([ticketHTML], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const sanitizedEventName = (event?.title || 'Event').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      a.download = `ticket-${sanitizedEventName}-${shortTicketNumber}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Ticket Downloaded Successfully',
        description: `Your ticket ${shortTicketNumber} is ready to present at the venue`,
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: 'Download Failed',
        description: 'Failed to download ticket. Please try again.',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-fuchsia-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-fuchsia-50">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Welcome back, {userName}!
              </h1>
              <p className="text-slate-600 text-lg font-medium">Quick access to all your event management tools</p>
            </div>
            {userRole === 'ADMIN' && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg">
                <Plus className="w-4 h-4 text-red-600" />
                <span className="font-bold text-sm text-red-700">Admin Access</span>
              </div>
            )}
          </div>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-lg p-3 shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Tickets</p>
                  <p className="text-xl font-bold text-slate-800">{tickets.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-lg p-3 shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Events</p>
                  <p className="text-xl font-bold text-slate-800">{registrations.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-lg p-3 shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Status</p>
                  <p className="text-sm font-bold text-emerald-600">Active</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-lg p-3 shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Updates</p>
                  <p className="text-xl font-bold text-slate-800">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Navigation</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card 
              className="group relative overflow-hidden border-2 border-cyan-200 hover:border-cyan-400 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white via-white to-cyan-50/30"
              onClick={() => router.push('/')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/5 group-hover:from-cyan-500/5 group-hover:to-cyan-500/10 transition-all duration-300" />
              <CardContent className="relative pt-6 pb-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800 mb-1">Home</h3>
                    <p className="text-xs text-slate-600 font-medium">Browse all events</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group relative overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white via-white to-purple-50/30"
              onClick={() => router.push('/tickets')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all duration-300" />
              <CardContent className="relative pt-6 pb-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <Ticket className="w-8 h-8 text-white" />
                    </div>
                    {tickets.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-white text-xs font-bold">{tickets.length}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800 mb-1">My Tickets</h3>
                    <p className="text-xs text-slate-600 font-medium">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group relative overflow-hidden border-2 border-fuchsia-200 hover:border-fuchsia-400 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white via-white to-fuchsia-50/30"
              onClick={() => router.push('/profile')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/0 to-fuchsia-500/5 group-hover:from-fuchsia-500/5 group-hover:to-fuchsia-500/10 transition-all duration-300" />
              <CardContent className="relative pt-6 pb-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800 mb-1">Profile</h3>
                    <p className="text-xs text-slate-600 font-medium">Manage settings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group relative overflow-hidden border-2 border-teal-200 hover:border-teal-400 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white via-white to-teal-50/30"
              onClick={() => router.push('/dashboard/analytics')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/5 group-hover:from-teal-500/5 group-hover:to-teal-500/10 transition-all duration-300" />
              <CardContent className="relative pt-6 pb-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800 mb-1">Analytics</h3>
                    <p className="text-xs text-slate-600 font-medium">View insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {userRole === 'ADMIN' && (
              <Card 
                className="group relative overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white via-white to-amber-50/30 md:col-span-2 lg:col-span-1"
                onClick={() => router.push('/dashboard/user-management')}
              >
                <div className="absolute top-2 right-2">
                  <div className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">ADMIN</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/5 group-hover:from-amber-500/5 group-hover:to-amber-500/10 transition-all duration-300" />
                <CardContent className="relative pt-6 pb-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-800 mb-1">User Management</h3>
                      <p className="text-xs text-slate-600 font-medium">Admin controls</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-2 border-slate-200 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-white border-b border-slate-100 py-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <Ticket className="w-4 h-4 text-purple-600" />
                Tickets Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-medium">Total Owned</span>
                  <span className="text-xl font-bold text-slate-800">{tickets.length}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: tickets.length > 0 ? '100%' : '0%' }}
                  />
                </div>
                <Button 
                  onClick={() => router.push('/tickets')}
                  className="w-full mt-2 bg-teal-600 hover:bg-teal-700 transition-colors text-sm h-9"
                >
                  View All Tickets
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-br from-cyan-50 to-white border-b border-slate-100 py-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-cyan-600" />
                Event Registrations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-medium">Total Registered</span>
                  <span className="text-xl font-bold text-slate-800">{registrations.length}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-full rounded-full transition-all duration-500"
                    style={{ width: registrations.length > 0 ? '100%' : '0%' }}
                  />
                </div>
                <Button 
                  onClick={() => router.push('/events')}
                  className="w-full mt-2 bg-teal-600 hover:bg-teal-700 transition-colors text-sm h-9"
                >
                  Browse Events
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-br from-emerald-50 to-white border-b border-slate-100 py-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-emerald-600" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-medium">Current Status</span>
                  <span className="text-base font-bold text-emerald-600">Active</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-700 font-medium">All systems operational</span>
                </div>
                <Button 
                  onClick={() => router.push('/profile')}
                  className="w-full mt-2 bg-teal-600 hover:bg-teal-700 transition-colors text-sm h-9"
                >
                  Manage Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
