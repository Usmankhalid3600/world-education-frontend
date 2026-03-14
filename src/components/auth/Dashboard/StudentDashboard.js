import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../../../utils/auth';
import * as educationService from '../../../services/educationService';
import ClassCard from '../../education/ClassCard/ClassCard';
import SubjectCard from '../../education/SubjectCard/SubjectCard';
import TopicCard from '../../education/TopicCard/TopicCard';
import ContentViewer from '../../education/ContentViewer/ContentViewer';
import MySubscriptions from '../../student/MySubscriptions/MySubscriptions';
import Alert from '../../common/Alert/Alert';
import Loader from '../../common/Loader/Loader';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [activeView, setActiveView] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState({ opted: [], unopted: [] });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState({ opted: [], unopted: [] });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [contents, setContents] = useState([]);
  const [topicMeta, setTopicMeta] = useState(null); // hasAccess, hasFreeContent, lockedContentsCount
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);

  // Subscription options screen
  const [subscriptionOptions, setSubscriptionOptions] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(null);
  const [activeTier, setActiveTier] = useState('subject'); // 'topic' | 'subject' | 'class'
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await educationService.getAllClasses();
      if (response.success) {
        setClasses(response.data.classes || []);
        setActiveView('classes');
        setBreadcrumb([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = async (classItem) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedClass(classItem);
      const data = await educationService.getSubjectsByClass(classItem.classId);
      setSubjects({ opted: data.optedSubjects || [], unopted: data.unoptedSubjects || [] });
      setActiveView('subjects');
      setBreadcrumb([{ name: classItem.className, onClick: () => handleClassSelect(classItem) }]);
    } catch (err) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = async (subject) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSubject(subject);
      const data = await educationService.getTopicsBySubject(subject.subjectId);
      setTopics({ opted: data.optedTopics || [], unopted: data.unoptedTopics || [] });
      setActiveView('topics');
      setBreadcrumb([
        { name: selectedClass.className, onClick: () => handleClassSelect(selectedClass) },
        { name: subject.subjectName, onClick: () => handleSubjectSelect(subject) },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = async (topic) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedTopic(topic);

      const response = await educationService.getTopicContents(topic.topicId);

      const data = response.data || {};
      const breadcrumbBase = [
        { name: selectedClass.className, onClick: () => handleClassSelect(selectedClass) },
        { name: selectedSubject.subjectName, onClick: () => handleSubjectSelect(selectedSubject) },
      ];

      if (response.success && data.hasAccess) {
        // Full access
        setContents(data.contents || []);
        setTopicMeta({ hasAccess: true, hasFreeContent: data.hasFreeContent, lockedContentsCount: 0 });
        setActiveView('contents');
        setBreadcrumb([...breadcrumbBase, { name: topic.topicName, onClick: () => handleTopicSelect(topic) }]);
      } else if (response.success && data.hasFreeContent) {
        // No full access but free content exists — show free items + banner
        setContents(data.contents || []);
        setTopicMeta({
          hasAccess: false,
          hasFreeContent: true,
          lockedContentsCount: data.lockedContentsCount || 0,
          topicId: topic.topicId,
        });
        setActiveView('contents');
        setBreadcrumb([...breadcrumbBase, { name: topic.topicName, onClick: () => handleTopicSelect(topic) }]);
      } else {
        // No access, no free content — show subscription options
        const optionsResp = await educationService.getTopicSubscriptionOptions(topic.topicId);
        if (optionsResp.success) {
          const opts = optionsResp.data;
          setSubscriptionOptions(opts);
          setSubscribeSuccess(null);
          if (opts.subjectPlans?.length) setActiveTier('subject');
          else if (opts.topicPlans?.length) setActiveTier('topic');
          else if (opts.classPlans?.length) setActiveTier('class');
          setActiveView('subscription-options');
          setBreadcrumb([...breadcrumbBase, { name: topic.topicName }]);
        } else {
          setError('Subscription required to view this topic.');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      setSubscribing(true);
      setSubscribingPlanId(plan.subscriptionId);
      setError(null);

      if (plan.targetType === 'TOPIC') {
        await educationService.subscribeToTopic(plan.targetId);
      } else {
        const subjectId = plan.targetType === 'SUBJECT'
          ? plan.targetId
          : subscriptionOptions.subjectId;
        await educationService.subscribeToSubject(subjectId);
      }

      setSubscribeSuccess(`You're in! Opening ${subscriptionOptions.topicName}...`);

      setTimeout(async () => {
        if (selectedTopic) await handleTopicSelect(selectedTopic);
      }, 1800);
    } catch (err) {
      setError(err.message || err.error || 'Subscription failed. Please try again.');
    } finally {
      setSubscribing(false);
      setSubscribingPlanId(null);
    }
  };

  // Called from the free-preview banner — fetch subscription options for the current topic
  const handleTopicSubscribeFlow = async () => {
    if (!selectedTopic) return;
    try {
      setLoading(true);
      const optionsResp = await educationService.getTopicSubscriptionOptions(selectedTopic.topicId);
      if (optionsResp.success) {
        const opts = optionsResp.data;
        setSubscriptionOptions(opts);
        setSubscribeSuccess(null);
        if (opts.subjectPlans?.length) setActiveTier('subject');
        else if (opts.topicPlans?.length) setActiveTier('topic');
        else if (opts.classPlans?.length) setActiveTier('class');
        setActiveView('subscription-options');
      }
    } catch (err) {
      setError(err.message || 'Failed to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  const handleContentSelect = (content) => setSelectedContent(content);
  const handleLogout = () => { logout(); navigate('/login'); };

  const handleBackToClasses = () => {
    setActiveView('classes');
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSubscriptionOptions(null);
    setTopicMeta(null);
    setBreadcrumb([]);
  };

  const handleGoToSubscriptions = () => {
    setActiveView('my-subscriptions');
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSubscriptionOptions(null);
    setTopicMeta(null);
    setBreadcrumb([]);
  };

  const formatPrice = (price, currency) => {
    if (!price) return 'Free';
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: currency || 'PKR' }).format(price);
  };

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>World Education</h1>
            <p className="welcome-text">Welcome, {user?.firstName || user?.userId}</p>
          </div>
          <div className="header-right">
            <nav className="header-nav">
              <button
                className={`nav-btn ${activeView !== 'my-subscriptions' ? 'nav-btn-active' : ''}`}
                onClick={handleBackToClasses}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L1 9l4 2.18V17l7 3 7-3v-5.82L23 9l-11-6zm0 2.28L18.82 9 12 12.72 5.18 9 12 5.28zM17 15.99l-5 2.21-5-2.21v-3.36l5 2.21 5-2.21v3.36z"/>
                </svg>
                My Learning
              </button>
              <button
                className={`nav-btn ${activeView === 'my-subscriptions' ? 'nav-btn-active' : ''}`}
                onClick={handleGoToSubscriptions}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
                My Subscriptions
              </button>
            </nav>
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {breadcrumb.length > 0 && (
          <div className="breadcrumb">
            <button onClick={handleBackToClasses} className="breadcrumb-item">Home</button>
            {breadcrumb.map((crumb, index) => (
              <React.Fragment key={index}>
                <span className="breadcrumb-separator">/</span>
                <button
                  onClick={crumb.onClick}
                  className={`breadcrumb-item ${index === breadcrumb.length - 1 ? 'active' : ''}`}
                  disabled={!crumb.onClick}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {loading && <Loader variant="page" />}

        {!loading && (
          <>
            {/* Classes View */}
            {activeView === 'classes' && (
              <div className="content-section">
                <h2 className="section-title">Select Your Class</h2>
                <div className="grid class-grid">
                  {classes.map((classItem) => (
                    <ClassCard key={classItem.classId} classItem={classItem} onClick={() => handleClassSelect(classItem)} />
                  ))}
                </div>
                {classes.length === 0 && <div className="empty-state"><p>No classes available</p></div>}
              </div>
            )}

            {/* Subjects View */}
            {activeView === 'subjects' && (
              <div className="content-section">
                {subjects.opted.length > 0 && (
                  <>
                    <h2 className="section-title">My Subscribed Subjects <span className="count-badge">{subjects.opted.length}</span></h2>
                    <div className="grid subject-grid">
                      {subjects.opted.map((s) => (
                        <SubjectCard key={s.subjectId} subject={s} isOpted={true} onClick={() => handleSubjectSelect(s)} />
                      ))}
                    </div>
                  </>
                )}
                {subjects.unopted.length > 0 && (
                  <>
                    <h2 className="section-title mt-40">Available Subjects <span className="count-badge secondary">{subjects.unopted.length}</span></h2>
                    <p className="section-subtitle">Subscribe to access more learning content</p>
                    <div className="grid subject-grid">
                      {subjects.unopted.map((s) => (
                        <SubjectCard key={s.subjectId} subject={s} isOpted={false} onClick={() => handleSubjectSelect(s)} />
                      ))}
                    </div>
                  </>
                )}
                {subjects.opted.length === 0 && subjects.unopted.length === 0 && (
                  <div className="empty-state"><p>No subjects available for this class</p></div>
                )}
              </div>
            )}

            {/* Topics View */}
            {activeView === 'topics' && (
              <div className="content-section">
                {topics.opted.length > 0 && (
                  <>
                    <h2 className="section-title">My Subscribed Topics <span className="count-badge">{topics.opted.length}</span></h2>
                    <div className="grid topic-grid">
                      {topics.opted.map((t) => (
                        <TopicCard key={t.topicId} topic={t} isOpted={true} onClick={() => handleTopicSelect(t)} />
                      ))}
                    </div>
                  </>
                )}
                {topics.unopted.length > 0 && (
                  <>
                    <h2 className="section-title mt-40">Available Topics <span className="count-badge secondary">{topics.unopted.length}</span></h2>
                    <p className="section-subtitle">Subscribe to unlock these topics</p>
                    <div className="grid topic-grid">
                      {topics.unopted.map((t) => (
                        <TopicCard key={t.topicId} topic={t} isOpted={false} onClick={() => handleTopicSelect(t)} />
                      ))}
                    </div>
                  </>
                )}
                {topics.opted.length === 0 && topics.unopted.length === 0 && (
                  <div className="empty-state"><p>No topics available for this subject</p></div>
                )}
              </div>
            )}

            {/* ── Subscription Options View ───────────────────────────── */}
            {activeView === 'subscription-options' && subscriptionOptions && (
              <SubscriptionOptionsView
                options={subscriptionOptions}
                activeTier={activeTier}
                onTierChange={setActiveTier}
                onSubscribe={handleSubscribe}
                subscribing={subscribing}
                subscribingPlanId={subscribingPlanId}
                subscribeSuccess={subscribeSuccess}
                formatPrice={formatPrice}
              />
            )}

            {/* Contents View */}
            {activeView === 'contents' && (
              <div className="content-section">
                {/* Free-preview banner — shown when user has no subscription but free items exist */}
                {topicMeta && !topicMeta.hasAccess && topicMeta.hasFreeContent && (
                  <div className="free-preview-banner">
                    <div className="free-preview-left">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"/>
                      </svg>
                      <div>
                        <strong>Free preview</strong>
                        <span>You're viewing {contents.length} free {contents.length === 1 ? 'item' : 'items'}.</span>
                        {topicMeta.lockedContentsCount > 0 && (
                          <span className="locked-count"> {topicMeta.lockedContentsCount} more {topicMeta.lockedContentsCount === 1 ? 'item is' : 'items are'} locked.</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="free-preview-subscribe-btn"
                      onClick={() => handleTopicSubscribeFlow()}
                    >
                      Subscribe to unlock all
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
                    </button>
                  </div>
                )}

                <h2 className="section-title">
                  {topicMeta && !topicMeta.hasAccess ? 'Free Preview' : 'Learning Materials'}
                  <span className="count-badge">{contents.length}</span>
                </h2>

                <div className="contents-list">
                  {contents.map((content) => (
                    <div key={content.contentId} className="content-item" onClick={() => handleContentSelect(content)}>
                      <div className="content-icon">
                        {content.fileType === 'PDF' && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H12V10H18V20H6Z" />
                          </svg>
                        )}
                        {['JPG', 'JPEG', 'PNG', 'GIF'].includes(content.fileType) && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                          </svg>
                        )}
                        {['MP4', 'WEBM'].includes(content.fileType) && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" />
                          </svg>
                        )}
                      </div>
                      <div className="content-details">
                        <h4>{content.fileName}</h4>
                        <p className="content-meta">{content.fileType} • {formatFileSize(content.contentSize)}</p>
                      </div>
                      <button className="view-content-icon-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {contents.length === 0 && (
                    <div className="empty-state"><p>No learning materials available for this topic yet</p></div>
                  )}
                </div>
              </div>
            )}

            {/* My Subscriptions View */}
            {activeView === 'my-subscriptions' && <MySubscriptions />}
          </>
        )}
      </main>

      {selectedContent && (
        <ContentViewer content={selectedContent} onClose={() => setSelectedContent(null)} />
      )}
    </div>
  );
};

/* ── Tier config ────────────────────────────────────────────────────── */
const TIERS = {
  topic: {
    key: 'topic',
    label: 'This Topic',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
      </svg>
    ),
    color: '#7c3aed',
    bg: '#ede9fe',
    accent: '#5b21b6',
  },
  subject: {
    key: 'subject',
    label: 'Full Subject',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 14v-2h12v2H6zm12-4H6v-2h12v2zm0-4h-5V4h5v6z"/>
      </svg>
    ),
    color: '#1d4ed8',
    bg: '#dbeafe',
    accent: '#1e40af',
    popular: true,
  },
  class: {
    key: 'class',
    label: 'Entire Class',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L1 9l4 2.18V17l7 3 7-3v-5.82L23 9l-11-6zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.21-5-2.21v-3.36l5 2.21 5-2.21v3.36z"/>
      </svg>
    ),
    color: '#b45309',
    bg: '#fef3c7',
    accent: '#92400e',
  },
};

/* ── Subscription Options View ──────────────────────────────────────── */
const SubscriptionOptionsView = ({
  options, activeTier, onTierChange,
  onSubscribe, subscribing, subscribingPlanId,
  subscribeSuccess, formatPrice
}) => {
  const plansMap = {
    topic:   options.topicPlans   || [],
    subject: options.subjectPlans || [],
    class:   options.classPlans   || [],
  };

  const availableTiers = Object.keys(TIERS).filter(k => plansMap[k].length > 0);
  const activePlans = plansMap[activeTier] || [];
  const tierInfo = TIERS[activeTier] || TIERS.subject;

  const featuresFor = (tier) => {
    if (tier === 'topic')   return [`Access "${options.topicName}"`, 'View all topic materials', `${options.subjectName} subject`];
    if (tier === 'subject') return [`All topics in ${options.subjectName}`, 'Unlimited topic access', `${options.className} class`, 'Best value'];
    if (tier === 'class')   return [`All subjects in ${options.className}`, 'Unlimited subject access', 'All topics included', 'Maximum value'];
    return [];
  };

  return (
    <div className="subs-page">

      {/* Hero */}
      <div className="subs-hero">
        <div className="subs-hero-deco" />
        <div className="subs-hero-content">
          <div className="subs-lock-wrap">
            <div className="subs-lock-ring" />
            <svg className="subs-lock-icon" width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1C9.24 1 7 3.24 7 6v2H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
            </svg>
          </div>
          <div className="subs-hero-text">
            <div className="subs-hero-path">
              <span>{options.className}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/></svg>
              <span>{options.subjectName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/></svg>
              <span className="subs-hero-topic">{options.topicName}</span>
            </div>
            <h2 className="subs-hero-title">Unlock <em>{options.topicName}</em></h2>
            <p className="subs-hero-sub">Choose a subscription plan to access this content</p>
          </div>
        </div>
      </div>

      {/* Success */}
      {subscribeSuccess && (
        <div className="subs-success">
          <div className="subs-success-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          </div>
          <span>{subscribeSuccess}</span>
        </div>
      )}

      {/* Tier tabs */}
      <div className="subs-tiers">
        {availableTiers.map(key => {
          const t = TIERS[key];
          const isActive = activeTier === key;
          return (
            <button
              key={key}
              className={`subs-tier-tab ${isActive ? 'subs-tier-active' : ''}`}
              style={isActive ? { '--tier-color': t.color, '--tier-bg': t.bg } : {}}
              onClick={() => onTierChange(key)}
            >
              <span className="subs-tier-icon" style={isActive ? { color: t.color } : {}}>{t.icon}</span>
              <span className="subs-tier-label">{t.label}</span>
              {t.popular && <span className="subs-tier-popular">Popular</span>}
              <span className="subs-tier-count" style={isActive ? { background: t.color } : {}}>
                {plansMap[key].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tier description strip */}
      <div className="subs-tier-desc" style={{ borderColor: tierInfo.bg, background: tierInfo.bg }}>
        <span className="subs-tier-desc-icon" style={{ color: tierInfo.color }}>{tierInfo.icon}</span>
        <div>
          {activeTier === 'topic'   && <><strong>{options.topicName}</strong> — access this single topic</>}
          {activeTier === 'subject' && <><strong>{options.subjectName}</strong> — unlock every topic in this subject</>}
          {activeTier === 'class'   && <><strong>{options.className}</strong> — full access to all subjects and topics</>}
        </div>
      </div>

      {/* Plan cards */}
      <div className="subs-plans-grid">
        {activePlans.map((plan, idx) => (
          <PlanCard
            key={plan.subscriptionId}
            plan={plan}
            tierKey={activeTier}
            tierConfig={tierInfo}
            features={featuresFor(activeTier)}
            onSubscribe={onSubscribe}
            isLoading={subscribingPlanId === plan.subscriptionId}
            disabled={subscribing}
            formatPrice={formatPrice}
            highlight={activeTier === 'subject' && activePlans.length === 1}
          />
        ))}
      </div>

      {availableTiers.length === 0 && (
        <div className="empty-state"><p>No subscription plans available. Please check back later.</p></div>
      )}
    </div>
  );
};

/* ── Plan Card sub-component ────────────────────────────────────────── */
const PlanCard = ({ plan, tierConfig, features, onSubscribe, isLoading, disabled, formatPrice, highlight }) => (
  <div className={`plan-card ${highlight ? 'plan-card-highlight' : ''}`} style={{ '--card-accent': tierConfig.color, '--card-bg': tierConfig.bg }}>
    {highlight && <div className="plan-popular-ribbon">Most Popular</div>}

    <div className="plan-card-top">
      <div className="plan-card-name">{plan.planName}</div>
      {plan.freeDays > 0 && (
        <div className="plan-free-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/></svg>
          {plan.freeDays} days free
        </div>
      )}
    </div>

    <div className="plan-card-price-block">
      <span className="plan-card-currency">{plan.currency}</span>
      <span className="plan-card-amount">{plan.price?.toLocaleString()}</span>
      <span className="plan-card-per">/ {plan.durationDays} days</span>
    </div>

    <ul className="plan-features">
      {features.map((f, i) => (
        <li key={i} className="plan-feature-item">
          <span className="plan-feature-check" style={{ color: tierConfig.color }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          </span>
          {f}
        </li>
      ))}
    </ul>

    <button
      className={`plan-cta-btn ${isLoading ? 'plan-cta-loading' : ''}`}
      style={{ '--btn-color': tierConfig.color, '--btn-accent': tierConfig.accent }}
      onClick={() => onSubscribe(plan)}
      disabled={disabled}
    >
      {isLoading ? (
        <><span className="plan-cta-spinner" /><span>Processing…</span></>
      ) : (
        <><span>Subscribe Now</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
        </>
      )}
    </button>
  </div>
);

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default StudentDashboard;
