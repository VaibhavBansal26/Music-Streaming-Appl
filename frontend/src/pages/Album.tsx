import { useParams } from "react-router-dom";
import { useEffect } from "react";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import SongTable from "../components/SongTable";
import { useSongData } from "../hooks/useSongData";

const Album = () => {
  const { fetchAlbumsongs, albumSong, albumData, loading } = useSongData();
  const params = useParams<{ id: string }>();

  useEffect(() => {
    if (params.id) {
      fetchAlbumsongs(params.id);
    }
  }, [params.id, fetchAlbumsongs]);

  return (
    <Layout>
      {loading || !albumData ? (
        <Loading />
      ) : (
        <>
          <PageHeader
            image={albumData.thumbnail}
            eyebrow="Album"
            title={albumData.title}
            subtitle={`${albumData.description} • ${albumSong?.length ?? 0} songs`}
          />
          <SongTable songs={albumSong ?? []} emptyMessage="No songs in this album yet." />
        </>
      )}
    </Layout>
  );
};

export default Album;
