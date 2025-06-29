import React, { useEffect, useState } from 'react';
import { TherapistSearch } from '../components/therapists/TherapistSearch';
import { TherapistCard } from '../components/therapists/TherapistCard';
import { useTherapistStore } from '../store/therapistStore';
import { Info } from 'lucide-react';

export const TherapistsPage: React.FC = () => {
  const { therapists, fetchTherapists, searchTherapists, isLoading, error } = useTherapistStore();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const handleSearch = (query: string, specializations: string[]) => {
    searchTherapists(query, specializations);
    setHasSearched(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find a Therapist</h1>
        <p className="text-gray-600">Connect with licensed professionals who can help with your mental health journey</p>
      </div>

      <TherapistSearch onSearch={handleSearch} isLoading={isLoading} />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
        <Info className="text-blue-500 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All sessions with therapists are confidential. Your privacy is our top priority.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse bg-white rounded-xl shadow-sm h-80">
              <div className="h-1/3 bg-gray-200 rounded-t-xl"></div>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded-xl w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded-xl w-20"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded-xl"></div>
                  <div className="h-3 bg-gray-200 rounded-xl"></div>
                  <div className="h-3 bg-gray-200 rounded-xl w-3/4"></div>
                </div>
                <div className="mt-6 flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : therapists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapists.map(therapist => (
            <TherapistCard key={therapist.id} therapist={therapist} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasSearched ? "No therapists match your search criteria" : "No therapists available"}
          </h3>
          <p className="text-gray-600">
            {hasSearched 
              ? "Try adjusting your filters or search term to find more results." 
              : "Please check back later or contact our support team for assistance."}
          </p>
        </div>
      )}
    </div>
  );
};