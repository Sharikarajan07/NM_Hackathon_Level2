'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
}

export default function EventGrid({ limit, events: propEvents }: { limit?: number, events?: Event[] }) {
  const [events, setEvents] = useState<Event[]>(propEvents || [])
  const [loading, setLoading] = useState(!propEvents)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (propEvents) {
      setEvents(propEvents)
      setLoading(false)
    } else {
      fetchEvents()
    }
  }, [propEvents])

  const fetchEvents = async () => {
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
            <Card className="h-full hover:shadow-xl transition-all hover:border-primary border-2 group">
              <CardHeader>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition">{event.title}</CardTitle>
                  <Badge variant={status.variant} className="shrink-0">{status.text}</Badge>
                </div>
                <Badge variant="secondary" className="w-fit text-xs font-medium">{event.category}</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 mb-6 text-base">
                  {event.description}
                </CardDescription>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium">{formatDate(event.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-5 h-5 text-primary" />
                    <span>{event.availableTickets} of {event.totalTickets} tickets left</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-2xl font-bold text-primary">
                      ${event.price.toFixed(2)}
                    </div>
                    <Button size="sm" variant="outline" className="border-2 group-hover:bg-primary group-hover:text-primary-foreground transition">
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
