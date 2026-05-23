import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {
  FiShoppingBag, FiUser, FiCalendar, FiDollarSign, FiEye, FiEdit,
} from "react-icons/fi";

const OrdersCardList = ({
  filteredOrders,
  handleViewDetails,
  handleStatusUpdate,
  formatDate,
  formatCurrency,
  getStatusBadge,
}) => {
  return (
    <Box sx={{ display: { xs: "block", lg: "none" }, p: 2 }}>
      {filteredOrders?.length > 0 && filteredOrders.map((order) => (
        <Card key={order._id || order.id}
          sx={{ mb: 2, borderRadius: "12px", border: "1px solid #f1f5f9" }} elevation={1}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Order #{order.orderNumber || order._id?.slice(-6)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.items?.length || 0} items
                </Typography>
              </Box>
              {getStatusBadge(order.status)}
            </Box>

            <Stack spacing={1} sx={{ mb: 2 }}>
              {[
                { icon: <FiUser color="#10b981" />, text: order.user?.name || order.customerName || "Unknown", bold: true },
                { icon: <FiCalendar color="#f59e0b" />, text: formatDate(order.createdAt || order.orderDate) },
                { icon: <FiDollarSign color="#059669" />, text: formatCurrency(order.totalAmount || order.total), bold: true, color: "#059669" },
              ].map(({ icon, text, bold, color }, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {icon}
                  <Typography variant="body2" fontWeight={bold ? 600 : 400} sx={{ color: color || "text.primary" }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" fullWidth
                startIcon={<FiEye size={14} />}
                onClick={() => handleViewDetails(order)}
                sx={{ borderRadius: "8px", borderColor: "#e2e8f0", color: "text.secondary" }}>
                View Details
              </Button>
              <Button variant="outlined" size="small" fullWidth
                startIcon={<FiEdit size={14} />}
                onClick={() => handleStatusUpdate(order)}
                sx={{ borderRadius: "8px", borderColor: "#e2e8f0", color: "text.secondary" }}>
                Update Status
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default OrdersCardList;
