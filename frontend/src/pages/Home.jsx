import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import Interactive3DNotebook from '../components/Home/Interactive3DNotebook';
import DoodleCorkboard from '../components/Home/DoodleCorkboard';

export default function Home() {
  const { user } = useAuth();
  const [memorials, setMemorials] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMemorials = async (p = 1, q = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p });
      if (q) params.set('search', q);
      const data = await api.get(`/api/memorials/?${params}`);
      setMemorials(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 6)); // Backend uses page_size = 6
      setPage(p);
    } catch {
      setMemorials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    if (!user) return;
    try {
      const data = await api.get('/api/memorials/invitations/');
      setInvitations(data || []);
    } catch (err) {
      console.error('Failed to fetch invitations', err);
    }
  };

  useEffect(() => {
    fetchMemorials();
    fetchInvitations();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMemorials(1, search);
  };

  const handleRespondInvitation = async (inviteId, status) => {
    try {
      await api.post(`/api/memorials/invitations/${inviteId}/respond/`, { status });
      alert(`Invitation ${status.toLowerCase()}ed successfully!`);
      fetchInvitations();
      fetchMemorials();
    } catch (err) {
      alert('Failed to respond to invitation.');
    }
  };

  return (
    <div className="flex flex-col gap-16">
      
      {/* Hero Section */}
      <section className="relative paper-card bg-postit p-8 md:p-12 rotate-1 max-w-5xl mx-auto w-full tape-decoration mt-8 select-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 text-center lg:text-left">
            <h1 className="font-kalam text-4xl md:text-6xl mb-6 leading-tight">
              Every Life is a Story <br/>
              <span className="text-marker inline-block -rotate-2">Worth Remembering</span>
            </h1>
            <p className="font-patrick text-xl md:text-2xl max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Honor your loved ones in a shared sketchbook of memories, timelines, and heartfelt stories.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              {user ? (
                <Link to="/memorials/create" className="btn btn-primary text-xl -rotate-2">
                  Create Memorial
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary text-xl -rotate-2">
                  Sign Up to Create
                </Link>
              )}
              <a href="#memorials" className="btn btn-secondary text-xl rotate-1">
                Browse Notebooks
              </a>
            </div>
          </div>

          {/* 3D Interactive Notebook */}
          <div className="lg:col-span-6 w-full flex justify-center">
            <Interactive3DNotebook />
          </div>

        </div>
        
        {/* Hand drawn arrow decoration */}
        <div className="hidden lg:block absolute -right-6 bottom-4 text-marker font-kalam text-5xl rotate-[120deg]">
          ➜
        </div>
      </section>

      {/* Pending Invitations Section */}
      {user && invitations.length > 0 && (
        <section className="w-full bg-postit p-6 border-[3px] border-ink wobbly-sm -rotate-1 shadow-hard">
          <h2 className="font-kalam text-3xl mb-4">📬 Pending Contributor Invitations</h2>
          <div className="flex flex-col gap-4">
            {invitations.map(invite => (
              <div key={invite.id} className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 border-[2px] border-ink wobbly-xs font-patrick text-xl">
                <div>
                  You have been invited to contribute to the memorial of <strong>{invite.memorial_name}</strong> as a <strong>{invite.role}</strong>.
                </div>
                <div className="flex gap-4 mt-4 sm:mt-0">
                  <button 
                    onClick={() => handleRespondInvitation(invite.id, 'ACCEPTED')}
                    className="btn btn-secondary py-1 px-4 text-lg bg-marker text-white"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleRespondInvitation(invite.id, 'DECLINED')}
                    className="btn btn-secondary py-1 px-4 text-lg bg-erased"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search & Memorials */}
      <section id="memorials" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b-[3px] border-ink border-dashed pb-6">
          <h2 className="font-kalam text-5xl text-ink">Memorials</h2>
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              className="input w-full md:w-64"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-[4px] border-ink border-t-marker rounded-full animate-spin"></div>
            <p className="font-kalam text-2xl">Loading pages...</p>
          </div>
        ) : memorials.length === 0 ? (
          <div className="paper-card p-12 text-center max-w-2xl mx-auto rotate-1">
            <div className="font-kalam text-6xl mb-4 opacity-50">?</div>
            <h3 className="font-kalam text-3xl mb-4">No memorials found</h3>
            <p className="font-patrick text-xl mb-8">
              Looks like this page is blank. Be the first to write a story!
            </p>
            {user ? (
              <Link to="/memorials/create" className="btn btn-primary">Create Memorial</Link>
            ) : (
              <Link to="/register" className="btn btn-primary">Sign Up to Create</Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {memorials.map((m, idx) => {
                const rotation = idx % 2 === 0 ? 'hover:-rotate-2' : 'hover:rotate-2';
                const tackOrTape = idx % 3 === 0 ? 'tack-decoration' : (idx % 2 === 0 ? 'tape-decoration' : '');
                
                return (
                  <Link to={`/memorial/${m.id}`} key={m.id} className="group">
                    <div className={`paper-card h-full flex flex-col ${tackOrTape} ${rotation} transition-transform`}>
                      
                      {/* Image Frame */}
                      <div className="p-4 pb-0 flex-1">
                        <div className="border-[3px] border-ink wobbly-sm overflow-hidden bg-erased relative aspect-[4/3] flex items-center justify-center">
                          {m.profile_image_url ? (
                            <img src={m.profile_image_url} alt={m.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-kalam text-5xl opacity-20">No Photo</span>
                          )}
                          {m.is_ai_generated_image && (
                            <div className="absolute bottom-2 right-2 bg-postit border-2 border-ink px-2 py-0.5 font-kalam text-sm font-bold -rotate-6">
                              AI Generated
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="font-kalam text-3xl mb-1 line-clamp-1">{m.full_name}</h3>
                        {(m.birth_date || m.passing_date) && (
                          <p className="font-patrick text-lg text-ink/70 mb-4">
                            {m.birth_date ? new Date(m.birth_date).getFullYear() : '?'} — {m.passing_date ? new Date(m.passing_date).getFullYear() : '?'}
                          </p>
                        )}
                        <div className="flex justify-between items-center pt-4 border-t-[3px] border-dashed border-ink/30 font-patrick text-lg font-bold">
                          <span>🕯️ {m.candle_count}</span>
                          <span>💬 {m.message_count}</span>
                        </div>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-12">
                <button 
                  className="btn btn-secondary" 
                  disabled={page <= 1} 
                  onClick={() => fetchMemorials(page - 1, search)}
                >
                  ← Prev
                </button>
                <span className="font-kalam text-2xl flex items-center px-4">
                  {page} of {totalPages}
                </span>
                <button 
                  className="btn btn-secondary" 
                  disabled={page >= totalPages} 
                  onClick={() => fetchMemorials(page + 1, search)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Guestboard Corkboard */}
      <section className="w-full">
        <DoodleCorkboard />
      </section>

    </div>
  );
}
