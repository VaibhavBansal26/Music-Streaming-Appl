import React from "react";
import { FaBookmark, FaPlay, FaRegBookmark } from "react-icons/fa";
import { useUserData } from "../hooks/useUserData";
import { useSongData } from "../hooks/useSongData";

interface SongCardProps {
  image: string;
  name: string;
  desc: string;
  id: string;
}

const SongCard: React.FC<SongCardProps> = ({ image, name, desc, id }) => {
  const { addToPlaylist, isAuth, user } = useUserData();
  const { setSelectedSong, setIsPlaying } = useSongData();
  const saved = user?.playlists?.includes(String(id));

  return (
    <div className="group w-40 shrink-0 rounded-xl bg-white/5 p-3 transition hover:bg-white/10 sm:w-44">
      <div className="relative">
        <img
          src={image || "/download.jpeg"}
          className="aspect-square w-full rounded-lg object-cover shadow-lg"
          alt=""
        />
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 transition duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
          {isAuth && (
            <button
              aria-label={saved ? "Remove from playlist" : "Add to playlist"}
              className="rounded-full bg-black/70 p-2.5 text-white transition hover:scale-105"
              onClick={() => addToPlaylist(id)}
            >
              {saved ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          )}
          <button
            aria-label={`Play ${name}`}
            className="rounded-full bg-accent p-3 text-black shadow-lg transition hover:scale-105"
            onClick={() => {
              setSelectedSong(id);
              setIsPlaying(true);
            }}
          >
            <FaPlay />
          </button>
        </div>
      </div>
      <p className="mt-3 truncate font-semibold">{name}</p>
      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{desc}</p>
    </div>
  );
};

export default SongCard;
