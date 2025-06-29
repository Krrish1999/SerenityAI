import React, { useEffect, useState } from 'react';
import { DashboardSummary } from '../components/dashboard/DashboardSummary';
import { MoodTracker } from '../components/dashboard/MoodTracker';
import { UpcomingAppointments } from '../components/dashboard/UpcomingAppointments';
import { RecentJournalEntries } from '../components/dashboard/RecentJournalEntries';
import { QuickActions } from '../components/dashboard/QuickActions';
import { useAuthStore } from '../store/authStore';
import { useJournalStore } from '../store/journalStore';
import { useMoodStore } from '../store/moodStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useResourceStore } from '../store/resourceStore';
import { ResourceCard } from '../components/resources/ResourceCard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { entries: journalEntries, fetchJournalEntries, isLoading: journalLoading } = useJournalStore();
  const { fetchMoodEntries, isLoading: moodLoading } = useMoodStore();
  const { appointments, fetchAppointments, isLoading: appointmentsLoading } = useAppointmentStore();
  const { featuredResources, fetchFeaturedResources, isLoading: resourcesLoading } = useResourceStore();
  
  const [streak, setStreak] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetchJournalEntries(user.id);
      fetchMoodEntries(user.id);
      fetchAppointments(user.id);
      fetchFeaturedResources();
      
      // Calculate streak (mock implementation)
      setStreak(Math.floor(Math.random() * 10) + 1);
    }
  }, [user]);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  const upcomingAppointmentsCount = appointments.filter(
    appointment => appointment.status === 'scheduled'
  ).length;
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-gray-800 text-3xl font-bold tracking-tight mb-3">Your Mood Summary</h1>
        <p className="text-gray-600 text-base max-w-2xl mx-auto">Here's a snapshot of your recent emotional trends and insights.</p>
      </div>

      <div className="mb-12">
        <MoodTracker />
      </div>

      <QuickActions />
      
      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-gray-800 text-2xl font-bold tracking-tight mb-4">Recently Viewed Resources</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resourcesLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700 aspect-video rounded-xl mb-4"></div>
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))
          ) : (
            featuredResources.slice(0, 3).map(resource => (
              <div key={resource.id} className="group cursor-pointer bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover transition-transform group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${resource.thumbnail_url || 'https://images.pexels.com/photos/3758105/pexels-photo-3758105.jpeg?auto=compress&cs=tinysrgb&w=600'})`
                  }}
                ></div>
                <div className="p-4">
                  <h3 className="text-gray-800 text-lg font-semibold leading-snug mb-2 group-hover:text-accent-teal transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {resource.content.substring(0, 60)}...
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};