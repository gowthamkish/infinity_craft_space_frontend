import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { loginSuccess, setAuthFromStorage } from '../features/authSlice';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (error) {
      console.error('OAuth error:', error);
      setTimeout(() => {
        navigate('/login?error=oauth_failed');
      }, 2000);
      return;
    }
    
    if (token) {
      try {
        // Decode token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Fetch user profile with the token
        fetchUserProfile(token);
        
      } catch (error) {
        console.error('Token decode error:', error);
        navigate('/login?error=invalid_token');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, dispatch, navigate]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Dispatch login success with user data
        dispatch(loginSuccess({
          user: {
            id: userData._id,
            username: userData.username,
            email: userData.email,
            isAdmin: userData.isAdmin,
            avatar: userData.avatar,
            provider: userData.provider
          },
          token
        }));
        
        // Redirect based on user role
        if (userData.isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      localStorage.removeItem('token');
      navigate('/login?error=profile_fetch_failed');
    }
  };

  const error = searchParams.get('error');

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="text-center">
        {error ? (
          <Alert variant="danger">
            <h5>Authentication Failed</h5>
            <p>
              {error === 'oauth_failed' && 'OAuth authentication failed. Please try again.'}
              {error === 'invalid_token' && 'Invalid authentication token received.'}
              {error === 'profile_fetch_failed' && 'Failed to fetch user profile.'}
            </p>
            <p>Redirecting to login page...</p>
          </Alert>
        ) : (
          <>
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <h4 className="mt-3 text-primary">Completing Sign In...</h4>
            <p className="text-muted">Please wait while we set up your account.</p>
          </>
        )}
      </div>
    </Container>
  );
};

export default AuthSuccess;