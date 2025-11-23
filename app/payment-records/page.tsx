'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Receipt, Calendar, DollarSign, CreditCard } from 'lucide-react'

interface PaymentRecord {
  id: number
  userId: number
  bookingId: number
  transactionId: string
  amount: number
  currency: string
  status: string
  customerEmail: string
  paymentMethod: string
  description: string
  createdAt: string
  updatedAt: string
}

export default function PaymentRecordsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchPaymentRecords()
  }, [])

  const fetchPaymentRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setError('Please log in to view payment records')
        setLoading(false)
        return
      }

      const response = await fetch(
        `http://10.74.115.219:8080/api/payments/history/${userId}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment records')
      }

      const data = await response.json()
      setPayments(data)
    } catch (err) {
      console.error('Error fetching payment records:', err)
      setError(err instanceof Error ? err.message : 'Failed to load payment records')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      SUCCESS: 'default',
      PENDING: 'secondary',
      FAILED: 'destructive',
      CANCELLED: 'outline',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const getTotalAmount = () => {
    return payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  const getStatusCount = (status: string) => {
    return payments.filter((p) => p.status === status).length
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Payment Records
          </h1>
          <p className="text-muted-foreground text-lg">
            View all your payment transactions and manage your billing history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 hover:border-cyan-400 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 bg-gradient-to-br from-card to-cyan-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Payments
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Receipt className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{payments.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-400 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 bg-gradient-to-br from-card to-green-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Successful</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {getStatusCount('SUCCESS')}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-yellow-400 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 bg-gradient-to-br from-card to-yellow-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {getStatusCount('PENDING')}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-400 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 bg-gradient-to-br from-card to-purple-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-md">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatAmount(getTotalAmount(), 'USD')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Records Table */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/20 dark:to-purple-950/20">
            <CardTitle className="text-2xl bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              Transaction History
            </CardTitle>
            <CardDescription className="text-base">
              A list of all your payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <Receipt className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Payment Records</h3>
                <p className="text-muted-foreground text-base">
                  You haven't made any payments yet. Your transaction history will appear here.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border-2 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/30 dark:to-purple-950/30 hover:from-cyan-100 hover:to-purple-100 dark:hover:from-cyan-950/40 dark:hover:to-purple-950/40">
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Booking ID</TableHead>
                        <TableHead className="font-semibold">Transaction ID</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Payment Method</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow 
                          key={payment.id}
                          className="hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-purple-50/50 dark:hover:from-cyan-950/10 dark:hover:to-purple-950/10 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {formatDate(payment.createdAt)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {payment.description || 'Event Ticket Purchase'}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gradient-to-r from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30 px-2 py-1 rounded font-mono">
                              #{payment.bookingId}
                            </code>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gradient-to-r from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30 px-2 py-1 rounded font-mono max-w-[150px] inline-block overflow-hidden text-ellipsis">
                              {payment.transactionId}
                            </code>
                          </TableCell>
                          <TableCell className="font-bold text-lg">
                            {formatAmount(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell className="capitalize font-medium">
                            {payment.paymentMethod || 'Card'}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
