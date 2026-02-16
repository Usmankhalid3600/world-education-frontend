import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../../../utils/auth';
import { searchTopics } from '../../../services/studentService';
import SubscriptionPlans from '../../student/SubscriptionPlans/SubscriptionPlans';
import MySubscriptions from '../../student/MySubscriptions/MySubscriptions';
import Profile from '../../student/Profile/Profile';
import ChangePassword from '../../student/ChangePassword/ChangePassword';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [activeMenu, setActiveMenu] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchTopics(searchQuery);
      setSearchResults(results);
      setActiveMenu('search');
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return (
          <div className="dashboard-welcome">
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
            
            <h1>Welcome to World Education!</h1>
            <p className="welcome-message">
              Hello, <strong>{user?.firstName || user?.userId}</strong>
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
          </div>
        );

      case 'subscription-plans':
        return <SubscriptionPlans />;

      case 'my-subscriptions':
        return <MySubscriptions />;

      case 'profile':
        return <Profile />;

      case 'change-password':
        return <ChangePassword />;

      case 'search':
        return (
          <div className="search-results-container">
            <h2>Search Results for "{searchQuery}"</h2>
            {searchResults.length === 0 ? (
              <p className="no-results">No topics found matching your search.</p>
            ) : (
              <div className="search-results-grid">
                {searchResults.map((topic) => (
                  <div key={topic.topicId} className="topic-result-card">
                    <div className="topic-header">
                      <h3>{topic.topicName}</h3>
                      {topic.isSubscribed && (
                        <span className="subscribed-badge">✓ Subscribed</span>
                      )}
                    </div>
                    <div className="topic-breadcrumb">
                      <span>{topic.className}</span>
                      <span className="separator">›</span>
                      <span>{topic.subjectName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return <div>Select a menu item</div>;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Top Search Bar */}
      <div className="dashboard-topbar">
        <div className="topbar-left">
          <h2>📚 World Education</h2>
        </div>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn" disabled={isSearching}>
            {isSearching ? '⏳' : '🔍'}
          </button>
        </form>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-menu">
          <button
            className={`menu-item ${activeMenu === 'home' ? 'active' : ''}`}
            onClick={() => setActiveMenu('home')}
          >
            <span className="menu-icon">🏠</span>
            <span className="menu-text">Home</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'subscription-plans' ? 'active' : ''}`}
            onClick={() => setActiveMenu('subscription-plans')}
          >
            <span className="menu-icon">💳</span>
            <span className="menu-text">Browse Plans</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'my-subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveMenu('my-subscriptions')}
          >
            <span className="menu-icon">📋</span>
            <span className="menu-text">My Subscriptions</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveMenu('profile')}
          >
            <span className="menu-icon">👤</span>
            <span className="menu-text">Profile</span>
          </button>

          <button
            className={`menu-item ${activeMenu === 'change-password' ? 'active' : ''}`}
            onClick={() => setActiveMenu('change-password')}
          >
            <span className="menu-icon">🔒</span>
            <span className="menu-text">Change Password</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
