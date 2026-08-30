import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import { MainLayout } from './layouts/MainLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Services } from './pages/Services';
import { ServiceWorkflow } from './pages/ServiceWorkflow';
import { ApplicationTracking } from './pages/ApplicationTracking';
import { Notifications } from './pages/Notifications';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Help } from './pages/Help';
import './index.css';

// Protected Route Wrapper Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

// Public Route Wrapper Component (Always has layout except login page, or has layout with different access)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DemoProvider>
          <Routes>
            {/* Public Welcome Landing Page */}
            <Route path="/welcome" element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            } />

            {/* Login OTP Page (no MainLayout wrapper directly inside Login to keep clean structure) */}
            <Route path="/login" element={
              <MainLayout>
                <Login />
              </MainLayout>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/services" element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            } />

            <Route path="/workflow" element={
              <ProtectedRoute>
                <ServiceWorkflow />
              </ProtectedRoute>
            } />

            <Route path="/track" element={
              <ProtectedRoute>
                <ApplicationTracking />
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />

            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/help" element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            } />

            {/* Fallback Catch All redirects */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DemoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
