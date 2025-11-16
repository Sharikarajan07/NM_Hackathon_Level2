import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/50 to-background">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-6xl sm:text-7xl font-bold mb-8 text-balance leading-tight">
          Discover Amazing <span className="text-primary">Events</span>
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground mb-12 text-balance max-w-3xl mx-auto">
          Register for concerts, conferences, workshops, and more. Get instant digital tickets with QR codes powered by our secure microservices architecture.
        </p>
        <div className="flex gap-6 justify-center flex-wrap">
          <Link href="/events">
            <Button size="lg" className="gap-2 text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow">
              Browse Events <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="border-2 text-lg px-8 py-6 h-auto">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
