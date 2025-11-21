'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { eventsApi } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Calendar, MapPin, Users, Loader2 } from 'lucide-react'

export default function AdminEventsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [mounted, setMounted] = useState(false)

  const loadEvents = async () => {
    try {
      setLoading(true)
      const allEvents = await eventsApi.getAll()
      setEvents(allEvents as any[])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('authToken')
    const role = localStorage.getItem('userRole')
    
    if (!token) {
      router.push('/login')
      return
    }
    
    if (role !== 'ORGANIZER') {
      toast({
        title: 'Access Denied',
        description: 'Only organizers can access this page.',
        variant: 'destructive'
      })
      router.push('/dashboard')
      return
    }
    
    setUserRole(role)
    loadEvents()
  }, [router])

  if (!mounted) {
    return null
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await eventsApi.delete(eventId)
      toast({
        title: 'Success',
        description: 'Event deleted successfully'
      })
      loadEvents()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Manage Events
            </h1>
            <p className="text-muted-foreground text-lg mt-2">Create and manage your events</p>
          </div>
          <Button 
            onClick={() => router.push('/admin/events/create')}
            size="lg" 
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No events yet</p>
              <p className="text-muted-foreground mb-6">Create your first event to get started</p>
              <Button onClick={() => router.push('/admin/events/create')} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden border-2 hover:shadow-xl transition-all">
                {event.imageUrl && (
                  <div className="aspect-video w-full bg-muted relative overflow-hidden">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="flex justify-between items-start gap-3">
                    <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                    <Badge variant={event.active ? 'default' : 'secondary'}>
                      {event.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{event.availableTickets} / {event.totalTickets} available</span>
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-primary">
                    ${event.price.toFixed(2)}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => router.push(`/admin/events/edit/${event.id}`)}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="gap-2"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
