import React from "react";
import { useNavigate } from "react-router-dom";

interface AlbumCardProps {
  image: string;
  name: string;
  desc: string;
  id: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ image, name, desc, id }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/album/" + id)}
      className="group w-40 shrink-0 rounded-xl bg-white/5 p-3 text-left transition hover:bg-white/10 sm:w-44"
    >
      <img
        src={image || "/download.jpeg"}
        className="aspect-square w-full rounded-lg object-cover shadow-lg transition group-hover:scale-[1.02]"
        alt=""
      />
      <p className="mt-3 truncate font-semibold">{name}</p>
      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{desc}</p>
    </button>
  );
};

export default AlbumCard;
