import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function CommunityList() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const data = await api.get('/api/communities/');
      setCommunities(data.results || data);
    } catch {
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-[3px] border-dashed border-ink pb-8">
        <div>
          <h1 className="font-kalam text-5xl mb-2">Support Communities</h1>
          <p className="font-patrick text-2xl">Connect, share, and heal together on our noticeboard.</p>
        </div>
        {user && <button className="btn btn-primary text-2xl rotate-2">Create Community</button>}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-[4px] border-ink border-t-marker rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communities.map((c, idx) => (
            <Link to={`/communities/${c.slug}`} key={c.id} className="group">
              <div className={`paper-card p-6 h-full flex flex-col ${idx % 2 === 0 ? 'bg-postit rotate-2 tape-decoration' : 'bg-white -rotate-1 tack-decoration'} group-hover:rotate-0 transition-transform`}>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-kalam text-3xl group-hover:underline decoration-wavy">{c.name}</h2>
                  {!c.is_public && <span className="bg-marker text-white font-patrick px-2 py-1 border-[2px] border-ink wobbly-sm text-sm -rotate-6">Private</span>}
                </div>
                <p className="font-patrick text-xl mb-6 flex-1">{c.description}</p>
                <div className="flex justify-between items-center font-patrick font-bold text-lg border-t-[3px] border-dashed border-ink/30 pt-4 mt-auto">
                  <span>👥 {c.member_count}</span>
                  <span>Host: {c.owner_username}</span>
                </div>
              </div>
            </Link>
          ))}
          {communities.length === 0 && (
            <p className="col-span-full text-center font-kalam text-3xl bg-erased paper-card py-12">No communities found.</p>
          )}
        </div>
      )}
    </div>
  );
}
