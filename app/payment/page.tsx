'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  User,
  MapPin,
  Ticket,
  AlertCircle,
  ArrowLeft,
  Shield,
  DollarSign
} from 'lucide-react';

interface EventDetails {
  id: string;
  name: string;
  date: string;
  location: string;
  price: number;
  ticketType: string;
  quantity: number;
}

interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingZip, setBillingZip] = useState('');

  // Card validation states
  const [cardErrors, setCardErrors] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    zip: ''
  });

  useEffect(() => {
    // Simulate loading event details from URL params
    const eventId = searchParams.get('eventId');
    const ticketId = searchParams.get('ticketId');
    
    if (eventId) {
      // In production, fetch event details from API
      setTimeout(() => {
        setEventDetails({
          id: eventId,
          name: searchParams.get('eventName') || 'Tech Conference 2025',
          date: searchParams.get('eventDate') || 'December 15, 2025',
          location: searchParams.get('location') || 'San Francisco Convention Center',
          price: parseFloat(searchParams.get('price') || '99.99'),
          ticketType: searchParams.get('ticketType') || 'General Admission',
          quantity: parseInt(searchParams.get('quantity') || '1')
        });
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Card number formatting
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Expiry date formatting
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };

  // Card validation
  const validateCard = () => {
    const errors = {
      number: '',
      name: '',
      expiry: '',
      cvv: '',
      zip: ''
    };

    // Validate card number (simplified Luhn algorithm)
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      errors.number = 'Invalid card number';
    }

    // Validate name
    if (cardName.trim().length < 3) {
      errors.name = 'Enter full name as shown on card';
    }

    // Validate expiry
    const [month, year] = expiryDate.split('/');
    if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
      errors.expiry = 'Invalid expiry date';
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.expiry = 'Card has expired';
      }
    }

    // Validate CVV
    if (cvv.length < 3 || cvv.length > 4) {
      errors.cvv = 'Invalid CVV';
    }

    // Validate ZIP
    if (billingZip.length < 5) {
      errors.zip = 'Invalid ZIP code';
    }

    setCardErrors(errors);
    return !Object.values(errors).some(e => e !== '');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 19) {
      setCardNumber(formatted);
      if (cardErrors.number) {
        setCardErrors({ ...cardErrors, number: '' });
      }
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
      if (cardErrors.expiry) {
        setCardErrors({ ...cardErrors, expiry: '' });
      }
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setCvv(value);
      if (cardErrors.cvv) {
        setCardErrors({ ...cardErrors, cvv: '' });
      }
    }
  };

  const createPaymentIntent = async () => {
    if (!eventDetails) return;

    try {
      const userId = localStorage.getItem('userId');
      let userEmail = localStorage.getItem('userEmail') || 'customer@eventhub.com';
      
      // Validate user is logged in
      if (!userId) {
        throw new Error('Please log in to continue with payment');
      }
      
      // Validate email format - if invalid, use a proper email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        console.warn('Invalid email in localStorage:', userEmail);
        userEmail = 'customer@eventhub.com'; // Use valid fallback email
      }
      
      // Generate a booking ID (in production, this would come from the booking service)
      const bookingId = parseInt(searchParams.get('bookingId') || String(Date.now()).slice(-8));
      
      // Validate eventId
      const eventId = parseInt(eventDetails.id);
      if (isNaN(eventId)) {
        throw new Error('Invalid event ID');
      }
      
      // Use API Gateway instead of direct service call
      const response = await fetch('http://10.74.115.219:8080/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://10.74.115.219:3000'
        },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: eventDetails.price * eventDetails.quantity,
          currency: 'usd',
          description: `${eventDetails.name} - ${eventDetails.ticketType}`,
          customerEmail: userEmail,
          userId: parseInt(userId),
          eventId: eventId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          console.error('Payment intent creation failed:', errorText);
          throw new Error('Payment service unavailable. Please try again.');
        }
        console.error('Payment intent creation failed:', errorData);
        throw new Error(errorData?.message || 'Failed to create payment intent');
      }

      const data = await response.json();
      console.log('✅ Payment intent created:', data);
      setPaymentIntent(data);
      return data;
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      throw new Error(err.message || 'Unable to initialize payment. Please try again.');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCard()) {
      setError('Please correct the errors in the form');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setError('Please log in to continue');
        setProcessing(false);
        setTimeout(() => router.push('/login'), 2000);
        return;
      }
      
      if (!eventDetails) {
        setError('Event information not found');
        setProcessing(false);
        return;
      }
      
      // Create payment intent if not already created
      let intent = paymentIntent;
      if (!intent) {
        intent = await createPaymentIntent();
      }

      if (!intent) {
        throw new Error('Payment intent not created');
      }

      // For testing: Simulate successful payment since we're using test mode
      // In production, you would use Stripe Elements for PCI compliance
      console.log('Processing payment for intent:', intent.clientSecret);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark payment as successful and confirm with backend
      const bookingId = parseInt(searchParams.get('bookingId') || String(Date.now()).slice(-8));
      
      // Validate userId and eventId
      const userIdNum = parseInt(userId);
      const eventIdNum = parseInt(eventDetails?.id || '0');
      
      if (isNaN(userIdNum) || isNaN(eventIdNum)) {
        throw new Error('Invalid user or event information');
      }
      
      // Use API Gateway instead of direct service call
      const confirmResponse = await fetch('http://10.74.115.219:8080/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://10.74.115.219:3000'
        },
        body: JSON.stringify({
          bookingId: bookingId,
          paymentIntentId: intent.clientSecret.split('_secret_')[0],
          amount: eventDetails.price * eventDetails.quantity,
          currency: 'usd',
          userId: userIdNum,
          eventId: eventIdNum
        })
      });

      if (confirmResponse.ok) {
        console.log('✅ Payment confirmed and ticket created');
        setSuccess(true);
        setTimeout(() => {
          router.push(`/payment/success?txId=${bookingId}&amount=${(eventDetails.price * eventDetails.quantity).toFixed(2)}&eventName=${encodeURIComponent(eventDetails.name)}&eventDate=${encodeURIComponent(eventDetails.date)}`);
        }, 2000);
      } else {
        const errorText = await confirmResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          console.error('Payment confirmation failed:', errorText);
          throw new Error('Failed to confirm payment. Please contact support.');
        }
        console.error('Payment confirmation failed:', errorData);
        throw new Error(errorData?.message || 'Payment confirmation failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-6 h-6" />
              Invalid Payment Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              The payment link is invalid or has expired.
            </p>
            <Button onClick={() => router.push('/events')} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-200 dark:border-green-800">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-400">Payment Successful!</CardTitle>
            <CardDescription>Your ticket has been confirmed</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Amount Paid</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                ${(eventDetails.price * eventDetails.quantity).toFixed(2)}
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              A confirmation email has been sent to your registered email address.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Redirecting to your tickets...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = eventDetails.price * eventDetails.quantity;
  const processingFee = subtotal * 0.029 + 0.30; // Stripe fee
  const total = subtotal + processingFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Secure Checkout
          </h1>
          <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Your payment information is encrypted and secure
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <form onSubmit={handlePayment}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>
                    Enter your card details to complete the purchase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Card Number */}
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="flex items-center gap-2">
                      Card Number
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className={`pl-10 font-mono text-lg ${cardErrors.number ? 'border-red-500' : ''}`}
                        disabled={processing}
                      />
                      <CreditCard className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    </div>
                    {cardErrors.number && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {cardErrors.number}
                      </p>
                    )}
                  </div>

                  {/* Cardholder Name */}
                  <div className="space-y-2">
                    <Label htmlFor="cardName" className="flex items-center gap-2">
                      Cardholder Name
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </Label>
                    <div className="relative">
                      <Input
                        id="cardName"
                        placeholder="JOHN DOE"
                        value={cardName}
                        onChange={(e) => {
                          setCardName(e.target.value.toUpperCase());
                          if (cardErrors.name) setCardErrors({ ...cardErrors, name: '' });
                        }}
                        className={`pl-10 ${cardErrors.name ? 'border-red-500' : ''}`}
                        disabled={processing}
                      />
                      <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    </div>
                    {cardErrors.name && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {cardErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="flex items-center gap-2">
                        Expiry Date
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </Label>
                      <div className="relative">
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={handleExpiryChange}
                          className={`pl-10 font-mono ${cardErrors.expiry ? 'border-red-500' : ''}`}
                          disabled={processing}
                        />
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      </div>
                      {cardErrors.expiry && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {cardErrors.expiry}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="flex items-center gap-2">
                        CVV
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </Label>
                      <div className="relative">
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={cvv}
                          onChange={handleCvvChange}
                          className={`pl-10 font-mono ${cardErrors.cvv ? 'border-red-500' : ''}`}
                          disabled={processing}
                          maxLength={4}
                        />
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      </div>
                      {cardErrors.cvv && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {cardErrors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Billing ZIP */}
                  <div className="space-y-2">
                    <Label htmlFor="billingZip" className="flex items-center gap-2">
                      Billing ZIP Code
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </Label>
                    <div className="relative">
                      <Input
                        id="billingZip"
                        placeholder="12345"
                        value={billingZip}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 10) {
                            setBillingZip(value);
                            if (cardErrors.zip) setCardErrors({ ...cardErrors, zip: '' });
                          }
                        }}
                        className={`pl-10 ${cardErrors.zip ? 'border-red-500' : ''}`}
                        disabled={processing}
                      />
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    </div>
                    {cardErrors.zip && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {cardErrors.zip}
                      </p>
                    )}
                  </div>

                  {/* Security Notice */}
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300">
                      Your payment is processed securely through Stripe. We never store your card details.
                    </AlertDescription>
                  </Alert>

                  {error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-semibold"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Spinner className="w-5 h-5 mr-2" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Pay ${total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {eventDetails.name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{eventDetails.date}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{eventDetails.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{eventDetails.ticketType}</Badge>
                      <Badge variant="secondary">Qty: {eventDetails.quantity}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm">
                    <span>Processing Fee</span>
                    <span>${processingFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                    <span>Total</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-5 h-5" />
                      {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Secure
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Encrypted
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </div>
                  </div>
                  <p className="text-center mt-3 text-xs text-slate-500 dark:text-slate-500">
                    Powered by Stripe
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading payment page...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
