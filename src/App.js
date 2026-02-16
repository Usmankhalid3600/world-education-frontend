import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login/Login';
import SignUp from './components/auth/SignUp/SignUp';
import StudentDashboard from './components/auth/Dashboard/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard/AdminDashboard';
import { isAuthenticated, getUser } from './utils/auth';
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
  return (
    <Router>
      <div className="App">
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
