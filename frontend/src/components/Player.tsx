import React, { useEffect, useRef, useState } from "react";
import { useSongData } from "../hooks/useSongData";
import { GrChapterNext, GrChapterPrevious } from "react-icons/gr";
import { FaPause, FaPlay, FaVolumeUp } from "react-icons/fa";

const Player = () => {
  const {
    song,
    fetchSingleSong,
    selectedSong,
    isPlaying,
    setIsPlaying,
    prevSong,
    nextSong,
  } = useSongData();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [volume, setVolume] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const handleLoadedMetaData = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime || 0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetaData);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetaData);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [song]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const volumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const durationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setProgress(newTime);
  };

  useEffect(() => {
    fetchSingleSong();
  }, [selectedSong,fetchSingleSong]);

  const fmt = (t: number) => {
    if (!isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const sec = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const progressPct = duration ? (progress / duration) * 100 : 0;

  if (!song) return null;

  return (
    <footer className="shrink-0 border-t border-line bg-black px-4 py-3 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_2fr_1fr]">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={song.thumbnail ? song.thumbnail : "/placeholder.png"}
            className="h-12 w-12 rounded object-cover"
            alt=""
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{song.title}</p>
            <p className="hidden truncate text-xs text-muted sm:block">{song.description}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 md:order-none">
          {song.audio && (
            <audio ref={audioRef} src={song.audio} autoPlay={isPlaying} />
          )}
          <div className="flex items-center gap-5">
            <button aria-label="Previous song" className="text-muted transition hover:text-white" onClick={prevSong}>
              <GrChapterPrevious />
            </button>
            <button
              aria-label={isPlaying ? "Pause" : "Play"}
              className="rounded-full bg-white p-2.5 text-black transition hover:scale-105"
              onClick={handlePlayPause}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button aria-label="Next song" className="text-muted transition hover:text-white" onClick={nextSong}>
              <GrChapterNext />
            </button>
          </div>
          <div className="hidden w-full max-w-xl items-center gap-2 text-xs text-muted md:flex">
            <span className="w-9 text-right tabular-nums">{fmt(progress)}</span>
            <input
              aria-label="Seek"
              type="range"
              min={0}
              max={100}
              step={0.1}
              className="w-full"
              style={{ "--fill": `${progressPct}%` } as React.CSSProperties}
              value={progressPct}
              onChange={durationChange}
            />
            <span className="w-9 tabular-nums">{fmt(duration)}</span>
          </div>
        </div>

        <div className="hidden items-center justify-end gap-2 md:flex">
          <FaVolumeUp className="text-muted" />
          <input
            aria-label="Volume"
            type="range"
            className="w-28"
            min={0}
            max={100}
            step={1}
            style={{ "--fill": `${volume * 100}%` } as React.CSSProperties}
            value={volume * 100}
            onChange={volumeChange}
          />
        </div>
      </div>
    </footer>
  );
};

export default Player;
