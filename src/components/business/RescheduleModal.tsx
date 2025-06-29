import React, { useState } from 'react';
import { Calendar, Clock, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Appointment } from '../../types';
import { format, addDays, isAfter, differenceInHours } from 'date-fns';

type RescheduleModalProps = {
  appointment: Appointment;
  onReschedule: (newDateTime: string, reason?: string) => void;
  onClose: () => void;
  isLoading?: boolean;
};

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  appointment,
  onReschedule,
  onClose,
  isLoading = false
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState('');
  
  const originalDateTime = new Date(appointment.date_time);
  const hoursUntilAppointment = differenceInHours(originalDateTime, new Date());
  const isWithin24Hours = hoursUntilAppointment <= 24;
  const rescheduleWillIncurFee = isWithin24Hours;

  // Generate available dates (next 30 days, excluding original date)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return format(date, 'yyyy-MM-dd');
  }).filter(date => date !== format(originalDateTime, 'yyyy-MM-dd'));

  // Generate available time slots
  const availableSlots = Array.from({ length: 9 }, (_, i) => {
    const hour = 9 + i; // 9 AM to 5 PM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) return;
    
    const newDateTime = `${selectedDate}T${selectedTime}:00`;
    onReschedule(newDateTime, reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Reschedule Appointment
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="w-4 h-4" />} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Appointment Info */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Current Appointment</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Date: {format(originalDateTime, 'EEEE, MMMM d, yyyy')}</p>
              <p>Time: {format(originalDateTime, 'h:mm a')}</p>
              <p>Therapist: Dr. {appointment.therapist_id}</p>
            </div>
          </div>

          {/* Fee Warning */}
          {rescheduleWillIncurFee && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 font-medium">Rescheduling Fee Notice</p>
                <p className="text-yellow-400 text-sm mt-1">
                  Since you're rescheduling within 24 hours ({hoursUntilAppointment} hours remaining), 
                  this may incur a rescheduling fee based on our cancellation policy.
                </p>
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div>
            <h3 className="text-white font-medium mb-3">Select New Date</h3>
            <div className="grid grid-cols-5 gap-2">
              {availableDates.slice(0, 15).map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    selectedDate === date
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-600 text-gray-300 hover:border-blue-400 hover:text-white'
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
              <h3 className="text-white font-medium mb-3">Select New Time</h3>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedTime === time
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-600 text-gray-300 hover:border-blue-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <h3 className="text-white font-medium mb-3">Reason for Rescheduling (Optional)</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              placeholder="Please provide a reason for rescheduling..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!selectedDate || !selectedTime || isLoading}
              isLoading={isLoading}
            >
              Confirm Reschedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};