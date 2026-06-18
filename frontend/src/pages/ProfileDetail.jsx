import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function ProfileDetail() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const resp = await api.get(`/api/users/${username}/`);
      setData(resp);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-[4px] border-ink border-t-marker rounded-full animate-spin"></div>
    </div>
  );
  if (!data) return <div className="text-center font-kalam text-4xl mt-12">Profile not found.</div>;

  const { profile, memorials, tales } = data;

  return (
    <div className="flex flex-col gap-12 max-w-4xl mx-auto">
      
      {/* Header Profile Card */}
      <div className="paper-card p-12 text-center bg-postit tack-decoration rotate-1">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={username} className="w-32 h-32 border-[4px] border-ink wobbly-sm object-cover mx-auto mb-6 -rotate-2" />
        ) : (
          <div className="w-32 h-32 border-[4px] border-ink wobbly-sm bg-white mx-auto mb-6 flex items-center justify-center font-kalam text-6xl rotate-2">
            {username[0].toUpperCase()}
          </div>
        )}
        <h1 className="font-kalam text-6xl mb-2 decoration-wavy underline">{profile.display_name || username}</h1>
        <p className="font-patrick text-2xl font-bold mb-6">@{username}</p>
        <p className="font-patrick text-xl max-w-lg mx-auto bg-white p-4 border-[3px] border-dashed border-ink -rotate-1">
          {profile.bio || "This user hasn't sketched out a bio yet."}
        </p>
        
        {profile.tags_list && profile.tags_list.length > 0 && (
          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            {profile.tags_list.map(t => (
              <span key={t} className="bg-marker text-white font-patrick font-bold px-3 py-1 border-[2px] border-ink wobbly-sm text-lg rotate-2">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        
        {/* Memorials */}
        <section>
          <h2 className="font-kalam text-4xl mb-6 border-b-[3px] border-ink pb-2 inline-block">Memorials ({memorials.length})</h2>
          <div className="flex flex-col gap-6">
            {memorials.map((m, idx) => (
              <Link to={`/memorial/${m.id}`} key={m.id} className="group">
                <div className={`paper-card p-6 bg-white ${idx % 2 === 0 ? '-rotate-1 tape-decoration' : 'rotate-2'} group-hover:rotate-0 transition-transform`}>
                  <h3 className="font-kalam text-3xl mb-2 group-hover:underline decoration-wavy">{m.full_name}</h3>
                  <p className="font-patrick text-lg mb-4">
                    {m.birth_date && new Date(m.birth_date).getFullYear()} — {m.passing_date && new Date(m.passing_date).getFullYear()}
                  </p>
                  <div className="flex gap-4 font-patrick text-lg font-bold border-t-[3px] border-dashed border-ink/20 pt-4">
                    <span>🕯️ {m.candle_count}</span>
                    <span>💬 {m.message_count}</span>
                  </div>
                </div>
              </Link>
            ))}
            {memorials.length === 0 && <p className="font-patrick text-xl italic bg-erased p-4 border-[3px] border-ink wobbly-sm">No memorials sketched.</p>}
          </div>
        </section>

        {/* Tales */}
        <section>
          <h2 className="font-kalam text-4xl mb-6 border-b-[3px] border-ink pb-2 inline-block">Tales ({tales.length})</h2>
          <div className="flex flex-col gap-6">
            {tales.map((t, idx) => (
              <Link to={`/tales/${t.slug}`} key={t.id} className="group">
                <div className={`paper-card p-6 bg-white flex justify-between items-center ${idx % 2 !== 0 ? '-rotate-2' : 'rotate-1 tack-decoration'} group-hover:rotate-0 transition-transform`}>
                  <div>
                    <h3 className="font-kalam text-3xl mb-2 group-hover:underline decoration-wavy">{t.title}</h3>
                    <p className="font-patrick text-xl font-bold">{t.chapter_count} chapters</p>
                  </div>
                  <span className="text-4xl">📖</span>
                </div>
              </Link>
            ))}
            {tales.length === 0 && <p className="font-patrick text-xl italic bg-erased p-4 border-[3px] border-ink wobbly-sm">No tales drafted.</p>}
          </div>
        </section>

      </div>
    </div>
  );
}
