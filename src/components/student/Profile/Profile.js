import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../../../services/studentService';
import Alert from '../../common/Alert/Alert';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        middleName: data.middleName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        mobileNo: data.mobileNo || '',
        country: data.country || '',
        state: data.state || '',
        city: data.city || '',
        address: data.address || ''
      });
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.error || 'Failed to load profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedProfile = await updateUserProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setAlert({
        show: true,
        message: 'Profile updated successfully',
        type: 'success'
      });
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.error || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName || '',
      middleName: profile.middleName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      mobileNo: profile.mobileNo || '',
      country: profile.country || '',
      state: profile.state || '',
      city: profile.city || '',
      address: profile.address || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: '' })}
        />
      )}

      <div className="profile-header">
        <div className="profile-title">
          <h2>My Profile</h2>
          <p className="subtitle">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profile?.firstName?.charAt(0) || profile?.userId?.charAt(0) || '?'}
          </div>
          <div className="avatar-info">
            <h3>
              {[profile?.firstName, profile?.middleName, profile?.lastName]
                .filter(Boolean)
                .join(' ') || 'No Name'}
            </h3>
            <p className="user-id">@{profile?.userId}</p>
            <span className="user-category">{profile?.userCategory}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="form-value">{profile?.firstName || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>Middle Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="Enter middle name"
                  />
                ) : (
                  <p className="form-value">{profile?.middleName || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="form-value">{profile?.lastName || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                ) : (
                  <p className="form-value">{profile?.email || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                  />
                ) : (
                  <p className="form-value">{profile?.mobileNo || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Address Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                  />
                ) : (
                  <p className="form-value">{profile?.country || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                  />
                ) : (
                  <p className="form-value">{profile?.state || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                ) : (
                  <p className="form-value">{profile?.city || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                    rows="3"
                  />
                ) : (
                  <p className="form-value">{profile?.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
