import React, { useState, useEffect } from 'react';
import { getAllUsers, getUserDetails } from '../../../services/adminService';
import Loader from '../../common/Loader/Loader';
import '../ClassManagement/ClassManagement.css';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [activeFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(activeFilter);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (customerId) => {
    try {
      const data = await getUserDetails(customerId);
      setSelectedUser(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to load user details:', error);
      alert('Failed to load user details');
    }
  };

  const getUserCategoryBadge = (category) => {
    const isAdmin = category === 'ADMIN';
    return (
      <span className={`category-badge ${isAdmin ? 'admin' : 'student'}`}>
        {category}
      </span>
    );
  };

  const getAccountStatusBadge = (isLocked) => {
    return (
      <span className={`status-badge ${isLocked ? 'inactive' : 'active'}`}>
        {isLocked ? 'Locked' : 'Active'}
      </span>
    );
  };

  if (loading) {
    return <Loader text="Loading users…" />;
  }

  return (
    <div className="class-management">
      <div className="management-header" style={{ justifyContent: 'space-between' }}>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${activeFilter === null ? 'active' : ''}`}
            onClick={() => setActiveFilter(null)}
          >
            All Users ({users.length})
          </button>
          <button 
            className={`filter-btn ${activeFilter === true ? 'active' : ''}`}
            onClick={() => setActiveFilter(true)}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${activeFilter === false ? 'active' : ''}`}
            onClick={() => setActiveFilter(false)}
          >
            Locked
          </button>
        </div>
      </div>

      <div className="classes-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Category</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">No users found</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.customerId}>
                  <td>{user.customerId}</td>
                  <td>{user.userId}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.mobileNo || 'N/A'}</td>
                  <td>{getUserCategoryBadge(user.userCategory)}</td>
                  <td>{getAccountStatusBadge(user.accountLocked)}</td>
                  <td>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td>
                    <button 
                      className="btn-edit" 
                      onClick={() => handleViewDetails(user.customerId)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDetailsModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>

            <div className="user-details">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>User ID:</label>
                    <span>{selectedUser.userId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{selectedUser.firstName} {selectedUser.lastName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedUser.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Mobile:</label>
                    <span>{selectedUser.mobileNo || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{getUserCategoryBadge(selectedUser.userCategory)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Account Status:</label>
                    <span>{getAccountStatusBadge(selectedUser.accountLocked)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Activity Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Created At:</label>
                    <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Login:</label>
                    <span>
                      {selectedUser.lastLoginAt 
                        ? new Date(selectedUser.lastLoginAt).toLocaleString() 
                        : 'Never'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Opted Subjects:</label>
                    <span className="count-badge">{selectedUser.totalOptedSubjects || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Opted Topics:</label>
                    <span className="count-badge">{selectedUser.totalOptedTopics || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
