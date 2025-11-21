'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Download, QrCode, Ticket, User, Plus, Loader2 } from 'lucide-react'
import { registrationApi, ticketsApi, eventsApi } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground text-lg">Manage your tickets and profile settings</p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="border-2 hover:border-primary transition-all cursor-pointer hover:shadow-lg"
            onClick={() => router.push('/dashboard')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Overview</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 hover:border-primary transition-all cursor-pointer hover:shadow-lg"
            onClick={() => router.push('/tickets')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">My Tickets</h3>
                  <p className="text-sm text-muted-foreground">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 hover:border-primary transition-all cursor-pointer hover:shadow-lg"
            onClick={() => router.push('/profile')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Profile</h3>
                  <p className="text-sm text-muted-foreground">Settings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="mb-8 w-full sm:w-auto">
            <TabsTrigger value="tickets" className="flex-1 sm:flex-none text-base px-8 py-3">My Tickets</TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 sm:flex-none text-base px-8 py-3">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">My Tickets</h2>
                <p className="text-muted-foreground mt-1">View and manage all your event tickets</p>
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
              <div className="grid md:grid-cols-2 gap-8">
                {tickets.map((ticket) => {
                  const event = eventsMap[ticket.eventId]
                  return (
                    <Card key={ticket.id} className="overflow-hidden border-2 hover:border-primary transition-colors shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                        <div className="flex justify-between items-start">
                          <div>
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
                      <CardContent className="pt-6 space-y-6">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground font-medium">Ticket Number</p>
                          <p className="font-mono font-bold text-lg">{ticket.ticketNumber}</p>
                        </div>

                        {ticket.seatNumber && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground font-medium">Seat Number</p>
                            <p className="font-semibold text-lg">{ticket.seatNumber}</p>
                          </div>
                        )}

                        <div className="bg-gradient-to-br from-muted/50 to-muted p-6 rounded-xl flex justify-center">
                          <div className="w-40 h-40 bg-background rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                            {ticket.qrCode ? (
                              <img src={ticket.qrCode} alt="QR Code" className="w-full h-full object-contain" />
                            ) : (
                              <QrCode className="w-12 h-12 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 gap-2 border-2">
                            <QrCode className="w-4 h-4" />
                            View QR Code
                          </Button>
                          <Button variant="outline" className="flex-1 gap-2 border-2">
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Profile Settings</h2>
              <p className="text-muted-foreground mt-1">Manage your account information and preferences</p>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <User className="w-6 h-6" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">Full Name</p>
                    <p className="font-semibold text-lg">{userName}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">Email Address</p>
                    <p className="font-semibold text-lg">{userEmail}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <p className="text-sm text-muted-foreground font-medium mb-4">Account Status</p>
                  <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                    <span className="font-semibold text-lg">Active Account</span>
                    <Badge variant="default" className="text-sm px-4 py-1">Verified</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-2" size="lg">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">Email Notifications</p>
                    <p className="text-sm text-muted-foreground mt-1">Receive updates about your events and tickets</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-2">Enable</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">Event Reminders</p>
                    <p className="text-sm text-muted-foreground mt-1">Get notified before your events start</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-2">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
