import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { compressImage } from '../utils/imageCompression';
import SEO from '../components/layout/SEO';

export default function CommunityList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    community_type: 'PUBLIC',
    rules: '1. Be respectful.\n2. No harassment.\n3. Support others kindly.\n4. No spam.',
    welcome_message: "We're sorry you're here, but you're not alone.",
    cover_image: null,
    icon_image: null
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreateLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('community_type', form.community_type);
    formData.append('rules', form.rules);
    formData.append('welcome_message', form.welcome_message);
    if (form.cover_image) formData.append('cover_image', form.cover_image);
    if (form.icon_image) formData.append('icon_image', form.icon_image);

    try {
      const data = await api.post('/api/communities/create/', formData);
      setShowCreateModal(false);
      // Reset form
      setForm({
        title: '',
        description: '',
        community_type: 'PUBLIC',
        rules: '1. Be respectful.\n2. No harassment.\n3. Support others kindly.\n4. No spam.',
        welcome_message: "We're sorry you're here, but you're not alone.",
        cover_image: null,
        icon_image: null
      });
      navigate(`/communities/${data.slug}`);
    } catch (err) {
      setError(err.message || 'Failed to create community.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <SEO 
        title="Support Communities & Grief Circles – Eterna"
        description="Connect with other families on similar paths (e.g. Lost Parent, Caregiver). Share comfort, messages, and stories."
      />
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-[3px] border-dashed border-ink pb-8">
        <div>
          <h1 className="font-kalam text-5xl mb-2">Support Communities</h1>
          <p className="font-patrick text-2xl">Connect, share, and heal together on our noticeboard.</p>
        </div>
        {user && (
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn btn-primary text-2xl rotate-2"
          >
            Create Community
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-[4px] border-ink border-t-marker rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communities.map((c, idx) => (
            <Link to={`/communities/${c.slug}`} key={c.id} className="group">
              <div className={`paper-card p-6 h-full flex flex-col relative ${idx % 2 === 0 ? 'bg-postit rotate-2 tape-decoration' : 'bg-white -rotate-1 tack-decoration'} group-hover:rotate-0 transition-all shadow-md hover:shadow-hard`}>
                
                {/* Community Icon if present */}
                <div className="flex gap-4 items-start mb-4">
                  {c.icon_image ? (
                    <img 
                      src={c.icon_image} 
                      alt="" 
                      className="w-12 h-12 object-cover border-2 border-ink rounded wobbly-xs flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-erased border-2 border-ink rounded flex items-center justify-center font-kalam font-bold text-2xl flex-shrink-0">
                      👥
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-kalam text-3xl group-hover:underline decoration-wavy truncate">{c.title}</h2>
                  </div>
                </div>

                <p className="font-patrick text-xl mb-6 flex-1 line-clamp-3">{c.description}</p>

                {/* Badges Container */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {c.community_type === 'PRIVATE' ? (
                    <span className="bg-marker text-white font-patrick px-2 py-0.5 border-[2px] border-ink wobbly-sm text-sm -rotate-2">Private</span>
                  ) : (
                    <span className="bg-paper text-ink font-patrick px-2 py-0.5 border-[2px] border-ink wobbly-sm text-sm rotate-1">Public</span>
                  )}
                  {c.is_archived && (
                    <span className="bg-ink text-white font-patrick px-2 py-0.5 border-[2px] border-ink wobbly-sm text-sm -rotate-3">Archived</span>
                  )}
                </div>

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

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-ink/60 z-[99999] flex items-center justify-center p-6 backdrop-blur-[2px]">
          <div className="paper-card bg-white p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto relative rotate-1 tack-decoration shadow-hard">
            <button 
              onClick={() => setShowCreateModal(false)} 
              className="absolute top-4 right-4 font-kalam text-3xl hover:text-marker transition-colors"
            >
              ✖
            </button>

            <h3 className="font-kalam text-4xl text-marker mb-6 border-b-[2px] border-dashed border-ink/20 pb-2">Start a New Support Circle</h3>

            {error && (
              <div className="bg-marker/10 border-l-4 border-marker p-3 font-patrick text-lg mb-4 text-left">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="flex flex-col gap-4 font-patrick text-xl text-left">
              <div>
                <label className="block font-bold mb-1">Community Title *</label>
                <input 
                  type="text"
                  required
                  className="input w-full"
                  placeholder="e.g. Pet Loss Support Group"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea 
                  className="input w-full h-24"
                  placeholder="Describe the purpose of this group..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Community Type</label>
                  <select 
                    className="input w-full"
                    value={form.community_type}
                    onChange={e => setForm({...form, community_type: e.target.value})}
                  >
                    <option value="PUBLIC">Public (Searchable, Join Approval Needed)</option>
                    <option value="PRIVATE">Private (Hidden, Invite Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Community Rules</label>
                <textarea 
                  className="input w-full h-24"
                  value={form.rules}
                  onChange={e => setForm({...form, rules: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Welcome Message</label>
                <textarea 
                  className="input w-full h-20"
                  value={form.welcome_message}
                  onChange={e => setForm({...form, welcome_message: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-sm">Icon Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="input w-full text-sm"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const compressed = await compressImage(file);
                        setForm({...form, icon_image: compressed});
                      } else {
                        setForm({...form, icon_image: null});
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-sm">Cover Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="input w-full text-sm"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const compressed = await compressImage(file);
                        setForm({...form, cover_image: compressed});
                      } else {
                        setForm({...form, cover_image: null});
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary text-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createLoading}
                  className="btn btn-primary text-lg"
                >
                  {createLoading ? 'Creating...' : 'Start Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
