import Box from "@mui/material/Box";
import Header from "../Header";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#fafaf9" }}>
      {/* Top AppBar */}
      <Header />

      {/* Body: sidebar + content */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Sidebar — sticky so it stays in view while page scrolls */}
        <Box
          component="nav"
          aria-label="Admin navigation"
          sx={{
            position: "sticky",
            top: 0,
            height: "100vh",
            alignSelf: "flex-start",
            display: { xs: "none", md: "flex" },
            flexShrink: 0,
          }}
        >
          <AdminSidebar />
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 3 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
