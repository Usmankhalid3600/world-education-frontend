import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.code;

      if (code === 'SESSION_TERMINATED') {
        // Another device has logged in and killed this session.
        // Dispatch a custom event — App.js listens and shows the dialog.
        window.dispatchEvent(new CustomEvent('session-terminated'));
        return Promise.reject(error);
      }

      // Regular 401 (expired token, etc.) — silently clear and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
