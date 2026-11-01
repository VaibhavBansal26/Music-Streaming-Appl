import { useMemo } from "react";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import SongTable from "../components/SongTable";
import { useUserData } from "../hooks/useUserData";
import { useSongData } from "../hooks/useSongData";

const PlayList = () => {
  const { songs, loading } = useSongData();
  const { user } = useUserData();

  const myPlayList = useMemo(
    () => (songs ?? []).filter((song) => user?.playlists?.includes(String(song.id))),
    [songs, user]
  );

  return (
    <Layout>
      {loading ? (
        <Loading />
      ) : (
        <>
          <PageHeader
            eyebrow="Playlist"
            title={`${user?.name ?? "My"}'s Playlist`}
            subtitle={`Your favourite songs • ${myPlayList.length} saved`}
          />
          <SongTable
            songs={myPlayList}
            emptyMessage="Nothing saved yet. Tap the bookmark on any song to add it here."
          />
        </>
      )}
    </Layout>
  );
};

export default PlayList;
