'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Calendar, MapPin, User, Ticket, DollarSign, Clock, ArrowLeft } from 'lucide-react'

export default function ValidateTicketPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const ticketNumber = params.ticketNumber as string
  const encodedData = searchParams.get('d')
  
  const [ticket, setTicket] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('Loading ticket details for:', ticketNumber)
    console.log('Encoded data present:', !!encodedData)
    
    if (encodedData) {
      // Use URL-encoded data (works offline)
      loadFromEncodedData()
    } else {
      // Fallback to API (requires network)
      loadTicketDetails()
    }
  }, [ticketNumber, encodedData])

  const loadFromEncodedData = () => {
    try {
      setLoading(true)
      console.log('Decoding ticket data from URL')
      
      const decoded = JSON.parse(atob(encodedData!))
      console.log('Decoded data:', decoded)
      
      // Reconstruct ticket object
      const ticketData = {
        id: 0,
        ticketNumber: decoded.tn,
        eventId: decoded.ei,
        userId: decoded.ui,
        status: decoded.s,
        price: decoded.p,
        issuedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
      
      // Reconstruct event object
      const eventData = {
        id: decoded.ei,
        title: decoded.et,
        startDate: decoded.ed,
        location: decoded.el
      }
      
      setTicket(ticketData)
      setEvent(eventData)
      setLoading(false)
    } catch (err: any) {
      console.error('Error decoding ticket data:', err)
      // Fallback to API if decoding fails
      loadTicketDetails()
    }
  }

  const loadTicketDetails = async () => {
    try {
      setLoading(true)
      
      // Use window.location to get the correct API URL (works on both localhost and network IP)
      const apiBase = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.hostname}:8080`
        : 'http://localhost:8080'
      
      console.log('API Base:', apiBase)
      console.log('Fetching ticket:', ticketNumber)
      
      // Fetch ticket by ticket number - public access, no login required
      const ticketUrl = `${apiBase}/api/tickets/validate/${ticketNumber}`
      console.log('Ticket URL:', ticketUrl)
      
      const response = await fetch(ticketUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        setError('Ticket not found or invalid')
        setLoading(false)
        return
      }

      const ticketData = await response.json()
      console.log('Ticket data:', ticketData)
      setTicket(ticketData)
      
      // Load event details using same API base
      const eventUrl = `${apiBase}/api/events/${ticketData.eventId}`
      console.log('Event URL:', eventUrl)
      
      const eventResponse = await fetch(eventUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (eventResponse.ok) {
        const eventData = await eventResponse.json()
        console.log('Event data:', eventData)
        setEvent(eventData)
      }
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error loading ticket:', err)
      setError(`Failed to load ticket details: ${err.message}`)
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getShortTicketNumber = (ticketNumber: string) => {
    return ticketNumber.substring(0, 8).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Validating ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600 text-center">
              Ticket Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-slate-600">{error || 'This ticket does not exist or has been cancelled'}</p>
            <p className="text-sm text-slate-500">Please verify the QR code and try again</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isValid = ticket.status === 'ACTIVE' || ticket.status === 'CONFIRMED'

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="mb-4 hover:bg-violet-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Validation Status Card */}
        <Card className={`mb-6 border-2 ${isValid ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-white' : 'border-amber-300 bg-gradient-to-br from-amber-50 to-white'}`}>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${isValid ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {isValid ? (
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                ) : (
                  <Clock className="w-12 h-12 text-amber-600" />
                )}
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isValid ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isValid ? 'Valid Ticket' : 'Ticket Status'}
                </h1>
                <p className="text-slate-600 mt-2">
                  {isValid ? 'This ticket is valid and ready for use' : 'Please check ticket status'}
                </p>
              </div>
              <Badge 
                className={`text-lg px-6 py-2 ${
                  isValid 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
              >
                {ticket.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Event Details Card */}
        {event && (
          <Card className="mb-6 border-violet-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-violet-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Event Date</p>
                    <p className="text-slate-800 font-semibold">{formatDate(event.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-fuchsia-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Location</p>
                    <p className="text-slate-800 font-semibold">{event.location}</p>
                  </div>
                </div>

                {event.description && (
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Description</p>
                      <p className="text-slate-700">{event.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ticket Details Card */}
        <Card className="border-violet-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Ticket className="w-5 h-5 mr-2 text-violet-600" />
              Ticket Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Ticket Number</p>
                <p className="text-2xl font-mono font-bold text-slate-800 tracking-wider">{getShortTicketNumber(ticket.ticketNumber)}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">Full: {ticket.ticketNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-violet-600" />
                    <p className="text-xs text-violet-700 font-medium uppercase">Price</p>
                  </div>
                  <p className="text-xl font-bold text-violet-800">${ticket.price?.toFixed(2) || '0.00'}</p>
                </div>

                <div className="bg-fuchsia-50 rounded-lg p-4 border border-fuchsia-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-fuchsia-600" />
                    <p className="text-xs text-fuchsia-700 font-medium uppercase">User ID</p>
                  </div>
                  <p className="text-lg font-semibold text-fuchsia-800">#{ticket.userId}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Issued Date</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(ticket.createdAt || ticket.issuedDate || new Date().toISOString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Please present this ticket at the event entrance for validation
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Keep this information secure and do not share with others
          </p>
        </div>
      </div>
    </div>
  )
}
