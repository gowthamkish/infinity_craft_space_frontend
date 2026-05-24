import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MuiAlert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { FiSmartphone, FiDownload } from "react-icons/fi";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return; // Already installed
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after 30 seconds or on user interaction
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 30000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show prompt after some time
    if (iOS && !window.navigator.standalone) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 45000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        setShowModal(false);
      }
    } else if (isIOS) {
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem(
      "pwa-install-dismissed",
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );
  };

  // Check if user previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed && Date.now() < parseInt(dismissed)) {
      setShowInstallPrompt(false);
    }
  }, []);

  // iOS Install Modal
  const IOSInstallModal = () => (
    <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
          <FiSmartphone className="me-2" />
          Install Infinity Craft App
        </DialogTitle>
      <DialogContent>
        <div className="text-center">
          <div className="mb-3">
            <img
              src="/ICS_Logo.jpeg.png"
              alt="App Icon"
              width="80"
              height="80"
              style={{ borderRadius: "16px" }}
            />
          </div>
          <h5>Get the full app experience!</h5>
          <p className="text-muted mb-4">
            Install Infinity Craft Space on your iPhone for faster access and a
            better shopping experience.
          </p>

          <div className="d-flex flex-column gap-2 text-start">
            <div className="d-flex align-items-center">
              <span className="badge bg-primary me-3">1</span>
              Tap the <strong>Share</strong> button
              <svg
                width="20"
                height="20"
                className="ms-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
              </svg>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-primary me-3">2</span>
              Select <strong>"Add to Home Screen"</strong>
              <svg
                width="20"
                height="20"
                className="ms-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <button className="ics-btn ics-btn--secondary" onClick={() => setShowModal(false)}>
          Maybe Later
        </button>
      </DialogActions>
    </Dialog>
  );

  if (!showInstallPrompt) return null;

  return (
    <>
      <MuiAlert
        severity="info"
        onClose={handleDismiss}
        sx={{ m: 1.5, borderRadius: "12px",
          background: "linear-gradient(135deg, #8B1A4A 0%, #6b1238 100%)",
          color: "white", "& .MuiAlert-icon": { color: "white" },
          "& .MuiAlert-action": { color: "white" },
          top: "5rem" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div
              className="me-3"
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiSmartphone size={24} />
            </div>
            <div>
              <strong style={{ fontSize: "1.1rem" }}>
                Install Infinity Craft App
              </strong>
              <p className="mb-0 small opacity-90">
                Get the full app experience with offline access and faster
                loading!
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className="ics-btn ics-btn--white ics-btn--sm"
              onClick={handleInstallClick}
            >
              <FiDownload className="me-1" />
              Install
            </button>
          </div>
        </div>
      </MuiAlert>

      {isIOS && <IOSInstallModal />}
    </>
  );
};

export default PWAInstallPrompt;
