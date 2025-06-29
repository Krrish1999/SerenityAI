import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Globe,
  BookOpen,
  Clock,
  DollarSign,
  Award,
  CheckCircle,
  CreditCard,
  Package
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useTherapistStore } from '../store/therapistStore';
import { useServiceStore } from '../store/serviceStore';
import { formatPriceFromDollars } from '../lib/stripe';

export const TherapistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTherapist, fetchTherapistById, isLoading, error } = useTherapistStore();
  const { services, fetchServices, isLoading: servicesLoading } = useServiceStore();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTherapistById(id);
    }
  }, [id, fetchTherapistById]);
  
  useEffect(() => {
    if (currentTherapist) {
      fetchServices(currentTherapist.id);
    }
  }, [currentTherapist, fetchServices]);

  if (isLoading) {
    return (
      <div className="animate-pulse max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded-xl w-1/4 mb-6"></div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gray-200 h-64 md:h-auto"></div>
            <div className="p-6 md:p-8 md:w-2/3">
              <div className="h-8 bg-gray-200 rounded-xl w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-1/2 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded-xl mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-xl mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-3/4 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentTherapist) {
    return (
      <div className="max-w-4xl mx-auto text-center py-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {error || "Therapist not found"}
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't find the therapist you're looking for.
        </p>
        <Button onClick={() => navigate('/therapists')}>
          Browse All Therapists
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/therapists')}
        >
          Back to therapists
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img
              src={currentTherapist.avatar_url ? currentTherapist.avatar_url : `https://randomuser.me/api/portraits/men/${parseInt(currentTherapist.id) % 100}.jpg`}
              alt={`Dr. ${currentTherapist.full_name}`}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          <div className="p-6 md:p-8 md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Dr. {currentTherapist.full_name}
                </h1>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5"
                        fill={i < currentTherapist.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {currentTherapist.rating.toFixed(1)} ({Math.floor(Math.random() * 100) + 50} reviews)
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ${currentTherapist.rate_per_hour}/hr
              </div>
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {currentTherapist.specialization.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <p className="text-gray-700 mb-6">
                {currentTherapist.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  <span>{currentTherapist.experience_years} years experience</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  <span>Online Sessions</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  <span>Languages: English, Spanish</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  <span>Response time: &lt;24 hours</span>
                </div>
              </div>

              <Button 
                fullWidth 
                icon={<Package className="w-5 h-5" />}
                onClick={() => navigate(`/therapists/${currentTherapist.id}#services`)}
              >
                View Available Services
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">About Dr. {currentTherapist.full_name}</h2>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-gray-700 mb-4">
              With over {currentTherapist.experience_years} years of experience, Dr. {currentTherapist.full_name} specializes in 
              {currentTherapist.specialization.join(', ')}. 
              They are committed to creating a safe, supportive environment where clients can explore their challenges and develop effective coping strategies.
            </p>
            <p className="text-gray-700">
              Their therapeutic approach is collaborative and tailored to each individual's unique needs and goals. 
              Dr. {currentTherapist.full_name} believes in empowering clients with the tools and insights needed for lasting positive change.
            </p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">Education & Credentials</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Education</h3>
                <ul className="space-y-2">
                  {currentTherapist.education.map((edu, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Certifications & Licenses</h3>
                <ul className="space-y-2">
                  {currentTherapist.certifications.map((cert, index) => (
                    <li key={index} className="flex items-start">
                      <Award className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Services */}
        <div id="services">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Services</h2>
          <Card>
            <CardHeader>
              <CardTitle>Select a Service</CardTitle>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>
                  <div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ) : services && services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedServiceId === service.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                      onClick={() => setSelectedServiceId(service.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                          <div className="flex items-center mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              service.type === 'one_time'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {service.type === 'one_time' ? 'One-time' : 'Subscription'}
                            </span>
                            
                            {service.type === 'subscription' && service.session_quota && (
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                {service.session_quota} sessions/{service.billing_interval}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">{formatPriceFromDollars(service.price_amount)}</p>
                          <p className="text-xs text-gray-600">
                            {service.type === 'one_time' ? 'per session' : `per ${service.billing_interval}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No services available</p>
                  <p className="text-sm text-gray-500 mt-2">This therapist hasn't configured any services yet.</p>
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  fullWidth
                  disabled={!selectedServiceId}
                  onClick={() => {
                    if (selectedServiceId && currentTherapist) {
                      navigate(`/book/${currentTherapist.id}/${selectedServiceId}`);
                    }
                  }}
                  icon={<Calendar className="w-5 h-5" />}
                >
                  Book Selected Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
     </div>
    </div>
  );
};