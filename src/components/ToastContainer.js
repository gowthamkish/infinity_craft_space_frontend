import React from "react";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
} from "react-icons/fi";
import "../styles/toastNotifications.css";

const getToastIcon = (type) => {
  const iconProps = { size: 20 };
  switch (type) {
    case "success":
      return <FiCheckCircle {...iconProps} />;
    case "error":
      return <FiAlertCircle {...iconProps} />;
    case "warning":
      return <FiAlertTriangle {...iconProps} />;
    case "info":
    default:
      return <FiInfo {...iconProps} />;
  }
};

const Toast = ({ toast, onClose }) => {
  return (
    <div
      className={`toast ${toast.type} ${toast.isExiting ? "exiting" : ""}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="toast-icon">{getToastIcon(toast.type)}</div>

      <div className="toast-content">
        {toast.title && <p className="toast-title">{toast.title}</p>}
        {toast.message && <p className="toast-message">{toast.message}</p>}
      </div>

      <button
        className="toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
        type="button"
      >
        <FiX size={18} />
      </button>

      {toast.duration > 0 && (
        <div
          className="toast-progress"
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
};

const ToastContainer = ({ toasts, onClose, position = "top-right" }) => {
  const positionClass = position.includes("left") ? "left" : "";
  const centerClass = position.includes("center") ? "center" : "";

  return (
    <div className={`toast-container ${positionClass} ${centerClass}`}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default ToastContainer;
