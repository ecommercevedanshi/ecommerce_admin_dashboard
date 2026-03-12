import { useState } from "react";
import { User, LogOut } from "lucide-react";

const ProfileDropdown = () => {

  const [open, setOpen] = useState(false);

  return (

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

          <button className="w-full px-4 py-2 hover:bg-[var(--hover-bg)] hover:text-[var(--color-primary)] flex gap-2 items-center">
            <LogOut size={16}/> Logout
          </button>

        </div>

      )}

    </div>
  );
};

export default ProfileDropdown;