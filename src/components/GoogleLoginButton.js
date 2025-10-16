import React from 'react';
import { Button, Alert } from 'react-bootstrap';
import { FaGoogle, FaExclamationTriangle } from 'react-icons/fa';

const GoogleLoginButton = ({ className = "", variant = "outline-danger" }) => {
  const handleGoogleLogin = () => {
    // Show alert if OAuth likely not configured (development check)
    if (window.location.hostname === 'localhost') {
      const confirmed = window.confirm(
        'Google OAuth Setup Required!\n\n' +
        'If you haven\'t set up Google OAuth credentials yet, this will show a 400 error.\n\n' +
        'Check GOOGLE_OAUTH_SETUP_URGENT.md for setup instructions.\n\n' +
        'Continue anyway?'
      );
      if (!confirmed) return;
    }
    
    // Redirect to backend Google OAuth endpoint
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    window.location.href = `${baseURL}/api/auth/google`;
  };

  return (
    <Button
      variant={variant}
      className={`w-100 mb-3 ${className}`}
      onClick={handleGoogleLogin}
      style={{
        borderRadius: '12px',
        padding: '12px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.3s ease'
      }}
    >
      <FaGoogle size={20} />
      Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;