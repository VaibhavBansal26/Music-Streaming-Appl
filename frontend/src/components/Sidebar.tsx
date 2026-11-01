import { NavLink } from "react-router-dom";
import { FaHome, FaMusic, FaUserShield } from "react-icons/fa";
import PlayListCard from "./PlayListCard";
import { useUserData } from "../hooks/useUserData";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-4 rounded-lg px-3 py-2.5 font-semibold transition ${
    isActive ? "bg-white/10 text-white" : "text-muted hover:text-white"
  }`;

const Sidebar = () => {
  const { user, isAuth } = useUserData();

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-2 lg:flex xl:w-80">
      <div className="rounded-xl bg-panel p-3">
        <div className="mb-3 flex items-center gap-2 px-3 py-2">
          <img src="/logo.png" alt="" className="h-7 w-7 rounded" />
          <span className="text-lg font-extrabold tracking-tight">Music Streaming</span>
        </div>
        <NavLink to="/" end className={linkClass}>
          <FaHome size={18} /> Home
        </NavLink>
        {user?.role === "admin" && (
          <NavLink to="/admin/dashboard" className={linkClass}>
            <FaUserShield size={18} /> Admin dashboard
          </NavLink>
        )}
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl bg-panel p-3">
        <div className="flex items-center gap-3 px-3 py-2 font-semibold text-muted">
          <FaMusic size={16} /> Your Library
        </div>
        <NavLink to="/playlist" className="block">
          <PlayListCard />
        </NavLink>

        {!isAuth && (
          <div className="mt-4 rounded-lg bg-white/5 p-4">
            <p className="font-semibold">Save your favourite songs</p>
            <p className="mt-1 text-sm text-muted">Log in to build your own playlist.</p>
            <NavLink to="/login" className="chip chip-active mt-4 inline-block">
              Log in
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
