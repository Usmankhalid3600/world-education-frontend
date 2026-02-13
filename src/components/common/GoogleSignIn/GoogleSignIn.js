import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import { setAuthToken, setUser } from '../../../utils/auth';
import './GoogleSignIn.css';

const GoogleSignIn = ({ onError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleResponse = useCallback(async (response) => {
    setLoading(true);
    
    try {
      const { credential } = response;
      
      // Send the Google token to backend
      const result = await authService.googleAuth({ token: credential });
      
      if (result.success) {
        const userData = result.data;
        
        // Save token and user data
        setAuthToken(userData.token);
        setUser(userData);
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Google Sign-In failed. Please try again.';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, onError]);

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
          }
        );
      }
    };

    loadGoogleScript();
  }, [handleGoogleResponse]);

  return (
    <div className="google-signin-container">
      <div className="divider">
        <span>OR</span>
      </div>
      <div 
        id="google-signin-button" 
        className={loading ? 'loading' : ''}
      />
    </div>
  );
};

export default GoogleSignIn;
