import React from 'react';
import { Users, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

export const DoctorStats: React.FC<DoctorStatsProps> = ({ stats, crisisCount }) => {
  const statCards = [
    {
      title: 'Total Patients',
      value: stats.total_patients,
      icon: Users,
      color: 'text-accent-teal',
      bgColor: 'bg-pastel-teal'
    },
    {
      title: 'Active This Week',
      value: stats.active_patients,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-pastel-sage'
    },
    {
      title: 'Upcoming Sessions',
      value: stats.upcoming_appointments,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-pastel-lavender'
    },
    {
      title: 'Crisis Alerts',
      value: crisisCount,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-pastel-pink'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-grow">
                <p className="text-sm text-gray-500 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor === 'bg-blue-600/20' ? 'bg-pastel-teal' : 
                                               stat.bgColor === 'bg-green-600/20' ? 'bg-pastel-sage' : 
                                               stat.bgColor === 'bg-purple-600/20' ? 'bg-pastel-lavender' : 
                                               'bg-pastel-pink'}`}>
                <stat.icon className={`w-6 h-6 ${stat.color === 'text-blue-400' ? 'text-accent-teal' : 
                                              stat.color === 'text-green-400' ? 'text-green-600' : 
                                              stat.color === 'text-purple-400' ? 'text-purple-600' : 
                                              'text-red-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="md:col-span-4">
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
             
                <p className="text-sm text-gray-500 mb-1">Average Patient Engagement</p>
                <p className="text-2xl font-bold text-gray-800">{stats.avg_patient_engagement}%</p>
                <p className="text-sm text-green-600 mt-1">+5% from last week</p>
              </div>
              <div className="w-24 h-24">
                <div className="relative w-full h-full">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#E5E7EB"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#457B9D"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.avg_patient_engagement / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="text-lg font-bold text-accent-teal">{stats.avg_patient_engagement}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="md:col-span-2 lg:col-span-4 border border-gray-200 shadow-sm">
      </Card>
    </div>
  );
};