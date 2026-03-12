import { useLocation } from "react-router-dom";

const routeNames = {
  "/": "Dashboard",
  "/users": "Users",
  "/settings": "Settings",
  "/products": "Products",
};

const Breadcrumb = () => {
  const location = useLocation();

  const path = location.pathname;

  const label = routeNames[path] || "Dashboard";

  return (
    <div className="text-xl text-[var(--color-primary)] font-medium">
      {label}
    </div>
  );
};

export default Breadcrumb;