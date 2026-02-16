import apiClient from '../utils/apiClient';

// Get all available subscription plans
export const getAvailableSubscriptionPlans = async () => {
  const response = await apiClient.get('/api/student/subscription-plans');
  return response.data;
};

// Get subscription plans by type
export const getSubscriptionPlansByType = async (type) => {
  const response = await apiClient.get(`/api/student/subscription-plans/${type}`);
  return response.data;
};

// Get my active subscriptions
export const getMySubscriptions = async () => {
  const response = await apiClient.get('/api/student/my-subscriptions');
  return response.data;
};

// Get user profile
export const getUserProfile = async () => {
  const response = await apiClient.get('/api/student/profile');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  const response = await apiClient.put('/api/student/profile', profileData);
  return response.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await apiClient.put('/api/student/change-password', passwordData);
  return response.data;
};

// Search topics
export const searchTopics = async (query) => {
  const response = await apiClient.get(`/api/student/search-topics?query=${encodeURIComponent(query)}`);
  return response.data;
};
