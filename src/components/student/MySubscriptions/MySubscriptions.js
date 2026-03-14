import React, { useState, useEffect } from 'react';
import { getMySubscriptions } from '../../../services/studentService';
import Alert from '../../common/Alert/Alert';
import './MySubscriptions.css';

const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await getMySubscriptions();
      setSubscriptions(data);
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.error || 'Failed to load subscriptions',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#4CAF50';
      case 'IN_GRACE_PERIOD': return '#FF9800';
      case 'EXPIRED': return '#f44336';
      case 'INACTIVE': return '#ed8936';
      default: return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return '✓';
      case 'INACTIVE': return '⊘';
      case 'IN_GRACE_PERIOD': return '⏰';
      case 'EXPIRED': return '✗';
      default: return '•';
    }
  };

  if (loading) {
    return <div className="loading">Loading your subscriptions...</div>;
  }

  return (
    <div className="my-subscriptions-container">
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: '' })}
        />
      )}

      <div className="subscriptions-header">
        <h2>My Subscriptions</h2>
        <p className="subtitle">View and manage your active subscriptions</p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="no-subscriptions">
          <div className="empty-icon">📋</div>
          <h3>No Active Subscriptions</h3>
          <p>You don't have any subscriptions yet. Browse available plans to get started!</p>
        </div>
      ) : (
        <div className="subscriptions-list">
          {subscriptions.map((sub) => (
            <div key={`${sub.type}-${sub.subscriptionId}`} className="subscription-card">
              <div className="subscription-header">
                <div className="subscription-info">
                  <span className="type-badge">{sub.type}</span>
                  <h3>{sub.targetName}</h3>
                </div>
                <div
                  className="status-badge"
                  style={{ background: getStatusColor(sub.status) }}
                >
                  {getStatusIcon(sub.status)} {sub.status.replace('_', ' ')}
                </div>
              </div>

              <div className="subscription-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="label">Price</span>
                    <span className="value">{formatPrice(sub.price, sub.currency)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration</span>
                    <span className="value">{sub.durationDays || 'N/A'} days</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <span className="label">Subscribed On</span>
                    <span className="value">{formatDate(sub.subscribedAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Expiry Date</span>
                    <span className="value">{formatDate(sub.expiryDate)}</span>
                  </div>
                </div>

                {sub.remainingDays !== null && (
                  <div className="remaining-days">
                    <div className="days-indicator">
                      {sub.remainingDays > 0 ? (
                        <>
                          <span className="days-count">{sub.remainingDays}</span>
                          <span className="days-text">days remaining</span>
                        </>
                      ) : sub.remainingDays === 0 ? (
                        <span className="days-text">Expires today</span>
                      ) : (
                        <span className="days-text">Expired {Math.abs(sub.remainingDays)} days ago</span>
                      )}
                    </div>
                    {sub.remainingDays > 0 && (
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min((sub.remainingDays / sub.durationDays) * 100, 100)}%`,
                            background: sub.remainingDays < 7 ? '#FF9800' : '#4CAF50'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubscriptions;
