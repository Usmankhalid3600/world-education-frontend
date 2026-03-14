import { useState, useEffect, useCallback } from 'react';
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

const EMPTY_FORM = {
  planName: '',
  targetType: 'SUBJECT',
  targetId: '',
  durationDays: 30,
  price: '',
  currency: 'PKR',
  gracePeriodDays: 0,
  freeDays: 0,
  isActive: true
};

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);

  // Hierarchy data
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Cascading selection (separate from formData so resets don't interfere)
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  // ── Initial data load ───────────────────────────────────────────────────────

  useEffect(() => {
    loadClasses();
    loadPlans();
    loadUserSubscriptions();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getAllSubscriptionPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      const data = await getAllUserSubscriptions();
      setUserSubscriptions(data);
    } catch (err) {
      console.error('Failed to load user subscriptions:', err);
    }
  };

  // ── Cascading loaders ───────────────────────────────────────────────────────

  const loadSubjectsForClass = useCallback(async (classId) => {
    try {
      setSubjectsLoading(true);
      const data = await getSubjectsByClass(classId);
      const flat = [...(data.optedSubjects || []), ...(data.unoptedSubjects || [])];
      setSubjects(flat);
      return flat;
    } catch (err) {
      console.error('Failed to load subjects:', err);
      return [];
    } finally {
      setSubjectsLoading(false);
    }
  }, []);

  const loadTopicsForSubject = useCallback(async (subjectId) => {
    try {
      setTopicsLoading(true);
      const data = await getTopicsBySubject(subjectId);
      const flat = [...(data.optedTopics || []), ...(data.unoptedTopics || [])];
      setTopics(flat);
      return flat;
    } catch (err) {
      console.error('Failed to load topics:', err);
      return [];
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  // ── Cascading change handlers ───────────────────────────────────────────────

  const handleTargetTypeChange = (type) => {
    setFormData(prev => ({ ...prev, targetType: type, targetId: '' }));
    setSelectedClassId('');
    setSelectedSubjectId('');
    setSubjects([]);
    setTopics([]);
  };

  const handleClassChange = async (classId) => {
    setSelectedClassId(classId);
    setSelectedSubjectId('');
    setTopics([]);

    if (formData.targetType === 'CLASS') {
      setFormData(prev => ({ ...prev, targetId: classId }));
      setSubjects([]);
    } else {
      setFormData(prev => ({ ...prev, targetId: '' }));
      if (classId) await loadSubjectsForClass(classId);
      else setSubjects([]);
    }
  };

  const handleSubjectChange = async (subjectId) => {
    setSelectedSubjectId(subjectId);
    setTopics([]);

    if (formData.targetType === 'SUBJECT') {
      setFormData(prev => ({ ...prev, targetId: subjectId }));
    } else {
      setFormData(prev => ({ ...prev, targetId: '' }));
      if (subjectId) await loadTopicsForSubject(subjectId);
    }
  };

  const handleTopicChange = (topicId) => {
    setFormData(prev => ({ ...prev, targetId: topicId }));
  };

  // ── Selection path display ──────────────────────────────────────────────────

  const getSelectionPath = () => {
    const cls = classes.find(c => String(c.classId) === String(selectedClassId));
    const subj = subjects.find(s => String(s.subjectId) === String(selectedSubjectId));
    const topic = topics.find(t => String(t.topicId) === String(formData.targetId));

    const parts = [cls?.className, subj?.subjectName, topic?.topicName].filter(Boolean);
    return parts.length > 0 ? parts : null;
  };

  const isSelectionComplete = () => {
    if (formData.targetType === 'CLASS') return !!selectedClassId;
    if (formData.targetType === 'SUBJECT') return !!selectedSubjectId;
    if (formData.targetType === 'TOPIC') return !!formData.targetId;
    return false;
  };

  // ── CRUD handlers ───────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSelectionComplete()) {
      alert('Please complete the target selection before saving.');
      return;
    }
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
    } catch (err) {
      console.error('Failed to save plan:', err);
      alert('Failed to save subscription plan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName,
      targetType: plan.targetType,
      targetId: String(plan.targetId),
      durationDays: plan.durationDays,
      price: plan.price,
      currency: plan.currency,
      gracePeriodDays: plan.gracePeriodDays || 0,
      freeDays: plan.freeDays || 0,
      isActive: plan.isActive
    });

    // Pre-populate cascading dropdowns using context IDs returned by the API
    setSubjects([]);
    setTopics([]);
    setSelectedClassId('');
    setSelectedSubjectId('');

    if (plan.targetType === 'CLASS') {
      setSelectedClassId(String(plan.targetId));

    } else if (plan.targetType === 'SUBJECT' && plan.contextClassId) {
      setSelectedClassId(String(plan.contextClassId));
      await loadSubjectsForClass(plan.contextClassId);
      setSelectedSubjectId(String(plan.targetId));

    } else if (plan.targetType === 'TOPIC' && plan.contextClassId && plan.contextSubjectId) {
      setSelectedClassId(String(plan.contextClassId));
      await loadSubjectsForClass(plan.contextClassId);
      setSelectedSubjectId(String(plan.contextSubjectId));
      await loadTopicsForSubject(plan.contextSubjectId);
      // targetId (topicId) is already set in formData above
    }

    setShowModal(true);
  };

  const handleDelete = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await deleteSubscriptionPlan(subscriptionId);
      loadPlans();
    } catch (err) {
      console.error('Failed to delete plan:', err);
      alert('Failed to delete subscription plan');
    }
  };

  const handleToggleSubscription = async (subscriptionId, type) => {
    try {
      await toggleUserSubscription(subscriptionId, type);
      loadUserSubscriptions();
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
      alert('Failed to toggle subscription');
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setSelectedClassId('');
    setSelectedSubjectId('');
    setSubjects([]);
    setTopics([]);
    setFormData({ ...EMPTY_FORM });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // ── Render helpers ──────────────────────────────────────────────────────────

  // Build sets of target IDs that already have a plan, per type.
  // When editing a plan, exclude that plan's own target so it stays selectable.
  const existingPlanTargets = (() => {
    const editingId = editingPlan?.subscriptionId;
    const otherPlans = plans.filter(p => p.subscriptionId !== editingId);
    return {
      CLASS:   new Set(otherPlans.filter(p => p.targetType === 'CLASS').map(p => String(p.targetId))),
      SUBJECT: new Set(otherPlans.filter(p => p.targetType === 'SUBJECT').map(p => String(p.targetId))),
      TOPIC:   new Set(otherPlans.filter(p => p.targetType === 'TOPIC').map(p => String(p.targetId))),
    };
  })();

  const selectionPath = getSelectionPath();

  const showSubjectStep = formData.targetType === 'SUBJECT' || formData.targetType === 'TOPIC';
  const showTopicStep = formData.targetType === 'TOPIC';

  return (
    <div className="subscription-management">

      {/* ── Tabs ── */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')}>
          Subscription Plans
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          User Subscriptions
        </button>
      </div>

      {/* ── Plans tab ── */}
      {activeTab === 'plans' ? (
        <div className="plans-section">
          <div className="management-header">
            <Button onClick={() => setShowModal(true)}>+ Add Subscription Plan</Button>
          </div>

          <div className="classes-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Type</th>
                  <th>Target</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Free Days</th>
                  <th>Grace Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr><td colSpan="9" className="no-data">No subscription plans found</td></tr>
                ) : (
                  plans.map(plan => (
                    <tr key={plan.subscriptionId}>
                      <td>{plan.planName}</td>
                      <td><span className="type-badge">{plan.targetType}</span></td>
                      <td className="target-path-cell" title={plan.targetFullPath}>
                        {plan.targetFullPath || plan.targetName}
                      </td>
                      <td>{plan.durationDays} days</td>
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
                          <button className="btn-edit" onClick={() => handleEdit(plan)}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDelete(plan.subscriptionId)}>Delete</button>
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
        /* ── User subscriptions tab ── */
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
                  <tr><td colSpan="7" className="no-data">No user subscriptions found</td></tr>
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
                          onClick={() => handleToggleSubscription(sub.subscriptionId, sub.subjectId ? 'SUBJECT' : 'TOPIC')}
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

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlan ? 'Edit Subscription Plan' : 'Add Subscription Plan'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="class-form">

              {/* Plan name */}
              <div className="form-group">
                <label>Plan Name *</label>
                <input
                  type="text"
                  value={formData.planName}
                  onChange={e => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                  required
                  placeholder="e.g., Grade 5 Mathematics - Monthly"
                />
              </div>

              {/* ── Target selection section ── */}
              <div className="target-selection-section">
                <div className="section-label">Applies To</div>

                {/* Target type radio buttons */}
                <div className="target-type-row">
                  {['CLASS', 'SUBJECT', 'TOPIC'].map(type => (
                    <label key={type} className={`type-radio ${formData.targetType === type ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="targetType"
                        value={type}
                        checked={formData.targetType === type}
                        onChange={() => handleTargetTypeChange(type)}
                      />
                      <span className="type-radio-icon">
                        {type === 'CLASS' ? '🏫' : type === 'SUBJECT' ? '📖' : '📝'}
                      </span>
                      <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                    </label>
                  ))}
                </div>

                {/* Step 1 – Class (always shown) */}
                <div className="selection-steps">
                  <div className="selection-step">
                    <div className="step-header">
                      <span className={`step-number ${selectedClassId ? 'done' : 'active'}`}>1</span>
                      <span className="step-label">Select Class</span>
                    </div>
                    <select
                      value={selectedClassId}
                      onChange={e => handleClassChange(e.target.value)}
                      required
                    >
                      <option value="">— Select Class —</option>
                      {classes.map(c => {
                        const hasPlan = formData.targetType === 'CLASS' && existingPlanTargets.CLASS.has(String(c.classId));
                        return (
                          <option key={c.classId} value={c.classId} disabled={hasPlan}>
                            {c.className}{hasPlan ? ' (plan exists)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Step 2 – Subject (SUBJECT and TOPIC) */}
                  {showSubjectStep && (
                    <>
                      <div className="step-connector">›</div>
                      <div className="selection-step">
                        <div className="step-header">
                          <span className={`step-number ${selectedSubjectId ? 'done' : selectedClassId ? 'active' : 'waiting'}`}>2</span>
                          <span className="step-label">Select Subject</span>
                        </div>
                        <select
                          value={selectedSubjectId}
                          onChange={e => handleSubjectChange(e.target.value)}
                          disabled={!selectedClassId || subjectsLoading}
                          required
                        >
                          <option value="">
                            {!selectedClassId ? '— Select a Class first —' : subjectsLoading ? 'Loading…' : '— Select Subject —'}
                          </option>
                          {subjects.map(s => {
                            const hasPlan = formData.targetType === 'SUBJECT' && existingPlanTargets.SUBJECT.has(String(s.subjectId));
                            return (
                              <option key={s.subjectId} value={s.subjectId} disabled={hasPlan}>
                                {s.subjectName}{hasPlan ? ' (plan exists)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Step 3 – Topic (TOPIC only) */}
                  {showTopicStep && (
                    <>
                      <div className="step-connector">›</div>
                      <div className="selection-step">
                        <div className="step-header">
                          <span className={`step-number ${formData.targetId ? 'done' : selectedSubjectId ? 'active' : 'waiting'}`}>3</span>
                          <span className="step-label">Select Topic</span>
                        </div>
                        <select
                          value={formData.targetId}
                          onChange={e => handleTopicChange(e.target.value)}
                          disabled={!selectedSubjectId || topicsLoading}
                          required
                        >
                          <option value="">
                            {!selectedSubjectId ? '— Select a Subject first —' : topicsLoading ? 'Loading…' : '— Select Topic —'}
                          </option>
                          {topics.map(t => {
                            const hasPlan = existingPlanTargets.TOPIC.has(String(t.topicId));
                            return (
                              <option key={t.topicId} value={t.topicId} disabled={hasPlan}>
                                {t.topicName}{hasPlan ? ' (plan exists)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {/* Path breadcrumb */}
                {selectionPath && (
                  <div className="selection-path">
                    <span className="path-icon">📍</span>
                    {selectionPath.map((part, i) => (
                      <span key={i}>
                        {i > 0 && <span className="path-separator"> › </span>}
                        <span className={`path-part ${i === selectionPath.length - 1 ? 'path-leaf' : ''}`}>{part}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Plan details ── */}
              <div className="section-label" style={{ marginTop: 8 }}>Plan Details</div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (Days) *</label>
                  <input
                    type="number"
                    value={formData.durationDays}
                    onChange={e => setFormData(prev => ({ ...prev, durationDays: parseInt(e.target.value) || 0 }))}
                    required min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number" step="0.01"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required min="0" placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select value={formData.currency} onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value }))}>
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
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
                    onChange={e => setFormData(prev => ({ ...prev, freeDays: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Grace Period (Days)</label>
                  <input
                    type="number"
                    value={formData.gracePeriodDays}
                    onChange={e => setFormData(prev => ({ ...prev, gracePeriodDays: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
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
