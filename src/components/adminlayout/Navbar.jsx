import {
  Menu,
  Bell,
  Search,
  PanelLeft
} from "lucide-react";

import ProfileDropdown from "./ProfileDropdown";
import Breadcrumb from "./Breadcrumb";

const Navbar = ({ setSidebarOpen, collapsed, setCollapsed }) => {

  return (

    <header
      className="
      h-16
      flex
      items-center
      justify-between
      px-6
      border-b
      border-[var(--border-color)]
      bg-[var(--bg-surface)]
      "
    >

      {/* Left Section */}

      <div className="flex items-center gap-4">

        <button
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </button>

        <button
          className="hidden lg:block"
          onClick={() => setCollapsed(!collapsed)}
        >
          <PanelLeft />
        </button>

        <Breadcrumb />

      </div>

      {/* Right Section */}

      <div className="flex items-center gap-5">

        {/* Search */}

        {/* <div
          className="
          hidden md:flex
          items-center
          bg-[var(--bg-surface-light)]
          px-3
          py-2
          rounded
          border border-[var(--border-color)]
          "
        >

          <Search size={16} className="mr-2"/>

          <input
            placeholder="Search..."
            className="bg-transparent outline-none text-sm"
          />

        </div> */}

        {/* Notifications */}

        <button className="relative">

          <Bell size={20}/>

          <span
            className="
            absolute
            -top-1
            -right-1
            text-xs
            bg-[var(--color-primary)]
            rounded-full
            px-1
            "
          >
            3
          </span>

        </button>

        {/* Profile */}

        <ProfileDropdown/>

      </div>

    </header>
  );
};

export default Navbar;