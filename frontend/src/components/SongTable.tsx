import React from "react";
import { FaBookmark, FaPlay, FaRegBookmark } from "react-icons/fa";
import { Song } from "../context/SongContext";
import { useUserData } from "../hooks/useUserData";
import { useSongData } from "../hooks/useSongData";

interface SongTableProps {
  songs: Song[];
  emptyMessage: string;
}

const SongTable: React.FC<SongTableProps> = ({ songs, emptyMessage }) => {
  const { isAuth, addToPlaylist, user } = useUserData();
  const { setSelectedSong, setIsPlaying, selectedSong, isPlaying } = useSongData();

  if (songs.length === 0) {
    return <p className="mt-12 text-center text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-[2rem_1fr_auto] gap-3 border-b border-line px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted sm:grid-cols-[2rem_1.5fr_2fr_auto]">
        <span>#</span>
        <span>Title</span>
        <span className="hidden sm:block">Description</span>
        <span className="text-right">Actions</span>
      </div>

      {songs.map((song, index) => {
        const current = String(selectedSong) === String(song.id);
        const saved = user?.playlists?.includes(String(song.id));
        return (
          <div
            key={song.id}
            className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/10 sm:grid-cols-[2rem_1.5fr_2fr_auto]"
          >
            <span className={`text-sm tabular-nums ${current ? "text-accent" : "text-muted"}`}>
              {current && isPlaying ? "♪" : index + 1}
            </span>
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={song.thumbnail || "/placeholder.png"}
                className="h-10 w-10 rounded object-cover"
                alt=""
              />
              <span className={`truncate font-medium ${current ? "text-accent" : ""}`}>{song.title}</span>
            </div>
            <span className="hidden truncate text-sm text-muted sm:block">{song.description}</span>
            <div className="flex items-center justify-end gap-4">
              {isAuth && (
                <button
                  aria-label={saved ? "Remove from playlist" : "Add to playlist"}
                  className="text-muted transition hover:text-white"
                  onClick={() => addToPlaylist(song.id)}
                >
                  {saved ? <FaBookmark className="text-accent" /> : <FaRegBookmark />}
                </button>
              )}
              <button
                aria-label={`Play ${song.title}`}
                className="rounded-full bg-accent p-2 text-black transition hover:scale-105"
                onClick={() => {
                  setSelectedSong(song.id);
                  setIsPlaying(true);
                }}
              >
                <FaPlay size={11} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SongTable;
