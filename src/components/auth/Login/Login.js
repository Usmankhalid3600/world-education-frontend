import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import Alert from '../../common/Alert/Alert';
import GoogleSignIn from '../../common/GoogleSignIn/GoogleSignIn';
import authService from '../../../services/authService';
import { setAuthToken, setUser } from '../../../utils/auth';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    deviceId: 'web-' + Date.now(),
    deviceType: 'WEB'
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Handle redirect after successful login
  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const redirectPath = user && user.userCategory === 'ADMIN' ? '/admin' : '/dashboard';
        navigate(redirectPath, { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.login(formData);
      
      if (response.success) {
        const userData = response.data;
        
        // Save token and user data
        setAuthToken(userData.token);
        setUser(userData);
        
        setAlert({ type: 'success', message: 'Login successful! Redirecting...' });
        setShouldRedirect(true);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Login failed. Please check your credentials.';
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue to World Education</p>
        </div>

        {alert.message && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="User ID"
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            placeholder="Enter your user ID"
            required
            error={errors.userId}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            error={errors.password}
          />

          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <GoogleSignIn onError={(message) => setAlert({ type: 'error', message })} />

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="link">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
