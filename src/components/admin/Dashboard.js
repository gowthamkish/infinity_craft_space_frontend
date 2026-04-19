import { OrbitLoader } from "../../components/Loader";
import {
  FiUsers, FiPackage, FiTrendingUp, FiPlus, FiBarChart2,
  FiShoppingCart, FiTag,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { useDashboardCounts } from "../../hooks/useSmartFetch";
import SEOHead, { SEO_CONFIG } from "../SEOHead";
import "./admin.css";

const STAT_CARDS = [
  { key: "userCount",    label: "Total Users",    hint: "Registered accounts", icon: FiUsers,        cls: "adm-stat--blue",   path: "/admin/users"    },
  { key: "productCount", label: "Total Products", hint: "Active listings",     icon: FiPackage,      cls: "adm-stat--green",  path: "/admin/products" },
  { key: "orderCount",   label: "Total Orders",   hint: "All-time orders",     icon: FiShoppingCart, cls: "adm-stat--amber",  path: "/admin/orders"   },
];

const QUICK_ACTIONS = [
  { label: "Add Product",       icon: FiPlus,         path: "/admin/addProduct" },
  { label: "Manage Users",      icon: FiUsers,        path: "/admin/users"      },
  { label: "View Orders",       icon: FiShoppingCart, path: "/admin/orders"     },
  { label: "Manage Categories", icon: FiTag,          path: "/admin/categories" },
  { label: "View Analytics",    icon: FiBarChart2,    path: "/admin/analytics"  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: counts, loading } = useDashboardCounts();

  return (
    <>
      <SEOHead
        title={`Admin Dashboard · ${SEO_CONFIG.SITE_NAME}`}
        description="Administrative dashboard for managing craft supplies store."
        noindex={true}
        nofollow={true}
        canonical={`${SEO_CONFIG.SITE_URL}/admin/dashboard`}
      />

      <AdminLayout>
        {/* Page header */}
        <div className="adm-page-header">
          <div>
            <h1 className="adm-page-title">
              <FiBarChart2 size={24} style={{ color: "var(--adm-primary)" }} />
              Dashboard
            </h1>
            <p className="adm-page-sub">Welcome back — manage your store from here.</p>
          </div>
          <span className="adm-online-badge">Live</span>
        </div>

        {loading ? (
          <div className="adm-loading">
            <OrbitLoader size="lg" />
            <span>Loading dashboard data…</span>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="adm-stat-grid">
              {STAT_CARDS.map(({ key, label, hint, icon: Icon, cls, path }) => (
                <div
                  key={key}
                  className={`adm-stat-card card ${cls}`}
                  onClick={() => navigate(path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(path)}
                  aria-label={`Navigate to ${label}`}
                >
                  <div className="adm-stat-body card-body">
                    <div className="adm-stat-icon-row">
                      <div className="adm-stat-icon"><Icon size={24} /></div>
                      <FiTrendingUp size={16} style={{ opacity: 0.65 }} />
                    </div>
                    <p className="adm-stat-value">{counts?.[key] ?? 0}</p>
                    <p className="adm-stat-label">{label}</p>
                    <p className="adm-stat-hint">{hint}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="adm-card">
              <div className="adm-card-header">
                <h2 className="adm-card-title">Quick Actions</h2>
              </div>
              <div className="adm-card-body">
                <div className="adm-actions-grid">
                  {QUICK_ACTIONS.map(({ label, icon: Icon, path }) => (
                    <button
                      key={label}
                      className="adm-action-btn"
                      onClick={() => navigate(path)}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
}
