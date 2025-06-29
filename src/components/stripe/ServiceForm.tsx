import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, DollarSign, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { useServiceStore, TherapistService } from '../../store/serviceStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

type ServiceFormData = {
  name: string;
  description: string;
  price_amount: number;
  type: 'one_time' | 'subscription';
  billing_interval?: 'week' | 'month' | 'year';
  session_quota?: number;
  is_active: boolean;
};

type ServiceFormProps = {
  service?: TherapistService | null;
  onClose: () => void;
  onSuccess: () => void;
};

export const ServiceForm: React.FC<ServiceFormProps> = ({ service, onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const { createService, updateService, isLoading, error } = useServiceStore();
  const [isCreatingStripeProducts, setIsCreatingStripeProducts] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ServiceFormData>({
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      price_amount: service?.price_amount || 100,
      type: service?.type || 'one_time',
      billing_interval: service?.billing_interval || 'month',
      session_quota: service?.session_quota || undefined,
      is_active: service?.is_active ?? true,
    }
  });

  const watchType = watch('type');

  const onSubmit = async (data: ServiceFormData) => {
    if (!user) return;

    try {
      setIsCreatingStripeProducts(true);

      // Get therapist profile
      const { data: therapistProfile, error: profileError } = await supabase
        .from('therapist_profiles')
        .select('id, stripe_account_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !therapistProfile) {
        throw new Error('Therapist profile not found');
      }

      if (!therapistProfile.stripe_account_id) {
        throw new Error('Stripe Connect account not set up');
      }

      // Create Stripe product and price via Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const stripeResponse = await fetch(`${supabaseUrl}/functions/v1/create-stripe-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          service_id: service?.id,
          name: data.name,
          description: data.description,
          price_amount: Math.round(data.price_amount * 100), // Convert to cents
          type: data.type,
          billing_interval: data.billing_interval,
          stripe_account_id: therapistProfile.stripe_account_id,
        }),
      });

      if (!stripeResponse.ok) {
        const errorData = await stripeResponse.json();
        throw new Error(errorData.error || 'Failed to create Stripe products');
      }

      const stripeData = await stripeResponse.json();

      // Save to database
      const serviceData = {
        therapist_profile_id: therapistProfile.id,
        name: data.name,
        description: data.description,
        price_amount: data.price_amount,
        currency: 'usd',
        type: data.type,
        stripe_product_id: stripeData.product_id,
        stripe_price_id: stripeData.price_id,
        billing_interval: data.type === 'subscription' ? data.billing_interval : null,
        session_quota: data.type === 'subscription' ? data.session_quota : null,
        is_active: data.is_active,
      };

      if (service) {
        await updateService(service.id, serviceData);
      } else {
        await createService(serviceData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setIsCreatingStripeProducts(false);
    }
  };

  const isSubmitting = isLoading || isCreatingStripeProducts;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {service ? 'Edit Service' : 'Create New Service'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="w-4 h-4" />} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <Input
              label="Service Name"
              placeholder="e.g., Individual Therapy Session"
              {...register('name', { required: 'Service name is required' })}
              error={errors.name?.message}
              fullWidth
            />

            <TextArea
              label="Description"
              placeholder="Describe what this service includes..."
              rows={3}
              {...register('description')}
              fullWidth
            />

            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              min="0"
              placeholder="100.00"
              icon={<DollarSign className="w-4 h-4" />}
              {...register('price_amount', { 
                required: 'Price is required',
                min: { value: 0.5, message: 'Minimum price is $0.50' }
              })}
              error={errors.price_amount?.message}
              fullWidth
            />

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Service Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative">
                  <input
                    type="radio"
                    value="one_time"
                    {...register('type')}
                    className="sr-only"
                  />
                  <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    watchType === 'one_time' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}>
                    <div className="font-medium text-gray-500">One-time Session</div>
                    <div className="text-xs text-gray-400 mt-1">Patient pays per session</div>
                  </div>
                </label>
                
                <label className="relative">
                  <input
                    type="radio"
                    value="subscription"
                    {...register('type')}
                    className="sr-only"
                  />
                  <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    watchType === 'subscription' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}>
                    <div className="font-medium text-gray-500">Subscription Plan</div>
                    <div className="text-xs text-gray-400 mt-1">Recurring payments with session quota</div>
                  </div>
                </label>
              </div>
            </div>

            {watchType === 'subscription' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Interval
                    </label>
                    <select
                      {...register('billing_interval')}
                      className="w-full rounded-md border border-gray-600  text-gray-500 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                      <option value="year">Yearly</option>
                    </select>
                  </div>

                  <Input
                    label="Sessions Included"
                    type="number"
                    min="1"
                    placeholder="4"
                    {...register('session_quota', {
                      required: watchType === 'subscription' ? 'Session quota is required for subscriptions' : false
                    })}
                    error={errors.session_quota?.message}
                    fullWidth
                  />
                </div>
              </>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('is_active')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
              />
              <label className="ml-2 text-sm text-gray-500">
                Service is active and available for booking
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                icon={<Save className="w-4 h-4" />}
              >
                {service ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};