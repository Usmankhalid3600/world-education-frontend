import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../../../utils/auth';
import Button from '../../common/Button/Button';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="success-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor"
            width="80"
            height="80"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <h1>Login Successful!</h1>
        <p className="welcome-message">
          Welcome back, <strong>{user?.firstName || user?.userId}</strong>
        </p>
        
        <div className="user-info">
          <div className="info-item">
            <span className="info-label">User ID:</span>
            <span className="info-value">{user?.userId}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Category:</span>
            <span className="info-value">{user?.userCategory}</span>
          </div>
        </div>
        
        <div className="dashboard-actions">
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
