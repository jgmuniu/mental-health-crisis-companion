import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ChatProvider } from './contexts/ChatContext'
import Layout from './components/layout/Layout'
import PrivateRoute from './components/auth/PrivateRoute'
import { LandingPage } from './components/auth/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Onboarding, { hasSeenOnboarding } from './components/auth/Onboarding'
import Chat from './components/chat/Chat'
import { OfflinePage } from './components/chat/OfflineBanner'
import CrisisResources from './components/crisis/CrisisResources'
import Dashboard from './components/crisis/Dashboard'
import CrisisMap from './components/crisis/CrisisMap'
import BreathingExercises from './components/wellness/BreathingExercises'
import SafetyPlan from './components/wellness/SafetyPlan'
import Journal from './components/wellness/Journal'
import NotificationsPage from './components/wellness/NotificationsPage'
import TrustedContacts from './components/wellness/TrustedContacts'
import DailyCheckIn from './components/wellness/DailyCheckIn'

// ── Offline-aware wrapper for pages that need network ─────────────────────
const RequiresNetwork = ({ children }) => {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const off = () => setOffline(true);
    const on  = () => setOffline(false);
    window.addEventListener('offline', off);
    window.addEventListener('online',  on);
    return () => {
      window.removeEventListener('offline', off);
      window.removeEventListener('online',  on);
    };
  }, []);
  if (offline) return <OfflinePage onRetry={() => window.location.reload()} />;
  return children;
};

// ── App routes ────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { loginAnonymous } = useAuth();
  const navigate = useNavigate();

  const handleAnonymous = () => {
    loginAnonymous();
    navigate('/chat');
  };

  const handleLogin = () => {
    // Returning users skip onboarding
    navigate('/chat');
  };

  const handleRegister = () => {
    // New users see onboarding; returning ones go straight to chat
    navigate(hasSeenOnboarding() ? '/chat' : '/onboarding');
  };

  return (
    <Layout>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"         element={<LandingPage onAnonymous={handleAnonymous} onLogin={handleLogin} onRegister={handleRegister} />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* ── Requires auth + network ── */}
        <Route path="/chat" element={
          <PrivateRoute><Chat /></PrivateRoute>
        } />
        <Route path="/resources" element={
          <PrivateRoute>
            <RequiresNetwork><CrisisResources /></RequiresNetwork>
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/map" element={
          <PrivateRoute>
            <RequiresNetwork><CrisisMap /></RequiresNetwork>
          </PrivateRoute>
        } />
        <Route path="/breathing"   element={<PrivateRoute><BreathingExercises /></PrivateRoute>} />
        <Route path="/safety-plan" element={<PrivateRoute><SafetyPlan /></PrivateRoute>} />

        {/* ── No auth needed — fully localStorage ── */}
        <Route path="/journal"          element={<Journal />} />
        <Route path="/notifications"    element={<NotificationsPage />} />
        <Route path="/trusted-contacts" element={<TrustedContacts />} />
        <Route path="/checkin"          element={<DailyCheckIn />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;