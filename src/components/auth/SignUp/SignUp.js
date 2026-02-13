import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import Alert from '../../common/Alert/Alert';
import GoogleSignIn from '../../common/GoogleSignIn/GoogleSignIn';
import authService from '../../../services/authService';
import { setAuthToken, setUser } from '../../../utils/auth';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Verification
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    userCategory: 'STUDENT',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    country: '',
    state: '',
    city: '',
    address: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userId.trim() || formData.userId.length < 4) {
      newErrors.userId = 'User ID must be at least 4 characters';
    }
    
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }
    
    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = 'Mobile number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...signupData } = formData;
      
      const response = await authService.signup(signupData);
      
      if (response.success) {
        setAlert({ 
          type: 'success', 
          message: `Verification code sent to ${formData.email}. Please check your email.` 
        });
        setStep(2); // Move to verification step
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Signup failed. Please try again.';
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });
    
    if (!verificationCode.trim()) {
      setAlert({ type: 'error', message: 'Please enter the verification code' });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.verifyCode({
        email: formData.email,
        code: verificationCode
      });
      
      if (response.success) {
        const userData = response.data;
        
        // Save token and user data
        setAuthToken(userData.token);
        setUser(userData);
        
        setAlert({ type: 'success', message: 'Account created successfully! Redirecting...' });
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Verification failed. Please check the code.';
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setAlert({ type: '', message: '' });
    setLoading(true);
    
    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await authService.signup(signupData);
      
      if (response.success) {
        setAlert({ type: 'success', message: 'New verification code sent!' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to resend code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>
            {step === 1 
              ? 'Fill in your details to get started' 
              : 'Enter the verification code sent to your email'}
          </p>
        </div>

        {alert.message && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}

        {step === 1 ? (
          <form onSubmit={handleSignUpSubmit} className="signup-form">
            <div className="form-section">
              <h3>Account Information</h3>
              <div className="form-row">
                <Input
                  label="User ID"
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Choose a unique user ID"
                  required
                  error={errors.userId}
                />
              </div>
              
              <div className="form-row">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  required
                  error={errors.password}
                />
              </div>
              
              <div className="form-row">
                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  error={errors.confirmPassword}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row form-row-2">
                <Input
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  error={errors.firstName}
                />
                <Input
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  error={errors.lastName}
                />
              </div>
              
              <div className="form-row">
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  error={errors.email}
                />
              </div>
              
              <div className="form-row">
                <Input
                  label="Mobile Number"
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  required
                  error={errors.mobileNo}
                />
              </div>
              
              <div className="form-row form-row-2">
                <Input
                  label="Country"
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                />
                <Input
                  label="State"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>
              
              <div className="form-row form-row-2">
                <Input
                  label="City"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
                <Input
                  label="Address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerificationSubmit} className="verification-form">
            <div className="verification-info">
              <p>We've sent a 6-digit verification code to:</p>
              <strong>{formData.email}</strong>
              <p className="code-expiry">Code expires in 15 minutes</p>
            </div>

            <Input
              label="Verification Code"
              type="text"
              name="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              required
            />

            <Button type="submit" fullWidth loading={loading}>
              Verify & Complete Signup
            </Button>

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button 
                type="button" 
                className="resend-button" 
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <GoogleSignIn onError={(message) => setAlert({ type: 'error', message })} />
        )}

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
