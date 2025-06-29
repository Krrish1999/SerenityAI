import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, Calendar, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { ServiceForm } from './ServiceForm';
import { useServiceStore, TherapistService } from '../../store/serviceStore';
import { useTherapistStore } from '../../store/therapistStore';
import { useAuthStore } from '../../store/authStore';
import { formatPriceFromDollars } from '../../lib/stripe';

export const ServiceManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { isTherapist } = useTherapistStore();
  const { services, isLoading, error, fetchServices, deleteService, clearError } = useServiceStore();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<TherapistService | null>(null);

  useEffect(() => {
    if (user && isTherapist) {
      // Get therapist profile ID and fetch services
      fetchTherapistServices();
    }
  }, [user, isTherapist]);

  const fetchTherapistServices = async () => {
    if (!user) return;
    
    // Get therapist profile ID
    const { data: therapistProfile } = await supabase
      .from('therapist_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (therapistProfile) {
      fetchServices(therapistProfile.id);
    }
  };

  const handleCreateService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service: TherapistService) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDeleteService = async (service: TherapistService) => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
      await deleteService(service.id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingService(null);
    clearError();
  };

  const getServiceTypeLabel = (type: string, billingInterval?: string) => {
    if (type === 'one_time') {
      return 'One-time session';
    }
    return `Subscription (${billingInterval || 'monthly'})`;
  };

  const getBillingLabel = (service: TherapistService) => {
    if (service.type === 'one_time') {
      return 'Per session';
    }
    return `Per ${service.billing_interval || 'month'}`;
  };

  if (!isTherapist) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Service Management
            </CardTitle>
            <Button onClick={handleCreateService} icon={<Plus className="w-4 h-4" />}>
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-xl p-6 h-32"></div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className=" rounded-lg p-6 border border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-500 mb-2">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-gray-400 text-sm mb-3">
                          {service.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center text-green-500">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-semibold">
                            {formatPriceFromDollars(service.price_amount)} {getBillingLabel(service)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-blue-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{getServiceTypeLabel(service.type, service.billing_interval)}</span>
                        </div>
                        
                        {service.session_quota && (
                          <div className="flex items-center text-purple-400">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{service.session_quota} sessions included</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          service.is_active
                            ? 'bg-green-800/20 text-green-700 border border-green-500/30'
                            : 'bg-gray-900/20 text-gray-500 border border-gray-600/30'
                        }`}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditService(service)}
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteService(service)}
                        icon={<Trash2 className="w-4 h-4 text-red-400" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No services yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first service to start accepting payments from patients.
              </p>
              <Button onClick={handleCreateService} icon={<Plus className="w-4 h-4" />}>
                Create Your First Service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Form Modal */}
      {showForm && (
        <ServiceForm
          service={editingService}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            fetchTherapistServices();
          }}
        />
      )}
    </div>
  );
};