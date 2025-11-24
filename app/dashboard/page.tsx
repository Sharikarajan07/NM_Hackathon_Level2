'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Calendar, Download, QrCode, Ticket, User, Plus, Loader2, Bell, 
  TrendingUp, Activity, Eye, MapPin, Clock, CheckCircle2, 
  AlertCircle, Users, BarChart3, ArrowRight, Sparkles, ChevronRight,
  History, Target, Award, TrendingDown, Zap
} from 'lucide-react'
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
    // Use environment variable for network-accessible URL or fallback to window location
    const baseUrl = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000`)
      : 'http://10.74.115.219:3000'
    
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/30">
      <Navigation />

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Executive Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
            <div className="flex items-start gap-5">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-white shadow-2xl ring-2 ring-purple-100">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white text-2xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Welcome back, {userName}
                  </h1>
                  {userRole === 'ADMIN' && (
                    <Badge className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 border-0 px-3 py-1.5 text-white font-semibold shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      ADMIN
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium">{userEmail}</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-emerald-600 font-semibold">Online</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
                onClick={() => router.push('/profile')}
              >
                <User className="w-4 h-4 mr-2" />
                My Profile
              </Button>
              <Button 
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                onClick={() => router.push('/events')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Explore Events
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Profile Views</p>
                  <p className="text-lg font-bold text-slate-900">1,284</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Completion</p>
                  <p className="text-lg font-bold text-slate-900">87%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Points Earned</p>
                  <p className="text-lg font-bold text-slate-900">2,450</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Streak</p>
                  <p className="text-lg font-bold text-slate-900">12 Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tickets Metric */}
            <Card className="relative overflow-hidden border-2 border-slate-300 shadow-md hover:shadow-xl hover:border-slate-400 hover:-translate-y-1 bg-white transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-700 to-slate-900" />
              <CardContent className="relative p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors duration-300">
                    <Ticket className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-md group-hover:bg-emerald-100 transition-colors duration-300">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">+12%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Total Tickets</p>
                  <p className="text-2xl font-bold text-slate-900 mb-0.5 group-hover:scale-105 transition-transform duration-300">{tickets.length}</p>
                  <p className="text-xs text-slate-600">Active in collection</p>
                </div>
              </CardContent>
            </Card>

            {/* Events Registered Metric */}
            <Card className="relative overflow-hidden border-2 border-slate-300 shadow-md hover:shadow-xl hover:border-slate-400 hover:-translate-y-1 bg-white transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-700 to-slate-900" />
              <CardContent className="relative p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors duration-300">
                    <Calendar className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-md group-hover:bg-blue-100 transition-colors duration-300">
                    <Activity className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Events Joined</p>
                  <p className="text-2xl font-bold text-slate-900 mb-0.5 group-hover:scale-105 transition-transform duration-300">{registrations.length}</p>
                  <p className="text-xs text-slate-600">Total registrations</p>
                </div>
              </CardContent>
            </Card>

            {/* Account Status Metric */}
            <Card className="relative overflow-hidden border-2 border-slate-300 shadow-md hover:shadow-xl hover:border-slate-400 hover:-translate-y-1 bg-white transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-700 to-slate-900" />
              <CardContent className="relative p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors duration-300">
                    <CheckCircle2 className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Account Status</p>
                  <p className="text-2xl font-bold text-slate-900 mb-0.5 group-hover:scale-105 transition-transform duration-300">Active</p>
                  <p className="text-xs text-slate-600">Verified & secured</p>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Metric */}
            <Card className="relative overflow-hidden border-2 border-slate-300 shadow-md hover:shadow-xl hover:border-slate-400 hover:-translate-y-1 bg-white transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-700 to-slate-900" />
              <CardContent className="relative p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors duration-300">
                    <Bell className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md group-hover:bg-slate-200 transition-colors duration-300">
                    <AlertCircle className="w-3 h-3 text-slate-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Notifications</p>
                  <p className="text-2xl font-bold text-slate-900 mb-0.5 group-hover:scale-105 transition-transform duration-300">0</p>
                  <p className="text-xs text-slate-600">All caught up</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Hub */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            </div>
            <Badge variant="outline" className="border border-teal-300 bg-teal-50 text-teal-700 px-3 py-1 text-xs font-semibold">
              {userRole}
            </Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* My Tickets Hub */}
            <Card 
              className="group relative cursor-pointer border border-slate-200 hover:border-teal-400 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
              onClick={() => router.push('/tickets')}
            >
              <CardContent className="relative p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Ticket className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    {tickets.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-white text-xs font-bold">{tickets.length}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 mb-1">My Tickets</h3>
                    <p className="text-xs text-slate-600">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browse Events Hub */}
            <Card 
              className="group relative cursor-pointer border border-slate-200 hover:border-cyan-400 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
              onClick={() => router.push('/events')}
            >
              <CardContent className="relative p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Calendar className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 mb-1">Browse Events</h3>
                    <p className="text-xs text-slate-600">Discover events</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Management Hub */}
            <Card 
              className="group relative cursor-pointer border border-slate-200 hover:border-emerald-400 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
              onClick={() => router.push('/profile')}
            >
              <CardContent className="relative p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <User className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 mb-1">My Profile</h3>
                    <p className="text-xs text-slate-600">Account settings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin/Analytics Hub */}
            {userRole === 'ADMIN' ? (
              <Card 
                className="group relative cursor-pointer border border-amber-300 hover:border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
                onClick={() => router.push('/admin/events')}
              >
                <div className="absolute top-2 right-2">
                  <div className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    ADMIN
                  </div>
                </div>
                <CardContent className="relative p-5">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Users className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-slate-900 mb-1">Admin Panel</h3>
                      <p className="text-xs text-slate-600">Manage platform</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card 
                className="group relative cursor-pointer border border-slate-200 hover:border-teal-400 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
                onClick={() => router.push('/dashboard/analytics')}
              >
                <CardContent className="relative p-5">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <BarChart3 className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-slate-900 mb-1">Analytics</h3>
                      <p className="text-xs text-slate-600">View insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Activity & Events Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity Timeline */}
          <Card className="lg:col-span-2 border border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 font-bold">
                  <History className="w-5 h-5 text-teal-600" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {/* Activity Item 1 */}
                <div className="flex gap-4 group hover:bg-slate-50 p-3 rounded-lg transition-colors">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
                      <Ticket className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Ticket Generated Successfully</p>
                    <p className="text-xs text-slate-600 mt-0.5">Your ticket for Tech Conference 2025 is ready</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      2 hours ago
                    </p>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex gap-4 group hover:bg-slate-50 p-3 rounded-lg transition-colors">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Registered for New Event</p>
                    <p className="text-xs text-slate-600 mt-0.5">Successfully registered for Design Workshop</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      5 hours ago
                    </p>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="flex gap-4 group hover:bg-slate-50 p-3 rounded-lg transition-colors">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Achievement Unlocked</p>
                    <p className="text-xs text-slate-600 mt-0.5">Earned 'Early Bird' badge for event participation</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      1 day ago
                    </p>
                  </div>
                </div>

                {/* Activity Item 4 */}
                <div className="flex gap-4 group hover:bg-slate-50 p-3 rounded-lg transition-colors">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Profile Updated</p>
                    <p className="text-xs text-slate-600 mt-0.5">Your profile information has been updated</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      2 days ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events Panel */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900 font-bold">
                <Calendar className="w-5 h-5 text-teal-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {registrations.slice(0, 3).map((reg, idx) => {
                  const event = eventsMap[reg.eventId]
                  if (!event) return null
                  
                  return (
                    <div key={idx} className="p-3 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 rounded-lg border border-teal-100 hover:border-teal-300 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/events/${event.id}`)}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <p className="text-xs text-slate-600">{formatDate(event.date)}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <p className="text-xs text-slate-600 truncate">{event.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {registrations.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600 mb-3">No upcoming events</p>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                      onClick={() => router.push('/events')}
                    >
                      Browse Events
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Dashboard */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="relative border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 via-purple-50/30 to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative bg-gradient-to-br from-purple-50/50 via-white to-white border-b-2 border-purple-100/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-3 text-slate-900 font-bold">
                <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg">
                  <Ticket className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                Tickets Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pt-6 pb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-semibold">Total Collection</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">{tickets.length}</span>
                </div>
                <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 rounded-full transition-all duration-700 shadow-lg"
                    style={{ width: tickets.length > 0 ? '100%' : '0%' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">Active & Ready</span>
                </div>
                <Button 
                  onClick={() => router.push('/tickets')}
                  className="w-full mt-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 hover:from-indigo-700 hover:via-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base h-11"
                >
                  View All Tickets
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/0 via-cyan-50/30 to-cyan-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative bg-gradient-to-br from-cyan-50/50 via-white to-white border-b-2 border-cyan-100/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-3 text-slate-900 font-bold">
                <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl shadow-lg">
                  <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                Events Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pt-6 pb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-semibold">Registered Events</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">{registrations.length}</span>
                </div>
                <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 rounded-full transition-all duration-700 shadow-lg"
                    style={{ width: registrations.length > 0 ? '100%' : '0%' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-cyan-50 px-3 py-2 rounded-lg border border-cyan-100">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  <span className="font-semibold">Currently Enrolled</span>
                </div>
                <Button 
                  onClick={() => router.push('/events')}
                  className="w-full mt-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 hover:from-cyan-700 hover:via-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base h-11"
                >
                  Explore Events
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-emerald-50/30 to-emerald-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative bg-gradient-to-br from-emerald-50/50 via-white to-white border-b-2 border-emerald-100/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-3 text-slate-900 font-bold">
                <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                Account Health
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pt-6 pb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-semibold">Status Level</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">Active</span>
                </div>
                <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 rounded-full shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200/50 shadow-sm">
                  <div className="relative flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-75 shadow-md shadow-emerald-400/50" />
                  </div>
                  <span className="text-sm text-emerald-800 font-bold">All Systems Operational</span>
                </div>
                <Button 
                  onClick={() => router.push('/profile')}
                  className="w-full mt-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 hover:from-emerald-700 hover:via-teal-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base h-11"
                >
                  Manage Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
