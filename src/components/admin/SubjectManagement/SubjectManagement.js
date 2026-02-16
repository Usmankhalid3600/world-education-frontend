import React, { useState, useEffect } from 'react';
import { getClasses } from '../../../services/adminService';
import { getSubjectsByClass } from '../../../services/educationService';
import { createSubject, updateSubject, deleteSubject } from '../../../services/adminService';
import Button from '../../common/Button/Button';
import '../ClassManagement/ClassManagement.css';

const SubjectManagement = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    classId: '',
    subjectName: '',
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
      alert('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async (classId) => {
    try {
      setLoading(true);
      const data = await getSubjectsByClass(classId);
      setSubjects(data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.subjectId, formData);
      } else {
        await createSubject(formData);
      }
      
      setShowModal(false);
      resetForm();
      if (selectedClassId) {
        loadSubjects(selectedClassId);
      }
    } catch (error) {
      console.error('Failed to save subject:', error);
      alert('Failed to save subject');
    }
  };

  const handleDelete = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      await deleteSubject(subjectId);
      if (selectedClassId) {
        loadSubjects(selectedClassId);
      }
    } catch (error) {
      console.error('Failed to delete subject:', error);
      alert('Failed to delete subject');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      classId: subject.classId,
      subjectName: subject.subjectName,
      isActive: subject.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingSubject(null);
    setFormData({
      classId: selectedClassId || '',
      subjectName: '',
      isActive: true
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAddNew = () => {
    setFormData({
      classId: selectedClassId || '',
      subjectName: '',
      isActive: true
    });
    setShowModal(true);
  };

  if (loading && classes.length === 0) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="class-management">
      <div className="management-header" style={{ justifyContent: 'space-between' }}>
        <div className="class-filter">
          <label style={{ marginRight: '12px', fontWeight: 600 }}>Select Class:</label>
          <select 
            value={selectedClassId} 
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              minWidth: '200px'
            }}
          >
            {classes.map(cls => (
              <option key={cls.classId} value={cls.classId}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleAddNew} disabled={!selectedClassId}>
          + Add New Subject
        </Button>
      </div>

      <div className="classes-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject ID</th>
              <th>Subject Name</th>
              <th>Class</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  {selectedClassId ? 'No subjects found for this class' : 'Please select a class'}
                </td>
              </tr>
            ) : (
              subjects.map(subject => (
                <tr key={subject.subjectId}>
                  <td>{subject.subjectId}</td>
                  <td>{subject.subjectName}</td>
                  <td>{classes.find(c => c.classId === subject.classId)?.className || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${subject.isActive ? 'active' : 'inactive'}`}>
                      {subject.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEdit(subject)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(subject.subjectId)}
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
              <h2>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="class-form">
              <div className="form-group">
                <label>Class *</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subject Name *</label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  required
                  placeholder="e.g., Mathematics"
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
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
