import { FaHeart } from "react-icons/fa";
import { useUserData } from "../hooks/useUserData";

const PlayListCard = () => {
  const { user, isAuth } = useUserData();
  return (
    <div className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-linear-to-br from-indigo-500 to-emerald-400">
        <FaHeart className="text-white" />
      </div>
      <div className="min-w-0">
        <h2 className="truncate font-semibold">My Playlist</h2>
        <p className="truncate text-sm text-muted">
          Playlist • {isAuth ? user?.name : "Guest"}
        </p>
      </div>
    </div>
  );
};

export default PlayListCard;
