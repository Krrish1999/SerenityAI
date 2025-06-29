import React, { useEffect, useState } from 'react';
import { Calendar, Search, Filter, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AppointmentCard } from './AppointmentCard';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useAuthStore } from '../../store/authStore';
import { format, isAfter, isBefore, startOfDay, endOfDay, addDays } from 'date-fns';

export const AppointmentList: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    appointments, 
    isLoading, 
    error, 
    fetchAppointments, 
    updateAppointmentStatus,
    rescheduleAppointment
  } = useAppointmentStore();
  
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchAppointments(user.id);
    }
  }, [user, fetchAppointments]);
  
  const getFilteredAppointments = () => {
    const now = new Date();
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date_time);
      const matchesSearch = searchTerm === '' || 
        appointment.therapist_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      switch (filter) {
        case 'upcoming':
          return appointment.status === 'scheduled' && isAfter(appointmentDate, now) && matchesSearch;
        case 'past':
          return (appointment.status === 'completed' || 
                 (appointment.status === 'scheduled' && isBefore(appointmentDate, now))) && 
                 matchesSearch;
        case 'cancelled':
          return appointment.status === 'cancelled' && matchesSearch;
        default:
          return matchesSearch;
      }
    });
  };
  
  const handleReschedule = async (appointmentId: string, newDateTime: string) => {
    if (user) {
      await rescheduleAppointment(appointmentId, newDateTime);
      await fetchAppointments(user.id);
    }
  };
  
  const handleCancel = async (appointmentId: string, reason?: string) => {
    await updateAppointmentStatus(appointmentId, 'cancelled');
    if (user) {
      await fetchAppointments(user.id);
    }
  };
  
  const filteredAppointments = getFilteredAppointments();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Appointments
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Filter className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => user && fetchAppointments(user.id)}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <Input
              placeholder="Search appointments..."
              icon={<Search className="w-5 h-5" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
            
            {showFilters && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'upcoming'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilter('past')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'past'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Past
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'cancelled'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          {/* Appointments List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-700 h-32 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No {filter !== 'all' ? filter : ''} appointments found
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === 'upcoming' 
                  ? "You don't have any upcoming appointments scheduled."
                  : filter === 'past'
                  ? "You don't have any past appointments."
                  : filter === 'cancelled'
                  ? "You don't have any cancelled appointments."
                  : "No appointments match your search criteria."}
              </p>
              <Button onClick={() => navigate('/therapists')}>
                Find a Therapist
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};