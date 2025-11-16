'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('userName')
    setIsLoggedIn(!!token)
    setUserName(user || '')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary tracking-tight hover:opacity-80 transition">
          EventHub
        </Link>
        
        <div className="flex items-center gap-8">
          <Link href="/events" className="text-foreground hover:text-primary transition font-medium">
            Events
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="font-medium">{userName}</Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="border-2">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="outline" className="border-2">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="shadow-sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
