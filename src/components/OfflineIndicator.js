import React, { useState, useEffect } from 'react';
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
        <div className="d-flex align-items-center justify-content-center">
          <FiWifi className="me-2" />
          <span>Connection restored!</span>
        </div>
      ) : (
        <div className="d-flex align-items-center justify-content-center">
          <FiWifiOff className="me-2" />
          <span>You're offline. Some features may not be available.</span>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;