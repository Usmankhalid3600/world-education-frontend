import React, { useState, useEffect } from 'react';
import { getAvailableSubscriptionPlans } from '../../../services/studentService';
import Alert from '../../common/Alert/Alert';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [plans, filterType]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getAvailableSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.error || 'Failed to load subscription plans',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPlans = () => {
    if (filterType === 'ALL') {
      setFilteredPlans(plans);
    } else {
      setFilteredPlans(plans.filter(plan => plan.targetType === filterType));
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  if (loading) {
    return <div className="loading">Loading subscription plans...</div>;
  }

  return (
    <div className="subscription-plans-container">
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: '' })}
        />
      )}

      <div className="plans-header">
        <h2>Available Subscription Plans</h2>
        <div className="filter-buttons">
          <button
            className={filterType === 'ALL' ? 'active' : ''}
            onClick={() => setFilterType('ALL')}
          >
            All Plans
          </button>
          <button
            className={filterType === 'CLASS' ? 'active' : ''}
            onClick={() => setFilterType('CLASS')}
          >
            Classes
          </button>
          <button
            className={filterType === 'SUBJECT' ? 'active' : ''}
            onClick={() => setFilterType('SUBJECT')}
          >
            Subjects
          </button>
          <button
            className={filterType === 'TOPIC' ? 'active' : ''}
            onClick={() => setFilterType('TOPIC')}
          >
            Topics
          </button>
        </div>
      </div>

      <div className="plans-grid">
        {filteredPlans.length === 0 ? (
          <p className="no-plans">No subscription plans available.</p>
        ) : (
          filteredPlans.map((plan) => (
            <div
              key={plan.subscriptionId}
              className={`plan-card ${plan.isSubscribed ? 'subscribed' : ''}`}
            >
              <div className="plan-badge">{plan.targetType}</div>
              {plan.isSubscribed && <div className="subscribed-badge">✓ Subscribed</div>}
              
              <h3>{plan.planName}</h3>
              <p className="target-name">{plan.targetName}</p>
              
              <div className="plan-price">
                <span className="price">{formatPrice(plan.price, plan.currency)}</span>
                <span className="duration">/ {plan.durationDays} days</span>
              </div>

              <div className="plan-features">
                {plan.freeDays > 0 && (
                  <div className="feature">
                    <span className="feature-icon">🎁</span>
                    <span>{plan.freeDays} days free trial</span>
                  </div>
                )}
                {plan.gracePeriodDays > 0 && (
                  <div className="feature">
                    <span className="feature-icon">⏰</span>
                    <span>{plan.gracePeriodDays} days grace period</span>
                  </div>
                )}
                <div className="feature">
                  <span className="feature-icon">📅</span>
                  <span>Valid for {plan.durationDays} days</span>
                </div>
              </div>

              <button
                className="subscribe-btn"
                disabled={plan.isSubscribed}
              >
                {plan.isSubscribed ? 'Already Subscribed' : 'Subscribe Now'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
