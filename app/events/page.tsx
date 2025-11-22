'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import EventGrid from '@/components/event-grid'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Loader2, Plus } from 'lucide-react'
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
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('All Events')
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem('userRole')
    setUserRole(role || '')
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

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cyan-50 via-purple-50 to-fuchsia-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Explore Events</h1>
              <p className="text-xl text-muted-foreground">Find and register for amazing events happening around you</p>
            </div>
            {userRole === 'ORGANIZER' && (
              <Button 
                size="lg" 
                onClick={() => router.push('/admin/events/create')}
                className="gap-2 shadow-lg hover:shadow-xl transition-all bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </Button>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-3 mb-8 mt-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
              <Input 
                placeholder="Search events by name, location, or organizer..." 
                className="pl-12 h-12 border-2 text-base hover:border-purple-400 focus:border-purple-500" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button size="lg" className="px-8 bg-teal-600 hover:bg-teal-700" onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
              Search
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-600" />
              <span className="font-semibold text-sm">Categories:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`cursor-pointer px-4 py-2 text-sm transition ${
                    selectedCategory === category 
                      ? 'bg-teal-600 hover:bg-teal-700 border-0 text-white' 
                      : 'border-2 hover:border-teal-400 hover:bg-teal-50'
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
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchEvents} className="bg-teal-600 hover:bg-teal-700">Retry</Button>
          </div>
        ) : (
          <EventGrid events={events} />
        )}
      </section>
    </div>
  )
}
