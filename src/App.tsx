import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useTherapistStore } from './store/therapistStore';
import { Layout } from './components/layout/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { JournalPage } from './pages/JournalPage';
import { JournalEntryPage } from './pages/JournalEntryPage';
import { JournalFormPage } from './pages/JournalFormPage';
import { TherapistsPage } from './pages/TherapistsPage';
import { TherapistDetailPage } from './pages/TherapistDetailPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import { EarningsDashboardPage } from './pages/EarningsDashboardPage';
import { SubscriptionManagementPage } from './pages/SubscriptionManagementPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { MessagesPage } from './pages/MessagesPage';
import { AIChatPage } from './pages/AIChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TherapistSetupPage } from './pages/TherapistSetupPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { AppointmentsPage } from './pages/AppointmentsPage';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuthStore();
  const { checkTherapistStatus } = useTherapistStore();
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  
  useEffect(() => {
    if (user) {
      checkTherapistStatus(user.id).finally(() => {
        setIsCheckingRole(false);
      });
    } else {
      setIsCheckingRole(false);
    }
  }, [user, checkTherapistStatus]);
  
  if (loading || isCheckingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-based route wrapper
const RoleBasedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: JSX.Element; 
  allowedRoles: ('patient' | 'therapist')[] 
}) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user.role === 'therapist' ? '/doctor-dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (user) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user.role === 'therapist' ? '/doctor-dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

function App() {
  const { initializeAuth } = useAuthStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route 
            index 
            element={
              user ? (
                <Navigate to={user.role === 'therapist' ? '/doctor-dashboard' : '/dashboard'} replace />
              ) : (
                <HomePage />
              )
            } 
          />
          <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          
          {/* Protected routes */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['patient']}>
                  <DashboardPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="doctor-dashboard" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['therapist']}>
                  <DoctorDashboardPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          {/* Patient-only routes */}
          <Route 
            path="journal" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['patient']}>
                  <JournalPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="journal/new" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['patient']}>
                  <JournalFormPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="journal/:id" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['patient']}>
                  <JournalEntryPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="journal/edit/:id" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['patient']}>
                  <JournalFormPage isEditing />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="ai-chat" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['patient']}>
                  <AIChatPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          {/* Shared routes (both roles) */}
          <Route path="therapists" element={<ProtectedRoute><TherapistsPage /></ProtectedRoute>} />
          <Route path="therapists/:id" element={<ProtectedRoute><TherapistDetailPage /></ProtectedRoute>} />
          
          <Route path="resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
          <Route path="resources/:id" element={<ProtectedRoute><ResourceDetailPage /></ProtectedRoute>} />
          
          <Route path="messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="payment-history" element={<ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>} />
          <Route path="subscriptions" element={<ProtectedRoute><SubscriptionManagementPage /></ProtectedRoute>} />
          <Route path="earnings" element={<ProtectedRoute><EarningsDashboardPage /></ProtectedRoute>} />
          <Route 
            path="payment-history" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['patient']}>
                  <PaymentHistoryPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="subscriptions" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['patient']}>
                  <SubscriptionManagementPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="earnings" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['therapist']}>
                  <EarningsDashboardPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="book/:therapistId/:serviceId" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['patient']}>
                  <BookAppointmentPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="appointments" 
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="therapist-setup" element={<ProtectedRoute><TherapistSetupPage /></ProtectedRoute>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;