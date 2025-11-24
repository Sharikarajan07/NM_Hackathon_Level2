'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Calendar, Ticket, DollarSign, Users, Activity, BarChart3, PieChart, Target } from 'lucide-react'
import { registrationApi, ticketsApi, eventsApi } from '@/lib/api-client'

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [upcomingEvents, setUpcomingEvents] = useState(0)
  const [eventsMap, setEventsMap] = useState<{[key: string]: any}>({})

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userId = localStorage.getItem('userId')
    
    if (!token) {
      router.push('/login')
      return
    }

    if (!userId) {
      router.push('/login')
      return
    }
    
    loadAnalytics(userId)
  }, [router])

  const loadAnalytics = async (userId: string) => {
    try {
      setLoading(true)
      
      const [userRegs, userTickets] = await Promise.all([
        registrationApi.getUserRegistrations(userId),
        ticketsApi.getUserTickets(userId)
      ]) as [any[], any[]]
      
      setRegistrations(userRegs)
      setTickets(userTickets)
      
      // Calculate total spent
      const total = userTickets.reduce((sum: number, ticket: any) => {
        return sum + (ticket.price || 0)
      }, 0)
      setTotalSpent(total)

      // Get events data
      const eventIds = [...new Set(userTickets.map((t: any) => t.eventId))]
      const events = await Promise.all(eventIds.map(id => eventsApi.getById(id.toString())))
      
      const eventsMapping: {[key: string]: any} = {}
      events.forEach((event: any) => {
        eventsMapping[event.id] = event
      })
      setEventsMap(eventsMapping)
      
      // Calculate upcoming events
      const now = new Date()
      const upcoming = events.filter((event: any) => new Date(event.startDate) > now).length
      setUpcomingEvents(upcoming)
      
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthlyStats = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const thisMonthTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt || ticket.bookingDate || now)
      return ticketDate.getMonth() === currentMonth && ticketDate.getFullYear() === currentYear
    })
    
    return {
      count: thisMonthTickets.length,
      spent: thisMonthTickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0)
    }
  }

  const monthlyStats = getMonthlyStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/30">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4 gap-2 hover:bg-purple-50 hover:text-purple-600 transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Analytics Dashboard</h1>
          <p className="text-slate-600 text-lg font-medium">Track your event engagement and performance insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white to-purple-50/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Total Tickets</p>
                  <p className="text-4xl font-bold text-slate-800 transition-all duration-300">{tickets.length}</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">All time purchases</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Ticket className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="group border-2 border-cyan-200 shadow-lg bg-gradient-to-br from-white to-cyan-50/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Total Spent</p>
                  <p className="text-4xl font-bold text-slate-800">${totalSpent.toFixed(2)}</p>
                  <p className="text-xs text-cyan-600 font-medium mt-1">Total investment</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="w-full bg-cyan-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-full rounded-full transition-all duration-500" style={{ width: totalSpent > 0 ? '100%' : '0%' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="group border-2 border-fuchsia-200 shadow-lg bg-gradient-to-br from-white to-fuchsia-50/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Upcoming Events</p>
                  <p className="text-4xl font-bold text-slate-800">{upcomingEvents}</p>
                  <p className="text-xs text-fuchsia-600 font-medium mt-1">Events to attend</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="w-full bg-fuchsia-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 h-full rounded-full transition-all duration-500" style={{ width: upcomingEvents > 0 ? `${Math.min((upcomingEvents / 10) * 100, 100)}%` : '0%' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="group border-2 border-teal-200 shadow-lg bg-gradient-to-br from-white to-teal-50/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Registrations</p>
                  <p className="text-4xl font-bold text-slate-800">{registrations.length}</p>
                  <p className="text-xs text-teal-600 font-medium mt-1">Total registered</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="w-full bg-teal-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-slate-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-cyan-50 via-purple-50 to-fuchsia-50 border-b-2 border-slate-200">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-fuchsia-600 flex items-center justify-center shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                This Month's Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="group p-5 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-sm text-slate-600 font-semibold mb-1">Tickets Purchased</p>
                      <p className="text-4xl font-bold text-slate-800">{monthlyStats.count}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center">
                      <Ticket className="w-7 h-7 text-purple-600" />
                    </div>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-full rounded-full transition-all duration-500" style={{ width: monthlyStats.count > 0 ? '100%' : '0%' }} />
                  </div>
                </div>
                
                <div className="group p-5 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border-2 border-cyan-200 hover:border-cyan-300 transition-all duration-300 hover:shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-sm text-slate-600 font-semibold mb-1">Amount Spent</p>
                      <p className="text-4xl font-bold text-slate-800">${monthlyStats.spent.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center">
                      <DollarSign className="w-7 h-7 text-cyan-600" />
                    </div>
                  </div>
                  <div className="w-full bg-cyan-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-teal-500 h-full rounded-full transition-all duration-500" style={{ width: monthlyStats.spent > 0 ? '100%' : '0%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-fuchsia-50 to-purple-50 border-b-2 border-slate-200">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-600 font-semibold">Avg Ticket Price</span>
                  </div>
                  <span className="text-xl font-bold text-slate-800">
                    ${tickets.length > 0 ? (totalSpent / tickets.length).toFixed(2) : '0.00'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-600 font-semibold">Unique Events</span>
                  </div>
                  <span className="text-xl font-bold text-slate-800">
                    {new Set(tickets.map(t => t.eventId)).size}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-600 font-semibold">Active Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xl font-bold text-emerald-600">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <Card className="border-2 border-slate-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-cyan-50 via-purple-50 to-fuchsia-50 border-b-2 border-slate-200">
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group p-6 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-800">Event Engagement</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {tickets.length > 5 
                    ? "Outstanding! You're an active event enthusiast. Keep discovering amazing experiences."
                    : "Explore more events to enhance your entertainment journey and discover new interests."}
                </p>
                <Button 
                  onClick={() => router.push('/events')}
                  className="bg-teal-600 hover:bg-teal-700 w-full transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Browse Events
                </Button>
              </div>

              <div className="group p-6 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl border-2 border-cyan-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-800">Spending Summary</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Total investment: ${totalSpent.toFixed(2)}. Track your experiences and make the most of every event!
                </p>
                <Button 
                  onClick={() => router.push('/tickets')}
                  className="bg-teal-600 hover:bg-teal-700 w-full transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  View Tickets
                </Button>
              </div>

              <div className="group p-6 bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-2xl border-2 border-fuchsia-200 hover:border-fuchsia-300 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-800">Upcoming Events</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {upcomingEvents > 0 
                    ? `Exciting! You have ${upcomingEvents} event${upcomingEvents > 1 ? 's' : ''} on your calendar.`
                    : "No upcoming events. Discover and register for new exciting experiences!"}
                </p>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-teal-600 hover:bg-teal-700 w-full transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
