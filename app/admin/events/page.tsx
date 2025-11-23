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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navigation />

      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                  Manage Events
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Create, edit, and manage your events • {events.length} {events.length === 1 ? 'event' : 'events'} total
                </p>
              </div>
              <Button 
                onClick={() => router.push('/admin/events/create')}
                size="lg" 
                className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-semibold w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                Create New Event
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-32">
              <Loader2 className="w-16 h-16 animate-spin text-purple-600 mb-4" />
              <p className="text-slate-600 font-medium">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            /* Empty State */
            <Card className="border-2 border-dashed border-slate-300 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-20 px-6">
                <div className="rounded-full bg-gradient-to-br from-cyan-100 to-purple-100 p-6 mb-6">
                  <Calendar className="w-16 h-16 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Events Yet</h3>
                <p className="text-slate-600 text-center mb-8 max-w-md">
                  Get started by creating your first event. Reach thousands of attendees and manage everything in one place.
                </p>
                <Button 
                  onClick={() => router.push('/admin/events/create')} 
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Events Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className="group overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 bg-white"
                >
                  {/* Event Image */}
                  <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        crossOrigin="anonymous"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'flex items-center justify-center h-full bg-gradient-to-br from-cyan-500 via-purple-500 to-fuchsia-500';
                            fallback.innerHTML = '<svg class="w-20 h-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                            parent.insertBefore(fallback, target);
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-cyan-500 via-purple-500 to-fuchsia-500">
                        <Calendar className="w-20 h-20 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={event.active ? 'default' : 'secondary'} 
                        className={`${event.active 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg' 
                          : 'bg-slate-500 text-white border-0'} px-3 py-1 font-semibold`}
                      >
                        {event.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Event Content */}
                  <CardContent className="p-5">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                      {event.title}
                    </h3>

                    {/* Event Details */}
                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-cyan-600" />
                        </div>
                        <span className="text-sm text-slate-600 font-medium">{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm text-slate-600 line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                          <Users className="w-4 h-4 text-fuchsia-600" />
                        </div>
                        <span className="text-sm text-slate-600">
                          <span className="font-semibold text-slate-900">{event.availableTickets}</span> / {event.totalTickets} available
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="pt-3 pb-4 border-t border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                          ${event.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-slate-500">per ticket</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 font-semibold transition-all"
                        onClick={() => router.push(`/admin/events/edit/${event.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        className="gap-2 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700 font-semibold transition-all"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
