'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react'
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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [searchQuery, selectedCategory, events])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await eventsApi.getAll() as Event[]
      setEvents(data)
      setFilteredEvents(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch events:', err)
      setError('Failed to load events. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }

    setFilteredEvents(filtered)
  }

  const categories = Array.from(new Set(events.map(e => e.category)))

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchEvents}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 text-teal-700">Explore Events</h1>
          <p className="text-gray-600">Find and register for amazing events happening around you</p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search events by name, location, or organizer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-teal-500"
            />
          </div>
          <Button className="h-14 px-8 bg-teal-600 hover:bg-teal-700">
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </div>

        {/* Category Pills */}
        <div className="mb-8 flex items-center gap-3 flex-wrap">
          <span className="text-gray-600 font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Categories:
          </span>
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-teal-600 hover:bg-teal-700' : 'border-gray-300'}
          >
            All Events
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-teal-600 hover:bg-teal-700' : 'border-gray-300'}
            >
              {category}
            </Button>
          ))}
        </div>

      {/* Events Grid */}
      <section className="py-0">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all bg-white">
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
                  {event.imageUrl ? (
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Calendar className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  <Badge className="absolute top-3 right-3 bg-teal-500 hover:bg-teal-600">{event.category}</Badge>
                  {event.availableTickets > 0 && (
                    <Badge className="absolute top-3 left-3 bg-green-500">Available</Badge>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-purple-700 line-clamp-1">{event.title}</CardTitle>
                  <Badge variant="outline" className="w-fit text-purple-600 border-purple-300">{event.category}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="line-clamp-2 text-gray-600">{event.description}</CardDescription>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>{new Date(event.startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>{event.availableTickets} of {event.totalTickets} tickets left</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Starting from</p>
                      <p className="text-2xl font-bold text-purple-700">${event.price.toFixed(2)}</p>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button className="bg-teal-600 hover:bg-teal-700">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  )
}
