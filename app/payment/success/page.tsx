'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Download, 
  Mail, 
  Calendar,
  MapPin,
  Ticket,
  Share2,
  Home,
  QrCode
} from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/dashboard');
    }
  }, [countdown, router]);

  const transactionId = searchParams.get('txId') || `TXN-${Date.now()}`;
  const amount = searchParams.get('amount') || '99.99';
  const eventName = searchParams.get('eventName') || 'Tech Conference 2025';
  const eventDate = searchParams.get('eventDate') || 'December 15, 2025';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Success Card */}
        <Card className="border-green-200 dark:border-green-800 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-lg">
              Your ticket has been confirmed and sent to your email
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Transaction Details */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                    {transactionId}
                  </p>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Confirmed
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Amount Paid</span>
                  <span className="font-bold text-2xl text-slate-900 dark:text-white">
                    ${amount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Payment Method</span>
                  <span className="text-slate-900 dark:text-white">•••• 4242</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Date & Time</span>
                  <span className="text-slate-900 dark:text-white">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {eventName}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4" />
                      <span>{eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-4 h-4" />
                      <span>San Francisco Convention Center</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button variant="outline" className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                View QR Code
              </Button>
            </div>

            {/* What's Next Section */}
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                What's Next?
              </h4>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Check your email for the ticket confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Add the event to your calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Show your QR code at the venue for entry</span>
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full h-12 text-lg font-semibold"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400">
              Redirecting automatically in {countdown} seconds...
            </p>
          </CardFooter>
        </Card>

        {/* Share Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                Twitter
              </Button>
              <Button variant="outline" className="flex-1">
                Facebook
              </Button>
              <Button variant="outline" className="flex-1">
                LinkedIn
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center"><p>Loading...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
