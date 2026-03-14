import React, { useState, useEffect } from 'react';
import { getClasses, createClass, updateClass, deleteClass } from '../../../services/adminService';
import Button from '../../common/Button/Button';
import Loader from '../../common/Loader/Loader';
import './ClassManagement.css';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    classNumber: '',
    isActive: true,
    description: ''
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
      alert('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingClass) {
        await updateClass(editingClass.classId, formData);
      } else {
        await createClass(formData);
      }
      
      setShowModal(false);
      resetForm();
      loadClasses();
    } catch (error) {
      console.error('Failed to save class:', error);
      alert('Failed to save class');
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }

    try {
      await deleteClass(classId);
      loadClasses();
    } catch (error) {
      console.error('Failed to delete class:', error);
      alert('Failed to delete class');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      className: classItem.className,
      classNumber: classItem.classNumber,
      isActive: classItem.isActive,
      description: classItem.description || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingClass(null);
    setFormData({
      className: '',
      classNumber: '',
      isActive: true,
      description: ''
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return <Loader text="Loading classes…" />;
  }

  return (
    <div className="class-management">
      <div className="management-header">
        <Button onClick={() => setShowModal(true)}>
          + Add New Class
        </Button>
      </div>

      <div className="classes-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class ID</th>
              <th>Class Name</th>
              <th>Class Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No classes found</td>
              </tr>
            ) : (
              classes.map(classItem => (
                <tr key={classItem.classId}>
                  <td>{classItem.classId}</td>
                  <td>{classItem.className}</td>
                  <td>{classItem.classNumber}</td>
                  <td>
                    <span className={`status-badge ${classItem.isActive ? 'active' : 'inactive'}`}>
                      {classItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEdit(classItem)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(classItem.classId)}
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
              <h2>{editingClass ? 'Edit Class' : 'Add New Class'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="class-form">
              <div className="form-group">
                <label>Class Name *</label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  required
                  placeholder="e.g., Grade 1"
                />
              </div>

              <div className="form-group">
                <label>Class Number *</label>
                <input
                  type="number"
                  value={formData.classNumber}
                  onChange={(e) => setFormData({ ...formData, classNumber: e.target.value })}
                  required
                  placeholder="e.g., 1"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for this class"
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
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
                  {editingClass ? 'Update Class' : 'Create Class'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
