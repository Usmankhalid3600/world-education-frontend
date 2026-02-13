import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  fullWidth = false,
  loading = false 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''} ${loading ? 'btn-loading' : ''}`}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
