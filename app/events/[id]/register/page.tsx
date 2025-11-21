'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { eventsApi, registrationApi } from '@/lib/api-client'
import { Ticket, Calendar, MapPin, DollarSign, Users } from 'lucide-react'

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [event, setEvent] = useState<any>(null)
  const [numberOfTickets, setNumberOfTickets] = useState(1)
  const [specialRequirements, setSpecialRequirements] = useState('')

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
      setLoadingEvent(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const userId = localStorage.getItem('userId')
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to register for events',
        variant: 'destructive'
      })
      router.push('/login')
      return
    }

    if (numberOfTickets > event.availableTickets) {
      toast({
        title: 'Error',
        description: `Only ${event.availableTickets} tickets available`,
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      await registrationApi.register({
        eventId: parseInt(params.id as string),
        userId: parseInt(userId),
        numberOfTickets,
        totalPrice: event.price * numberOfTickets,
        status: 'CONFIRMED',
        specialRequirements: specialRequirements || undefined
      })
      
      toast({
        title: 'Registration Successful!',
        description: `You've successfully registered for ${event.title}. Check your dashboard for tickets.`
      })
      
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to complete registration. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingEvent) {
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
          <Card className="p-8"><CardTitle>Event not found</CardTitle></Card>
        </div>
      </div>
    )
  }

  const totalPrice = event.price * numberOfTickets

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 border-2">
          ← Back to Event
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-2">
              <CardHeader className="pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Event Registration</CardTitle>
                    <p className="text-muted-foreground mt-1">{event.title}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="numberOfTickets" className="text-base font-semibold">Number of Tickets</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="h-12 w-12 text-xl"
                        onClick={() => setNumberOfTickets(Math.max(1, numberOfTickets - 1))}
                        disabled={numberOfTickets <= 1}
                      >
                        −
                      </Button>
                      <Input
                        id="numberOfTickets"
                        type="number"
                        min="1"
                        max={event.availableTickets}
                        value={numberOfTickets}
                        onChange={(e) => setNumberOfTickets(Math.max(1, Math.min(event.availableTickets, parseInt(e.target.value) || 1)))}
                        className="text-center text-xl font-bold h-12 w-24"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="h-12 w-12 text-xl"
                        onClick={() => setNumberOfTickets(Math.min(event.availableTickets, numberOfTickets + 1))}
                        disabled={numberOfTickets >= event.availableTickets}
                      >
                        +
                      </Button>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({event.availableTickets} available)
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialRequirements" className="text-base font-semibold">
                      Special Requirements <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="specialRequirements"
                      placeholder="Any dietary restrictions, accessibility needs, or other special requirements..."
                      className="mt-2 min-h-[100px]"
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                    />
                  </div>

                  <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-primary">Important Information:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>You will receive a confirmation email with your tickets</li>
                      <li>Each ticket includes a unique QR code for entry</li>
                      <li>Please arrive 30 minutes before the event starts</li>
                      <li>Tickets are non-refundable but transferable</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold"
                    size="lg"
                    disabled={isLoading || event.availableTickets < 1}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Processing Registration...
                      </span>
                    ) : (
                      `Complete Registration - $${totalPrice.toFixed(2)}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Event Summary Sidebar */}
          <div>
            <Card className="shadow-xl border-2 sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">Registration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {new Date(event.startDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Organizer</p>
                      <p className="font-semibold">{event.organizer}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-start gap-3 mb-4">
                    <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Price per ticket</p>
                      <p className="font-semibold">${event.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <Ticket className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Number of tickets</p>
                      <p className="font-semibold">{numberOfTickets}</p>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total Amount</span>
                      <span className="font-bold text-2xl text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
