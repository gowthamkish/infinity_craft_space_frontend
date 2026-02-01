import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { autoLogout } from '../features/authSlice';
import IDLE_TIMEOUT_CONFIG from '../config/idleTimeout';

const useIdleTimeout = (timeoutDuration = IDLE_TIMEOUT_CONFIG.TIMEOUT_DURATION, paused = false, isAdminUser = false) => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);

  // Clear all tokens and logout - ONLY for admin users
  const performLogout = useCallback(() => {
    console.log('🚪 Auto-logout triggered due to inactivity');
    
    // Dispatch auto-logout action (this will handle localStorage cleanup)
    dispatch(autoLogout({ reason: 'Inactivity timeout' }));
    
    // Redirect if configured
    if (IDLE_TIMEOUT_CONFIG.AUTO_REDIRECT) {
      window.location.href = IDLE_TIMEOUT_CONFIG.REDIRECT_URL;
    }
  }, [dispatch]);

  // Reset the timeout
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only set timeout if user is logged in
    if (token) {
      lastActivityRef.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        performLogout();
      }, timeoutDuration);
    }
  }, [token, timeoutDuration, performLogout]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    // Don't reset timeout if warning is being shown (paused mode)
    if (!paused && !warningShownRef.current) {
      resetTimeout();
    }
  }, [resetTimeout, paused]);

  // Events to track for user activity
  const events = IDLE_TIMEOUT_CONFIG.ACTIVITY_EVENTS;

  useEffect(() => {
    // Only activate idle timeout if user is logged in AND is an admin
    if (!token || !isAdminUser) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Initialize timeout (only if not paused)
    if (!paused) {
      resetTimeout();
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      // Clear timeout (only if not paused)
      if (timeoutRef.current && !paused) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [token, resetTimeout, handleActivity, paused, isAdminUser]);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (token && !document.hidden) {
        // User came back to tab, reset timeout
        resetTimeout();
      } else if (document.hidden) {
        // User switched away from tab, but don't clear timeout
        // Let it continue running
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, resetTimeout]);

  // Return utility functions
  return {
    resetTimeout,
    getRemainingTime: () => {
      const elapsed = Date.now() - lastActivityRef.current;
      return Math.max(0, timeoutDuration - elapsed);
    },
    isActive: () => token !== null,
    setWarningShown: (shown) => {
      warningShownRef.current = shown;
    }
  };
};

export default useIdleTimeout;