import React, { useState } from 'react';
import { Calendar, Clock, Video, User, MoreVertical, Edit, Trash2, RefreshCw, DollarSign, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Appointment } from '../../types';
import { format, isAfter, differenceInHours } from 'date-fns';
import { RescheduleModal } from '../business/RescheduleModal';
import { CancellationPolicy } from '../business/CancellationPolicy';
import { RefundModal } from '../business/RefundModal';
import { useAuthStore } from '../../store/authStore';
import { useAppointmentStore } from '../../store/appointmentStore';
import { usePaymentStore } from '../../store/paymentStore';
import { formatPriceFromDollars } from '../../lib/stripe';

type AppointmentCardProps = {
  appointment: Appointment;
  showActions?: boolean;
  onReschedule?: (appointmentId: string, newDateTime: string) => Promise<void>;
  onCancel?: (appointmentId: string, reason?: string) => Promise<void>;
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showActions = true,
  onReschedule,
  onCancel,
}) => {
  const { user } = useAuthStore();
  const { isLoading } = useAppointmentStore();
  const { processRefund } = usePaymentStore();
  
  const [showMenu, setShowMenu] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  
  const appointmentDate = new Date(appointment.date_time);
  const isPast = isAfter(new Date(), appointmentDate);
  const isWithin24Hours = differenceInHours(appointmentDate, new Date()) <= 24;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-600 text-white';
      case 'completed':
        return 'bg-green-600 text-white';
      case 'cancelled':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };
  
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-900/20 text-green-400 border-green-600/30';
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-600/30';
      case 'failed':
        return 'bg-red-900/20 text-red-400 border-red-600/30';
      case 'refunded':
        return 'bg-blue-900/20 text-blue-400 border-blue-600/30';
      case 'free':
        return 'bg-purple-900/20 text-purple-400 border-purple-600/30';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-600/30';
    }
  };
  
  const handleReschedule = async (newDateTime: string, reason?: string) => {
    if (onReschedule) {
      await onReschedule(appointment.id, newDateTime);
      setShowRescheduleModal(false);
    }
  };
  
  const handleCancel = async () => {
    if (onCancel) {
      await onCancel(appointment.id);
      setShowCancellationPolicy(false);
    }
  };
  
  const handleRefund = async (paymentIntentId: string, reason: string, amount?: number) => {
    if (!paymentIntentId) return;
    
    try {
      await processRefund(paymentIntentId, reason, amount);
      setShowRefundModal(false);
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };
  
  const isTherapist = user?.role === 'therapist';
  
  return (
    <>
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${getStatusColor(appointment.status)}`}>
                {appointment.status === 'scheduled' ? (
                  <Calendar className="w-5 h-5" />
                ) : appointment.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </div>
              
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold">
                    {appointment.therapist_profile?.full_name || `Dr. ${appointment.therapist_id}`}
                    {appointment.therapist_service?.name || 'Therapy Session'}
                  </h3>
                  <span className={`ml-3 px-2 py-0.5 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-400 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {format(appointmentDate, 'h:mm a')}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-400 mt-1">
                  <User className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {isTherapist
                      ? `Client: ${appointment.client?.full_name || 'Unknown Client'}`
                      : `Dr. ${appointment.therapist?.full_name || appointment.therapist_id}`
                    }
                  </span>
                </div>
                
                {appointment.payment_status && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${getPaymentStatusColor(appointment.payment_status)}`}>
                      <DollarSign className="w-3 h-3 mr-1" />
                      {appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)}
                      {appointment.therapist_service?.price_amount && appointment.payment_status !== 'free' && (
                        <span className="ml-1">
                          ({formatPriceFromDollars(appointment.therapist_service.price_amount)})
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
                {appointment.rescheduled_from && (
                  <div className="mt-2 text-xs text-blue-400 flex items-center">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Rescheduled from {format(new Date(appointment.rescheduled_from), 'MMM d, h:mm a')}
                  </div>
                )}
              </div>
            </div>
            
            {showActions && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700">
                    <div className="py-1">
                      {appointment.status === 'scheduled' && !isPast && (
                        <>
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            onClick={() => {
                              setShowMenu(false);
                              setShowRescheduleModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Reschedule
                          </button>
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            onClick={() => {
                              setShowMenu(false);
                              setShowCancellationPolicy(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {isTherapist && appointment.status === 'scheduled' && appointment.payment_status === 'paid' && (
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                          onClick={() => {
                            setShowMenu(false);
                            setShowRefundModal(true);
                          }}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Process Refund
                        </button>
                      )}
                      
                      {appointment.status === 'scheduled' && !isPast && (
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Session
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {appointment.notes && (
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-300">{appointment.notes}</p>
            </div>
          )}
          
          {appointment.status === 'scheduled' && !isPast && (
            <div className="mt-4">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                icon={<Video className="w-4 h-4" />}
              >
                Join Video Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modals */}
      {showRescheduleModal && (
        <RescheduleModal
          appointment={appointment}
          onReschedule={handleReschedule}
          onClose={() => setShowRescheduleModal(false)}
          isLoading={isLoading}
        />
      )}
      
      {showCancellationPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <CancellationPolicy
              onAccept={handleCancel}
              onDecline={() => setShowCancellationPolicy(false)}
              sessionPrice={appointment.therapist_service?.price_amount || 100}
            />
          </div>
        </div>
      )}
      
      {showRefundModal && appointment.stripe_payment_intent_id && (
        <RefundModal
          appointmentId={appointment.id}
          paymentIntentId={appointment.stripe_payment_intent_id}
          amount={appointment.therapist_service?.price_amount || 100}
          onRefund={handleRefund}
          onClose={() => setShowRefundModal(false)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};