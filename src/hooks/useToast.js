import { useState, useCallback, useRef } from "react";

let toastIdCounter = 0;

// Hook for managing toast notifications
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toastRefs = useRef({});

  const addToast = useCallback(
    (
      message,
      { type = "info", title = "", duration = 3000, onClose = null } = {},
    ) => {
      const toastId = toastIdCounter++;
      const toast = {
        id: toastId,
        message,
        title,
        type,
        duration,
        onClose,
        isExiting: false,
      };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after duration
      if (duration > 0) {
        const timeout = setTimeout(() => {
          removeToast(toastId);
        }, duration);

        toastRefs.current[toastId] = timeout;
      }

      return toastId;
    },
    [],
  );

  const removeToast = useCallback((toastId) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === toastId);
      if (toast) {
        toast.isExiting = true;
      }

      // Remove after animation completes
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
        if (toastRefs.current[toastId]) {
          clearTimeout(toastRefs.current[toastId]);
          delete toastRefs.current[toastId];
        }
      }, 300);

      return prev;
    });
  }, []);

  // Convenience methods
  const success = useCallback(
    (message, title = "Success", options = {}) => {
      return addToast(message, { ...options, type: "success", title });
    },
    [addToast],
  );

  const error = useCallback(
    (message, title = "Error", options = {}) => {
      return addToast(message, { ...options, type: "error", title });
    },
    [addToast],
  );

  const warning = useCallback(
    (message, title = "Warning", options = {}) => {
      return addToast(message, { ...options, type: "warning", title });
    },
    [addToast],
  );

  const info = useCallback(
    (message, title = "Info", options = {}) => {
      return addToast(message, { ...options, type: "info", title });
    },
    [addToast],
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};
