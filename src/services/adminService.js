import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';
import API_BASE_URL from '../config/api';

// ============ Class Management ============

export const getClasses = async () => {
  const response = await apiClient.get(API_ENDPOINTS.CLASSES);
  return response.data.data.classes;
};

export const createClass = async (classData) => {
  const response = await apiClient.post(`${API_BASE_URL}/api/admin/classes`, classData);
  return response.data.data;
};

export const updateClass = async (classId, classData) => {
  const response = await apiClient.put(`${API_BASE_URL}/api/admin/classes/${classId}`, classData);
  return response.data.data;
};

export const deleteClass = async (classId) => {
  const response = await apiClient.delete(`${API_BASE_URL}/api/admin/classes/${classId}`);
  return response.data.data;
};

// ============ Subject Management ============

export const getAllSubjects = async (classId = null) => {
  const params = classId ? { classId } : {};
  const response = await apiClient.get(`${API_BASE_URL}/api/admin/subjects`, { params });
  return response.data.data;
};

export const createSubject = async (subjectData) => {
  const response = await apiClient.post(`${API_BASE_URL}/api/admin/subjects`, subjectData);
  return response.data.data;
};

export const updateSubject = async (subjectId, subjectData) => {
  const response = await apiClient.put(`${API_BASE_URL}/api/admin/subjects/${subjectId}`, subjectData);
  return response.data.data;
};

export const deleteSubject = async (subjectId) => {
  const response = await apiClient.delete(`${API_BASE_URL}/api/admin/subjects/${subjectId}`);
  return response.data.data;
};

// ============ Topic Management ============

export const getAllTopics = async (subjectId = null) => {
  const params = subjectId ? { subjectId } : {};
  const response = await apiClient.get(`${API_BASE_URL}/api/admin/topics`, { params });
  return response.data.data;
};

export const createTopic = async (topicData) => {
  const response = await apiClient.post(`${API_BASE_URL}/api/admin/topics`, topicData);
  return response.data.data;
};

export const updateTopic = async (topicId, topicData) => {
  const response = await apiClient.put(`${API_BASE_URL}/api/admin/topics/${topicId}`, topicData);
  return response.data.data;
};

export const deleteTopic = async (topicId) => {
  const response = await apiClient.delete(`${API_BASE_URL}/api/admin/topics/${topicId}`);
  return response.data.data;
};

// ============ Content Management ============

export const getAllContents = async (topicId = null) => {
  const params = topicId ? { topicId } : {};
  const response = await apiClient.get(`${API_BASE_URL}/api/admin/contents`, { params });
  return response.data.data;
};

// ============ User Management ============

export const getAllUsers = async (activeFilter = null) => {
  const params = activeFilter !== null ? { active: activeFilter } : {};
  const response = await apiClient.get(`${API_BASE_URL}/api/admin/users`, { params });
  return response.data.data;
};

export const getUserDetails = async (customerId) => {
  const response = await apiClient.get(`${API_BASE_URL}/api/admin/users/${customerId}`);
  return response.data.data;
};

// ============ Subscription Management ============

export const getAllSubscriptionPlans = async (targetType = null) => {
  const params = targetType ? { targetType } : {};
  const response = await apiClient.get(`${API_BASE_URL}/api/admin/subscriptions/plans`, { params });
  return response.data.data;
};

export const createSubscriptionPlan = async (planData) => {
  const response = await apiClient.post(`${API_BASE_URL}/api/admin/subscriptions/plans`, planData);
  return response.data.data;
};

export const updateSubscriptionPlan = async (subscriptionId, planData) => {
  const response = await apiClient.put(`${API_BASE_URL}/api/admin/subscriptions/plans/${subscriptionId}`, planData);
  return response.data.data;
};

export const deleteSubscriptionPlan = async (subscriptionId) => {
  const response = await apiClient.delete(`${API_BASE_URL}/api/admin/subscriptions/plans/${subscriptionId}`);
  return response.data.data;
};

export const getAllUserSubscriptions = async (activeFilter = null) => {
  const params = activeFilter !== null ? { active: activeFilter } : {};
  const response = await apiClient.get(`${API_BASE_URL}/api/admin/subscriptions/user-subscriptions`, { params });
  return response.data.data;
};

export const toggleUserSubscription = async (subscriptionId, type) => {
  const response = await apiClient.put(
    `${API_BASE_URL}/api/admin/subscriptions/user-subscriptions/${subscriptionId}/toggle`,
    null,
    { params: { type } }
  );
  return response.data.data;
};
