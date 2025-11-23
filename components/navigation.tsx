'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  Settings, 
  Calendar, 
  Ticket, 
  LogOut, 
  User, 
  Menu,
  X,
  Home,
  CreditCard
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Navigation() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('userName')
    const role = localStorage.getItem('userRole')
    const email = localStorage.getItem('userEmail')
    setIsLoggedIn(!!token)
    setUserName(user || '')
    setUserRole(role || '')
    setUserEmail(email || '')
  }, [])

  if (!mounted) {
    return (
      <nav className="border-b border-border bg-background/95 sticky top-0 z-50 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-all">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent tracking-tight">
                EventHub
              </span>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    setMobileMenuOpen(false)
    router.push('/')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  return (
    <nav className="border-b border-border/40 bg-white/80 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-foreground/80 hover:text-teal-600 transition font-medium group px-3 py-2"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Home</span>
            </Link>
            <Link 
              href="/events" 
              className="flex items-center gap-2 text-foreground/80 hover:text-teal-600 transition font-medium group px-3 py-2"
            >
              <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Browse Events</span>
            </Link>
            
            {isLoggedIn ? (
              <>
                {userRole === 'ORGANIZER' && (
                  <Link href="/admin/events">
                    <Button variant="ghost" className="font-medium gap-2 hover:bg-teal-50 hover:text-teal-600 transition-all text-sm h-9">
                      <Settings className="w-4 h-4" />
                      Manage Events
                    </Button>
                  </Link>
                )}
                
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 hover:bg-teal-50 hover:text-teal-600 transition-all h-9">
                      <Avatar className="w-7 h-7 border-2 border-teal-300 shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-600 text-white font-semibold text-xs">
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{userName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 shadow-xl border-2">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground">{userEmail}</p>
                        <p className="text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-md inline-block w-fit">{userRole}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer hover:bg-primary/10">
                        <LayoutDashboard className="w-4 h-4 mr-2 text-primary" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tickets" className="cursor-pointer hover:bg-primary/10">
                        <Ticket className="w-4 h-4 mr-2 text-primary" />
                        My Tickets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/payment-records" className="cursor-pointer hover:bg-primary/10">
                        <CreditCard className="w-4 h-4 mr-2 text-primary" />
                        Payment Records
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer hover:bg-primary/10">
                        <User className="w-4 h-4 mr-2 text-primary" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {userRole === 'ORGANIZER' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/events" className="cursor-pointer hover:bg-primary/10">
                          <Settings className="w-4 h-4 mr-2 text-accent" />
                          Manage Events
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="border-2 border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all shadow-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link 
                href="/events" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="w-4 h-4" />
                Browse Events
              </Link>
              
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2 border-t border-border mt-2">
                    <p className="text-sm font-semibold">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </Link>
                  <Link 
                    href="/tickets" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Ticket className="w-4 h-4" />
                    My Tickets
                  </Link>
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  {userRole === 'ORGANIZER' && (
                    <Link 
                      href="/admin/events" 
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Manage Events
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4 pt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
