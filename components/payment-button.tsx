'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentButtonProps {
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  price: number;
  ticketType: string;
  ticketId?: string;
  quantity?: number;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
}

export function PaymentButton({
  eventId,
  eventName,
  eventDate,
  location,
  price,
  ticketType,
  ticketId,
  quantity = 1,
  variant = 'default',
  className = ''
}: PaymentButtonProps) {
  const router = useRouter();

  const handlePayment = () => {
    const params = new URLSearchParams({
      eventId,
      eventName,
      eventDate,
      location,
      price: price.toString(),
      ticketType,
      quantity: quantity.toString(),
      ...(ticketId && { ticketId })
    });

    router.push(`/payment?${params.toString()}`);
  };

  return (
    <Button 
      onClick={handlePayment} 
      variant={variant}
      className={className}
    >
      <Lock className="w-4 h-4 mr-2" />
      Proceed to Payment
    </Button>
  );
}
