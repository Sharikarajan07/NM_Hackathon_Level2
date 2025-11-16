'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [eventName, setEventName] = useState('')

  useEffect(() => {
    const eventId = params.id
    const events: { [key: string]: string } = {
      '1': 'Tech Conference 2025',
      '2': 'Summer Music Festival',
      '3': 'Web Development Workshop'
    }
    setEventName(events[eventId as string] || 'Event')
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: 'Success!',
        description: 'Registration completed. Check your dashboard for your ticket.'
      })
      
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to register. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Register for {eventName}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
              </div>

              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <Input id="company" placeholder="Your Company" />
              </div>

              <div className="bg-secondary/30 border border-secondary p-4 rounded-lg">
                <p className="text-sm">
                  You will receive a confirmation email with your digital ticket and QR code.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Completing Registration...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
