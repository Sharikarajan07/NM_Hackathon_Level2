'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Layers,
  LineChart,
  Zap,
  Users,
  Eye,
  EyeOff,
  Github
} from 'lucide-react'
import { authApi } from '@/lib/api-client'

export default function LoginPageClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{ title: string; message: string } | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [oauthProvider, setOauthProvider] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8081'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Loading sign-in...</div>
          <div className="text-sm text-slate-400">Preparing secure access.</div>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: Layers,
      title: 'Unified workspace',
      description: 'Bring registrations, payments, and customer data together.'
    },
    {
      icon: LineChart,
      title: 'Real-time analytics',
      description: 'Track conversion, attendance, and revenue in one view.'
    },
    {
      icon: Zap,
      title: 'Automated workflows',
      description: 'Launch campaigns and approvals without manual handoffs.'
    },
    {
      icon: Users,
      title: 'Team-ready controls',
      description: 'Granular access, audit trails, and enterprise SSO.'
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response: any = await authApi.login(email, password)
      console.log('LOGIN RESPONSE:', JSON.stringify(response, null, 2))
      console.log('User ID from response:', response.id)
      console.log('All response keys:', Object.keys(response))

      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userName', `${response.firstName} ${response.lastName}`)
      localStorage.setItem('userId', response.id?.toString() || '')
      localStorage.setItem('userRole', response.role)
      localStorage.setItem('userEmail', response.email)

      console.log('Stored in localStorage - userId:', localStorage.getItem('userId'))

      toast({
        title: 'Welcome back!',
        description: `Good to see you again, ${response.firstName}!`
      })

      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error: any) {
      console.error('LOGIN ERROR:', error)

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

  const handleOAuthRedirect = (provider: 'google' | 'github') => {
    setOauthProvider(provider)
    window.location.href = `${authBaseUrl}/api/auth/oauth2/authorize/${provider}`
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950/70 to-indigo-950 p-12">
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="absolute top-16 right-10 h-32 w-32 rounded-3xl bg-emerald-400/25 blur-2xl" />
          <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />

          <Link href="/" className="relative z-10 flex items-center gap-3 text-slate-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-wide">EventHub Cloud</p>
              <p className="text-xs text-slate-400">Enterprise event operations</p>
            </div>
          </Link>

          <div className="relative z-10 max-w-xl space-y-6">
            <div className="space-y-4">
              <p className="text-4xl font-semibold leading-tight tracking-tight">
                Streamline your workflow operations.
              </p>
              <p className="text-sm text-slate-300">
                Orchestrate registrations, ticketing, and customer journeys with a premium platform built for modern teams.
                Stay ahead with unified data, automation, and enterprise-grade reliability.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)] backdrop-blur"
                >
                  <feature.icon className="h-5 w-5 text-teal-200" />
                  <p className="mt-3 text-sm font-semibold">{feature.title}</p>
                  <p className="mt-1 text-xs text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <ShieldCheck className="h-4 w-4 text-teal-200" />
              <span>Single sign-on, audit trails, and enterprise encryption.</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                { label: '10K+ Users', value: 'Teams onboarded' },
                { label: '99.9% Uptime', value: 'Service guarantee' },
                { label: '24/7 Support', value: 'Enterprise coverage' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center"
                >
                  <p className="text-sm font-semibold text-white">{stat.label}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-slate-50 px-6 py-12 text-slate-900 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-slate-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <LogIn className="h-4 w-4" />
                </div>
                <span className="text-base font-semibold">EventHub</span>
              </Link>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                Secure access
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Welcome Back</h1>
              <p className="text-sm text-slate-600">Sign in to your account</p>
            </div>

            <Card className="border border-slate-200/80 shadow-xl">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-xl">Sign in</CardTitle>
                <p className="text-sm text-slate-500">Use your work email to continue.</p>
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
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        className="pl-9 h-11 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <button type="button" className="text-xs text-slate-500 hover:text-slate-700">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-9 pr-10 h-11 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(null); }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full bg-gradient-to-r from-teal-600 via-emerald-500 to-indigo-600 text-white shadow-lg shadow-teal-200/40 transition hover:brightness-110"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">...</span>
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    OR
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 gap-2 border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                      onClick={() => handleOAuthRedirect('google')}
                      disabled={!!oauthProvider}
                    >
                      <span className="text-base">G</span>
                      {oauthProvider === 'google' ? 'Redirecting...' : 'Google'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 gap-2 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
                      onClick={() => handleOAuthRedirect('github')}
                      disabled={!!oauthProvider}
                    >
                      <Github className="h-4 w-4" />
                      {oauthProvider === 'github' ? 'Redirecting...' : 'GitHub'}
                    </Button>
                  </div>

                  <p className="text-center text-xs text-slate-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-semibold text-slate-900 hover:underline">
                      Sign up
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
