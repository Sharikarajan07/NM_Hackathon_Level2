'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Calendar, Download, QrCode, Ticket, Loader2, User } from 'lucide-react'
import { ticketsApi, eventsApi } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { QRCodeSVG } from 'qrcode.react'

export default function TicketsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<any[]>([])
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
    
    loadTickets(userId)
  }, [router])

  const loadTickets = async (userId: string) => {
    try {
      setLoading(true)
      
      const userTickets = await ticketsApi.getUserTickets(userId) as any[]
      setTickets(userTickets)
      
      const eventIds = [...new Set(userTickets.map((t: any) => t.eventId))]
      const events = await Promise.all(eventIds.map(id => eventsApi.getById(id.toString())))
      
      const eventsMapping: {[key: string]: any} = {}
      events.forEach((event: any) => {
        eventsMapping[event.id] = event
      })
      setEventsMap(eventsMapping)
      
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    switch (status.toLowerCase()) {
      case 'active':
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
      
      // Create professional HTML ticket without QR code
      const ticketHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Ticket - ${shortTicketNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @page { size: A4; margin: 0; }
        
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
            top: -50%; left: -50%;
            width: 200%; height: 200%;
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
            top: 0; left: 0;
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
            font-size: 48px;
            color: #667eea;
            font-weight: 900;
            font-family: 'Courier New', monospace;
            letter-spacing: 8px;
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
            body { background: white; padding: 0; }
            .ticket-container { box-shadow: none; max-width: 100%; border-radius: 0; }
            .info-card:hover { transform: none; }
        }
        
        @media (max-width: 768px) {
            .info-grid { grid-template-columns: 1fr; }
            .footer-grid { grid-template-columns: 1fr; text-align: center; }
            .ticket-header { padding: 30px 25px; }
            .ticket-title { font-size: 28px; }
            .event-name { font-size: 28px; }
            .ticket-body { padding: 30px 25px; }
            .ticket-footer { padding: 25px; }
            .ticket-id-value { font-size: 36px; letter-spacing: 4px; }
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
            <div class="event-name">${event?.title || 'Event Name'}</div>
            
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
                </div>
                
                <div class="info-card">
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
</html>
      `.trim()

      // Create blob and download as HTML
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
        description: 'Failed to download ticket',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-600 bg-clip-text text-transparent">My Tickets</h1>
          <p className="text-slate-600 text-lg font-medium">View and manage all your event tickets</p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/dashboard')} 
              variant="outline" 
              className="gap-2 border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              <User className="w-4 h-4 text-violet-600" />
              Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/profile')} 
              variant="outline" 
              className="gap-2 border-2 border-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-50 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              <User className="w-4 h-4 text-fuchsia-600" />
              Profile
            </Button>
          </div>
          <Button 
            onClick={() => router.push('/events')} 
            size="lg" 
            className="gap-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-orange-700 shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold"
          >
            <Calendar className="w-4 h-4" />
            Browse More Events
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-2 border-slate-200 shadow-xl bg-gradient-to-br from-white to-slate-50">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Ticket className="w-10 h-10 text-white" />
              </div>
              <p className="text-xl font-bold mb-2 text-slate-800">No tickets yet</p>
              <p className="text-slate-600 mb-6 font-medium">Start exploring events to get your first ticket</p>
              <Button 
                onClick={() => router.push('/events')} 
                size="lg"
                className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-orange-700 shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold"
              >
                Register for an Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-800">{groupedTicketsList.length}</span> event{groupedTicketsList.length !== 1 ? 's' : ''} with <span className="font-bold text-slate-800">{tickets.length}</span> ticket{tickets.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedTicketsList.map((group) => {
                const event = eventsMap[group.eventId]
                const ticket = group.firstTicket
                return (
                  <Card key={group.eventId} className="overflow-hidden border-2 border-slate-200 hover:border-fuchsia-400 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50">
                    <CardHeader className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-orange-500/10 border-b-2 border-slate-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1 text-slate-800">{event?.title || 'Event'}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <Calendar className="w-4 h-4 text-fuchsia-600" />
                            {event ? formatDate(event.startDate) : 'Date TBD'}
                          </div>
                        </div>
                        <Badge variant={getStatusColor(ticket.status) as any} className="text-xs px-3 py-1 font-semibold shadow-sm">
                          {ticket.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 font-semibold">Ticket Number</p>
                        <p className="font-mono font-bold text-lg text-slate-800">{getShortTicketNumber(ticket.ticketNumber)}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 font-semibold">Tickets Booked</p>
                        <p className="font-bold text-lg text-orange-600">{group.count} Ticket{group.count !== 1 ? 's' : ''}</p>
                      </div>

                      {event?.location && (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 font-semibold">Location</p>
                          <p className="text-sm font-medium text-slate-700">{event.location}</p>
                        </div>
                      )}

                      {ticket.price && (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 font-semibold">Total Amount</p>
                          <p className="font-bold text-lg text-slate-800">${(ticket.price * group.count).toFixed(2)}</p>
                        </div>
                      )}

                      <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-2xl flex justify-center shadow-inner">
                        <div className="w-32 h-32 bg-white rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center shadow-md">
                          {ticket.qrCode ? (
                            <img src={ticket.qrCode} alt="QR Code" className="w-full h-full object-contain" />
                          ) : (
                            <QrCode className="w-12 h-12 text-slate-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewQRCode(ticket)}
                          className="flex-1 gap-2 border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all shadow-sm hover:shadow-md text-xs font-semibold"
                        >
                          <QrCode className="w-3 h-3 text-violet-600" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleDownloadTicket(ticket, group.count)}
                          className="flex-1 gap-2 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all shadow-sm hover:shadow-md text-xs font-semibold"
                        >
                          <Download className="w-3 h-3 text-orange-600" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </section>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Scan QR Code
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600">
              Scan this code to view complete ticket details
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="flex flex-col items-center space-y-4 py-6">
              {/* QR Code with embedded ticket data */}
              <div className="p-6 bg-white rounded-lg shadow-lg border-2 border-violet-200">
                <QRCodeSVG 
                  value={generateTicketQRData(selectedTicket)}
                  size={240}
                  level="H"
                  includeMargin={true}
                  className="w-full h-auto"
                />
              </div>
              
              <p className="text-xs text-slate-500 text-center px-4">
                Ticket #{getShortTicketNumber(selectedTicket.ticketNumber)}
              </p>
              
              <p className="text-xs text-center text-slate-400 px-4">
                Scan with any QR code reader to view full ticket information
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
