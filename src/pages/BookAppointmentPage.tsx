import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CreditCard, User, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentCheckout } from '../components/stripe/PaymentCheckout';
import { useTherapistStore } from '../store/therapistStore';
import { useServiceStore, TherapistService } from '../store/serviceStore';
import { useAuthStore } from '../store/authStore';
import { formatPriceFromDollars } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { format, addDays, addHours, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

export const BookAppointmentPage: React.FC = () => {
  const { therapistId, serviceId } = useParams<{ therapistId: string; serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTherapist, fetchTherapistById } = useTherapistStore();
  const { services, fetchServices } = useServiceStore();
  
  const [selectedService, setSelectedService] = useState<TherapistService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [step, setStep] = useState<'booking' | 'payment'>('booking');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (therapistId && serviceId) {
      loadBookingData();
    }
  }, [therapistId, serviceId]);

  const loadBookingData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch therapist details
      if (therapistId) {
        await fetchTherapistById(therapistId);
      }

      // Get therapist profile to fetch services
      const { data: therapistProfile } = await supabase
        .from('therapist_profiles')
        .select('id')
        .eq('id', therapistId)
        .single();

      if (therapistProfile) {
        await fetchServices(therapistProfile.id);
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
      setError('Failed to load booking information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (services.length > 0 && serviceId) {
      const service = services.find(s => s.id === serviceId);
      setSelectedService(service || null);
    }
  }, [services, serviceId]);

  const generateAvailableSlots = (date: string) => {
    // Generate time slots from 9 AM to 5 PM
    const slots: string[] = [];
    const selectedDate = new Date(date);
    
    for (let hour = 9; hour <= 17; hour++) {
      const slotTime = addHours(startOfDay(selectedDate), hour);
      if (isAfter(slotTime, new Date())) { // Only future slots
        slots.push(format(slotTime, 'HH:mm'));
      }
    }
    
    return slots;
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setAvailableSlots(generateAvailableSlots(date));
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const proceedToPayment = () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Payment success is handled by the webhook
    // Redirect to appointments page
    navigate('/dashboard', { 
      state: { 
        message: 'Appointment booked successfully! You will receive a confirmation email shortly.' 
      }
    });
  };

  const getAppointmentDateTime = () => {
    if (!selectedDate || !selectedTime) return '';
    return `${selectedDate}T${selectedTime}:00`;
  };

  // Generate available dates (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return format(date, 'yyyy-MM-dd');
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !currentTherapist || !selectedService) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Booking Error</h2>
            <p className="text-gray-400 mb-6">{error || 'Service or therapist not found'}</p>
            <Button onClick={() => navigate('/therapists')}>
              Back to Therapists
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => step === 'payment' ? setStep('booking') : navigate(`/therapists/${therapistId}`)}
          className="mr-4 text-gray-400 hover:text-teal-800/50 flex items-center px-2 rounded-xl"
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-500">Book Appointment</h1>
          <p className="text-gray-400">Schedule your session with Dr. {currentTherapist.full_name}</p>
        </div>
      </div>

      {step === 'booking' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Therapist & Service Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={`https://randomuser.me/api/portraits/men/${parseInt(currentTherapist.id) % 100}.jpg`}
                    alt={`Dr. ${currentTherapist.user_id}`}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Dr. {currentTherapist.user_id}
                    </h3>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      <span className="text-sm">{currentTherapist.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="font-medium text-white mb-2">{selectedService.name}</h4>
                  <p className="text-gray-400 text-sm mb-3">{selectedService.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Price:</span>
                    <span className="text-green-500 font-semibold">
                      {formatPriceFromDollars(selectedService.price_amount)}
                    </span>
                  </div>
                  
                  {selectedService.type === 'subscription' && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-400 text-sm">Billing:</span>
                      <span className="text-blue-400 text-sm">
                        {selectedService.billing_interval}ly
                      </span>
                    </div>
                  )}
                </div>

                {/* Free Session Notice */}
                {user?.free_session_credit && selectedService.type === 'one_time' && (
                  <div className="mt-4 p-3 border border-green-600/30 rounded-lg">
                    <p className="text-green-500 text-sm font-medium">
                      🎉 Your first session is FREE!
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      This session will use your complimentary first session credit.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <h3 className="font-medium text-gray-500 mb-3">Choose a Date</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {availableDates.slice(0, 10).map((date) => (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          selectedDate === date
                            ? 'bg-accent-teal text-white border-accent-teal'
                            : 'border-gray-600 text-gray-400 hover:border-blue-400'
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="font-bold text-lg">
                          {new Date(date).getDate()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <h3 className="font-medium text-gray-500 mb-3">Available Times</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            selectedTime === time
                              ? 'bg-accent-teal text-white border-accent-teal'
                              : 'border-gray-600 text-gray-00 hover:border-blue-400'
                          }`}
                        >
                          <Clock className="w-4 h-4 mx-auto mb-1" />
                          {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking Summary & Continue */}
                {selectedDate && selectedTime && (
                  <div className="border-t border-gray-700 pt-6">
                    <div className=" rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-500 mb-2">Booking Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Service:</span>
                          <span className="text-gray-600s">{selectedService.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date:</span>
                          <span className="text-gray-600">
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time:</span>
                          <span className="text-gray-600">
                            {format(new Date(`2000-01-01T${selectedTime}`), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t border-gray-600 pt-2">
                          <span className="text-gray-400">Total:</span>
                          <span className="text-gray-500">
                            {user?.free_session_credit && selectedService.type === 'one_time' 
                              ? 'FREE' 
                              : formatPriceFromDollars(selectedService.price_amount)
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={proceedToPayment}
                      variant='primary'
                      className="w-full flex justify-center items-center p-2 rounded-xl bg-accent-teal text-white hover:bg-accent-teal/90 focus:ring-2 focus:ring-accent-teal/50"
                      icon={<CreditCard className="w-4 h-4" />}
                    >
                      {user?.free_session_credit && selectedService.type === 'one_time' 
                        ? 'Book Free Session' 
                        : 'Proceed to Payment'
                      }
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Payment Step */
        <div className="max-w-md mx-auto">
          <PaymentCheckout
            service={selectedService}
            appointmentDateTime={getAppointmentDateTime()}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setStep('booking')}
          />
        </div>
      )}
    </div>
  );
};