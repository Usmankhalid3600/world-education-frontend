// API Base URL Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  VERIFY: `${API_BASE_URL}/api/auth/verify`,
  GOOGLE_AUTH: `${API_BASE_URL}/api/auth/google`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  VERIFY_RESET_CODE: `${API_BASE_URL}/api/auth/verify-reset-code`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  SESSION_CHECK: `${API_BASE_URL}/api/auth/session/check`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,

  // Class endpoints
  CLASSES: `${API_BASE_URL}/api/classes`,
  
  // Subject endpoints
  SUBJECTS: (classId) => `${API_BASE_URL}/api/subjects/class/${classId}`,
  
  // Topic endpoints
  TOPICS: (subjectId) => `${API_BASE_URL}/api/topics/subject/${subjectId}`,
  TOPIC_CONTENTS: (topicId) => `${API_BASE_URL}/api/topics/${topicId}/contents`,
  TOPIC_SUBSCRIPTION_OPTIONS: (topicId) => `${API_BASE_URL}/api/topics/${topicId}/subscription-options`,
  SUBSCRIBE_SUBJECT: (subjectId) => `${API_BASE_URL}/api/topics/subscribe/subject/${subjectId}`,
  SUBSCRIBE_TOPIC: (topicId) => `${API_BASE_URL}/api/topics/subscribe/topic/${topicId}`,
};

export default API_BASE_URL;
