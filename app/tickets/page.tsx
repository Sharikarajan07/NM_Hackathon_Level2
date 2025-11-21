'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download, QrCode, Ticket, Loader2, User } from 'lucide-react'
import { ticketsApi, eventsApi } from '@/lib/api-client'

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [eventsMap, setEventsMap] = useState<{[key: string]: any}>({})

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground text-lg">View and manage all your event tickets</p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="gap-2">
              <User className="w-4 h-4" />
              Dashboard
            </Button>
            <Button onClick={() => router.push('/profile')} variant="outline" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </Button>
          </div>
          <Button onClick={() => router.push('/events')} size="lg" className="gap-2">
            <Calendar className="w-4 h-4" />
            Browse More Events
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-16 text-center">
              <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-2">No tickets yet</p>
              <p className="text-muted-foreground mb-6">Start exploring events to get your first ticket</p>
              <Button onClick={() => router.push('/events')} size="lg">
                Register for an Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{tickets.length}</span> ticket{tickets.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => {
                const event = eventsMap[ticket.eventId]
                return (
                  <Card key={ticket.id} className="overflow-hidden border-2 hover:border-primary transition-colors shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{event?.title || 'Event'}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {event ? formatDate(event.startDate) : 'Date TBD'}
                          </div>
                        </div>
                        <Badge variant={getStatusColor(ticket.status) as any} className="text-xs px-3 py-1">
                          {ticket.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">Ticket Number</p>
                        <p className="font-mono font-bold text-lg">{ticket.ticketNumber}</p>
                      </div>

                      {event?.location && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground font-medium">Location</p>
                          <p className="text-sm">{event.location}</p>
                        </div>
                      )}

                      {ticket.price && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground font-medium">Price</p>
                          <p className="font-semibold text-lg">${ticket.price.toFixed(2)}</p>
                        </div>
                      )}

                      <div className="bg-gradient-to-br from-muted/50 to-muted p-6 rounded-xl flex justify-center">
                        <div className="w-32 h-32 bg-background rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                          {ticket.qrCode ? (
                            <img src={ticket.qrCode} alt="QR Code" className="w-full h-full object-contain" />
                          ) : (
                            <QrCode className="w-12 h-12 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1 gap-2 border-2 text-xs">
                          <QrCode className="w-3 h-3" />
                          View
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2 border-2 text-xs">
                          <Download className="w-3 h-3" />
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
    </div>
  )
}
