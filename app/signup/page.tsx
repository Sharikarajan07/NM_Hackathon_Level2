'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Mail, Lock, User, UserCircle, AlertCircle } from 'lucide-react'
import { authApi } from '@/lib/api-client'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{ title: string; message: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = { title: 'Password Mismatch', message: 'Passwords do not match.' }
      setError(errorMsg)
      toast({
        title: errorMsg.title,
        description: errorMsg.message,
        variant: 'destructive',
        duration: 5000,
      })
      return
    }

    if (formData.password.length < 6) {
      const errorMsg = { title: 'Weak Password', message: 'Password must be at least 6 characters long.' }
      setError(errorMsg)
      toast({
        title: errorMsg.title,
        description: errorMsg.message,
        variant: 'destructive',
        duration: 5000,
      })
      return
    }

    setIsLoading(true)

    try {
      console.log('📝 SIGNUP REQUEST:', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      })

      const response: any = await authApi.signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      })
      
      console.log('✅ SIGNUP RESPONSE:', JSON.stringify(response, null, 2))
      console.log('✅ User ID from response:', response.id)
      
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`)
      localStorage.setItem('userId', response.id?.toString() || '')
      localStorage.setItem('userRole', formData.role)
      localStorage.setItem('userEmail', formData.email)
      
      console.log('✅ Stored in localStorage:', {
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName'),
        userRole: localStorage.getItem('userRole')
      })
      
      toast({
        title: 'Account Created!',
        description: `Welcome to EventHub, ${formData.firstName}!`
      })
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error: any) {
      console.error('❌ SIGNUP ERROR:', error)
      
      let errorTitle = 'Registration Failed'
      let errorDescription = 'Failed to create account. Please try again.'
      
      if (error.status === 409 || (error.message && error.message.toLowerCase().includes('already registered'))) {
        errorTitle = 'Email Already Registered'
        errorDescription = 'This email is already registered with another account. Please login to continue.'
      } else if (error.message && error.message.includes('User already exists')) {
        errorTitle = 'Email Already Registered'
        errorDescription = 'This email is already registered with another account. Please login to continue.'
      } else if (error.status === 400) {
        errorDescription = 'Invalid input. Please check all fields and try again.'
      } else if (error.status === 500) {
        errorDescription = 'Server error. Please try again later.'
      } else if (error.message) {
        errorDescription = error.message
      }
      
      setError({ title: errorTitle, message: errorDescription })
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-2xl shadow-2xl border-2">
          <CardHeader className="space-y-2 pb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserCircle className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl text-center">Create Your Account</CardTitle>
            <p className="text-muted-foreground text-center text-lg">Join EventHub and discover amazing events</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{error.title}</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-base">First Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      className="pl-10 h-12"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-base">Last Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      className="pl-10 h-12"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-base">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-12"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role" className="text-base">Account Type</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="h-12 mt-2">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Event Attendee</SelectItem>
                    <SelectItem value="ORGANIZER">Event Organizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-base">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-12"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-base">Confirm Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-12"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-semibold">
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
