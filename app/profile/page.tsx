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
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account information and preferences</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal Information Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <User className="w-6 h-6" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">Full Name</p>
                    <p className="font-semibold text-lg">{userName}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">User ID</p>
                    <p className="font-mono text-lg">{userId}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">Email Address</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="font-semibold text-lg">{userEmail}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">Account Role</p>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <Badge variant={userRole === 'ORGANIZER' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                        {userRole}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <p className="text-sm text-muted-foreground font-medium mb-4">Account Status</p>
                  <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                    <span className="font-semibold text-lg">Active Account</span>
                    <Badge variant="default" className="text-sm px-4 py-1">Verified</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-2 gap-2" size="lg">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Notification Preferences Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">Email Notifications</p>
                    <p className="text-sm text-muted-foreground mt-1">Receive updates about your events and tickets</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-2">Enable</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">Event Reminders</p>
                    <p className="text-sm text-muted-foreground mt-1">Get notified before your events start</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-2">Enable</Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">Password</p>
                    <p className="text-sm text-muted-foreground mt-1">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-2">Change</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-2">Setup</Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="outline" 
                className="flex-1 border-2"
                size="lg"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/tickets')} 
                className="flex-1"
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
