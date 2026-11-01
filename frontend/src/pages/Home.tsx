import AlbumCard from "../components/AlbumCard";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import SongCard from "../components/SongCard";
import { useSongData } from "../hooks/useSongData";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="mb-4 text-2xl font-bold tracking-tight">{title}</h2>
    <div className="flex gap-3 overflow-x-auto pb-2">{children}</div>
  </section>
);

const Home = () => {
  const { albums, songs, loading } = useSongData();
  return (
    <Layout>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Section title="Featured albums">
            {albums?.length ? (
              albums.map((e) => (
                <AlbumCard key={e.id} image={e.thumbnail} name={e.title} desc={e.description} id={e.id} />
              ))
            ) : (
              <p className="text-muted">No albums yet.</p>
            )}
          </Section>

          <Section title="Today's biggest hits">
            {songs?.length ? (
              songs.map((e) => (
                <SongCard key={e.id} image={e.thumbnail} name={e.title} desc={e.description} id={e.id} />
              ))
            ) : (
              <p className="text-muted">No songs yet.</p>
            )}
          </Section>
        </>
      )}
    </Layout>
  );
};

export default Home;
