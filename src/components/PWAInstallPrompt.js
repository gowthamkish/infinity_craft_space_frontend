import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Button, Box, Typography, Stack,
} from "@mui/material";
import { FiSmartphone, FiDownload, FiShare2, FiPlus } from "react-icons/fi";

const P = "#d24e33"; // Ember & Teal theme

const IOSInstallModal = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <FiSmartphone size={18} color={P} />
      Install Infinity Craft App
    </DialogTitle>
    <DialogContent>
      <Box sx={{ textAlign: "center", mb: 2.5 }}>
        <Box
          component="img"
          src="/ICS_Logo.jpeg"
          alt="App Icon"
          sx={{ width: 80, height: 80, borderRadius: "16px", objectFit: "cover", mb: 1.5 }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Get the full app experience!
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Install Infinity Craft Space on your iPhone for faster access and a better shopping experience.
        </Typography>
      </Box>

      <Stack sx={{ gap: 1.5 }}>
        {[
          { step: 1, icon: FiShare2, text: <>Tap the <strong>Share</strong> button</> },
          { step: 2, icon: FiPlus,   text: <>Select <strong>"Add to Home Screen"</strong></> },
        ].map(({ step, icon: Icon, text }) => (
          <Stack key={step} direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: "50%", bgcolor: P, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
            }}>
              {step}
            </Box>
            <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
              <Typography variant="body2">{text}</Typography>
              <Icon size={16} color="#64748b" />
            </Stack>
          </Stack>
        ))}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button
        fullWidth variant="outlined" onClick={onClose}
        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", borderColor: "#d4d4d4", color: "#57534e" }}
      >
        Maybe Later
      </Button>
    </DialogActions>
  </Dialog>
);

const PWAInstallPrompt = () => {
  const [deferredPrompt,    setDeferredPrompt]    = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS,             setIsIOS]             = useState(false);
  const [showModal,         setShowModal]         = useState(false);

  useEffect(() => {
    // iPadOS 13+ reports itself as "Macintosh", so also check for touch support
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    try {
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (dismissed && Date.now() < parseInt(dismissed)) return;
    } catch {
      /* storage unavailable — show the prompt anyway */
    }

    let timer;
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      timer = setTimeout(() => setShowInstallPrompt(true), 15000);
    };
    const handleInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    };

    if (window.__pwaInstallEvent) handleBeforeInstall(window.__pwaInstallEvent);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    // iOS has no install event — Safari users add it via Share → Add to Home Screen
    if (iOS) timer = setTimeout(() => setShowInstallPrompt(true), 20000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      window.__pwaInstallEvent = null; // a prompt event can only be used once
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
    try {
      localStorage.setItem("pwa-install-dismissed", Date.now() + 7 * 24 * 60 * 60 * 1000);
    } catch {
      /* ignore */
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <>
      <Alert
        severity="info"
        onClose={handleDismiss}
        icon={false}
        sx={{
          position: "fixed", left: 12, right: 12, bottom: 16, zIndex: 1400,
          maxWidth: 520, mx: "auto",
          boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
          borderRadius: "12px",
          background: `linear-gradient(135deg, #e8623d 0%, #d24e33 100%)`,
          color: "#fff",
          "& .MuiAlert-action": { color: "rgba(255,255,255,0.7)", alignItems: "center" },
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 1.75 }}>
            <Box sx={{
              width: 44, height: 44, bgcolor: "rgba(255,255,255,0.18)",
              borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <FiSmartphone size={22} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.3 }}>
                Install Infinity Craft App
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", opacity: 0.85, lineHeight: 1.4, mt: 0.25 }}>
                Add it to your home screen for faster, app-like shopping.
              </Typography>
            </Box>
          </Stack>
          <Button
            size="small"
            startIcon={<FiDownload size={14} />}
            onClick={handleInstall}
            sx={{
              flexShrink: 0, textTransform: "none", fontWeight: 700,
              bgcolor: "#fff", color: P, borderRadius: "8px",
              px: 1.75, py: 0.625, fontSize: "0.8125rem",
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              boxShadow: "none",
            }}
          >
            Install
          </Button>
        </Stack>
      </Alert>

      {isIOS && <IOSInstallModal open={showModal} onClose={() => setShowModal(false)} />}
    </>
  );
};

export default PWAInstallPrompt;
