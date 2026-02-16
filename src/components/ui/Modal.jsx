// Wrapper for Modal component - maps React-Bootstrap Modal to MUI Dialog
import React from "react";
import MuiDialog from "@mui/material/Dialog";
import MuiDialogTitle from "@mui/material/DialogTitle";
import MuiDialogContent from "@mui/material/DialogContent";
import MuiDialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Modal wrapper component
 * Maps React-Bootstrap Modal to MUI Dialog
 *
 * Props mapping:
 *   show -> open
 *   onHide -> onClose
 *   size="lg" -> maxWidth="lg"
 *
 * Usage:
 *   <Modal show={show} onHide={handleClose}>
 *     <Modal.Header closeButton>
 *       <Modal.Title>Title</Modal.Title>
 *     </Modal.Header>
 *     <Modal.Body>Content</Modal.Body>
 *     <Modal.Footer>Actions</Modal.Footer>
 *   </Modal>
 */
export default function Modal({ show, onHide, size, children, ...props }) {
  const maxWidth = size || "sm";

  return (
    <MuiDialog
      open={!!show}
      onClose={onHide}
      maxWidth={maxWidth}
      fullWidth
      {...props}
    >
      {children}
    </MuiDialog>
  );
}

// Modal.Header subcomponent
Modal.Header = function ModalHeader({ closeButton, children, ...props }) {
  return (
    <MuiDialogTitle {...props}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {children}
        {closeButton && (
          <IconButton aria-label="close" onClick={props.onHide} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </div>
    </MuiDialogTitle>
  );
};

// Modal.Title subcomponent
Modal.Title = function ModalTitle({ children, ...props }) {
  return <span {...props}>{children}</span>;
};

// Modal.Body subcomponent
Modal.Body = function ModalBody({ children, ...props }) {
  return <MuiDialogContent {...props}>{children}</MuiDialogContent>;
};

// Modal.Footer subcomponent
Modal.Footer = function ModalFooter({ children, ...props }) {
  return <MuiDialogActions {...props}>{children}</MuiDialogActions>;
};
