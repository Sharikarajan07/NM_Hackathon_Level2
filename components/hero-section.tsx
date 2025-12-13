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
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-cyan-50 via-indigo-50 to-rose-50">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/50 via-indigo-100/50 to-rose-100/50 -z-10" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-fuchsia-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse delay-700" />
      
      <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border-2 border-cyan-500/20 mb-8 animate-fade-in backdrop-blur-sm shadow-lg">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">Next-Gen Event Management</span>
        </div>

        {/* Main heading with gradient */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 text-balance leading-tight">
          Discover Amazing{' '}
          <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent animate-gradient">
            Events
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-slate-700 mb-12 text-balance max-w-3xl mx-auto leading-relaxed font-medium">
          Register for concerts, conferences, workshops, and more. Get instant digital tickets with QR codes powered by our secure microservices architecture.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-6 justify-center flex-wrap mb-16">
          <Link href="/events">
            <Button size="lg" className="gap-2 text-lg px-10 py-7 h-auto shadow-2xl hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-700 hover:via-purple-700 hover:to-fuchsia-700 font-semibold">
              Browse Events <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="border-2 border-slate-300 text-lg px-10 py-7 h-auto hover:bg-white hover:border-cyan-500 hover:text-cyan-600 hover:scale-105 transition-all duration-300 shadow-lg font-semibold bg-white/50 backdrop-blur-sm">
              Create Account
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className={`grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-cyan-100 hover:border-cyan-400 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Diverse Events</h3>
            <p className="text-sm text-slate-600">From conferences to concerts</p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-fuchsia-100 hover:border-fuchsia-400 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-rose-600 flex items-center justify-center shadow-lg">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Instant Tickets</h3>
            <p className="text-sm text-slate-600">Digital QR code delivery</p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-violet-100 hover:border-violet-400 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Secure Platform</h3>
            <p className="text-sm text-slate-600">Connect with organizers</p>
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
