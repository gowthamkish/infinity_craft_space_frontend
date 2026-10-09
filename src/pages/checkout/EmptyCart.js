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
          background: "linear-gradient(135deg, #fff3ee, #f7f4ee)",
          border: "2px solid #f0e8e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <ShoppingBagOutlinedIcon sx={{ fontSize: 48, color: "#d24e33" }} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: "#1c1917" }}>
        Your Cart is Empty
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3.5, lineHeight: 1.7 }}>
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
          background: "linear-gradient(135deg, #d24e33, #7a1640)",
          boxShadow: "0 4px 14px rgba(210, 78, 51,0.35)",
          "&:hover": { background: "linear-gradient(135deg, #7a1640, #6b1236)" },
        }}
      >
        Start Shopping
      </Button>
    </Box>
  </Box>
);
