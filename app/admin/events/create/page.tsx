'use client'

import { useRouter } from 'next/navigation'
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
import { CalendarIcon, MapPin, DollarSign, Users, Image as ImageIcon, Loader2 } from 'lucide-react'

export default function CreateEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    totalTickets: '',
    price: '',
    imageUrl: ''
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
        description: 'Only organizers can create events.',
        variant: 'destructive'
      })
      router.push('/dashboard')
    }
  }, [router])

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
    const price = parseFloat(formData.price)

    if (isNaN(totalTickets) || totalTickets <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Total tickets must be a positive number',
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
      const userName = localStorage.getItem('userName') || 'Organizer'
      
      await eventsApi.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalTickets,
        price,
        organizer: userName,
        imageUrl: formData.imageUrl || undefined
      })

      toast({
        title: 'Success!',
        description: 'Event created successfully'
      })
      
      router.push('/admin/events')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-fuchsia-50">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
            Create New Event
          </h1>
          <p className="text-muted-foreground text-lg">Fill in the details to create your event</p>
        </div>

        <Card className="border-2 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-purple-50">
            <CardTitle className="text-2xl">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter event title"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your event..."
                  rows={5}
                  className="text-base resize-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-semibold">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Concert">Concert</SelectItem>
                      <SelectItem value="Festival">Festival</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Exhibition">Exhibition</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location *
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Event venue"
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-base font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-base font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="totalTickets" className="text-base font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Tickets *
                  </Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    min="1"
                    value={formData.totalTickets}
                    onChange={(e) => handleChange('totalTickets', e.target.value)}
                    placeholder="100"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Ticket Price *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="imageUrl" className="text-base font-semibold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Image URL (Optional)
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-xxx?w=800"
                  className="h-12 text-base"
                />
                <p className="text-sm text-muted-foreground">
                  Paste an image URL from Unsplash or any image hosting service
                </p>
                
                {/* Live Image Preview */}
                {formData.imageUrl && (
                  <div className="mt-4 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50">
                    <div className="bg-gradient-to-r from-cyan-50 to-purple-50 px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-slate-700">Image Preview</p>
                    </div>
                    <div className="p-4">
                      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                        <img 
                          src={formData.imageUrl} 
                          alt="Event preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                            const parent = (e.target as HTMLImageElement).parentElement
                            if (parent) {
                              parent.innerHTML = `
                                <div class="flex flex-col items-center justify-center h-full text-slate-500">
                                  <svg class="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  <p class="font-medium">Invalid image URL</p>
                                  <p class="text-sm">Please check the URL and try again</p>
                                </div>
                              `
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/events')}
                  className="flex-1 h-12 text-base border-2"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base shadow-lg hover:shadow-xl transition-all bg-teal-600 hover:bg-teal-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
