import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * Get all available classes
 */
export const getAllClasses = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CLASSES);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get subjects for a specific class
 */
export const getSubjectsByClass = async (classId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SUBJECTS(classId));
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get topics for a specific subject
 */
export const getTopicsBySubject = async (subjectId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.TOPICS(subjectId));
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get contents for a specific topic.
 * Returns the response body even on 403 so the caller can check hasAccess.
 */
export const getTopicContents = async (topicId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.TOPIC_CONTENTS(topicId));
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      return error.response.data;
    }
    throw error.response?.data || error.message;
  }
};

/**
 * Get subscription plan options grouped by level (topic / subject / class)
 * for a locked topic — used to display the subscribe screen.
 */
export const getTopicSubscriptionOptions = async (topicId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.TOPIC_SUBSCRIPTION_OPTIONS(topicId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Subscribe the current student to a subject (grants access to all topics in it)
 */
export const subscribeToSubject = async (subjectId) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.SUBSCRIBE_SUBJECT(subjectId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Subscribe the current student to a specific topic
 */
export const subscribeToTopic = async (topicId) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.SUBSCRIBE_TOPIC(topicId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
