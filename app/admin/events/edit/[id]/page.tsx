'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { eventsApi } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { CalendarIcon, MapPin, DollarSign, Users, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    totalTickets: '',
    availableTickets: '',
    price: '',
    imageUrl: '',
    organizer: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const role = localStorage.getItem('userRole')
    
    if (!token) {
      router.push('/login')
      return
    }
    
    if (role !== 'ORGANIZER') {
      toast({
        title: 'Access Denied',
        description: 'Only organizers can edit events.',
        variant: 'destructive'
      })
      router.push('/dashboard')
      return
    }

    loadEvent()
  }, [router, params.id])

  const loadEvent = async () => {
    try {
      setFetching(true)
      const event = await eventsApi.getById(params.id as string)
      
      // Format dates for datetime-local input
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16)
      }

      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || '',
        location: event.location || '',
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        totalTickets: event.totalTickets?.toString() || '',
        availableTickets: event.availableTickets?.toString() || '',
        price: event.price?.toString() || '',
        imageUrl: event.imageUrl || '',
        organizer: event.organizer || ''
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load event details',
        variant: 'destructive'
      })
      router.push('/admin/events')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select start and end dates',
        variant: 'destructive'
      })
      return
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast({
        title: 'Validation Error',
        description: 'End date must be after start date',
        variant: 'destructive'
      })
      return
    }

    const totalTickets = parseInt(formData.totalTickets)
    const availableTickets = parseInt(formData.availableTickets)
    const price = parseFloat(formData.price)

    if (isNaN(totalTickets) || totalTickets <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Total tickets must be a positive number',
        variant: 'destructive'
      })
      return
    }

    if (isNaN(availableTickets) || availableTickets < 0) {
      toast({
        title: 'Validation Error',
        description: 'Available tickets must be a valid number',
        variant: 'destructive'
      })
      return
    }

    if (availableTickets > totalTickets) {
      toast({
        title: 'Validation Error',
        description: 'Available tickets cannot exceed total tickets',
        variant: 'destructive'
      })
      return
    }

    if (isNaN(price) || price < 0) {
      toast({
        title: 'Validation Error',
        description: 'Price must be a valid number',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      
      await eventsApi.update(params.id as string, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalTickets,
        availableTickets,
        price,
        organizer: formData.organizer,
        imageUrl: formData.imageUrl || undefined
      })

      toast({
        title: 'Success!',
        description: 'Event updated successfully'
      })
      
      router.push('/admin/events')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update event',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-fuchsia-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-fuchsia-50">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/events')}
            className="mb-4 border-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
            Edit Event
          </h1>
          <p className="text-muted-foreground text-lg">Update your event details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-purple-50">
              <CardTitle className="text-2xl">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Event Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter event title"
                  className="border-2"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your event"
                  rows={4}
                  className="border-2"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Concert">Concert</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Festival">Festival</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Exhibition">Exhibition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Event location"
                  className="border-2"
                  required
                />
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-base font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="border-2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-base font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="border-2"
                    required
                  />
                </div>
              </div>

              {/* Tickets & Price */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="totalTickets" className="text-base font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Tickets <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    min="1"
                    value={formData.totalTickets}
                    onChange={(e) => handleChange('totalTickets', e.target.value)}
                    placeholder="100"
                    className="border-2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableTickets" className="text-base font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Available Tickets <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="availableTickets"
                    type="number"
                    min="0"
                    value={formData.availableTickets}
                    onChange={(e) => handleChange('availableTickets', e.target.value)}
                    placeholder="100"
                    className="border-2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price (USD) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    className="border-2"
                    required
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-base font-semibold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Event Image URL
                </Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="border-2"
                />
                <p className="text-sm text-muted-foreground">
                  Add a direct link to an image (Unsplash, Pexels, etc.)
                </p>
                {formData.imageUrl && (
                  <div className="mt-4 rounded-lg overflow-hidden border-2">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/events')}
                  className="flex-1 border-2"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 hover:from-cyan-700 hover:via-purple-700 hover:to-fuchsia-700 text-white shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Event'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </section>
    </div>
  )
}
