import React from 'react';
import { Calendar, BookOpen, UserCircle, BarChart2, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { User } from '../../types';

type DashboardSummaryProps = {
  user: User;
  journalCount: number;
  upcomingAppointments: number;
  streak: number;
};

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  user,
  journalCount,
  upcomingAppointments,
  streak,
}) => {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.full_name}!</h1>
          <p className="text-gray-600 mt-1">Here's a summary of your wellness journey</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link to="/journal/new">
            <Button 
              variant="secondary"
              size="sm"
              icon={<BookOpen className="w-4 h-4" />}
            >
              New Journal Entry
            </Button>
          </Link>
          <Link to="/therapists">
            <Button 
              variant="outline"
              size="sm"
              icon={<Calendar className="w-4 h-4" />}
            >
              Schedule Session
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pastel-teal text-accent-teal">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">{journalCount}</h3>
                <p className="text-sm text-gray-500">Journal Entries</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/journal" className="text-blue-400 text-sm font-medium hover:underline">
                View all entries →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pastel-sage text-green-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">
                  {user.free_session_credit ? "1 Free" : "0 Free"}
                </h3>
                <p className="text-sm text-gray-500">Session Credits</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/payment-history" className="text-green-400 text-sm font-medium hover:underline">
                View payment history →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pastel-lavender text-accent-teal">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">{upcomingAppointments}</h3>
                <p className="text-sm text-gray-500">Upcoming Appointments</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/therapists" className="text-teal-400 text-sm font-medium hover:underline">
                Manage appointments →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent-coral text-white">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">{streak} days</h3>
                <p className="text-sm text-gray-500">Current Streak</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/journal" className="text-purple-400 text-sm font-medium hover:underline">
                View your progress →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};