'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Clock, Share2 } from 'lucide-react'

interface Event {
  id: string
  name: string
  description: string
  date: string
  venue: string
  totalTickets: number
  availableTickets: number
  category?: string
}

const MOCK_EVENTS: { [key: string]: Event } = {
  '1': {
    id: '1',
    name: 'Tech Conference 2025',
    description: 'Annual technology conference featuring industry leaders discussing the latest trends in AI, cloud computing, and web technologies. Join us for keynote speeches, panel discussions, and networking sessions.',
    date: '2025-03-15',
    venue: 'San Francisco Convention Center',
    totalTickets: 500,
    availableTickets: 145,
    category: 'Conference'
  },
  '2': {
    id: '2',
    name: 'Summer Music Festival',
    description: 'Three-day music festival with top artists performing live. Enjoy performances from various genres including rock, pop, and indie music.',
    date: '2025-06-20',
    venue: 'Central Park, New York',
    totalTickets: 10000,
    availableTickets: 3200,
    category: 'Music'
  }
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const eventId = params.id as string
    const mockEvent = MOCK_EVENTS[eventId]
    if (mockEvent) {
      setEvent(mockEvent)
    }
    setIsLoading(false)
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleRegister = () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }
    router.push(`/events/${event?.id}/register`)
  }

  if (isLoading) return <div>Loading...</div>
  if (!event) return <div>Event not found</div>

  const availabilityPercentage = (event.availableTickets / event.totalTickets) * 100

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Badge variant="outline" className="mb-3">{event.category}</Badge>
              <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
              <p className="text-lg text-muted-foreground">{event.description}</p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-semibold">{formatDate(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-semibold">{event.totalTickets} total tickets</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <p className="font-semibold">{event.availableTickets} tickets remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tickets Available</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.max(5, availabilityPercentage)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {event.availableTickets} of {event.totalTickets}
                  </p>
                </div>

                {event.availableTickets > 0 ? (
                  <Button
                    onClick={handleRegister}
                    className="w-full"
                    size="lg"
                  >
                    Register Now
                  </Button>
                ) : (
                  <Button disabled className="w-full" size="lg">
                    Sold Out
                  </Button>
                )}

                <Button variant="outline" className="w-full gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
