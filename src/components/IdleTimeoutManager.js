import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { FiClock, FiLogOut, FiRefreshCw } from 'react-icons/fi';
import { autoLogout } from '../features/authSlice';
import useIdleTimeout from '../hooks/useIdleTimeout';
import IDLE_TIMEOUT_CONFIG from '../config/idleTimeout';


const IdleTimeoutManager = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const user = useSelector(state => state.auth.user);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPreWarning, setShowPreWarning] = useState(false);
  
  // Only enable idle timeout for admin users
  const isAdminUser = user?.isAdmin === true;

  // Define handleAutoLogout first using useCallback
  const handleAutoLogout = useCallback((reason) => {
    console.log('🚪 Performing auto-logout:', reason);
    dispatch(autoLogout({ reason }));
    setShowWarning(false);
    
    // Redirect if configured to do so
    if (IDLE_TIMEOUT_CONFIG.AUTO_REDIRECT) {
      window.location.href = IDLE_TIMEOUT_CONFIG.REDIRECT_URL;
    }
  }, [dispatch]);
  
  // Always call the hook (React Rules of Hooks)
  // Pass isAdminUser so the hook can disable itself for non-admins
  const { resetTimeout, getRemainingTime, isActive, setWarningShown } = useIdleTimeout(
    IDLE_TIMEOUT_CONFIG.TIMEOUT_DURATION,
    showWarning,  // Pause activity tracking when warning modal is shown
    isAdminUser   // Pass admin status to hook
  );

  useEffect(() => {
    // Don't track idle time for non-admin users
    if (!isAdminUser) return;

    const interval = setInterval(() => {
      const remaining = getRemainingTime();
      
      // Show pre-warning notification
      if (remaining <= (IDLE_TIMEOUT_CONFIG.WARNING_TIME + 5000) && remaining > IDLE_TIMEOUT_CONFIG.WARNING_TIME) {
        if (!showPreWarning) {
          setShowPreWarning(true);
        }
      } else if (remaining <= IDLE_TIMEOUT_CONFIG.WARNING_TIME && remaining > 0) {
        // Hide pre-warning and show main warning dialog
        setShowPreWarning(false);
        if (!showWarning) {
          setShowWarning(true);
          setWarningShown(true); // Pause activity tracking
        }
        setCountdown(Math.ceil(remaining / 1000));
      } else if (remaining <= 0) {
        // Time's up, perform logout
        setShowWarning(false);
        setShowPreWarning(false);
        setWarningShown(false);
        handleAutoLogout('Session expired due to inactivity');
      } else {
        // Reset warnings if user became active
        if (showPreWarning) setShowPreWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning, isActive, getRemainingTime, isAdminUser, handleAutoLogout, setWarningShown, showPreWarning]);

  const handleStayLoggedIn = () => {
    resetTimeout();
    setShowWarning(false);
    setShowPreWarning(false);
    setWarningShown(false); // Resume activity tracking
  };

  const handleLogoutNow = () => {
    setWarningShown(false); // Resume activity tracking
    handleAutoLogout('User chose to logout');
  };

  // Don't render if user is not logged in or not an admin
  if (!token || !isAdminUser) {
    return null;
  }

  return (
    <>
      {/* Pre-warning notification */}
      {showPreWarning && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '15px',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: 10000,
            boxShadow: '0 8px 25px rgba(255, 167, 38, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            animation: 'slideIn 0.3s ease-out',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setShowPreWarning(false)}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 35px rgba(255, 167, 38, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 25px rgba(255, 167, 38, 0.4)';
          }}
        >
          <div className="d-flex align-items-center">
            <FiClock className="me-2" size={18} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>Session Warning</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Your session will expire soon. Stay active!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      <Modal 
        show={showWarning} 
        backdrop="static" 
        keyboard={false}
        centered
        size="md"
        className="idle-timeout-modal"
      >
        <div 
          className="modal-content border-0 shadow-lg overflow-hidden"
          style={{ 
            borderRadius: '25px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
          }}
        >
          {/* Gradient Header */}
          <Modal.Header 
            className="border-0 text-white position-relative"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 50%, #ffcc02 100%)',
              padding: '25px 30px',
              borderRadius: '25px 25px 0 0'
            }}
          >
            <Modal.Title 
              className="d-flex align-items-center w-100 justify-content-center"
              style={{ fontSize: '1.4rem', fontWeight: '700' }}
            >
              <div 
                className="d-flex align-items-center justify-content-center me-3"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '15px',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                <FiClock size={24} className="text-white" />
              </div>
              <div className="text-center">
                <div>Session Timeout Warning</div>
                <small className="opacity-75" style={{ fontSize: '0.9rem', fontWeight: '400' }}>
                  Action Required
                </small>
              </div>
            </Modal.Title>
            
          </Modal.Header>
          
          <Modal.Body className="text-center" style={{ padding: '40px 35px' }}>
            {/* Main Content Card */}
            <div 
              className="p-4 mb-4"
              style={{ 
                background: 'linear-gradient(135deg, #fff5f5 0%, #ffebee 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 107, 107, 0.1)',
                boxShadow: '0 8px 25px rgba(255, 107, 107, 0.1)'
              }}
            >
              {/* Timer Circle */}
              <div 
                className="mx-auto mb-4 d-flex align-items-center justify-content-center position-relative"
                style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8a80 100%)',
                  borderRadius: '50%',
                  boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)'
                }}
              >
                <div 
                  className="d-flex align-items-center justify-content-center text-white"
                  style={{
                    width: '100px',
                    height: '100px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)',
                    fontSize: '2rem',
                    fontWeight: '700'
                  }}
                >
                  {countdown}
                </div>
                
                {/* Animated ring */}
                <svg 
                  className="position-absolute"
                  width="140" 
                  height="140"
                  style={{ top: '-10px', left: '-10px' }}
                >
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="transparent"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - (countdown / (IDLE_TIMEOUT_CONFIG.WARNING_TIME / 1000)))}`}
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: '70px 70px',
                      transition: 'stroke-dashoffset 1s ease'
                    }}
                  />
                </svg>
              </div>
              
              <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1.3rem' }}>
                Your session will expire in <span className="text-danger">{countdown}</span> seconds
              </h5>
              
              {/* Progress bar with gradient */}
              <div 
                className="mb-4"
                style={{
                  background: '#f1f3f4',
                  borderRadius: '15px',
                  height: '12px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div
                  className="h-100"
                  style={{
                    width: `${(countdown / (IDLE_TIMEOUT_CONFIG.WARNING_TIME / 1000)) * 100}%`,
                    background: countdown > 5 
                      ? 'linear-gradient(90deg, #ff6b6b 0%, #ffa726 100%)' 
                      : 'linear-gradient(90deg, #f44336 0%, #d32f2f 100%)',
                    borderRadius: '15px',
                    transition: 'all 1s ease',
                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)'
                  }}
                />
              </div>
              
              <p className="text-muted mb-0" style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                <FiClock className="me-2" />
                You've been inactive for too long. Please choose an action below to continue your session.
              </p>
            </div>
            
            {/* Security Notice */}
            <div 
              className="d-flex align-items-center justify-content-center p-3 mb-3"
              style={{
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                borderRadius: '15px',
                border: '1px solid rgba(103, 58, 183, 0.1)'
              }}
            >
              <div 
                className="me-3 d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '10px',
                  color: 'white'
                }}
              >
                <FiClock size={20} />
              </div>
              <div>
                <div className="fw-semibold text-dark mb-1">Security Feature</div>
                <small className="text-muted">
                  This timeout helps protect your account from unauthorized access
                </small>
              </div>
            </div>
          </Modal.Body>
          
          <Modal.Footer 
            className="border-0 d-flex justify-content-center gap-3"
            style={{ padding: '25px 35px 35px' }}
          >
            <Button 
              variant="outline-secondary" 
              onClick={handleLogoutNow}
              size="lg"
              className="px-4 py-3"
              style={{ 
                borderRadius: '15px',
                border: '2px solid #dee2e6',
                color: '#6c757d',
                fontWeight: '600',
                minWidth: '140px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#6c757d';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6c757d';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FiLogOut className="me-2" />
              Logout Now
            </Button>
            
            <Button 
              variant="primary" 
              onClick={handleStayLoggedIn}
              size="lg"
              className="px-4 py-3"
              style={{ 
                borderRadius: '15px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: '600',
                minWidth: '160px',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }}
            >
              <FiRefreshCw className="me-2" />
              Stay Logged In
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Development indicator (remove in production) */}
      {IDLE_TIMEOUT_CONFIG.DEBUG_MODE && (
        <div 
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '15px',
            fontSize: '13px',
            fontWeight: '600',
            zIndex: 9999,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="d-flex align-items-center">
            <FiClock className="me-2" size={16} />
            <span>Debug: {Math.ceil(getRemainingTime() / 1000)}s</span>
          </div>
        </div>
      )}
    </>
  );
};

export default IdleTimeoutManager;