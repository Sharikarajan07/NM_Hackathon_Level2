'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function OAuthSuccessClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      if (error === 'oauth_unregistered') {
        const email = searchParams.get('email')
        const provider = searchParams.get('provider')
        toast({
          title: 'Account not found',
          description: 'Please sign up to continue with this provider.',
          variant: 'destructive',
        })
        const signupParams = new URLSearchParams()
        if (email) signupParams.set('email', email)
        if (provider) signupParams.set('provider', provider)
        const signupUrl = signupParams.toString()
          ? `/signup?${signupParams.toString()}`
          : '/signup'
        router.replace(signupUrl)
        return
      }

      toast({
        title: 'OAuth Login Failed',
        description: 'Please try again or use email and password.',
        variant: 'destructive',
      })
      router.replace('/login')
      return
    }

    const token = searchParams.get('token')
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const firstName = searchParams.get('firstName')
    const lastName = searchParams.get('lastName')
    const role = searchParams.get('role')

    if (!token) {
      toast({
        title: 'OAuth Login Failed',
        description: 'Missing token. Please try again.',
        variant: 'destructive',
      })
      router.replace('/login')
      return
    }

    localStorage.setItem('authToken', token)
    localStorage.setItem('userId', userId || '')
    localStorage.setItem('userEmail', email || '')
    localStorage.setItem('userRole', role || 'USER')
    localStorage.setItem('userName', `${firstName || 'User'} ${lastName || ''}`.trim())

    toast({
      title: 'Welcome back!',
      description: 'You are now signed in.',
    })

    router.replace('/dashboard')
  }, [router, searchParams, toast])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-lg font-semibold">Signing you in...</div>
        <div className="text-sm text-slate-400">Finalizing OAuth session.</div>
      </div>
    </div>
  )
}
