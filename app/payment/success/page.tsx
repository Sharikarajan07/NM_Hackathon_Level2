'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { eventsApi, ticketsApi } from '@/lib/api-client';
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
  const [countdown, setCountdown] = useState(30);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [latestTicket, setLatestTicket] = useState<any | null>(null);
  const [latestEvent, setLatestEvent] = useState<any | null>(null);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const playChime = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const master = audioContext.createGain();
      master.gain.value = 0.22;
      master.connect(audioContext.destination);

      const now = audioContext.currentTime;
      const notes = [523.25, 659.25, 783.99, 880.0]; // C5, E5, G5, A5
      const starts = [0, 0.12, 0.26, 0.42];
      const lengths = [0.22, 0.22, 0.28, 0.36];

      notes.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = index % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(master);

        const start = now + starts[index];
        const end = start + lengths[index];
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.38, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        osc.start(start);
        osc.stop(end + 0.03);
      });

      // Soft shimmer tail
      const shimmer = audioContext.createOscillator();
      const shimmerGain = audioContext.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.value = 1174.66; // D6
      shimmer.connect(shimmerGain);
      shimmerGain.connect(master);
      shimmerGain.gain.setValueAtTime(0.0001, now + 0.5);
      shimmerGain.gain.exponentialRampToValueAtTime(0.14, now + 0.55);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      shimmer.start(now + 0.5);
      shimmer.stop(now + 0.92);

      setTimeout(() => {
        audioContext.close();
      }, 1400);
    };

    const timer = setTimeout(playChime, 300);
    return () => clearTimeout(timer);
  }, []);

  const transactionId = searchParams.get('txId') || `TXN-${Date.now()}`;
  const amount = searchParams.get('amount') || '99.99';
  const eventName = searchParams.get('eventName') || 'Tech Conference 2025';
  const eventDate = searchParams.get('eventDate') || 'December 15, 2025';
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const shareText = `I just booked ${eventName} on ${eventDate} with EventHub.`;

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    let url = '';

    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    } else {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const loadLatestTicket = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const tickets = await ticketsApi.getUserTickets(userId);
        if (!Array.isArray(tickets) || tickets.length === 0) return;

        const sortedTickets = [...tickets].sort((a, b) => {
          const aTime = new Date(a.issuedAt || a.createdAt || 0).getTime();
          const bTime = new Date(b.issuedAt || b.createdAt || 0).getTime();
          return bTime - aTime;
        });
        const ticket = sortedTickets[0];
        setLatestTicket(ticket);

        if (ticket?.eventId) {
          const event = await eventsApi.getById(ticket.eventId.toString());
          setLatestEvent(event);
        }
      } catch (error) {
        console.error('Failed to load latest ticket:', error);
      }
    };

    loadLatestTicket();
  }, []);

  const generateTicketQRData = (ticket: any) => {
    const envBaseUrl = process.env.NEXT_PUBLIC_QR_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
    const baseUrl = envBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const ticketData = {
      tn: ticket.ticketNumber || '',
      ei: ticket.eventId || '',
      et: latestEvent?.title || eventName,
      ed: latestEvent?.startDate || eventDate,
      el: latestEvent?.location || '',
      s: ticket.status || 'active',
      p: ticket.price || amount,
      ui: ticket.userId || ''
    };

    const encoded = typeof window !== 'undefined' ? btoa(JSON.stringify(ticketData)) : '';
    return `${baseUrl}/validate/${ticket.ticketNumber || 'TICKET'}?d=${encoded}`;
  };

  const handleDownloadReceipt = () => {
    const issuedAt = new Date().toLocaleString();
    const ticketNumber = latestTicket?.ticketNumber || 'N/A';
    const location = latestEvent?.location || 'Location TBD';
    const receiptHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
    h1 { margin: 0 0 12px; font-size: 22px; }
    .meta { color: #475569; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; margin: 8px 0; }
    .label { color: #64748b; }
    .value { font-weight: 600; }
    .divider { border-top: 1px solid #e2e8f0; margin: 16px 0; }
  </style>
</head>
<body>
  <h1>Payment Receipt</h1>
  <div class="meta">Issued: ${issuedAt}</div>
  <div class="row"><span class="label">Transaction ID</span><span class="value">${transactionId}</span></div>
  <div class="row"><span class="label">Amount Paid</span><span class="value">$${amount}</span></div>
  <div class="row"><span class="label">Event</span><span class="value">${eventName}</span></div>
  <div class="row"><span class="label">Event Date</span><span class="value">${eventDate}</span></div>
  <div class="row"><span class="label">Location</span><span class="value">${location}</span></div>
  <div class="row"><span class="label">Ticket Number</span><span class="value">${ticketNumber}</span></div>
  <div class="divider"></div>
  <div class="row"><span class="label">Status</span><span class="value">Confirmed</span></div>
</body>
</html>
`;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transactionId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewQrCode = () => {
    if (latestTicket) {
      setQrDialogOpen(true);
      return;
    }

    router.push('/tickets');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Success Card */}
        <Card className="border-green-200 dark:border-green-800 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-200/70 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-emerald-200/50 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
              </div>
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
              <Button variant="outline" className="w-full" onClick={handleDownloadReceipt}>
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button variant="outline" className="w-full" onClick={handleViewQrCode}>
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
              <Button variant="outline" className="flex-1" onClick={() => handleShare('twitter')}>
                Twitter
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => handleShare('facebook')}>
                Facebook
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => handleShare('linkedin')}>
                LinkedIn
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Scan QR Code
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600">
              Scan this code to view your ticket details
            </DialogDescription>
          </DialogHeader>

          {latestTicket && (
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="p-6 bg-white rounded-lg shadow-lg border-2 border-emerald-200">
                {typeof window !== 'undefined' && (
                  <QRCodeSVG
                    value={generateTicketQRData(latestTicket)}
                    size={240}
                    level="H"
                    includeMargin={true}
                    className="w-full h-auto"
                  />
                )}
              </div>
              <p className="text-xs text-slate-500 text-center px-4">
                Ticket #{(latestTicket.ticketNumber || '').substring(0, 8).toUpperCase()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
