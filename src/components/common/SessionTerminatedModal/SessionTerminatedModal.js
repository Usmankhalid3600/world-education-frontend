import React from 'react';
import './SessionTerminatedModal.css';

const SessionTerminatedModal = ({ onClose }) => {
  return (
    <div className="stm-overlay">
      <div className="stm-dialog">
        <div className="stm-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="stm-title">Session Ended</h2>
        <p className="stm-message">
          Your account was signed in from another device or browser.
          You have been logged out of this session.
        </p>
        <button className="stm-btn" onClick={onClose}>
          OK, Go to Login
        </button>
      </div>
    </div>
  );
};

export default SessionTerminatedModal;
