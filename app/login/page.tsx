'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { authApi } from '@/lib/api-client'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{ title: string; message: string } | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response: any = await authApi.login(email, password)
      console.log('🔐 LOGIN RESPONSE:', JSON.stringify(response, null, 2))
      console.log('🔐 User ID from response:', response.id)
      console.log('🔐 All response keys:', Object.keys(response))
      
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userName', `${response.firstName} ${response.lastName}`)
      localStorage.setItem('userId', response.id?.toString() || '')
      localStorage.setItem('userRole', response.role)
      localStorage.setItem('userEmail', response.email)
      
      console.log('✅ Stored in localStorage - userId:', localStorage.getItem('userId'))
      
      toast({
        title: 'Welcome back!',
        description: `Good to see you again, ${response.firstName}!`
      })
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error: any) {
      console.error('❌ LOGIN ERROR:', error)
      
      let errorTitle = 'Login Failed'
      let errorDescription = 'Invalid email or password. Please try again.'
      
      if (error.status === 401 || error.status === 403) {
        errorDescription = 'Invalid email or password. Please check your credentials.'
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md shadow-2xl border-2 hover:border-indigo-300 transition-all">
          <CardHeader className="space-y-2 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Welcome Back</CardTitle>
            <p className="text-muted-foreground text-center text-lg">Sign in to your EventHub account</p>
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
              
              <div>
                <Label htmlFor="email" className="text-base">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-indigo-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-12 border-2 hover:border-indigo-300 focus:border-indigo-500"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-base">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-12 border-2 hover:border-purple-300 focus:border-purple-500"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-2">
                Don't have an account?{' '}
                <Link href="/signup" className="text-indigo-600 hover:underline font-semibold hover:text-purple-600">
                  Sign up here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
