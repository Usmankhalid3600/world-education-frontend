import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../../../utils/auth';
import educationService from '../../../services/educationService';
import ClassCard from '../../education/ClassCard/ClassCard';
import SubjectCard from '../../education/SubjectCard/SubjectCard';
import TopicCard from '../../education/TopicCard/TopicCard';
import ContentViewer from '../../education/ContentViewer/ContentViewer';
import Alert from '../../common/Alert/Alert';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  // State management
  const [activeView, setActiveView] = useState('classes'); // 'classes', 'subjects', 'topics', 'contents'
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState({ opted: [], unopted: [] });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState({ opted: [], unopted: [] });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Breadcrumb trail
  const [breadcrumb, setBreadcrumb] = useState([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await educationService.getAllClasses();
      if (response.success) {
        setClasses(response.data.classes || []);
        setActiveView('classes');
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
      
      const response = await educationService.getSubjectsByClass(classItem.classId);
      if (response.success) {
        setSubjects({
          opted: response.data.optedSubjects || [],
          unopted: response.data.unoptedSubjects || []
        });
        setActiveView('subjects');
        setBreadcrumb([{ name: classItem.className, onClick: () => handleClassSelect(classItem) }]);
      }
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
      
      const response = await educationService.getTopicsBySubject(subject.subjectId);
      if (response.success) {
        setTopics({
          opted: response.data.optedTopics || [],
          unopted: response.data.unoptedTopics || []
        });
        setActiveView('topics');
        setBreadcrumb([
          { name: selectedClass.className, onClick: () => handleClassSelect(selectedClass) },
          { name: subject.subjectName, onClick: () => handleSubjectSelect(subject) }
        ]);
      }
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
      
      if (response.success && response.data.hasAccess) {
        setContents(response.data.contents || []);
        setActiveView('contents');
        setBreadcrumb([
          { name: selectedClass.className, onClick: () => handleClassSelect(selectedClass) },
          { name: selectedSubject.subjectName, onClick: () => handleSubjectSelect(selectedSubject) },
          { name: topic.topicName, onClick: () => handleTopicSelect(topic) }
        ]);
      } else {
        setError(response.message || 'You need to subscribe to view this content');
      }
    } catch (err) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleContentSelect = (content) => {
    setSelectedContent(content);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToClasses = () => {
    setActiveView('classes');
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setBreadcrumb([]);
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
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="breadcrumb">
            <button onClick={handleBackToClasses} className="breadcrumb-item">Home</button>
            {breadcrumb.map((crumb, index) => (
              <React.Fragment key={index}>
                <span className="breadcrumb-separator">/</span>
                <button 
                  onClick={crumb.onClick} 
                  className={`breadcrumb-item ${index === breadcrumb.length - 1 ? 'active' : ''}`}
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
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Classes View */}
            {activeView === 'classes' && (
              <div className="content-section">
                <h2 className="section-title">Select Your Class</h2>
                <div className="grid class-grid">
                  {classes.map((classItem) => (
                    <ClassCard
                      key={classItem.classId}
                      classItem={classItem}
                      onClick={() => handleClassSelect(classItem)}
                    />
                  ))}
                </div>
                {classes.length === 0 && (
                  <div className="empty-state">
                    <p>No classes available</p>
                  </div>
                )}
              </div>
            )}

            {/* Subjects View */}
            {activeView === 'subjects' && (
              <div className="content-section">
                {subjects.opted.length > 0 && (
                  <>
                    <h2 className="section-title">
                      My Subscribed Subjects
                      <span className="count-badge">{subjects.opted.length}</span>
                    </h2>
                    <div className="grid subject-grid">
                      {subjects.opted.map((subject) => (
                        <SubjectCard
                          key={subject.subjectId}
                          subject={subject}
                          isOpted={true}
                          onClick={() => handleSubjectSelect(subject)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {subjects.unopted.length > 0 && (
                  <>
                    <h2 className="section-title mt-40">
                      Available Subjects
                      <span className="count-badge secondary">{subjects.unopted.length}</span>
                    </h2>
                    <p className="section-subtitle">Subscribe to access more learning content</p>
                    <div className="grid subject-grid">
                      {subjects.unopted.map((subject) => (
                        <SubjectCard
                          key={subject.subjectId}
                          subject={subject}
                          isOpted={false}
                          onClick={() => handleSubjectSelect(subject)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {subjects.opted.length === 0 && subjects.unopted.length === 0 && (
                  <div className="empty-state">
                    <p>No subjects available for this class</p>
                  </div>
                )}
              </div>
            )}

            {/* Topics View */}
            {activeView === 'topics' && (
              <div className="content-section">
                {topics.opted.length > 0 && (
                  <>
                    <h2 className="section-title">
                      My Subscribed Topics
                      <span className="count-badge">{topics.opted.length}</span>
                    </h2>
                    <div className="grid topic-grid">
                      {topics.opted.map((topic) => (
                        <TopicCard
                          key={topic.topicId}
                          topic={topic}
                          isOpted={true}
                          onClick={() => handleTopicSelect(topic)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {topics.unopted.length > 0 && (
                  <>
                    <h2 className="section-title mt-40">
                      Available Topics
                      <span className="count-badge secondary">{topics.unopted.length}</span>
                    </h2>
                    <p className="section-subtitle">Subscribe to unlock these topics</p>
                    <div className="grid topic-grid">
                      {topics.unopted.map((topic) => (
                        <TopicCard
                          key={topic.topicId}
                          topic={topic}
                          isOpted={false}
                          onClick={() => handleTopicSelect(topic)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {topics.opted.length === 0 && topics.unopted.length === 0 && (
                  <div className="empty-state">
                    <p>No topics available for this subject</p>
                  </div>
                )}
              </div>
            )}

            {/* Contents View */}
            {activeView === 'contents' && (
              <div className="content-section">
                <h2 className="section-title">
                  Learning Materials
                  <span className="count-badge">{contents.length}</span>
                </h2>
                <div className="contents-list">
                  {contents.map((content) => (
                    <div
                      key={content.contentId}
                      className="content-item"
                      onClick={() => handleContentSelect(content)}
                    >
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
                        <p className="content-meta">
                          {content.fileType} • {formatFileSize(content.contentSize)}
                        </p>
                      </div>
                      <button className="view-content-icon-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {contents.length === 0 && (
                  <div className="empty-state">
                    <p>No learning materials available for this topic yet</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Content Viewer Modal */}
      {selectedContent && (
        <ContentViewer
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </div>
  );
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default StudentDashboard;
