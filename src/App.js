import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login/Login';
import SignUp from './components/auth/SignUp/SignUp';
import ForgotPassword from './components/auth/ForgotPassword/ForgotPassword';
import StudentDashboard from './components/auth/Dashboard/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard/AdminDashboard';
import SessionTerminatedModal from './components/common/SessionTerminatedModal/SessionTerminatedModal';
import { isAuthenticated, getUser, logout } from './utils/auth';
import apiClient from './utils/apiClient';
import API_BASE_URL from './config/api';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly) {
    const user = getUser();
    if (!user || user.userCategory !== 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

// Public Route Component (redirect to appropriate dashboard if already logged in)
const PublicRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return children;
  }
  
  const user = getUser();
  if (user && user.userCategory === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const [sessionTerminated, setSessionTerminated] = useState(false);

  // Listen for session-terminated events dispatched by the axios interceptor
  useEffect(() => {
    const handler = () => setSessionTerminated(true);
    window.addEventListener('session-terminated', handler);
    return () => window.removeEventListener('session-terminated', handler);
  }, []);

  // Poll every 30 seconds to detect session termination for idle users
  useEffect(() => {
    if (!isAuthenticated()) return;

    const poll = setInterval(async () => {
      if (!isAuthenticated()) {
        clearInterval(poll);
        return;
      }
      try {
        await apiClient.get('/api/auth/session/check');
      } catch {
        // 401 SESSION_TERMINATED is handled by the axios interceptor
      }
    }, 30000);

    return () => clearInterval(poll);
  }, []);

  const handleSessionModalClose = () => {
    setSessionTerminated(false);
    logout();
  };

  return (
    <Router>
      <div className="App">
        {sessionTerminated && (
          <SessionTerminatedModal onClose={handleSessionModalClose} />
        )}
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
