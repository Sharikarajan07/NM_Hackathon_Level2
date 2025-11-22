import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Navigation from '@/components/navigation'
import HeroSection from '@/components/hero-section'
import EventGrid from '@/components/event-grid'
import { Calendar, Users, Ticket, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Why Choose EventHub</h2>
        <p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">Experience seamless event management with enterprise-grade features</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border-2 hover:border-cyan-400 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 bg-gradient-to-br from-card to-cyan-50/50">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Easy Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Browse and discover events from your favorite categories with powerful filters</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-fuchsia-400 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 bg-gradient-to-br from-card to-fuchsia-50/50">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Quick Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Register in seconds and get instant confirmation via email</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-violet-400 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 bg-gradient-to-br from-card to-violet-50/50">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Ticket className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Digital Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get QR codes and digital tickets instantly after registration</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-rose-400 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 bg-gradient-to-br from-card to-rose-50/50">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Secure & Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Enterprise-grade security with JWT authentication</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Featured Events</h2>
            <p className="text-muted-foreground text-lg">Discover exciting events happening near you</p>
          </div>
          <Link href="/events">
            <Button variant="outline" size="lg" className="border-2 hover:border-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-md hover:shadow-lg">View All Events</Button>
          </Link>
        </div>
        <EventGrid limit={6} />
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">Ready to Experience Amazing Events?</h2>
          <p className="text-xl mb-10 opacity-95">Join thousands of attendees discovering and registering for events with our secure microservices platform</p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-white text-violet-700 font-semibold hover:bg-violet-50">Get Started Free</Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-fuchsia-700 text-lg px-8 py-6 h-auto backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold">Browse Events</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">EventHub</h3>
              <p className="text-sm text-muted-foreground">Discover, register, and enjoy amazing events</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="#" className="hover:text-foreground">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
