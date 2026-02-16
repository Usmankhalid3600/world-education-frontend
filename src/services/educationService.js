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
    return response.data;
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
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get contents for a specific topic
 */
export const getTopicContents = async (topicId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.TOPIC_CONTENTS(topicId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
