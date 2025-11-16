'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/navigation'
import EventGrid from '@/components/event-grid'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Loader2 } from 'lucide-react'
import { eventsApi } from '@/lib/api-client'

const CATEGORIES = [
  'All Events',
  'Conference',
  'Concert',
  'Workshop',
  'Sports',
  'Festival',
  'Networking',
  'Exhibition'
]

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Events')
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [selectedCategory])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let data
      if (selectedCategory === 'All Events') {
        data = await eventsApi.getAll()
      } else {
        data = await eventsApi.getByCategory(selectedCategory)
      }
      
      setEvents(data)
    } catch (err) {
      console.error('Failed to fetch events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchEvents()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await eventsApi.search(searchQuery)
      setEvents(data)
    } catch (err) {
      console.error('Search failed:', err)
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Explore Events</h1>
          <p className="text-xl text-muted-foreground mb-8">Find and register for amazing events happening around you</p>
          
          {/* Search Bar */}
          <div className="flex gap-3 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search events by name, location, or organizer..." 
                className="pl-12 h-12 border-2 text-base" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button size="lg" className="px-8" onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
              Search
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-sm">Categories:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`cursor-pointer px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition ${
                    selectedCategory === category ? 'border-2' : 'border-2'
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchEvents}>Retry</Button>
          </div>
        ) : (
          <EventGrid events={events} />
        )}
      </section>
    </div>
  )
}
