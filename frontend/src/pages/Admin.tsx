/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/useUserData";
import { useSongData } from "../hooks/useSongData";
import axios from "axios";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";

const API_URL = import.meta.env.VITE_API_ADMIN_URL;
const API_ADMIN_PORT = import.meta.env.VITE_API_ADMIN_PORT;

const server = API_ADMIN_PORT ? `${API_URL}:${API_ADMIN_PORT}` : API_URL;




const Admin = () => {
  const navigate = useNavigate();
  const { user } = useUserData();

  const { albums, songs, fetchAlbums, fetchSongs } = useSongData();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [songTitle, setSongTitle] = useState<string>("");
  const [songDescription, setSongDescription] = useState<string>("");
  const [album, setAlbum] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const addAlbumHandler = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/album/addAlbum`,
        formData,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      fetchAlbums();
      setBtnLoading(false);
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
      setBtnLoading(false);
    }
  };

  const addSongHandler = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append("title", songTitle);
    formData.append("description", songDescription);
    formData.append("file", file);
    formData.append("album_id", album);

    setBtnLoading(true);

    try {
      const { data } = await axios.post(`${server}/api/v1/songs/addSong`, formData, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      toast.success(data.message);
      fetchSongs();
      setBtnLoading(false);
      setSongTitle("");
      setSongDescription("");
      setFile(null);
      setAlbum("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
      setBtnLoading(false);
    }
  };

  const addThumbnailHandler = async (id: string) => {
    if (!thumbFile) return;

    const formData = new FormData();
    formData.append("file", thumbFile);

    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/songs/${id}`,
        formData,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      fetchSongs();
      setBtnLoading(false);
      setThumbFile(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
      setBtnLoading(false);
    }
  };

  const deleteAlbum = async (id: string) => {
    if (confirm("Are you sure you want to delete this album?")) {
      setBtnLoading(true);
      try {
        const { data } = await axios.delete(`${server}/api/v1/album/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchSongs();
        fetchAlbums();
        setBtnLoading(false);
      } catch (error:any) {
        toast.error(error.response?.data?.message || "An error occured");
        setBtnLoading(false);
      }
    }
  };

  const deleteSong = async (id: string) => {
    if (confirm("Are you sure you want to delete this song?")) {
      setBtnLoading(true);
      try {
        const { data } = await axios.delete(`${server}/api/v1/songs/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchSongs();
        setBtnLoading(false);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "An error occured");
        setBtnLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);
  const field = "auth-input";
  const card = "rounded-xl border border-line bg-panel p-6";
  const sectionTitle = "mb-4 text-xl font-bold tracking-tight";

  return (
    <div className="min-h-screen bg-surface px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Admin dashboard</h1>
          <Link to="/" className="chip chip-active">
            Back to home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form className={card} onSubmit={addAlbumHandler}>
            <h2 className={sectionTitle}>Add album</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Title" className={field} value={title} maxLength={255} onChange={(e) => setTitle(e.target.value)} required />
              <input type="text" placeholder="Description" className={field} value={description} maxLength={255} onChange={(e) => setDescription(e.target.value)} required />
              <label className="block text-sm text-muted">
                Cover image
                <input type="file" onChange={fileChangeHandler} className={`${field} mt-1`} accept="image/*" required />
              </label>
              <button className="auth-btn sm:w-40" disabled={btnLoading}>
                {btnLoading ? "Please wait..." : "Add album"}
              </button>
            </div>
          </form>

          <form className={card} onSubmit={addSongHandler}>
            <h2 className={sectionTitle}>Add song</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Title" className={field} value={songTitle} maxLength={255} onChange={(e) => setSongTitle(e.target.value)} required />
              <input type="text" placeholder="Description" className={field} value={songDescription} maxLength={255} onChange={(e) => setSongDescription(e.target.value)} required />
              <select className={field} value={album} onChange={(e) => setAlbum(e.target.value)} required>
                <option value="">Choose album</option>
                {albums?.map((e: any) => (
                  <option value={e.id} key={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
              <label className="block text-sm text-muted">
                Audio file
                <input type="file" onChange={fileChangeHandler} className={`${field} mt-1`} accept="audio/*" required />
              </label>
              <button className="auth-btn sm:w-40" disabled={btnLoading}>
                {btnLoading ? "Please wait..." : "Add song"}
              </button>
            </div>
          </form>
        </div>

        <section className="mt-10">
          <h2 className={sectionTitle}>Albums ({albums?.length ?? 0})</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {albums?.map((e) => (
              <div className="rounded-xl bg-panel p-3" key={e.id}>
                <img src={e.thumbnail} className="aspect-square w-full rounded-lg object-cover" alt="" />
                <h3 className="mt-3 truncate font-semibold">{e.title}</h3>
                <p className="truncate text-sm text-muted">{e.description}</p>
                <button
                  disabled={btnLoading}
                  className="mt-3 flex items-center gap-1 rounded-full bg-red-500/15 px-3 py-1 text-sm font-medium text-red-400 transition hover:bg-red-500/25 disabled:opacity-50"
                  onClick={() => deleteAlbum(e.id)}
                >
                  <MdDelete /> Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className={sectionTitle}>Songs ({songs?.length ?? 0})</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {songs?.map((e) => (
              <div className="rounded-xl bg-panel p-3" key={e.id}>
                {e.thumbnail ? (
                  <img src={e.thumbnail} className="aspect-square w-full rounded-lg object-cover" alt="" />
                ) : (
                  <div className="flex aspect-square w-full flex-col justify-center gap-2 rounded-lg border border-dashed border-line p-2 text-xs">
                    <input type="file" accept="image/*" onChange={(ev) => setThumbFile(ev.target.files?.[0] || null)} />
                    <button
                      className="chip chip-active disabled:opacity-50"
                      disabled={btnLoading || !thumbFile}
                      onClick={() => addThumbnailHandler(e.id)}
                    >
                      Add thumbnail
                    </button>
                  </div>
                )}
                <h3 className="mt-3 truncate font-semibold">{e.title}</h3>
                <p className="truncate text-sm text-muted">{e.description}</p>
                <button
                  disabled={btnLoading}
                  className="mt-3 flex items-center gap-1 rounded-full bg-red-500/15 px-3 py-1 text-sm font-medium text-red-400 transition hover:bg-red-500/25 disabled:opacity-50"
                  onClick={() => deleteSong(e.id)}
                >
                  <MdDelete /> Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
