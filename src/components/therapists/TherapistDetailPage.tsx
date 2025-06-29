@@ .. @@
 import { useParams, Link, useNavigate } from 'react-router-dom';
 import {
   ArrowLeft,
-  Star,
-  Calendar,
-  MapPin,
-  Globe,
-  BookOpen,
-  Clock,
-  DollarSign,
-  Award,
-  CheckCircle,
+  Star, Calendar, MapPin, Globe, BookOpen, Clock, 
+  DollarSign, Award, CheckCircle, CreditCard
 } from 'lucide-react';
 import { Button } from '../ui/Button';
 import { Card, CardContent } from '../ui/Card';
 import { useTherapistStore } from '../../store/therapistStore';
+import { useServiceStore } from '../../store/serviceStore';
+import { useEffect, useState } from 'react';
+import { formatPriceFromDollars } from '../../lib/stripe';
 
 export const TherapistDetailPage: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const { currentTherapist, fetchTherapistById, isLoading, error } = useTherapistStore();
-  const [selectedDate, setSelectedDate] = useState<string | null>(null);
-  const [selectedTime, setSelectedTime] = useState<string | null>(null);
+  const { services, fetchServices } = useServiceStore();
+  const [selectedService, setSelectedService] = useState<string | null>(null);
 
   useEffect(() => {
     if (id) {
       fetchTherapistById(id);
     }
   }, [id]);
+  
+  useEffect(() => {
+    if (currentTherapist) {
+      fetchServices(currentTherapist.id);
+    }
+  }, [currentTherapist]);
 
   // Mock data for available dates and times
@@ .. @@
               <div className="text-2xl font-bold text-blue-600">
-                ${currentTherapist.rate_per_hour}/hr
+                From ${Math.min(...services.map(s => s.price_amount), currentTherapist.rate_per_hour)}/session
               </div>
             </div>
 
@@ .. @@
               </div>
             </CardContent>
           </Card>
+          
+          {/* Services */}
+          <Card className="mt-6">
+            <CardHeader>
+              <CardTitle>Available Services</CardTitle>
+            </CardHeader>
+            <CardContent>
+              {services.length > 0 ? (
+                <div className="space-y-4">
+                  {services.map((service) => (
+                    <div 
+                      key={service.id}
+                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
+                        selectedService === service.id 
+                          ? 'border-blue-500 bg-blue-900/20' 
+                          : 'border-gray-600 hover:border-blue-400'
+                      }`}
+                      onClick={() => setSelectedService(service.id)}
+                    >
+                      <div className="flex justify-between items-start">
+                        <div>
+                          <h3 className="font-medium text-white">{service.name}</h3>
+                          {service.description && (
+                            <p className="text-sm text-gray-400 mt-1">{service.description}</p>
+                          )}
+                          <div className="flex items-center mt-2">
+                            <span className={`px-2 py-1 text-xs rounded-full ${
+                              service.type === 'one_time'
+                                ? 'bg-blue-900/20 text-blue-400 border border-blue-600/30'
+                                : 'bg-purple-900/20 text-purple-400 border border-purple-600/30'
+                            }`}>
+                              {service.type === 'one_time' ? 'One-time' : 'Subscription'}
+                            </span>
+                            
+                            {service.type === 'subscription' && service.session_quota && (
+                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-900/20 text-green-400 border border-green-600/30">
+                                {service.session_quota} sessions/{service.billing_interval}
+                              </span>
+                            )}
+                          </div>
+                        </div>
+                        <div className="text-right">
+                          <p className="font-medium text-white">{formatPriceFromDollars(service.price_amount)}</p>
+                          <p className="text-xs text-gray-400">
+                            {service.type === 'one_time' ? 'per session' : `per ${service.billing_interval}`}
+                          </p>
+                        </div>
+                      </div>
+                    </div>
+                  ))}
+                </div>
+              ) : (
+                <div className="text-center py-6">
+                  <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
+                  <p className="text-gray-400">No services available</p>
+                </div>
+              )}
+              
+              <div className="mt-6">
+                <Button
+                  fullWidth
+                  disabled={!selectedService}
                  onClick={() => {
                      console.log('Book Selected Service button clicked!');
                      console.log('Current Therapist ID:', currentTherapist?.id);
                      console.log('Selected Service ID:', selectedService);
                      if (selectedService && currentTherapist) {
                        navigate(`/book/${currentTherapist.id}/${selectedService}`);
                      } else {
                        console.log('Navigation prevented: selectedService or currentTherapist is missing.');
                      }
                    }}
+                  icon={<Calendar className="w-5 h-5" />}
+                >
+                  Book Selected Service
+                </Button>
+              </div>
+            </CardContent>
+          </Card>
         </div>
       </div>
     </div>