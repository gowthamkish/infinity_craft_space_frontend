// Wrapper for Form components - maps React-Bootstrap Form to MUI components
import React from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";

/**
 * Form wrapper component
 * Maps React-Bootstrap Form to HTML form with MUI styling
 *
 * Usage:
 *   <Form onSubmit={handleSubmit}>
 *     <Form.Group>
 *       <Form.Label>Label</Form.Label>
 *       <Form.Control type="text" />
 *     </Form.Group>
 *   </Form>
 */
export default function Form({ children, ...props }) {
  return <form {...props}>{children}</form>;
}

// Form.Group subcomponent
Form.Group = function FormGroup({ controlId, className, children, ...props }) {
  return (
    <Box sx={{ mb: 2 }} className={className} {...props}>
      {children}
    </Box>
  );
};

// Form.Label subcomponent
Form.Label = function FormLabelComponent({ children, ...props }) {
  return (
    <FormLabel
      sx={{
        display: "block",
        mb: 0.5,
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "text.primary",
      }}
      {...props}
    >
      {children}
    </FormLabel>
  );
};

// Form.Control subcomponent
Form.Control = React.forwardRef(function FormControl(
  { type = "text", as, isInvalid, plaintext, size, ...props },
  ref,
) {
  // Handle textarea
  if (as === "textarea") {
    return (
      <TextField
        multiline
        rows={4}
        fullWidth
        size={size === "sm" ? "small" : "medium"}
        error={isInvalid}
        inputRef={ref}
        {...props}
      />
    );
  }

  // Handle select
  if (as === "select") {
    return (
      <FormControl fullWidth size={size === "sm" ? "small" : "medium"}>
        <Select inputRef={ref} error={isInvalid} {...props}>
          {props.children}
        </Select>
      </FormControl>
    );
  }

  // Handle plaintext
  if (plaintext) {
    return (
      <Box
        component="span"
        sx={{ display: "block", py: 1, color: "text.secondary" }}
        {...props}
      />
    );
  }

  // Default text input
  return (
    <TextField
      type={type}
      fullWidth
      size={size === "sm" ? "small" : "medium"}
      error={isInvalid}
      inputRef={ref}
      {...props}
    />
  );
});

// Form.Text subcomponent (helper text)
Form.Text = function FormText({ muted, children, ...props }) {
  return (
    <Box
      component="small"
      sx={{
        display: "block",
        mt: 0.5,
        fontSize: "0.75rem",
        color: muted ? "text.secondary" : "text.primary",
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Form.Check subcomponent (checkbox/radio)
Form.Check = React.forwardRef(function FormCheck(
  { type = "checkbox", label, id, inline, ...props },
  ref,
) {
  const InputComponent = type === "radio" ? Radio : Checkbox;

  return (
    <FormControlLabel
      control={<InputComponent inputRef={ref} {...props} />}
      label={label}
      sx={{ display: inline ? "inline-flex" : "flex", mr: inline ? 2 : 0 }}
    />
  );
});

// Form.Select subcomponent (convenience for select)
Form.Select = React.forwardRef(function FormSelect(
  { size, isInvalid, children, ...props },
  ref,
) {
  return (
    <FormControl fullWidth size={size === "sm" ? "small" : "medium"}>
      <Select inputRef={ref} error={isInvalid} {...props}>
        {children}
      </Select>
    </FormControl>
  );
});
