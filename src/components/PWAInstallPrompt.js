import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Button, Box, Typography, Stack,
} from "@mui/material";
import { FiSmartphone, FiDownload, FiShare2, FiPlus } from "react-icons/fi";

const P = "#8B1A4A";

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

      <Stack gap={1.5}>
        {[
          { step: 1, icon: FiShare2, text: <>Tap the <strong>Share</strong> button</> },
          { step: 2, icon: FiPlus,   text: <>Select <strong>"Add to Home Screen"</strong></> },
        ].map(({ step, icon: Icon, text }) => (
          <Stack key={step} direction="row" alignItems="center" gap={1.5}>
            <Box sx={{
              width: 28, height: 28, borderRadius: "50%", bgcolor: P, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
            }}>
              {step}
            </Box>
            <Stack direction="row" alignItems="center" gap={0.75}>
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
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed && Date.now() < parseInt(dismissed)) return;

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowInstallPrompt(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    if (iOS && !window.navigator.standalone) {
      setTimeout(() => setShowInstallPrompt(true), 45000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
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
    localStorage.setItem("pwa-install-dismissed", Date.now() + 7 * 24 * 60 * 60 * 1000);
  };

  if (!showInstallPrompt) return null;

  return (
    <>
      <Alert
        severity="info"
        onClose={handleDismiss}
        icon={false}
        sx={{
          m: 1.5, borderRadius: "12px",
          background: `linear-gradient(135deg, ${P} 0%, #6b1238 100%)`,
          color: "#fff",
          "& .MuiAlert-action": { color: "rgba(255,255,255,0.7)", alignItems: "center" },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Stack direction="row" alignItems="center" gap={1.75}>
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
                Get the full app experience with offline access and faster loading!
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
