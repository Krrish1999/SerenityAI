import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, TrendingUp, MessageCircle, AlertTriangle, 
  BookOpen, Activity, Target, Phone, Mail, ChevronRight 
} from 'lucide-react';
import { PatientSummary } from '../../types';
import { useDoctorStore } from '../../store/doctorStore';
import { MoodTrendChart } from './MoodTrendChart';
import { CrisisAlertsPanel } from './CrisisAlertsPanel';
import { PatientMessaging } from './PatientMessaging';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

type PatientProfileProps = {
  patient: PatientSummary;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'messages' | 'insights'>('overview');
  const { patientDetails, journalEntries, moodData, crisisEvents } = useDoctorStore();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'history', label: 'History', icon: BookOpen },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'insights', label: 'Insights', icon: Activity },
  ] as const;

  return (
    <div className="flex-1 flex flex-col bg-neutral-off-white">
      {/* Patient Header */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mr-4 border border-gray-200">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{patient.full_name}</h1>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                <span>Age {patient.age}</span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    patient.status === 'stable' ? 'bg-green-400' :
                    patient.status === 'monitoring' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                </span>
                {patient.has_crisis_alert && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center text-red-500">
                      <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                      Crisis Alert
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                {patientDetails?.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    <span>{patientDetails.email}</span>
                  </div>
                )}
                {patientDetails?.phone_number && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{patientDetails.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button size="sm" icon={<MessageCircle className="w-4 h-4 mr-1" />}>
              <span>Send Message</span>
            </Button>
            <Button size="sm" variant="outline" icon={<Calendar className="w-4 h-4 mr-1" />}>
              <span>Schedule</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex space-x-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-b-2 border-b-2 ${
                activeTab === id
                  ? 'text-accent-teal border-accent-teal bg-pastel-teal/10'
                  : 'text-gray-600 border-transparent hover:text-accent-teal hover:bg-pastel-teal/5'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Mood</p>
                      <p className="text-xl font-bold text-gray-800">{patient.avg_mood}/5</p>
                    </div>
                    <div className="p-2 rounded-full bg-pastel-teal">
                      <TrendingUp className="w-5 h-5 text-accent-teal" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Journal Entries</p>
                      <p className="text-xl font-bold text-gray-800">{patient.journal_count}</p>
                    </div>
                    <div className="p-2 rounded-full bg-pastel-lavender">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Engagement</p>
                      <p className="text-xl font-bold text-gray-800">{patient.engagement_score}%</p>
                    </div>
                    <div className="p-2 rounded-full bg-pastel-pink">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Next Session</p>
                      <p className="text-xl font-bold text-gray-800">
                        {patient.next_appointment ? 'Scheduled' : 'None'}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-pastel-sage">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mood Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Mood Trends (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <MoodTrendChart data={moodData} />
              </CardContent>
            </Card>

            {/* Crisis Alerts */}
            {patient.has_crisis_alert && (
              <CrisisAlertsPanel events={crisisEvents} />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Mental Health History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Mental Health History</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {patientDetails?.bio ? (
                  <p className="text-gray-700">{patientDetails.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No medical history recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Journal Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Recent Journal Entries</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {journalEntries.length > 0 ? (
                  <div className="space-y-4">
                    {journalEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="border-l-4 border-accent-teal pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">{entry.title}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-2">{entry.content}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-600">Mood: {entry.mood}/5</span>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="ml-4 flex flex-wrap gap-1">
                              {entry.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No journal entries found</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'messages' && (
          <PatientMessaging patientId={patient.id} patientName={patient.full_name} />
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Engagement Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Patient Engagement</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">App Usage Frequency</span>
                    <span className="text-gray-800 font-medium">{patient.engagement_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-accent-teal h-2 rounded-full" 
                      style={{ width: `${patient.engagement_score}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shared Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Treatment Goals</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Target className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-gray-800 font-medium">Improve Sleep Quality</p>
                        <p className="text-gray-500 text-sm">7-8 hours per night</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-medium">75%</p>
                      <p className="text-gray-500 text-sm">Progress</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Target className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-gray-800 font-medium">Daily Mindfulness</p>
                        <p className="text-gray-500 text-sm">10 minutes daily</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-600 font-medium">45%</p>
                      <p className="text-gray-500 text-sm">Progress</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};