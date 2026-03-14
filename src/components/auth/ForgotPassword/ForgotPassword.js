import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';
import Alert from '../../common/Alert/Alert';
import authService from '../../../services/authService';
import './ForgotPassword.css';

// ── Step indicator ────────────────────────────────────────────────────────────
const StepIndicator = ({ current }) => (
  <div className="fp-steps">
    {['User ID', 'Verify Code', 'New Password'].map((label, i) => {
      const step = i + 1;
      const done = current > step;
      const active = current === step;
      return (
        <React.Fragment key={step}>
          <div className={`fp-step ${active ? 'fp-step-active' : ''} ${done ? 'fp-step-done' : ''}`}>
            <div className="fp-step-circle">
              {done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span className="fp-step-label">{label}</span>
          </div>
          {i < 2 && <div className={`fp-step-line ${done ? 'fp-step-line-done' : ''}`} />}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Password strength helper ──────────────────────────────────────────────────
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd))   score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};
const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

// ── Main component ────────────────────────────────────────────────────────────
const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Step 1
  const [userId, setUserId] = useState('');
  const [userIdError, setUserIdError] = useState('');

  // Step 2
  const [maskedEmail, setMaskedEmail] = useState('');
  const [codeValidity, setCodeValidity] = useState(15);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  // Step 3
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const clearAlert = () => setAlert({ type: '', message: '' });

  // ── Step 1 — send reset code ──────────────────────────────────────────────
  const handleSendCode = async (e) => {
    e.preventDefault();
    clearAlert();
    if (!userId.trim()) { setUserIdError('Please enter your User ID'); return; }
    setUserIdError('');

    setLoading(true);
    try {
      const res = await authService.forgotPassword(userId.trim());
      if (res.success) {
        setMaskedEmail(res.data.maskedEmail);
        setCodeValidity(res.data.codeValidityMinutes);
        setStep(2);
      } else {
        setAlert({ type: 'error', message: res.message || 'Something went wrong. Please try again.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to send reset code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 — verify code ──────────────────────────────────────────────────
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    clearAlert();
    if (!code.trim()) { setCodeError('Please enter the verification code'); return; }
    if (code.length !== 6 || !/^\d+$/.test(code)) { setCodeError('Code must be a 6-digit number'); return; }
    setCodeError('');

    setLoading(true);
    try {
      const res = await authService.verifyResetCode(userId.trim(), code.trim());
      if (res.success) {
        setStep(3);
      } else {
        setAlert({ type: 'error', message: res.message || 'Invalid or expired code.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Invalid or expired verification code.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 — reset password ───────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearAlert();
    if (!newPassword) { setPwdError('Please enter a new password'); return; }
    if (newPassword.length < 8) { setPwdError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setPwdError('Passwords do not match'); return; }
    setPwdError('');

    setLoading(true);
    try {
      const res = await authService.resetPassword(userId.trim(), code.trim(), newPassword);
      if (res.success) {
        setAlert({ type: 'success', message: 'Password reset successfully! Redirecting to login…' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setAlert({ type: 'error', message: res.message || 'Failed to reset password.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to reset password. The code may have expired.' });
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(newPassword);

  return (
    <div className="fp-container">
      <div className="fp-card">

        {/* Logo / brand */}
        <div className="fp-brand">
          <div className="fp-brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 3L1 9l4 2.18V17l7 3 7-3v-5.82L23 9l-11-6zm0 2.28L19.14 9 12 12.72 4.86 9 12 5.28zM17 15.99l-5 2.21-5-2.21v-3.36l5 2.21 5-2.21v3.36z"/>
            </svg>
          </div>
          <span className="fp-brand-name">World Education</span>
        </div>

        <div className="fp-header">
          <h1>Reset Password</h1>
          <p>
            {step === 1 && 'Enter your User ID and we\'ll send a reset code to your email'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Choose a strong new password for your account'}
          </p>
        </div>

        <StepIndicator current={step} />

        {alert.message && (
          <Alert type={alert.type} message={alert.message} onClose={clearAlert} />
        )}

        {/* ── Step 1: User ID ──────────────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="fp-form" noValidate>
            <div className="fp-field">
              <label htmlFor="fp-userId">User ID</label>
              <div className="fp-input-wrap">
                <svg className="fp-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
                <input
                  id="fp-userId"
                  type="text"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setUserIdError(''); }}
                  placeholder="Enter your User ID"
                  className={`fp-input ${userIdError ? 'fp-input-error' : ''}`}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              {userIdError && <span className="fp-error-msg">{userIdError}</span>}
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Send Reset Code
            </Button>

            <div className="fp-back-link">
              <Link to="/login" className="fp-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* ── Step 2: Verification Code ─────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="fp-form" noValidate>
            <div className="fp-email-hint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <div>
                <p>We sent a 6-digit code to</p>
                <strong>{maskedEmail}</strong>
                <p className="fp-validity">Valid for {codeValidity} minutes</p>
              </div>
            </div>

            <div className="fp-field">
              <label htmlFor="fp-code">Verification Code</label>
              <input
                id="fp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                placeholder="• • • • • •"
                className={`fp-input fp-input-code ${codeError ? 'fp-input-error' : ''}`}
                autoFocus
                autoComplete="one-time-code"
              />
              {codeError && <span className="fp-error-msg">{codeError}</span>}
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Verify Code
            </Button>

            <div className="fp-resend">
              <span>Didn't receive it?{' '}</span>
              <button
                type="button"
                className="fp-resend-btn"
                onClick={() => { setStep(1); setCode(''); clearAlert(); }}
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: New Password ─────────────────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="fp-form" noValidate>
            <div className="fp-field">
              <label htmlFor="fp-newPwd">New Password</label>
              <div className="fp-input-wrap">
                <svg className="fp-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1C9.24 1 7 3.24 7 6v2H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                </svg>
                <input
                  id="fp-newPwd"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPwdError(''); }}
                  placeholder="Min. 8 characters"
                  className={`fp-input ${pwdError ? 'fp-input-error' : ''}`}
                  autoFocus
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="fp-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
                  )}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword && (
                <div className="fp-strength">
                  <div className="fp-strength-bar">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className="fp-strength-seg"
                        style={{ background: i <= strength ? strengthColor[strength] : '#e5e7eb' }}
                      />
                    ))}
                  </div>
                  <span className="fp-strength-label" style={{ color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className="fp-field">
              <label htmlFor="fp-confirmPwd">Confirm Password</label>
              <div className="fp-input-wrap">
                <svg className="fp-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1C9.24 1 7 3.24 7 6v2H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                </svg>
                <input
                  id="fp-confirmPwd"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPwdError(''); }}
                  placeholder="Repeat your new password"
                  className={`fp-input ${pwdError ? 'fp-input-error' : ''}`}
                  autoComplete="new-password"
                />
                {confirmPassword && (
                  <span className="fp-match-icon">
                    {newPassword === confirmPassword
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#22c55e"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    }
                  </span>
                )}
              </div>
              {pwdError && <span className="fp-error-msg">{pwdError}</span>}
            </div>

            <div className="fp-rules">
              {[
                { ok: newPassword.length >= 8, text: 'At least 8 characters' },
                { ok: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
                { ok: /[a-z]/.test(newPassword), text: 'One lowercase letter' },
                { ok: /\d/.test(newPassword), text: 'One number' },
              ].map(({ ok, text }) => (
                <div key={text} className={`fp-rule ${ok ? 'fp-rule-ok' : ''}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    {ok
                      ? <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      : <circle cx="12" cy="12" r="4"/>}
                  </svg>
                  {text}
                </div>
              ))}
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Reset Password
            </Button>
          </form>
        )}

        {/* Footer sign-in link (steps 2 & 3) */}
        {step > 1 && (
          <div className="fp-footer-link">
            <Link to="/login" className="fp-link">Back to Sign In</Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
