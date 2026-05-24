import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import {
  FiShoppingBag,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiEdit,
} from "react-icons/fi";

const OrdersTable = ({
  filteredOrders,
  handleViewDetails,
  handleStatusUpdate,
  formatDate,
  formatCurrency,
  getStatusBadge,
}) => {
  return (
    <Box sx={{ display: { xs: "none", lg: "block" } }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
            {[
              { icon: <FiShoppingBag style={{ color: "#8B1A4A" }} />, label: "Order" },
              { icon: <FiUser style={{ color: "#10b981" }} />, label: "Customer" },
              { icon: <FiCalendar style={{ color: "#f59e0b" }} />, label: "Date" },
              { icon: <FiDollarSign style={{ color: "#059669" }} />, label: "Amount" },
              { label: "Status" },
              { label: "Actions", align: "center" },
            ].map(({ icon, label, align }) => (
              <TableCell key={label} align={align || "left"}
                sx={{ fontWeight: 700, color: "#475569", fontSize: "0.8rem",
                  textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {icon && <Box component="span" sx={{ mr: 0.75, verticalAlign: "middle" }}>{icon}</Box>}
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredOrders?.length > 0 && filteredOrders.map((order) => (
            <TableRow key={order._id || order.id}
              sx={{ "&:hover": { backgroundColor: "#faf5ff" }, transition: "background 150ms" }}>
              <TableCell>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  #{order.orderNumber || order._id?.slice(-6)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.items?.length || 0} items
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  {order.userId?.username || order.customerName || "Unknown"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.user?.email || order.customerEmail}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(order.createdAt || order.orderDate)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={700} sx={{ color: "#059669", fontSize: "1rem" }}>
                  {formatCurrency(order.totalAmount || order.total)}
                </Typography>
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={0.75} justifyContent="center">
                  <button className="adm-btn adm-btn-secondary adm-btn-sm"
                    onClick={() => handleViewDetails(order)}>
                    <FiEye size={12} style={{ marginRight: 4 }} /> View
                  </button>
                  <button className="adm-btn adm-btn-secondary adm-btn-sm"
                    onClick={() => handleStatusUpdate(order)}>
                    <FiEdit size={12} style={{ marginRight: 4 }} /> Update
                  </button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default OrdersTable;
