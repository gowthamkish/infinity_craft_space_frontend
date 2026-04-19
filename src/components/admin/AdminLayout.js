import Header from "../Header";
import "./admin.css";

export default function AdminLayout({ children }) {
  return (
    <div style={{ background: "var(--adm-bg)", minHeight: "100vh" }}>
      <Header />
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "calc(var(--adm-navbar-h) + 1.75rem) 1.5rem 3rem",
        }}
      >
        {children}
      </div>
    </div>
  );
}
