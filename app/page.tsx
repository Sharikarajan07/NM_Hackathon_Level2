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
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose EventHub</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Calendar className="w-12 h-12 mb-3 text-primary" />
              <CardTitle className="text-xl">Easy Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Browse and discover events from your favorite categories with powerful filters</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Users className="w-12 h-12 mb-3 text-primary" />
              <CardTitle className="text-xl">Quick Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Register in seconds and get instant confirmation via email</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Ticket className="w-12 h-12 mb-3 text-primary" />
              <CardTitle className="text-xl">Digital Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get QR codes and digital tickets instantly after registration</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Shield className="w-12 h-12 mb-3 text-primary" />
              <CardTitle className="text-xl">Secure & Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Enterprise-grade security with JWT authentication</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/30">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2">Featured Events</h2>
            <p className="text-muted-foreground">Discover exciting events happening near you</p>
          </div>
          <Link href="/events">
            <Button variant="outline" size="lg">View All Events</Button>
          </Link>
        </div>
        <EventGrid limit={6} />
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Experience Amazing Events?</h2>
          <p className="text-xl mb-10 opacity-90">Join thousands of attendees discovering and registering for events with our secure microservices platform</p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">Get Started Free</Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="border-2 border-primary-foreground bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6 h-auto backdrop-blur-sm">Browse Events</Button>
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
