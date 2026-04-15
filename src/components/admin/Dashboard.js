import { OrbitLoader } from "../../components/Loader";
import {
  FiUsers, FiPackage, FiTrendingUp, FiPlus, FiBarChart2,
  FiShoppingCart, FiTag, FiPieChart,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { useDashboardCounts } from "../../hooks/useSmartFetch";
import SEOHead, { SEO_CONFIG } from "../SEOHead";
import "./admin.css";

const STAT_CARDS = [
  { key: "userCount",    label: "Total Users",    hint: "Registered accounts", icon: FiUsers,       cls: "admin-stat-card--blue",   path: "/admin/users"     },
  { key: "productCount", label: "Total Products", hint: "Active listings",     icon: FiPackage,     cls: "admin-stat-card--green",  path: "/admin/products"  },
  { key: "orderCount",   label: "Total Orders",   hint: "All time orders",     icon: FiShoppingCart,cls: "admin-stat-card--amber",  path: "/admin/orders"    },
];

const QUICK_ACTIONS = [
  { label: "Add Product",         icon: FiPlus,         path: "/admin/addProduct" },
  { label: "Manage Users",        icon: FiUsers,         path: "/admin/users"      },
  { label: "View Orders",         icon: FiShoppingCart,  path: "/admin/orders"     },
  { label: "Manage Categories",   icon: FiTag,           path: "/admin/categories" },
  { label: "View Analytics",      icon: FiBarChart2,     path: "/admin/analytics"  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: counts, loading } = useDashboardCounts();

  return (
    <>
      <SEOHead
        title={`Admin Dashboard - ${SEO_CONFIG.SITE_NAME}`}
        description="Administrative dashboard for managing craft supplies store."
        noindex={true}
        nofollow={true}
        canonical={`${SEO_CONFIG.SITE_URL}/admin/dashboard`}
      />
      <div className="admin-page">
        <Header />
        <div className="admin-container">
          {/* Page Header */}
          <div className="admin-header">
            <div>
              <h1 className="admin-header-title">
                <FiBarChart2 size={28} style={{ color: "var(--primary)" }} />
                Admin Dashboard
              </h1>
              <p className="admin-header-sub">Welcome back — manage your store from here.</p>
            </div>
            <span className="admin-online-badge">Live</span>
          </div>

          {loading ? (
            <div className="admin-loading">
              <OrbitLoader size="lg" />
              <span>Loading dashboard data…</span>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="admin-stat-grid">
                {STAT_CARDS.map(({ key, label, hint, icon: Icon, cls, path }) => (
                  <div
                    key={key}
                    className={`admin-stat-card card ${cls}`}
                    onClick={() => navigate(path)}
                    role="button"
                    aria-label={`Navigate to ${label}`}
                  >
                    <div className="admin-stat-body card-body">
                      <div className="admin-stat-icon-row">
                        <div className="admin-stat-icon"><Icon size={26} /></div>
                        <FiTrendingUp size={18} className="admin-stat-trend" />
                      </div>
                      <p className="admin-stat-value">{counts?.[key] ?? 0}</p>
                      <p className="admin-stat-label">{label}</p>
                      <p className="admin-stat-hint">{hint}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="admin-section-card card">
                <div className="admin-section-header">
                  <h2 className="admin-section-title">Quick Actions</h2>
                </div>
                <div className="admin-section-body card-body">
                  <div className="admin-actions-grid">
                    {QUICK_ACTIONS.map(({ label, icon: Icon, path }) => (
                      <button
                        key={label}
                        className="admin-action-btn"
                        onClick={() => navigate(path)}
                      >
                        <Icon size={17} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
