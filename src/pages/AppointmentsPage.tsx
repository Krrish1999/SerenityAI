import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AppointmentList } from '../components/dashboard/AppointmentList';

export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
          className="mr-4 text-gray-400 hover:text-white"
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Appointments</h1>
          <p className="text-gray-400">Manage your therapy sessions</p>
        </div>
      </div>

      <AppointmentList />
    </div>
  );
};