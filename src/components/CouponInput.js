import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { FiTag, FiCheck, FiX } from "react-icons/fi";
import { couponAPI } from "../api/features";

const CouponInput = ({ cartTotal, onCouponApplied, appliedCoupon = null, onRemoveCoupon }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState(appliedCoupon);
  const [error, setError] = useState(null);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError("Please enter a coupon code"); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await couponAPI.validate(code.toUpperCase(), cartTotal);
      if (result.success) {
        setValidatedCoupon(result.data);
        setCode("");
        if (onCouponApplied) onCouponApplied(result.data);
      } else {
        setError(result.error || "Invalid coupon code");
        setValidatedCoupon(null);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setValidatedCoupon(null);
    setCode("");
    setError(null);
    if (onRemoveCoupon) onRemoveCoupon();
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 1.25 }}>
        Have a coupon?
      </Typography>

      {validatedCoupon ? (
        <Alert
          severity="success"
          icon={<FiCheck size={16} />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<FiX size={13} />}
              onClick={handleRemove}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}
            >
              Remove
            </Button>
          }
          sx={{ borderRadius: 2, py: 0.75 }}
        >
          <Typography variant="body2" fontWeight={700}>
            {validatedCoupon.code}
          </Typography>
          <Typography variant="caption" color="success.dark">
            −₹{validatedCoupon.discount?.toFixed(2)} discount applied
          </Typography>
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleValidate} noValidate>
          <Stack direction="row" spacing={1}>
            <TextField
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
              placeholder="Enter coupon code"
              size="small"
              fullWidth
              disabled={loading}
              error={!!error}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiTag size={15} color="#8B1A4A" />
                    </InputAdornment>
                  ),
                  style: { letterSpacing: "0.08em", fontWeight: 600 },
                },
              }}
              aria-label="Coupon code"
            />
            <Button
              type="submit"
              variant="outlined"
              disabled={loading || !code.trim()}
              sx={{
                minWidth: 72,
                flexShrink: 0,
                fontWeight: 700,
                fontSize: "0.8125rem",
              }}
            >
              {loading ? <CircularProgress size={16} color="inherit" /> : "Apply"}
            </Button>
          </Stack>

          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 0.75, display: "block" }}>
              {error}
            </Typography>
          )}
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        💡 Check your email for exclusive discount codes
      </Typography>
    </Box>
  );
};

export default CouponInput;
