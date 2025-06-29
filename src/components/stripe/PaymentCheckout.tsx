import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { stripePromise, formatPriceFromDollars } from '../../lib/stripe';
import { TherapistService } from '../../store/serviceStore';
import { supabase } from '../../lib/supabase';

type PaymentCheckoutProps = {
  service: TherapistService;
  appointmentDateTime: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
};

const CheckoutForm: React.FC<{
  service: TherapistService;
  appointmentDateTime: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  clientSecret: string;
}> = ({ service, appointmentDateTime, onSuccess, onCancel, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/appointments?payment=success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-700/50 rounded-lg p-4">
        <h3 className="font-medium text-white mb-2">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Service:</span>
            <span className="text-white">{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date & Time:</span>
            <span className="text-white">
              {new Date(appointmentDateTime).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-gray-400">Total:</span>
            <span className="text-white">{formatPriceFromDollars(service.price_amount)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-white flex items-center">
          <CreditCard className="w-4 h-4 mr-2" />
          Payment Information
        </h3>
        <PaymentElement />
      </div>

      <div className="flex items-center text-sm text-gray-400">
        <Lock className="w-4 h-4 mr-2" />
        Your payment information is encrypted and secure
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          isLoading={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : `Pay ${formatPriceFromDollars(service.price_amount)}`}
        </Button>
      </div>
    </form>
  );
};

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  service,
  appointmentDateTime,
  onSuccess,
  onCancel,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Create payment intent via Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          service_id: service.id,
          appointment_datetime: appointmentDateTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.client_secret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded-xl w-3/4"></div>
            <div className="h-32 bg-gray-700 rounded-xl"></div>
            <div className="h-10 bg-gray-700 rounded-xl"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-medium">Payment Error</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={createPaymentIntent} className="flex-1">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret || !stripePromise) {
    return null;
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#3B82F6',
        colorBackground: '#1F2937',
        colorText: '#F9FAFB',
        colorDanger: '#EF4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={stripeOptions}>
          <CheckoutForm
            service={service}
            appointmentDateTime={appointmentDateTime}
            onSuccess={onSuccess}
            onCancel={onCancel}
            clientSecret={clientSecret}
          />
        </Elements>
      </CardContent>
    </Card>
  );
};