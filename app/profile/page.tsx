'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield, Loader2, Edit } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      router.push('/login')
      return
    }

    const name = localStorage.getItem('userName') || 'User'
    const email = localStorage.getItem('userEmail') || ''
    const role = localStorage.getItem('userRole') || 'USER'
    const id = localStorage.getItem('userId') || ''
    
    setUserName(name)
    setUserEmail(email)
    setUserRole(role)
    setUserId(id)
    setLoading(false)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-rose-50 to-amber-50">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">Profile Settings</h1>
          <p className="text-slate-600 text-lg font-medium">Manage your account information and preferences</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal Information Card */}
            <Card className="border-2 border-slate-200 shadow-xl bg-gradient-to-br from-white to-slate-50/50">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b-2 border-slate-200">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 font-semibold">Full Name</p>
                    <p className="font-bold text-lg text-slate-800">{userName}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 font-semibold">User ID</p>
                    <p className="font-mono text-lg font-bold text-slate-800">{userId}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 font-semibold">Email Address</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      <p className="font-bold text-lg text-slate-800">{userEmail}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 font-semibold">Account Role</p>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-600" />
                      <Badge 
                        className={`text-sm px-3 py-1 font-semibold shadow-sm ${
                          userRole === 'ORGANIZER' 
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {userRole}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-slate-200 pt-6">
                  <p className="text-sm text-slate-600 font-semibold mb-4">Account Status</p>
                  <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border-2 border-emerald-200 shadow-sm">
                    <span className="font-bold text-lg text-slate-800">Active Account</span>
                    <Badge className="text-sm px-4 py-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md">Verified</Badge>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg gap-2 font-semibold" 
                  size="lg"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Notification Preferences Card */}
            <Card className="border-2 border-slate-200 shadow-xl bg-gradient-to-br from-white to-slate-50/50">
              <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 border-b-2 border-slate-200">
                <CardTitle className="text-2xl flex items-center gap-3 text-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 shadow-sm">
                  <div>
                    <p className="font-bold text-lg text-slate-800">Email Notifications</p>
                    <p className="text-sm text-slate-600 mt-1 font-medium">Receive updates about your events and tickets</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-2 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all shadow-sm hover:shadow-md font-semibold"
                  >
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 shadow-sm">
                  <div>
                    <p className="font-bold text-lg text-slate-800">Event Reminders</p>
                    <p className="text-sm text-slate-600 mt-1 font-medium">Get notified before your events start</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition-all shadow-sm hover:shadow-md font-semibold"
                  >
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings Card */}
            <Card className="border-2 border-slate-200 shadow-xl bg-gradient-to-br from-white to-slate-50/50">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border-b-2 border-slate-200">
                <CardTitle className="text-2xl flex items-center gap-3 text-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 shadow-sm">
                  <div>
                    <p className="font-bold text-lg text-slate-800">Password</p>
                    <p className="text-sm text-slate-600 mt-1 font-medium">Last changed 30 days ago</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all shadow-sm hover:shadow-md font-semibold"
                  >
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 shadow-sm">
                  <div>
                    <p className="font-bold text-lg text-slate-800">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-600 mt-1 font-medium">Add an extra layer of security</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm hover:shadow-md font-semibold"
                  >
                    Setup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="outline" 
                className="flex-1 border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg font-semibold"
                size="lg"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/tickets')} 
                className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold"
                size="lg"
              >
                View My Tickets
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
