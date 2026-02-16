import React, { useState, useEffect } from 'react';
import { getClasses } from '../../../services/adminService';
import { getSubjectsByClass, getTopicsBySubject } from '../../../services/educationService';
import { 
  getAllSubscriptionPlans, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  deleteSubscriptionPlan,
  getAllUserSubscriptions,
  toggleUserSubscription
} from '../../../services/adminService';
import Button from '../../common/Button/Button';
import '../ClassManagement/ClassManagement.css';
import './SubscriptionManagement.css';

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    targetType: 'SUBJECT',
    targetId: '',
    durationDays: 30,
    price: '',
    currency: 'USD',
    gracePeriodDays: 0,
    freeDays: 0,
    isActive: true
  });

  useEffect(() => {
    loadClasses();
    loadPlans();
    loadUserSubscriptions();
  }, []);

  useEffect(() => {
    if (formData.targetType === 'SUBJECT' && classes.length > 0) {
      loadSubjects(classes[0]?.classId);
    } else if (formData.targetType === 'TOPIC' && classes.length > 0) {
      loadSubjects(classes[0]?.classId);
    }
  }, [formData.targetType, classes]);

  const loadClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const loadSubjects = async (classId) => {
    try {
      const data = await getSubjectsByClass(classId);
      setSubjects(data);
      if (data.length > 0 && formData.targetType === 'TOPIC') {
        loadTopics(data[0].subjectId);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const loadTopics = async (subjectId) => {
    try {
      const data = await getTopicsBySubject(subjectId);
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getAllSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      const data = await getAllUserSubscriptions();
      setUserSubscriptions(data);
    } catch (error) {
      console.error('Failed to load user subscriptions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.subscriptionId, formData);
      } else {
        await createSubscriptionPlan(formData);
      }
      
      setShowModal(false);
      resetForm();
      loadPlans();
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('Failed to save subscription plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) {
      return;
    }

    try {
      await deleteSubscriptionPlan(subscriptionId);
      loadPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('Failed to delete subscription plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName,
      targetType: plan.targetType,
      targetId: plan.targetId,
      durationDays: plan.durationDays,
      price: plan.price,
      currency: plan.currency,
      gracePeriodDays: plan.gracePeriodDays,
      freeDays: plan.freeDays,
      isActive: plan.isActive
    });
    setShowModal(true);
  };

  const handleToggleSubscription = async (subscriptionId, type) => {
    try {
      await toggleUserSubscription(subscriptionId, type);
      loadUserSubscriptions();
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
      alert('Failed to toggle subscription');
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      planName: '',
      targetType: 'SUBJECT',
      targetId: '',
      durationDays: 30,
      price: '',
      currency: 'USD',
      gracePeriodDays: 0,
      freeDays: 0,
      isActive: true
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getTargetOptions = () => {
    if (formData.targetType === 'CLASS') return classes;
    if (formData.targetType === 'SUBJECT') return subjects;
    if (formData.targetType === 'TOPIC') return topics;
    return [];
  };

  const getTargetLabel = () => {
    if (formData.targetType === 'CLASS') return 'Class';
    if (formData.targetType === 'SUBJECT') return 'Subject';
    if (formData.targetType === 'TOPIC') return 'Topic';
    return 'Target';
  };

  return (
    <div className="subscription-management">
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Subscription Plans
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Subscriptions
        </button>
      </div>

      {activeTab === 'plans' ? (
        <div className="plans-section">
          <div className="management-header">
            <Button onClick={() => setShowModal(true)}>
              + Add Subscription Plan
            </Button>
          </div>

          <div className="classes-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Type</th>
                  <th>Target</th>
                  <th>Duration (Days)</th>
                  <th>Price</th>
                  <th>Free Days</th>
                  <th>Grace Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No subscription plans found</td>
                  </tr>
                ) : (
                  plans.map(plan => (
                    <tr key={plan.subscriptionId}>
                      <td>{plan.planName}</td>
                      <td><span className="type-badge">{plan.targetType}</span></td>
                      <td>{plan.targetName}</td>
                      <td>{plan.durationDays}</td>
                      <td className="price-cell">{plan.currency} {plan.price}</td>
                      <td>{plan.freeDays || 0}</td>
                      <td>{plan.gracePeriodDays || 0}</td>
                      <td>
                        <span className={`status-badge ${plan.isActive ? 'active' : 'inactive'}`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-edit" onClick={() => handleEdit(plan)}>
                            Edit
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(plan.subscriptionId)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="user-subscriptions-section">
          <div className="classes-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Type</th>
                  <th>Content</th>
                  <th>Subscribed At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">No user subscriptions found</td>
                  </tr>
                ) : (
                  userSubscriptions.map(sub => (
                    <tr key={`${sub.subjectId ? 'subject' : 'topic'}-${sub.subscriptionId}`}>
                      <td>{sub.userId}</td>
                      <td>{sub.userName}</td>
                      <td><span className="type-badge">{sub.subjectId ? 'SUBJECT' : 'TOPIC'}</span></td>
                      <td>{sub.subjectName || sub.topicName}</td>
                      <td>{sub.subscribedAt}</td>
                      <td>
                        <span className={`status-badge ${sub.isActive ? 'active' : 'inactive'}`}>
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`btn-toggle ${sub.isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleSubscription(
                            sub.subscriptionId, 
                            sub.subjectId ? 'SUBJECT' : 'TOPIC'
                          )}
                        >
                          {sub.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlan ? 'Edit Subscription Plan' : 'Add Subscription Plan'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="class-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Plan Name *</label>
                  <input
                    type="text"
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    required
                    placeholder="e.g., Premium Math Package"
                  />
                </div>

                <div className="form-group">
                  <label>Target Type *</label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value, targetId: '' })}
                    required
                  >
                    <option value="CLASS">Class</option>
                    <option value="SUBJECT">Subject</option>
                    <option value="TOPIC">Topic</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{getTargetLabel()} *</label>
                <select
                  value={formData.targetId}
                  onChange={(e) => {
                    setFormData({ ...formData, targetId: e.target.value });
                    if (formData.targetType === 'SUBJECT' && e.target.value) {
                      const selectedSubject = subjects.find(s => s.subjectId.toString() === e.target.value);
                      if (selectedSubject) {
                        setFormData(prev => ({ 
                          ...prev, 
                          targetId: e.target.value,
                          planName: `${selectedSubject.subjectName} Subscription`
                        }));
                      }
                    }
                  }}
                  required
                >
                  <option value="">Select {getTargetLabel()}</option>
                  {getTargetOptions().map(item => {
                    const id = item.classId || item.subjectId || item.topicId;
                    const name = item.className || item.subjectName || item.topicName;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (Days) *</label>
                  <input
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="PKR">PKR</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Free Days</label>
                  <input
                    type="number"
                    value={formData.freeDays}
                    onChange={(e) => setFormData({ ...formData, freeDays: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Grace Period (Days)</label>
                  <input
                    type="number"
                    value={formData.gracePeriodDays}
                    onChange={(e) => setFormData({ ...formData, gracePeriodDays: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <Button type="submit" loading={loading}>
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
