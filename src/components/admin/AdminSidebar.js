import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiPlusSquare,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiBarChart2,
  FiBell,
} from "react-icons/fi";

const NAV_ITEMS = [
  {
    section: "Overview",
    links: [
      { label: "Dashboard",   icon: FiGrid,        to: "/admin/dashboard" },
      { label: "Analytics",   icon: FiBarChart2,    to: "/admin/analytics"  },
    ],
  },
  {
    section: "Catalog",
    links: [
      { label: "Products",    icon: FiPackage,     to: "/admin/products"    },
      { label: "Add Product", icon: FiPlusSquare,  to: "/admin/addProduct"  },
      { label: "Categories",  icon: FiTag,         to: "/admin/categories"  },
    ],
  },
  {
    section: "Commerce",
    links: [
      { label: "Orders",        icon: FiShoppingBag, to: "/admin/orders"       },
      { label: "Users",         icon: FiUsers,       to: "/admin/users"        },
      { label: "Notifications", icon: FiBell,        to: "/admin/notifications"},
    ],
  },
];

export default function AdminSidebar() {
  return (
    <aside className="adm-sidebar">
      {NAV_ITEMS.map(({ section, links }) => (
        <div key={section} className="adm-sidebar-section">
          <p className="adm-sidebar-section-label">{section}</p>
          {links.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin/dashboard"}
              className={({ isActive }) =>
                `adm-sidebar-link${isActive ? " active" : ""}`
              }
            >
              <Icon size={16} className="adm-sidebar-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}
