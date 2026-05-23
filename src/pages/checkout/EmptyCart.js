import { Box, Typography, Button } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const EmptyCart = ({ navigate }) => (
  <Box
    sx={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      px: 2,
    }}
  >
    <Box sx={{ textAlign: "center", maxWidth: 440 }}>
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #fdf2f6, #fdf6ec)",
          border: "2px solid #f0e8e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <ShoppingBagOutlinedIcon sx={{ fontSize: 48, color: "#8B1A4A" }} />
      </Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1, color: "#1c1917" }}>
        Your Cart is Empty
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.7 }}>
        Looks like you haven't added any items yet. Discover our beautiful handcrafted collection!
      </Typography>
      <Button
        variant="contained"
        size="large"
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate("/products")}
        sx={{
          py: 1.5,
          px: 4,
          fontWeight: 700,
          borderRadius: 2,
          background: "linear-gradient(135deg, #8B1A4A, #7a1640)",
          boxShadow: "0 4px 14px rgba(139,26,74,0.35)",
          "&:hover": { background: "linear-gradient(135deg, #7a1640, #6b1236)" },
        }}
      >
        Start Shopping
      </Button>
    </Box>
  </Box>
);
