import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { FiWifiOff, FiWifi } from 'react-icons/fi';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showOfflineMessage) return null;

  return (
    <div className="offline-indicator">
      {isOnline ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FiWifi style={{ marginRight: 8 }} />
          <span>Connection restored!</span>
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FiWifiOff style={{ marginRight: 8 }} />
          <span>You're offline. Some features may not be available.</span>
        </Box>
      )}
    </div>
  );
};

export default OfflineIndicator;