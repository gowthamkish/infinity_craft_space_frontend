// Idle timeout configuration
export const IDLE_TIMEOUT_CONFIG = {
  // Timeout duration in milliseconds
  TIMEOUT_DURATION: 30000, // 30 seconds
  
  // Warning time before logout (show modal)
  WARNING_TIME: 10000, // 10 seconds
  
  // Events to track for user activity
  ACTIVITY_EVENTS: [
    'mousedown',
    'mousemove', 
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ],
  
  // Debug mode (shows countdown in corner)
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  
  // Auto redirect after logout
  AUTO_REDIRECT: true,
  
  // Redirect URL after logout
  REDIRECT_URL: '/login'
};

// For production, you might want longer timeouts:
// TIMEOUT_DURATION: 15 * 60 * 1000, // 15 minutes
// WARNING_TIME: 2 * 60 * 1000, // 2 minutes warning

export default IDLE_TIMEOUT_CONFIG;