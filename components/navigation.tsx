'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Settings } from 'lucide-react'

export default function Navigation() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('userName')
    const role = localStorage.getItem('userRole')
    setIsLoggedIn(!!token)
    setUserName(user || '')
    setUserRole(role || '')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent tracking-tight hover:opacity-80 transition">
          EventHub
        </Link>
        
        <div className="flex items-center gap-8">
          <Link href="/events" className="text-foreground hover:text-primary transition font-medium">
            Events
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              {userRole === 'ORGANIZER' && (
                <Link href="/admin/events">
                  <Button variant="ghost" className="font-medium gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Events
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" className="font-medium gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  {userName}
                </Button>
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
