import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

class AuthService {
  // Login
  async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  }

  // SignUp - Step 1: Send verification code
  async signup(userData) {
    const response = await apiClient.post(API_ENDPOINTS.SIGNUP, userData);
    return response.data;
  }

  // SignUp - Step 2: Verify code
  async verifyCode(verificationData) {
    const response = await apiClient.post(API_ENDPOINTS.VERIFY, verificationData);
    return response.data;
  }

  // Google OAuth
  async googleAuth(googleData) {
    const response = await apiClient.post(API_ENDPOINTS.GOOGLE_AUTH, googleData);
    return response.data;
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;
