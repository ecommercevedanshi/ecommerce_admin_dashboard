import {
  LayoutDashboard,
  Users,
  Settings,
  ShoppingBag,
  X,
  Package,
  Tag,
  FileText,
  ListTree,
  Images,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "Users",
    icon: Users,
    path: "/users",
  },
  {
    name: "Media",
    icon: Images,
    path: "/media",
  },
  {
    name: "Categories",
    icon: ListTree,
    path: "/categories",
  },
  {
    name: "Products",
    icon: ShoppingBag,
    path: "/products",
  },
  {
    name: "Orders",
    icon: Package,
    path: "/orders",
  },
  {
    name: "Coupons",
    icon: Tag,
    path: "/coupons",
  },
  {
    name: "CMS",
    icon: FileText,
    path: "/cms",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, collapsed }) => {
  return (
    <aside
      className={`
      bg-[var(--bg-surface)]
      border-r border-[var(--border-color)]
      transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0
      fixed lg:relative
      h-full
      z-40
      `}
    >
      {/* Logo */}

      <div
        className="
  h-16
  flex
  items-center
  justify-between
  px-5
  border-b
  border-[var(--border-color)]
  "
      >
        {/* Logo */}

        {!collapsed ? (
          <div className="leading-none">
            <div
              className="text-[26px] text-[var(--color-primary)]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              Jaimax
            </div>

            <div
              className="text-[11px] tracking-[0.35em] text-[var(--text-secondary)]"
              style={{
                fontFamily: "var(--font-brand-secondary)",
                marginTop: "-2px",
                marginLeft: "32px",
              }}
            >
              Clothing
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span
              className="text-[24px] text-[var(--color-primary)]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              V
            </span>

            <span
              className="text-[18px] text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-brand-secondary)" }}
            >
              C
            </span>
          </div>
        )}

        {/* Close button (mobile only) */}

        <button
          className="lg:hidden text-[var(--text-secondary)] hover:text-white transition"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Menu */}

      <nav className="p-3 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center
gap-3
px-4
py-3
rounded-lg
transition-all
duration-200
hover:translate-x-1
                ${
                  isActive
                    ? "bg-[var(--hover-primary)] text-[var(--color-primary)] border-l-2 border-[var(--color-primary)]"
                    : "hover:bg-[var(--hover-bg)]"
                }
                `
              }
            >
              <Icon size={20} />

              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
