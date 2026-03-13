import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../../features/auth/authSlice";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import { useLogoutUserMutation } from "../../features/auth/authApiSlice";

const ProfileDropdown = () => {

  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutUser] = useLogoutUserMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {

    await logoutUser().unwrap();

  } catch (err) {
    console.error("Logout API failed:", err);
  }

  dispatch(logout());
  navigate("/login");
};

  return (
    <>
      <div className="relative">

        <button onClick={() => setOpen(!open)}>
          <div
            className="
            w-9 h-9
            flex items-center justify-center
            rounded-full
            bg-[var(--color-primary)]
            "
          >
            <User size={16}/>
          </div>
        </button>

        {open && (

          <div
            className="
            absolute right-0 mt-2
            w-40
            bg-[var(--bg-surface)]
            border border-[var(--border-color-secondary)]
            rounded
            shadow-lg
            "
          >

            <button className="w-full px-4 py-2 hover:bg-[var(--hover-bg)] hover:text-[var(--color-primary)] flex gap-2 items-center">
              <User size={16}/> Profile
            </button>

            <button
              onClick={() => setConfirmLogout(true)}
              className="w-full px-4 py-2 hover:bg-[var(--hover-bg)] hover:text-[var(--color-primary)] flex gap-2 items-center"
            >
              <LogOut size={16}/> Logout
            </button>

          </div>

        )}

      </div>

      {/* Confirm Logout Modal */}

      {confirmLogout && (

        <ConfirmDeleteModal
          title="Logout"
          message="Are you sure you want to logout?"
           confirmText="Logout"
          onCancel={() => setConfirmLogout(false)}
          onConfirm={handleLogout}
        />

      )}

    </>
  );
};

export default ProfileDropdown;