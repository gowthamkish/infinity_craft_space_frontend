// Wrapper for Card component - maps React-Bootstrap Card to MUI Card
import React from "react";
import MuiCard from "@mui/material/Card";
import MuiCardContent from "@mui/material/CardContent";
import MuiCardHeader from "@mui/material/CardHeader";
import MuiCardActions from "@mui/material/CardActions";
import MuiCardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

/**
 * Card wrapper component
 * Maps React-Bootstrap Card to MUI Card
 *
 * Usage:
 *   <Card>
 *     <Card.Header>Title</Card.Header>
 *     <Card.Body>Content</Card.Body>
 *   </Card>
 */
export default function Card({ children, className, style, ...props }) {
  return (
    <MuiCard className={className} style={style} {...props}>
      {children}
    </MuiCard>
  );
}

// Card.Header subcomponent
Card.Header = function CardHeader({ children, className, style, ...props }) {
  // Check if children is a string or simple element
  const title =
    typeof children === "string" ? (
      <Typography variant="h6" component="div">
        {children}
      </Typography>
    ) : (
      children
    );

  return (
    <MuiCardHeader
      title={title}
      className={className}
      style={style}
      {...props}
    />
  );
};

// Card.Body subcomponent
Card.Body = function CardBody({ children, className, style, ...props }) {
  return (
    <MuiCardContent className={className} style={style} {...props}>
      {children}
    </MuiCardContent>
  );
};

// Card.Footer subcomponent (maps to CardActions)
Card.Footer = function CardFooter({ children, className, style, ...props }) {
  return (
    <MuiCardActions className={className} style={style} {...props}>
      {children}
    </MuiCardActions>
  );
};

// Card.Img subcomponent (maps to CardMedia)
Card.Img = function CardImg({
  variant,
  src,
  alt,
  className,
  style,
  loading,
  onError,
  ...props
}) {
  const isTop = variant === "top";

  return (
    <MuiCardMedia
      component="img"
      image={src}
      alt={alt || "Card image"}
      className={className}
      style={style}
      loading={loading}
      onError={onError}
      {...props}
    />
  );
};

// Card.Title subcomponent
Card.Title = function CardTitle({ children, className, style, ...props }) {
  return (
    <Typography
      variant="h6"
      component="div"
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
};

// Card.Text subcomponent
Card.Text = function CardText({ children, className, style, ...props }) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Typography>
  );
};
