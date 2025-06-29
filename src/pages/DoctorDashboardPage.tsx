import React, { useEffect, useState } from 'react';
import { Search, Filter, AlertTriangle, TrendingUp, Calendar, MessageCircle, RefreshCw } from 'lucide-react';
import { useDoctorStore } from '../store/doctorStore';
import { useAuthStore } from '../store/authStore';
import { PatientList } from '../components/doctor/PatientList';
import { PatientProfile } from '../components/doctor/PatientProfile';
import { DoctorStats } from '../components/doctor/DoctorStats';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    patients,
    selectedPatient,
    crisisAlerts,
    stats,
    isLoading,
    selectPatient,
    fetchPatients,
    fetchCrisisAlerts,
    fetchDoctorStats
  } = useDoctorStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'stable' | 'monitoring' | 'crisis'>('all');

  // Filter patients based on search term and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    // For now, we'll use a simple status mapping - this can be enhanced based on your business logic
    const patientStatus = patient.status || 'stable';
    return matchesSearch && patientStatus === statusFilter;
  });

  useEffect(() => {
    if (user && user.id) {
      fetchPatients(user.id);
      fetchCrisisAlerts(user.id);
      fetchDoctorStats(user.id);
    }
  }, [user, fetchPatients, fetchCrisisAlerts, fetchDoctorStats]);

  // Check if user exists
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-accent-teal"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-off-white flex overflow-hidden">
      {/* Left Sidebar - Patient List */}
      <div className="w-80 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Patients</h1>
            <div className="flex items-center space-x-2">
              {crisisAlerts.length > 0 && (
                <div className="flex items-center px-2 py-1 bg-red-100 text-red-600 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs font-medium">{crisisAlerts.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search patients..."
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'stable', 'monitoring', 'crisis'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)} 
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-accent-teal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Patient List */}
        <div className="flex-1 overflow-y-auto">
          <PatientList
            patients={filteredPatients}
            selectedPatientId={selectedPatient?.id}
            onSelectPatient={selectPatient}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedPatient ? (
          <PatientProfile patient={selectedPatient} />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Welcome Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome, Dr. {user.full_name}
              </h2>
              <p className="text-gray-600">
                Your patient dashboard - select a patient from the sidebar to view their profile
              </p>
            </div>

            {/* Dashboard Stats */}
            <div className="p-6 bg-neutral-off-white">
              <DoctorStats stats={stats} crisisCount={crisisAlerts.length} />
            </div>

            {/* Recent Activity */}
            <div className="flex-1 p-6 pt-0">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recent Activity
                </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => user && fetchCrisisAlerts(user.id)}
                    className="text-sm"
                    icon={<RefreshCw className="w-4 h-4 mr-2" />}
                  >
                    Refresh
                  </Button>
                </div>
                
                {crisisAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {crisisAlerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-3" />
                          <div>
                            <p className="text-gray-800 font-medium">{alert.patient_name}</p>
                            <p className="text-red-600 text-sm">
                              Crisis detected - {alert.severity_level} severity
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-sm">
                            {new Date(alert.detected_at).toLocaleDateString()}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => selectPatient(alert.user_id)}
                            variant="outline"
                            className="mt-1 text-xs"
                            className="mt-1 text-xs"
                          >
                            View Patient
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">No recent crisis alerts</p>
                    <p className="text-gray-500 text-sm">Your patients are doing well</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};