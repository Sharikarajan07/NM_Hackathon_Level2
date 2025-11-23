'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users } from 'lucide-react'
import { eventsApi } from '@/lib/api-client'

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate?: string
  location: string
  totalTickets: number
  availableTickets: number
  category: string
  price: number
  organizer?: string
  active?: boolean
  imageUrl?: string
}

export default function EventGrid({ limit, events: propEvents }: { limit?: number, events?: Event[] }) {
  const [events, setEvents] = useState<Event[]>(propEvents || [])
  const [loading, setLoading] = useState(!propEvents)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (propEvents) {
      setEvents(propEvents)
      setLoading(false)
      return
    }

    const fetchEvents = async () => {
      try {
        setLoading(true)
        const data = await eventsApi.getAll() as Event[]
        setEvents(limit ? data.slice(0, limit) : data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch events:', err)
        setError('Failed to load events. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [limit, propEvents])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getAvailabilityStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100
    if (percentage === 0) return { text: 'Sold Out', variant: 'destructive' as const }
    if (percentage < 20) return { text: 'Limited', variant: 'secondary' as const }
    return { text: 'Available', variant: 'default' as const }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-full">
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No events available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event) => {
        const status = getAvailabilityStatus(event.availableTickets, event.totalTickets)
        return (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card className="h-full hover:shadow-xl transition-all hover:border-indigo-400 border-2 group overflow-hidden">
              {/* Event Image */}
              {event.imageUrl ? (
                <div className="relative w-full h-48 overflow-hidden">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-cyan-500', 'via-purple-500', 'to-fuchsia-500');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <Badge 
                    variant={status.variant} 
                    className={`absolute top-3 right-3 shadow-lg ${status.variant === 'default' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' : ''}`}
                  >
                    {status.text}
                  </Badge>
                  <Badge variant="secondary" className="absolute bottom-3 left-3 text-xs font-medium bg-white/90 backdrop-blur-sm text-violet-700 border border-violet-200 shadow-lg">
                    {event.category}
                  </Badge>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-gradient-to-br from-cyan-500 via-purple-500 to-fuchsia-500 flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-white/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <Badge 
                    variant={status.variant} 
                    className={`absolute top-3 right-3 shadow-lg ${status.variant === 'default' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' : ''}`}
                  >
                    {status.text}
                  </Badge>
                  <Badge variant="secondary" className="absolute bottom-3 left-3 text-xs font-medium bg-white/90 backdrop-blur-sm text-violet-700 border border-violet-200 shadow-lg">
                    {event.category}
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl line-clamp-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-fuchsia-600 transition">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 mb-6 text-base">
                  {event.description}
                </CardDescription>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                    <span className="font-medium">{formatDate(event.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-fuchsia-600" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-5 h-5 text-violet-600" />
                    <span>{event.availableTickets} of {event.totalTickets} tickets left</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      ${event.price.toFixed(2)}
                    </div>
                    <Button size="sm" variant="outline" className="border-2 border-indigo-300 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
