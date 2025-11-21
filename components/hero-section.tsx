'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Ticket, Users, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('authToken')
    setIsLoggedIn(!!token)
  }, [])

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/30 -z-10" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Next-Gen Event Management</span>
        </div>

        {/* Main heading with gradient */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 text-balance leading-tight">
          Discover Amazing{' '}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient">
            Events
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-muted-foreground mb-12 text-balance max-w-3xl mx-auto leading-relaxed">
          Register for concerts, conferences, workshops, and more. Get instant digital tickets with QR codes powered by our secure microservices architecture.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-6 justify-center flex-wrap mb-16">
          <Link href="/events">
            <Button size="lg" className="gap-2 text-lg px-10 py-7 h-auto shadow-2xl hover:shadow-primary/20 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80">
              Browse Events <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          {!isLoggedIn && (
            <Link href="/signup">
              <Button size="lg" variant="outline" className="border-2 text-lg px-10 py-7 h-auto hover:bg-primary/5 hover:scale-105 transition-all duration-300">
                Create Account
              </Button>
            </Link>
          )}
        </div>

        {/* Feature highlights */}
        <div className={`grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Diverse Events</h3>
            <p className="text-sm text-muted-foreground">From conferences to concerts</p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Ticket className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Instant Tickets</h3>
            <p className="text-sm text-muted-foreground">Digital QR code delivery</p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Join Community</h3>
            <p className="text-sm text-muted-foreground">Connect with organizers</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
