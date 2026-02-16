import React, { useState, useEffect } from 'react';
import { getClasses } from '../../../services/adminService';
import { getSubjectsByClass, getTopicsBySubject } from '../../../services/educationService';
import { createTopic, updateTopic, deleteTopic } from '../../../services/adminService';
import Button from '../../common/Button/Button';
import '../ClassManagement/ClassManagement.css';

const TopicManagement = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    subjectId: '',
    topicName: '',
    publishDate: '',
    isActive: true
  });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadSubjects(selectedClassId);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadTopics(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await getClasses();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(data[0].classId);
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async (classId) => {
    try {
      const data = await getSubjectsByClass(classId);
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubjectId(data[0].subjectId);
      } else {
        setSelectedSubjectId('');
        setTopics([]);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]);
    }
  };

  const loadTopics = async (subjectId) => {
    try {
      setLoading(true);
      const data = await getTopicsBySubject(subjectId);
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : null
      };

      if (editingTopic) {
        await updateTopic(editingTopic.topicId, payload);
      } else {
        await createTopic(payload);
      }
      
      setShowModal(false);
      resetForm();
      if (selectedSubjectId) {
        loadTopics(selectedSubjectId);
      }
    } catch (error) {
      console.error('Failed to save topic:', error);
      alert('Failed to save topic');
    }
  };

  const handleDelete = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    try {
      await deleteTopic(topicId);
      if (selectedSubjectId) {
        loadTopics(selectedSubjectId);
      }
    } catch (error) {
      console.error('Failed to delete topic:', error);
      alert('Failed to delete topic');
    }
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({
      subjectId: topic.subjectId,
      topicName: topic.topicName,
      publishDate: topic.publishDate ? new Date(topic.publishDate).toISOString().split('T')[0] : '',
      isActive: topic.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTopic(null);
    setFormData({
      subjectId: selectedSubjectId || '',
      topicName: '',
      publishDate: '',
      isActive: true
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAddNew = () => {
    setFormData({
      subjectId: selectedSubjectId || '',
      topicName: '',
      publishDate: '',
      isActive: true
    });
    setShowModal(true);
  };

  return (
    <div className="class-management">
      <div className="management-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="class-filter">
            <label style={{ marginRight: '8px', fontWeight: 600 }}>Class:</label>
            <select 
              value={selectedClassId} 
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              {classes.map(cls => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>

          <div className="class-filter">
            <label style={{ marginRight: '8px', fontWeight: 600 }}>Subject:</label>
            <select 
              value={selectedSubjectId} 
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={!subjects.length}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              {subjects.map(subject => (
                <option key={subject.subjectId} value={subject.subjectId}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleAddNew} disabled={!selectedSubjectId}>
          + Add New Topic
        </Button>
      </div>

      <div className="classes-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Topic ID</th>
              <th>Topic Name</th>
              <th>Subject</th>
              <th>Publish Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {topics.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {selectedSubjectId ? 'No topics found for this subject' : 'Please select a subject'}
                </td>
              </tr>
            ) : (
              topics.map(topic => (
                <tr key={topic.topicId}>
                  <td>{topic.topicId}</td>
                  <td>{topic.topicName}</td>
                  <td>{subjects.find(s => s.subjectId === topic.subjectId)?.subjectName || 'N/A'}</td>
                  <td>{topic.publishDate ? new Date(topic.publishDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${topic.isActive ? 'active' : 'inactive'}`}>
                      {topic.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEdit(topic)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(topic.topicId)}
                      >
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

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="class-form">
              <div className="form-group">
                <label>Subject *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Topic Name *</label>
                <input
                  type="text"
                  value={formData.topicName}
                  onChange={(e) => setFormData({ ...formData, topicName: e.target.value })}
                  required
                  placeholder="e.g., Algebra Basics"
                />
              </div>

              <div className="form-group">
                <label>Publish Date</label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                />
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
                <Button type="submit">
                  {editingTopic ? 'Update Topic' : 'Create Topic'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicManagement;
