import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { FiClock, FiLogOut, FiRefreshCw } from "react-icons/fi";
import { autoLogout } from "../features/authSlice";
import useIdleTimeout from "../hooks/useIdleTimeout";
import IDLE_TIMEOUT_CONFIG from "../config/idleTimeout";

const IdleTimeoutManager = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPreWarning, setShowPreWarning] = useState(false);

  // Only enable idle timeout for admin users
  const isAdminUser = user?.isAdmin === true;

  // Define handleAutoLogout first using useCallback
  const handleAutoLogout = useCallback(
    (reason) => {
      console.log("🚪 Performing auto-logout:", reason);
      dispatch(autoLogout({ reason }));
      setShowWarning(false);

      // Redirect if configured to do so
      if (IDLE_TIMEOUT_CONFIG.AUTO_REDIRECT) {
        window.location.href = IDLE_TIMEOUT_CONFIG.REDIRECT_URL;
      }
    },
    [dispatch],
  );

  // Always call the hook (React Rules of Hooks)
  // Pass isAdminUser so the hook can disable itself for non-admins
  const { resetTimeout, getRemainingTime, isActive, setWarningShown } =
    useIdleTimeout(
      IDLE_TIMEOUT_CONFIG.TIMEOUT_DURATION,
      showWarning, // Pause activity tracking when warning modal is shown
      isAdminUser, // Pass admin status to hook
    );

  useEffect(() => {
    // Don't track idle time for non-admin users
    if (!isAdminUser) return;

    const interval = setInterval(() => {
      const remaining = getRemainingTime();

      // Show pre-warning notification
      if (
        remaining <= IDLE_TIMEOUT_CONFIG.WARNING_TIME + 5000 &&
        remaining > IDLE_TIMEOUT_CONFIG.WARNING_TIME
      ) {
        if (!showPreWarning) {
          setShowPreWarning(true);
        }
      } else if (
        remaining <= IDLE_TIMEOUT_CONFIG.WARNING_TIME &&
        remaining > 0
      ) {
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
        handleAutoLogout("Session expired due to inactivity");
      } else {
        // Reset warnings if user became active
        if (showPreWarning) setShowPreWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    showWarning,
    isActive,
    getRemainingTime,
    isAdminUser,
    handleAutoLogout,
    setWarningShown,
    showPreWarning,
  ]);

  const handleStayLoggedIn = () => {
    resetTimeout();
    setShowWarning(false);
    setShowPreWarning(false);
    setWarningShown(false); // Resume activity tracking
  };

  const handleLogoutNow = () => {
    setWarningShown(false); // Resume activity tracking
    handleAutoLogout("User chose to logout");
  };

  // Don't render if user is not logged in or not an admin
  if (!token || !isAdminUser) {
    return null;
  }

  return (
    <>
      {/* Pre-warning notification */}
      {showPreWarning && (
        <Box
          onClick={() => setShowPreWarning(false)}
          sx={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "linear-gradient(135deg, #ffa726 0%, #ff9800 100%)",
            color: "white",
            p: "16px 20px",
            borderRadius: "15px",
            fontSize: "14px",
            fontWeight: "600",
            zIndex: 10000,
            boxShadow: "0 8px 25px rgba(255, 167, 38, 0.4)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            animation: "slideIn 0.3s ease-out",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 12px 35px rgba(255, 167, 38, 0.5)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FiClock size={18} style={{ marginRight: 8 }} />
            <Box>
              <Box sx={{ fontSize: "13px", fontWeight: "700" }}>
                Session Warning
              </Box>
              <Box sx={{ fontSize: "12px", opacity: 0.9 }}>
                Your session will expire soon. Stay active!
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Warning Modal */}
      <Dialog
        open={showWarning}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "25px",
            overflow: "hidden",
            background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          },
        }}
      >
        {/* Gradient Header */}
        <DialogTitle sx={{ p: 0 }}>
          <Box
            sx={{
              background:
                "linear-gradient(135deg, #8B1A4A 0%, #C9A84C 100%)",
              p: "25px 30px",
              borderRadius: "25px 25px 0 0",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                fontWeight: "700",
              }}
            >
              <Box
                sx={{
                  width: "50px",
                  height: "50px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "15px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                }}
              >
                <FiClock size={24} color="white" />
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Box>Session Timeout Warning</Box>
                <Box
                  component="small"
                  sx={{ fontSize: "0.9rem", fontWeight: "400", opacity: 0.75 }}
                >
                  Action Required
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: "40px 35px", textAlign: "center" }}>
          {/* Main Content Card */}
          <Box
            sx={{
              p: 4,
              mb: 4,
              background:
                "linear-gradient(135deg, #fff5f5 0%, #ffebee 100%)",
              borderRadius: "20px",
              border: "1px solid rgba(139, 26, 74, 0.1)",
              boxShadow: "0 8px 25px rgba(139, 26, 74, 0.08)",
            }}
          >
            {/* Timer Circle */}
            <Box
              sx={{
                mx: "auto",
                mb: 4,
                width: "120px",
                height: "120px",
                background:
                  "linear-gradient(135deg, #8B1A4A 0%, #C9A84C 100%)",
                borderRadius: "50%",
                boxShadow: "0 10px 30px rgba(139, 26, 74, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  width: "100px",
                  height: "100px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.2)",
                  fontSize: "2rem",
                  fontWeight: "700",
                }}
              >
                {countdown}
              </Box>

              {/* Animated ring */}
              <svg
                style={{ position: "absolute", top: "-10px", left: "-10px" }}
                width="140"
                height="140"
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
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - countdown / (IDLE_TIMEOUT_CONFIG.WARNING_TIME / 1000))}`}
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "70px 70px",
                    transition: "stroke-dashoffset 1s ease",
                  }}
                />
              </svg>
            </Box>

            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#2C2C2C", mb: 3, fontSize: "1.3rem" }}
            >
              Your session will expire in{" "}
              <Box component="span" sx={{ color: "#8B1A4A" }}>
                {countdown}
              </Box>{" "}
              seconds
            </Typography>

            {/* Progress bar */}
            <Box
              sx={{
                mb: 4,
                background: "#f1f3f4",
                borderRadius: "15px",
                height: "12px",
                overflow: "hidden",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${(countdown / (IDLE_TIMEOUT_CONFIG.WARNING_TIME / 1000)) * 100}%`,
                  background:
                    countdown > 5
                      ? "linear-gradient(90deg, #8B1A4A 0%, #C9A84C 100%)"
                      : "linear-gradient(90deg, #5c0f30 0%, #8B1A4A 100%)",
                  borderRadius: "15px",
                  transition: "all 1s ease",
                  boxShadow: "0 2px 8px rgba(139, 26, 74, 0.4)",
                }}
              />
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: "1rem",
                lineHeight: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <FiClock />
              You've been inactive for too long. Please choose an action below
              to continue your session.
            </Typography>
          </Box>

          {/* Security Notice */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
              mb: 3,
              background:
                "linear-gradient(135deg, #FDF6EC 0%, #f0fdf4 100%)",
              borderRadius: "15px",
              border: "1px solid rgba(201, 168, 76, 0.2)",
            }}
          >
            <Box
              sx={{
                width: "40px",
                height: "40px",
                background:
                  "linear-gradient(135deg, #8B1A4A 0%, #C9A84C 100%)",
                borderRadius: "10px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
                flexShrink: 0,
              }}
            >
              <FiClock size={20} />
            </Box>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#2C2C2C", mb: 0.5 }}
              >
                Security Feature
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This timeout helps protect your account from unauthorized
                access
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: "25px 35px 35px",
            borderTop: "none",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button
            onClick={handleLogoutNow}
            variant="outlined"
            startIcon={<FiLogOut />}
            sx={{
              minWidth: "140px",
              borderColor: "#8B1A4A",
              color: "#8B1A4A",
              borderRadius: "12px",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#5c0f30",
                backgroundColor: "rgba(139,26,74,0.05)",
              },
            }}
          >
            Logout Now
          </Button>

          <Button
            onClick={handleStayLoggedIn}
            variant="contained"
            startIcon={<FiRefreshCw />}
            sx={{
              minWidth: "160px",
              background: "linear-gradient(135deg, #8B1A4A 0%, #C9A84C 100%)",
              borderRadius: "12px",
              fontWeight: 600,
              color: "white",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #5c0f30 0%, #a8882e 100%)",
              },
            }}
          >
            Stay Logged In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Development indicator (remove in production) */}
      {IDLE_TIMEOUT_CONFIG.DEBUG_MODE && (
        <Box
          sx={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background:
              "linear-gradient(135deg, #8B1A4A 0%, #C9A84C 100%)",
            color: "white",
            p: "12px 16px",
            borderRadius: "15px",
            fontSize: "13px",
            fontWeight: "600",
            zIndex: 9999,
            fontFamily: "system-ui, -apple-system, sans-serif",
            boxShadow: "0 8px 25px rgba(139, 26, 74, 0.3)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <FiClock size={16} />
          <span>Debug: {Math.ceil(getRemainingTime() / 1000)}s</span>
        </Box>
      )}
    </>
  );
};

export default IdleTimeoutManager;
