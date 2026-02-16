import React, { useState, useEffect } from 'react';
import { getClasses } from '../../../services/adminService';
import { getSubjectsByClass, getTopicsBySubject, getTopicContents } from '../../../services/educationService';
import Button from '../../common/Button/Button';
import apiClient from '../../../utils/apiClient';
import '../ClassManagement/ClassManagement.css';
import './ContentManagement.css';

const ContentManagement = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [contents, setContents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    contentType: 'PDF',
    contentUrl: '',
    files: []
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

  useEffect(() => {
    if (selectedTopicId) {
      loadContents(selectedTopicId);
    }
  }, [selectedTopicId]);

  const loadClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(data[0].classId);
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
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
      const data = await getTopicsBySubject(subjectId);
      setTopics(data);
      if (data.length > 0) {
        setSelectedTopicId(data[0].topicId);
      } else {
        setSelectedTopicId('');
        setContents([]);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
      setTopics([]);
    }
  };

  const loadContents = async (topicId) => {
    try {
      setLoading(true);
      const data = await getTopicContents(topicId);
      setContents(data);
    } catch (error) {
      console.error('Failed to load contents:', error);
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setUploadData({
      ...uploadData,
      files: Array.from(e.target.files)
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedTopicId) {
      alert('Please select a topic');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('contentType', uploadData.contentType);
      
      if (uploadData.contentUrl) {
        formData.append('contentUrl', uploadData.contentUrl);
      }
      
      uploadData.files.forEach(file => {
        formData.append('files', file);
      });

      const response = await apiClient.post(
        `/api/topics/${selectedTopicId}/contents/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('Content uploaded successfully');
        setShowUploadModal(false);
        setUploadData({ contentType: 'PDF', contentUrl: '', files: [] });
        loadContents(selectedTopicId);
      }
    } catch (error) {
      console.error('Failed to upload content:', error);
      alert('Failed to upload content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/topics/${selectedTopicId}/contents/${contentId}`);
      loadContents(selectedTopicId);
    } catch (error) {
      console.error('Failed to delete content:', error);
      alert('Failed to delete content');
    }
  };

  return (
    <div className="class-management">
      <div className="management-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            value={selectedClassId} 
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="filter-select"
          >
            {classes.map(cls => (
              <option key={cls.classId} value={cls.classId}>
                {cls.className}
              </option>
            ))}
          </select>

          <select 
            value={selectedSubjectId} 
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={!subjects.length}
            className="filter-select"
          >
            {subjects.map(subject => (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.subjectName}
              </option>
            ))}
          </select>

          <select 
            value={selectedTopicId} 
            onChange={(e) => setSelectedTopicId(e.target.value)}
            disabled={!topics.length}
            className="filter-select"
          >
            {topics.map(topic => (
              <option key={topic.topicId} value={topic.topicId}>
                {topic.topicName}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={() => setShowUploadModal(true)} disabled={!selectedTopicId}>
          + Upload Content
        </Button>
      </div>

      <div className="classes-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Content ID</th>
              <th>Type</th>
              <th>URL</th>
              <th>File Name</th>
              <th>Upload Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contents.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {selectedTopicId ? 'No content found for this topic' : 'Please select a topic'}
                </td>
              </tr>
            ) : (
              contents.map(content => (
                <tr key={content.contentId}>
                  <td>{content.contentId}</td>
                  <td>
                    <span className="content-type-badge">{content.contentType}</span>
                  </td>
                  <td className="url-cell">
                    {content.contentUrl ? (
                      <a href={content.contentUrl} target="_blank" rel="noopener noreferrer">
                        {content.contentUrl.substring(0, 50)}...
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{content.originalFileName || 'N/A'}</td>
                  <td>{content.uploadedAt ? new Date(content.uploadedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(content.contentId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Content</h2>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>×</button>
            </div>

            <form onSubmit={handleUpload} className="class-form">
              <div className="form-group">
                <label>Content Type *</label>
                <select
                  value={uploadData.contentType}
                  onChange={(e) => setUploadData({ ...uploadData, contentType: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="PDF">PDF Document</option>
                  <option value="IMAGE">Images</option>
                  <option value="VIDEO">Video</option>
                  <option value="URL">External Link</option>
                </select>
              </div>

              {uploadData.contentType === 'URL' && (
                <div className="form-group">
                  <label>Content URL *</label>
                  <input
                    type="url"
                    value={uploadData.contentUrl}
                    onChange={(e) => setUploadData({ ...uploadData, contentUrl: e.target.value })}
                    required={uploadData.contentType === 'URL'}
                    placeholder="https://example.com/video"
                  />
                </div>
              )}

              {uploadData.contentType !== 'URL' && (
                <div className="form-group">
                  <label>Upload Files *</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple={uploadData.contentType === 'IMAGE'}
                    accept={
                      uploadData.contentType === 'PDF' ? '.pdf' :
                      uploadData.contentType === 'IMAGE' ? 'image/*' :
                      'video/*'
                    }
                    required
                    className="file-input"
                  />
                  {uploadData.files.length > 0 && (
                    <div className="file-list">
                      {uploadData.files.map((file, index) => (
                        <div key={index} className="file-item">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <Button type="submit" loading={loading}>
                  Upload
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
