import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassManagement from '../ClassManagement/ClassManagement';
import SubjectManagement from '../SubjectManagement/SubjectManagement';
import TopicManagement from '../TopicManagement/TopicManagement';
import ContentManagement from '../ContentManagement/ContentManagement';
import UserManagement from '../UserManagement/UserManagement';
import SubscriptionManagement from '../SubscriptionManagement/SubscriptionManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { id: 'classes', icon: '📚', label: 'Classes' },
    { id: 'subjects', icon: '📖', label: 'Subjects' },
    { id: 'topics', icon: '📝', label: 'Topics' },
    { id: 'content', icon: '📄', label: 'Content' },
    { id: 'subscriptions', icon: '💳', label: 'Subscriptions' },
    { id: 'users', icon: '👥', label: 'Users' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'classes':
        return <ClassManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'topics':
        return <TopicManagement />;
      case 'content':
        return <ContentManagement />;
      case 'subscriptions':
        return <SubscriptionManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <ClassManagement />;
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="logo-icon">🎓</span>
            {!isSidebarCollapsed && <h2 className="logo-text">WorldEdu Admin</h2>}
          </div>
          <button 
            className="collapse-btn" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isSidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {!isSidebarCollapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`admin-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <header className="content-header">
          <h1 className="page-title">
            {menuItems.find(item => item.id === activeTab)?.label} Management
          </h1>
        </header>

        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
