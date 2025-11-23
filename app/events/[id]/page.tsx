'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Clock, Share2, DollarSign, Ticket } from 'lucide-react'
import { eventsApi } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [event, setEvent] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEvent()
  }, [params.id])

  const loadEvent = async () => {
    try {
      const data = await eventsApi.getById(params.id as string)
      setEvent(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load event details',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRegister = () => {
    // Navigate to payment page with event details
    if (event) {
      const params = new URLSearchParams({
        eventId: event.id,
        eventName: event.title,
        eventDate: formatDate(event.startDate),
        location: event.location,
        price: event.price.toString(),
        ticketType: 'General Admission',
        quantity: '1'
      });
      router.push(`/payment?${params.toString()}`);
    }
  };

  const handleRegisterOld = () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      toast({
        title: 'Login Required',
        description: 'Please login to register for events',
        variant: 'destructive'
      })
      router.push('/login')
      return
    }
    router.push(`/events/${event?.id}/register`)
  }

  const handleShareEvent = async () => {
    const shareUrl = `${window.location.origin}/events/${event?.id}`
    const shareData = {
      title: event?.title || 'Event',
      text: `Check out this event: ${event?.title}`,
      url: shareUrl
    }

    // Try Web Share API first (for mobile devices)
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast({
          title: 'Shared Successfully',
          description: 'Event shared successfully!',
        })
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          copyToClipboard(shareUrl)
        }
      }
    } else {
      // Fallback to copying to clipboard
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Link Copied!',
        description: 'Event link copied to clipboard. Share it with your friends!',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link. Please try again.',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="p-8">
            <CardTitle className="text-center">Event not found</CardTitle>
            <Button onClick={() => router.push('/events')} className="mt-4 w-full">
              Browse All Events
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const availabilityPercentage = (event.availableTickets / event.totalTickets) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.back()} className="border-2">
            ← Back to Events
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Event Hero Image */}
            {event.imageUrl ? (
              <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl group">
                <div className="aspect-[16/9] w-full">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-cyan-500', 'via-purple-500', 'to-fuchsia-500', 'flex', 'items-center', 'justify-center');
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <Badge variant="secondary" className="absolute top-6 right-6 text-base px-4 py-2 bg-white/95 backdrop-blur-sm shadow-xl">
                  {event.category}
                </Badge>
              </div>
            ) : (
              <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl aspect-[16/9] bg-gradient-to-br from-cyan-500 via-purple-500 to-fuchsia-500 flex items-center justify-center">
                <Calendar className="w-24 h-24 text-white/20" />
                <Badge variant="secondary" className="absolute top-6 right-6 text-base px-4 py-2 bg-white/95 backdrop-blur-sm shadow-xl">
                  {event.category}
                </Badge>
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                {event.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            <Card className="shadow-xl border-2">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Start Date</p>
                    <p className="font-bold text-lg">{formatDate(event.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <Clock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">End Date</p>
                    <p className="font-bold text-lg">{formatDate(event.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Location</p>
                    <p className="font-bold text-lg">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <Users className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Organizer</p>
                    <p className="font-bold text-lg">{event.organizer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4 shadow-2xl border-2">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-primary/10 rounded-xl border-2 border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-muted-foreground">Price per ticket</span>
                    <span className="text-3xl font-bold text-primary">${event.price.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold">Ticket Availability</span>
                    <span className="text-sm font-bold">{event.availableTickets} / {event.totalTickets}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/60 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, availabilityPercentage)}%` }}
                    />
                  </div>
                </div>

                {event.availableTickets > 0 ? (
                  <Button
                    onClick={handleRegister}
                    className="w-full h-14 text-lg font-semibold"
                    size="lg"
                  >
                    <Ticket className="w-5 h-5 mr-2" />
                    Register Now
                  </Button>
                ) : (
                  <Button disabled className="w-full h-14 text-lg" size="lg">
                    Sold Out
                  </Button>
                )}

                <Button variant="outline" className="w-full h-12 gap-2 border-2" onClick={handleShareEvent}>
                  <Share2 className="w-4 h-4" />
                  Share Event
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Secure registration powered by EventHub
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
