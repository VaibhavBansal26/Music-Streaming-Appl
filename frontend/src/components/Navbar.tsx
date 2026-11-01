import { NavLink, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useUserData } from "../hooks/useUserData";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuth, user, logoutUser } = useUserData();

  const arrowClass =
    "flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black";

  return (
    <header className="sticky top-0 z-10 -mx-4 mb-2 px-4 pb-3 pt-1 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className={arrowClass} onClick={() => navigate(-1)} aria-label="Back">
            <FaChevronLeft size={12} />
          </button>
          <button className={arrowClass} onClick={() => navigate(1)} aria-label="Forward">
            <FaChevronRight size={12} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isAuth ? (
            <>
              <span
                title={user?.email}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-black"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </span>
              <button onClick={logoutUser} className="chip chip-active">
                Log out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/register")} className="chip hidden sm:block">
                Sign up
              </button>
              <button onClick={() => navigate("/login")} className="chip chip-active">
                Log in
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="mt-3 flex items-center gap-2 lg:hidden">
        <NavLink to="/" end className={({ isActive }) => `chip ${isActive ? "chip-active" : ""}`}>
          Home
        </NavLink>
        <NavLink to="/playlist" className={({ isActive }) => `chip ${isActive ? "chip-active" : ""}`}>
          My Playlist
        </NavLink>
        {user?.role === "admin" && (
          <NavLink to="/admin/dashboard" className="chip">
            Admin
          </NavLink>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
