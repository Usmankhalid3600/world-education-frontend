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

  // Forgot Password - Step 1: Send reset code
  async forgotPassword(userId) {
    const response = await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { userId });
    return response.data;
  }

  // Forgot Password - Step 2: Verify reset code
  async verifyResetCode(userId, code) {
    const response = await apiClient.post(API_ENDPOINTS.VERIFY_RESET_CODE, { userId, code });
    return response.data;
  }

  // Forgot Password - Step 3: Set new password
  async resetPassword(userId, code, newPassword) {
    const response = await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, { userId, code, newPassword });
    return response.data;
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;
