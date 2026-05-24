import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import { DotsLoader } from "../Loader";
import {
  FiShoppingBag, FiUser, FiCalendar, FiDollarSign,
  FiPackage, FiEdit, FiX, FiCheck,
} from "react-icons/fi";

const STATUS_OPTIONS = [
  { value: "pending",    label: "📋 Pending — Order received, awaiting confirmation" },
  { value: "confirmed",  label: "✅ Confirmed — Order confirmed and being prepared" },
  { value: "processing", label: "📦 Processing — Order is being processed" },
  { value: "shipped",    label: "🚚 Shipped — Order has been shipped" },
  { value: "delivered",  label: "🎉 Delivered — Order successfully delivered" },
  { value: "cancelled",  label: "❌ Cancelled — Order has been cancelled" },
];

const StatusUpdateModal = ({
  show, onHide, selectedOrder, newStatus, setNewStatus,
  confirmStatusUpdate, updating, getStatusBadge, formatDate, formatCurrency,
}) => {
  return (
    <Dialog open={show} onClose={onHide} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, #8B1A4A 0%, #6b1238 100%)", color: "white", py: 1.5, px: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ background: "rgba(255,255,255,0.15)", borderRadius: 1, p: 0.75, display: "flex" }}>
            <FiEdit size={16} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>Update Order Status</Typography>
        </Box>
        <IconButton onClick={onHide} size="small" sx={{ color: "white" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, background: "#f8fafc" }}>
        {/* Order summary card */}
        <Card sx={{ mb: 2, border: "1px solid #e2e8f0" }} elevation={0}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Box sx={{ width: 45, height: 45, background: "rgba(139,26,74,0.1)", borderRadius: "50%",
                border: "2px solid rgba(139,26,74,0.3)", display: "flex", alignItems: "center",
                justifyContent: "center", mx: "auto", mb: 1 }}>
              <FiShoppingBag size={20} style={{ color: "#8B1A4A" }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              Order #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}
            </Typography>
            <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary">Current Status:</Typography>
              {getStatusBadge(selectedOrder?.status)}
            </Box>

            {selectedOrder && (
              <Grid container spacing={1} sx={{ mt: 1.5, background: "#f1f5f9",
                  borderRadius: 1.5, p: 1, border: "1px solid #e2e8f0" }}>
                {[
                  { icon: <FiUser size={14} style={{ color: "#10b981" }} />, label: "Customer",
                    value: selectedOrder.userId?.username || selectedOrder.customerName || "Unknown" },
                  { icon: <FiCalendar size={14} style={{ color: "#f59e0b" }} />, label: "Date",
                    value: formatDate(selectedOrder.createdAt || selectedOrder.orderDate)?.split(",")[0] },
                  { icon: <FiDollarSign size={14} style={{ color: "#059669" }} />, label: "Amount",
                    value: formatCurrency(selectedOrder.totalAmount || selectedOrder.total), green: true },
                ].map(({ icon, label, value, green }) => (
                  <Grid item xs={4} key={label} sx={{ textAlign: "center" }}>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>{icon}</Box>
                    <Typography variant="caption" display="block" color="text.secondary">{label}</Typography>
                    <Typography variant="caption" fontWeight={700} color={green ? "#059669" : "text.primary"}>
                      {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Status selector card */}
        <Card sx={{ border: "1px solid #e2e8f0", overflow: "hidden" }} elevation={0}>
          <Box sx={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              color: "white", px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FiEdit size={14} /> Select New Status
            </Typography>
          </Box>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Choose the new status for this order:
            </Typography>
            <TextField
              select fullWidth size="small"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><FiPackage size={14} color="#94a3b8" /></InputAdornment>
                  ),
                },
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              {STATUS_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </TextField>

            {newStatus && (
              <Box sx={{ mt: 1.5, p: 1.5, background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  borderRadius: 1.5, border: "1px solid #bbf7d0", display: "flex",
                  alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="caption" color="#166534" fontWeight={500}>Preview of new status:</Typography>
                {getStatusBadge(newStatus)}
              </Box>
            )}
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", px: 2.5, py: 1.5, gap: 1 }}>
        <Button variant="outlined" onClick={onHide} startIcon={<FiX size={14} />}
          sx={{ flex: 1, borderColor: "#e2e8f0", color: "text.secondary", borderRadius: 2 }}>
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={confirmStatusUpdate}
          disabled={updating || !newStatus || newStatus === selectedOrder?.status}
          startIcon={updating ? null : <FiCheck size={14} />}
          sx={{ flex: 2, borderRadius: 2 }}>
          {updating ? <><DotsLoader size="sm" /> Updating…</> :
            newStatus === selectedOrder?.status ? "No Changes" : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateModal;
