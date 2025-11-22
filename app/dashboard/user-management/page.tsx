'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Users, Search, Shield, UserCheck, UserX, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function UserManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const role = localStorage.getItem('userRole') || ''
    
    if (!token) {
      router.push('/login')
      return
    }

    setUserRole(role)

    // Check if user is admin
    if (role !== 'ADMIN') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      })
      router.push('/dashboard')
      return
    }
    
    loadUsers()
  }, [router, toast])

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Mock users data - replace with actual API call
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER',
          status: 'active',
          registeredEvents: 5,
          totalTickets: 8,
          joinDate: '2025-01-15'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'ORGANIZER',
          status: 'active',
          registeredEvents: 12,
          totalTickets: 15,
          joinDate: '2025-02-20'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'USER',
          status: 'active',
          registeredEvents: 3,
          totalTickets: 4,
          joinDate: '2025-03-10'
        },
        {
          id: '4',
          name: 'Alice Williams',
          email: 'alice@example.com',
          role: 'ADMIN',
          status: 'active',
          registeredEvents: 20,
          totalTickets: 25,
          joinDate: '2024-12-01'
        },
        {
          id: '5',
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          role: 'USER',
          status: 'inactive',
          registeredEvents: 1,
          totalTickets: 1,
          joinDate: '2025-10-05'
        }
      ]
      
      setUsers(mockUsers)
      
    } catch (error) {
      console.error('Failed to load users:', error)
      toast({
        title: "Error",
        description: "Failed to load users data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'ORGANIZER':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'USER':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
      : 'bg-slate-100 text-slate-600 border-slate-300'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    organizers: users.filter(u => u.role === 'ORGANIZER').length,
    regularUsers: users.filter(u => u.role === 'USER').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-fuchsia-50">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4 gap-2 hover:bg-teal-50 hover:text-teal-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">User Management</h1>
              <p className="text-slate-600 text-xl font-medium">Monitor and manage all platform users</p>
            </div>
            <Badge className="bg-red-100 text-red-700 border-2 border-red-300 px-4 py-2 text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Admin Access
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-2 border-slate-200 shadow-lg bg-white">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-slate-800">{userStats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 shadow-lg bg-gradient-to-br from-white to-emerald-50/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-emerald-600">{userStats.active}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 shadow-lg bg-gradient-to-br from-white to-red-50/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Admins</p>
                  <p className="text-3xl font-bold text-red-600">{userStats.admins}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-white to-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Organizers</p>
                  <p className="text-3xl font-bold text-blue-600">{userStats.organizers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-white to-green-50/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Regular Users</p>
                  <p className="text-3xl font-bold text-green-600">{userStats.regularUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-2 border-slate-200 shadow-lg bg-white mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-2 border-slate-200 focus:border-teal-400"
                />
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700 h-12 px-6">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-2 border-slate-200 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-cyan-50 via-purple-50 to-fuchsia-50 border-b-2 border-slate-200">
            <CardTitle className="text-2xl">All Users</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserX className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-xl font-bold text-slate-600 mb-2">No users found</p>
                <p className="text-slate-500">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Name</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Email</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Role</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Status</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Events</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Tickets</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Joined</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{user.email}</td>
                        <td className="py-4 px-4">
                          <Badge className={`${getRoleBadgeColor(user.role)} border-2 px-3 py-1`}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusBadgeColor(user.status)} border-2 px-3 py-1`}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-slate-800 font-semibold">{user.registeredEvents}</td>
                        <td className="py-4 px-4 text-slate-800 font-semibold">{user.totalTickets}</td>
                        <td className="py-4 px-4 text-slate-600">{formatDate(user.joinDate)}</td>
                        <td className="py-4 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50 text-teal-600"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
