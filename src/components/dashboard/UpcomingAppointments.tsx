import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Calendar, Clock, Video, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { Appointment } from '../../types';
import { Link } from 'react-router-dom';

type UpcomingAppointmentsProps = {
  appointments: Appointment[];
  isLoading: boolean;
};

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border-b border-gray-700 last:border-b-0">
                <div className="h-4 bg-gray-700 rounded-xl w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded-xl w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingAppointments = appointments
    .filter((appointment) => appointment.status === 'scheduled')
    .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Appointments</CardTitle>
        <Link to="/appointments">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-600 text-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-white">
                        Dr. {appointment.therapist?.full_name || appointment.therapist_id}
                      </h4>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {format(new Date(appointment.date_time), 'MMMM d, yyyy')}
                        </span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {format(new Date(appointment.date_time), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Video className="w-4 h-4" />}
                  >
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <h4 className="text-gray-400">No upcoming appointments</h4>
            <Link to="/therapists">
              <Button variant="outline" className="mt-4">
                Find a Therapist
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};