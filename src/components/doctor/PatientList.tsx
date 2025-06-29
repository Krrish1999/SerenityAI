import React from 'react';
import { Calendar, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { PatientSummary } from '../../types';

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  isLoading
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-400';
      case 'monitoring': return 'bg-yellow-400';
      case 'crisis': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'stable': return 'Stable';
      case 'monitoring': return 'Monitor';
      case 'crisis': return 'Crisis';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center p-3 space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No patients found</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="space-y-2">
        {patients.map((patient) => (
          <button
            key={patient.id}
            onClick={() => onSelectPatient(patient.id)}
            className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
              selectedPatientId === patient.id
                ? 'bg-pastel-teal/40 shadow-sm border border-accent-teal/30'
                : 'bg-white hover:bg-pastel-teal/20 border border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(patient.status)} mr-2`} />
                  <h3 className="text-gray-800 font-medium truncate">{patient.full_name}</h3>
                  {patient.has_crisis_alert && (
                    <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-sm text-xs flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-0.5" />
                      Alert
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <span className={`font-medium px-1.5 py-0.5 rounded-sm ${
                      patient.status === 'stable' ? 'bg-green-100 text-green-700' : 
                      patient.status === 'monitoring' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {getStatusText(patient.status)}
                    </span>
                    <span className="mx-1">•</span>
                    <span>Age {patient.age}</span>
                  </div>
                  
                  {patient.next_appointment && (
                    <div className="flex items-center text-accent-teal mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{format(new Date(patient.next_appointment), 'MMM d')}</span>
                    </div>
                  )}
                  
                  {patient.last_mood_entry && (
                    <div className="flex items-center text-accent-coral mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>Mood: {patient.avg_mood}/5</span>
                    </div>
                  )}
                  
                  {patient.last_activity && (
                    <div className="flex items-center text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDistanceToNow(new Date(patient.last_activity), { addSuffix: true })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};