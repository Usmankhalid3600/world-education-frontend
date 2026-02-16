import apiClient from '../utils/apiClient';
import API_ENDPOINTS from '../config/api';

// ============ Class Management ============

export const getClasses = async () => {
  const response = await apiClient.get(API_ENDPOINTS.CLASSES);
  return response.data;
};

export const createClass = async (classData) => {
  const response = await apiClient.post('/api/admin/classes', classData);
  return response.data;
};

export const updateClass = async (classId, classData) => {
  const response = await apiClient.put(`/api/admin/classes/${classId}`, classData);
  return response.data;
};

export const deleteClass = async (classId) => {
  const response = await apiClient.delete(`/api/admin/classes/${classId}`);
  return response.data;
};

// ============ Subject Management ============

export const getAllSubjects = async (classId = null) => {
  const params = classId ? { classId } : {};
  const response = await apiClient.get('/api/admin/subjects', { params });
  return response.data;
};

export const createSubject = async (subjectData) => {
  const response = await apiClient.post('/api/admin/subjects', subjectData);
  return response.data;
};

export const updateSubject = async (subjectId, subjectData) => {
  const response = await apiClient.put(`/api/admin/subjects/${subjectId}`, subjectData);
  return response.data;
};

export const deleteSubject = async (subjectId) => {
  const response = await apiClient.delete(`/api/admin/subjects/${subjectId}`);
  return response.data;
};

// ============ Topic Management ============

export const getAllTopics = async (subjectId = null) => {
  const params = subjectId ? { subjectId } : {};
  const response = await apiClient.get('/api/admin/topics', { params });
  return response.data;
};

export const createTopic = async (topicData) => {
  const response = await apiClient.post('/api/admin/topics', topicData);
  return response.data;
};

export const updateTopic = async (topicId, topicData) => {
  const response = await apiClient.put(`/api/admin/topics/${topicId}`, topicData);
  return response.data;
};

export const deleteTopic = async (topicId) => {
  const response = await apiClient.delete(`/api/admin/topics/${topicId}`);
  return response.data;
};

// ============ Content Management ============

export const getAllContents = async (topicId = null) => {
  const params = topicId ? { topicId } : {};
  const response = await apiClient.get('/api/admin/contents', { params });
  return response.data;
};

// ============ User Management ============

export const getAllUsers = async (activeFilter = null) => {
  const params = activeFilter !== null ? { active: activeFilter } : {};
  const response = await apiClient.get('/api/admin/users', { params });
  return response.data;
};

export const getUserDetails = async (customerId) => {
  const response = await apiClient.get(`/api/admin/users/${customerId}`);
  return response.data;
};

// ============ Subscription Management ============

export const getAllSubscriptionPlans = async (targetType = null) => {
  const params = targetType ? { targetType } : {};
  const response = await apiClient.get('/api/admin/subscriptions/plans', { params });
  return response.data;
};

export const createSubscriptionPlan = async (planData) => {
  const response = await apiClient.post('/api/admin/subscriptions/plans', planData);
  return response.data;
};

export const updateSubscriptionPlan = async (subscriptionId, planData) => {
  const response = await apiClient.put(`/api/admin/subscriptions/plans/${subscriptionId}`, planData);
  return response.data;
};

export const deleteSubscriptionPlan = async (subscriptionId) => {
  const response = await apiClient.delete(`/api/admin/subscriptions/plans/${subscriptionId}`);
  return response.data;
};

export const getAllUserSubscriptions = async (activeFilter = null) => {
  const params = activeFilter !== null ? { active: activeFilter } : {};
  const response = await apiClient.get('/api/admin/subscriptions/user-subscriptions', { params });
  return response.data;
};

export const toggleUserSubscription = async (subscriptionId, type) => {
  const response = await apiClient.put(
    `/api/admin/subscriptions/user-subscriptions/${subscriptionId}/toggle`,
    null,
    { params: { type } }
  );
  return response.data;
};
