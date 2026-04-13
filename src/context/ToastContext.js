import React, { createContext, useCallback, useState } from "react";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [toastIdCounter, setToastIdCounter] = useState(0);

  const addToast = useCallback(
    (message, options = {}) => {
      const { type = "info", duration = 3000, title = "" } = options;

      const toastId = toastIdCounter + 1;
      setToastIdCounter(toastId);

      const newToast = {
        id: toastId,
        message,
        type,
        title,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => removeToast(toastId), duration);
      }

      return toastId;
    },
    [toastIdCounter],
  );

  const removeToast = useCallback((toastId) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === toastId ? { ...toast, isExiting: true } : toast,
      ),
    );
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toastId));
    }, 300);
  }, []);

  const addSuccess = useCallback(
    (message, title = "Success", options = {}) => {
      return addToast(message, { ...options, type: "success", title });
    },
    [addToast],
  );

  const addError = useCallback(
    (message, title = "Error", options = {}) => {
      return addToast(message, { ...options, type: "error", title });
    },
    [addToast],
  );

  const addWarning = useCallback(
    (message, title = "Warning", options = {}) => {
      return addToast(message, { ...options, type: "warning", title });
    },
    [addToast],
  );

  const addInfo = useCallback(
    (message, title = "Info", options = {}) => {
      return addToast(message, { ...options, type: "info", title });
    },
    [addToast],
  );

  const value = {
    addToast,
    removeToast,
    addSuccess,
    addError,
    addWarning,
    addInfo,
    toasts,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};
