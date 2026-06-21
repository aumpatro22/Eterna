import { useState, useEffect } from 'react';
import { compressImage } from '../utils/imageCompression';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import ReportModal from '../components/layout/ReportModal';

export default function ProfileDetail() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState(null);

  // Tabs: 'content' (default), 'timeline', 'circles', 'connections' (owner only)
  const [activeTab, setActiveTab] = useState('content');

  // Edit profile states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPrivacySetting, setEditPrivacySetting] = useState('PUBLIC');
  const [editProfileImage, setEditProfileImage] = useState(null);
  const [editTags, setEditTags] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Timeline add states
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  // Owner's connections lists
  const [connections, setConnections] = useState({ accepted: [], pending_incoming: [], pending_outgoing: [] });
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetType, setReportTargetType] = useState('USER');
  const [reportTargetId, setReportTargetId] = useState(null);

  // Connection request dropdown state (for visitors)
  const [showConnectOptions, setShowConnectOptions] = useState(false);

  const isOwner = user && user.username === username;

  useEffect(() => {
    fetchProfile();
    setActiveTab('content');
  }, [username]);

  useEffect(() => {
    if (isOwner && activeTab === 'connections') {
      fetchConnections();
    }
  }, [activeTab, username, user]);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorData(null);
    try {
      const resp = await api.get(`/api/users/${username}/`);
      setData(resp);
      
      if (resp.profile) {
        setEditDisplayName(resp.profile.display_name || '');
        setEditBio(resp.profile.bio || '');
        setEditPrivacySetting(resp.profile.privacy_setting || 'PUBLIC');
        setEditTags(resp.profile.tags || '');
      }
    } catch (err) {
      if (err.status === 403) {
        setErrorData(err.data);
      } else {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    setConnectionsLoading(true);
    try {
      const resp = await api.get('/api/connections/');
      setConnections(resp);
    } catch (err) {
      console.error('Failed to fetch connections', err);
    } finally {
      setConnectionsLoading(false);
    }
  };

  // Connection actions
  const handleConnect = async (connectionType) => {
    try {
      await api.post('/api/connections/request/', {
        username: username,
        connection_type: connectionType
      });
      alert('Connection request sent!');
      setShowConnectOptions(false);
      fetchProfile();
    } catch (err) {
      alert(err.message || 'Failed to send connection request.');
    }
  };

  const handleRespondRequest = async (connId, status) => {
    try {
      await api.post(`/api/connections/${connId}/respond/`, { status });
      alert(`Connection request ${status === 'ACCEPTED' ? 'accepted' : status === 'DECLINED' ? 'declined' : 'blocked'}.`);
      fetchProfile();
      if (isOwner && activeTab === 'connections') {
        fetchConnections();
      }
    } catch (err) {
      alert(err.message || 'Failed to respond to request.');
    }
  };

  const handleDirectBlock = async () => {
    if (!window.confirm(`Are you sure you want to block @${username}?`)) return;
    try {
      await api.post('/api/connections/block/', { username });
      alert('User blocked.');
      fetchProfile();
      if (isOwner && activeTab === 'connections') {
        fetchConnections();
      }
    } catch (err) {
      alert(err.message || 'Failed to block user.');
    }
  };

  const handleMessage = async () => {
    try {
      await api.post('/api/conversations/create/', { username });
      navigate('/messages', { state: { startChatWith: username } });
    } catch (err) {
      alert(err.message || 'Failed to start conversation.');
    }
  };

  // Profile update action
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);

    const formData = new FormData();
    formData.append('display_name', editDisplayName);
    formData.append('bio', editBio);
    formData.append('privacy_setting', editPrivacySetting);
    formData.append('tags', editTags);
    if (editProfileImage) {
      formData.append('profile_image', editProfileImage);
    }

    try {
      await api.post('/api/users/profile/update/', formData);
      setShowEditModal(false);
      setEditProfileImage(null);
      fetchProfile();
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Timeline Milestone actions
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestoneTitle || !newMilestoneDate) return;
    setSubmittingMilestone(true);
    try {
      await api.post('/api/profiles/timeline/', {
        title: newMilestoneTitle,
        event_date: newMilestoneDate,
        description: newMilestoneDesc
      });
      setNewMilestoneTitle('');
      setNewMilestoneDate('');
      setNewMilestoneDesc('');
      setShowAddMilestone(false);
      fetchProfile();
    } catch (err) {
      alert(err.message || 'Failed to add milestone.');
    } finally {
      setSubmittingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await api.post(`/api/profiles/timeline/${milestoneId}/delete/`);
      fetchProfile();
    } catch (err) {
      alert(err.message || 'Failed to delete milestone.');
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render 403 locked views
  if (errorData) {
    const isConnectionsOnly = errorData.privacy_setting === 'CONNECTIONS_ONLY';
    return (
      <div className="max-w-2xl mx-auto py-16 font-patrick">
        <div className="paper-card p-12 text-center bg-erased wobbly-md rotate-1 tack-decoration">
          <span className="text-7xl block mb-6">🔒</span>
          <h1 className="font-kalam text-5xl mb-4">Profile Restricted</h1>
          <p className="text-2xl text-ink/80 mb-8 max-w-md mx-auto">
            {isConnectionsOnly
              ? `@${username}'s profile details are private and shared only with their Circle Connections.`
              : `@${username}'s profile has been marked as private.`}
          </p>

          {isConnectionsOnly && user && (
            <div className="border-t-[3px] border-dashed border-ink/20 pt-8 flex flex-col items-center gap-4">
              {errorData.connection_status === null || errorData.connection_status === 'DECLINED' ? (
                <div className="relative">
                  <button
                    onClick={() => setShowConnectOptions(!showConnectOptions)}
                    className="btn btn-primary bg-marker text-white text-xl py-2 px-6 flex items-center gap-2 hover:rotate-1"
                  >
                    🤝 Request Connection
                  </button>
                  {showConnectOptions && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border-[3px] border-ink wobbly-sm p-4 shadow-hard z-50 flex flex-col gap-2 w-48 text-left rotate-1">
                      <p className="font-bold text-base mb-1 text-ink/70">Connect as:</p>
                      <button onClick={() => handleConnect('FRIEND')} className="text-left font-bold py-1 px-2 hover:bg-postit hover:underline text-lg">🤝 Friend</button>
                      <button onClick={() => handleConnect('FAMILY')} className="text-left font-bold py-1 px-2 hover:bg-postit hover:underline text-lg">❤️ Family</button>
                      <button onClick={() => handleConnect('SUPPORTER')} className="text-left font-bold py-1 px-2 hover:bg-postit hover:underline text-lg">🎗️ Supporter</button>
                    </div>
                  )}
                </div>
              ) : errorData.connection_status === 'PENDING' ? (
                errorData.is_my_connection_request ? (
                  <div className="font-bold text-2xl text-ink/60 bg-white px-6 py-2 border-[3px] border-dashed border-ink/30 wobbly-sm -rotate-1">
                    ⏳ Connection Request Pending...
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="font-bold text-xl">@{username} sent you a connection request!</p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleRespondRequest(errorData.connection_id, 'ACCEPTED')}
                        className="btn btn-primary bg-marker text-white text-lg py-1 px-4"
                      >
                        Accept 👍
                      </button>
                      <button
                        onClick={() => handleRespondRequest(errorData.connection_id, 'DECLINED')}
                        className="btn btn-secondary text-lg py-1 px-4"
                      >
                        Decline 👎
                      </button>
                      <button
                        onClick={() => handleRespondRequest(errorData.connection_id, 'BLOCKED')}
                        className="btn btn-secondary text-marker border-2 border-marker text-lg py-1 px-4 hover:bg-marker hover:text-white"
                      >
                        Block 🚫
                      </button>
                    </div>
                  </div>
                )
              ) : errorData.connection_status === 'BLOCKED' ? (
                <div className="font-bold text-2xl text-marker border-2 border-marker bg-white px-6 py-2 wobbly-sm rotate-1">
                  🚫 Blocked
                </div>
              ) : null}
            </div>
          )}

          {!user && (
            <div className="border-t-[3px] border-dashed border-ink/20 pt-6">
              <Link to="/login" className="btn btn-primary text-xl px-6 py-2">
                Sign in to Request Connection
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-[4px] border-ink border-t-marker rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return <div className="text-center font-kalam text-4xl mt-12">Profile not found.</div>;

  const { profile, memorials, tales } = data;

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto font-patrick text-xl">
      
      {/* Header Profile Card */}
      <div className="paper-card p-6 md:p-10 text-center bg-postit tack-decoration rotate-0.5 relative">
        {/* Report Button (if visitor) */}
        {!isOwner && user && (
          <button
            onClick={() => {
              setReportTargetType('USER');
              setReportTargetId(profile.user?.id);
              setShowReportModal(true);
            }}
            className="absolute top-4 right-4 bg-white hover:bg-erased border-2 border-ink p-1.5 rounded-full shadow-sm hover:rotate-6 transition-transform"
            title="Report User Profile"
          >
            🛡️
          </button>
        )}

        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={username} className="w-32 h-32 border-[4px] border-ink wobbly-sm object-cover mx-auto mb-6 -rotate-2" />
        ) : (
          <div className="w-32 h-32 border-[4px] border-ink wobbly-sm bg-white mx-auto mb-6 flex items-center justify-center font-kalam text-6xl rotate-2">
            {username[0].toUpperCase()}
          </div>
        )}
        <h1 className="font-kalam text-5xl mb-1 decoration-wavy underline">{profile.display_name || username}</h1>
        <p className="font-patrick text-xl font-bold mb-4">@{username}</p>
        
        {/* Privacy Badge */}
        <div className="mb-6 flex gap-2 justify-center">
          <span className="bg-white/80 border-[2px] border-ink font-bold px-2 py-0.5 wobbly-xs text-sm">
            🔒 Privacy: {profile.privacy_setting}
          </span>
        </div>

        <p className="font-patrick text-xl max-w-lg mx-auto bg-white p-4 border-[3px] border-dashed border-ink -rotate-1 mb-6">
          {profile.bio || "This user hasn't sketched out a bio yet."}
        </p>
        
        {profile.tags_list && profile.tags_list.length > 0 && (
          <div className="flex gap-3 justify-center mb-8 flex-wrap">
            {profile.tags_list.map(t => (
              <span key={t} className="bg-marker text-white font-patrick font-bold px-3 py-1 border-[2px] border-ink wobbly-sm text-base rotate-2">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons Section */}
        <div className="flex gap-4 justify-center items-center flex-wrap pt-4 border-t-[3px] border-dashed border-ink/20">
          {isOwner ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-primary bg-marker text-white font-bold py-2 px-6 hover:rotate-1"
            >
              ✏️ Edit Profile
            </button>
          ) : user ? (
            <>
              {/* Message button */}
              <button
                onClick={handleMessage}
                className="btn btn-primary bg-white text-ink border-[3px] border-ink font-bold py-2 px-6 flex items-center gap-2 hover:-rotate-1"
              >
                ✉️ Send Message
              </button>

              {/* Connection Status Buttons */}
              {profile.connection_status === null || profile.connection_status === 'DECLINED' ? (
                <div className="relative">
                  <button
                    onClick={() => setShowConnectOptions(!showConnectOptions)}
                    className="btn btn-primary bg-marker text-white font-bold py-2 px-6 flex items-center gap-2 hover:rotate-1"
                  >
                    🤝 Connect
                  </button>
                  {showConnectOptions && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border-[3px] border-ink wobbly-sm p-4 shadow-hard z-50 flex flex-col gap-2 w-48 text-left rotate-1">
                      <p className="font-bold text-base mb-1 text-ink/70">Connect as:</p>
                      <button onClick={() => handleConnect('FRIEND')} className="text-left font-bold py-1 px-2 hover:bg-postit hover:underline text-lg">🤝 Friend</button>
                      <button onClick={() => handleConnect('FAMILY')} className="text-left font-bold py-1 px-2 hover:bg-postit hover:underline text-lg">❤️ Family</button>
                      <button onClick={() => handleConnect('SUPPORTER')} className="text-left font-bold py-1 px-2 hover:bg-postit hover:underline text-lg">🎗️ Supporter</button>
                    </div>
                  )}
                </div>
              ) : profile.connection_status === 'PENDING' ? (
                profile.is_my_connection_request ? (
                  <div className="font-bold text-lg text-ink/60 bg-white px-4 py-2 border-[3px] border-dashed border-ink/30 wobbly-sm">
                    ⏳ Request Pending
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondRequest(profile.connection_id, 'ACCEPTED')}
                      className="btn btn-primary bg-marker text-white text-base py-1.5 px-4"
                    >
                      Accept 👍
                    </button>
                    <button
                      onClick={() => handleRespondRequest(profile.connection_id, 'DECLINED')}
                      className="btn btn-secondary text-base py-1.5 px-4"
                    >
                      Decline 👎
                    </button>
                  </div>
                )
              ) : profile.connection_status === 'ACCEPTED' ? (
                <div className="flex items-center gap-3">
                  <span className="font-bold bg-white px-4 py-1.5 border-[3px] border-ink wobbly-sm text-ink rotate-1">
                    🟢 Connected
                  </span>
                  <button
                    onClick={() => handleRespondRequest(profile.connection_id, 'DECLINED')}
                    className="text-sm font-bold text-marker underline hover:text-marker/80"
                  >
                    Disconnect
                  </button>
                </div>
              ) : profile.connection_status === 'BLOCKED' ? (
                <span className="font-bold text-lg text-marker border-2 border-marker bg-white px-4 py-2 wobbly-sm">
                  🚫 Blocked
                </span>
              ) : null}

              {profile.connection_status !== 'BLOCKED' && (
                <button
                  onClick={handleDirectBlock}
                  className="text-sm font-bold text-ink/60 underline hover:text-marker"
                >
                  Block @{username}
                </button>
              )}
            </>
          ) : (
            <Link to="/login" className="btn btn-primary px-6 py-2">
              Sign in to Connect
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex justify-center gap-4 border-b-[3px] border-ink pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('content')}
          className={`font-kalam text-2xl py-1 px-4 transition-all ${
            activeTab === 'content'
              ? 'bg-postit border-[3px] border-ink wobbly-sm font-bold -rotate-1'
              : 'hover:underline text-ink/70'
          }`}
        >
          Memories & Tales 📝
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`font-kalam text-2xl py-1 px-4 transition-all ${
            activeTab === 'timeline'
              ? 'bg-postit border-[3px] border-ink wobbly-sm font-bold rotate-1'
              : 'hover:underline text-ink/70'
          }`}
        >
          Milestones Timeline 🗓️
        </button>
        <button
          onClick={() => setActiveTab('circles')}
          className={`font-kalam text-2xl py-1 px-4 transition-all ${
            activeTab === 'circles'
              ? 'bg-postit border-[3px] border-ink wobbly-sm font-bold -rotate-1'
              : 'hover:underline text-ink/70'
          }`}
        >
          Circles 👥
        </button>
        {isOwner && (
          <button
            onClick={() => setActiveTab('connections')}
            className={`font-kalam text-2xl py-1 px-4 transition-all ${
              activeTab === 'connections'
                ? 'bg-postit border-[3px] border-ink wobbly-sm font-bold rotate-1'
                : 'hover:underline text-ink/70'
            }`}
          >
            My Connections 🤝
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div>
        
        {/* Panel 1: Memories & Tales */}
        {activeTab === 'content' && (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Memorials */}
            <section>
              <h2 className="font-kalam text-3xl mb-6 border-b-[3px] border-ink pb-2 inline-block">Memorials ({memorials.length})</h2>
              <div className="flex flex-col gap-6">
                {memorials.map((m, idx) => (
                  <div key={m.id} className="relative group">
                    {/* Inline report trigger */}
                    {user && m.owner?.username !== user.username && (
                      <button
                        onClick={() => {
                          setReportTargetType('MEMORIAL');
                          setReportTargetId(m.id);
                          setShowReportModal(true);
                        }}
                        className="absolute top-2 right-2 z-10 bg-white border-2 border-ink p-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:rotate-6"
                        title="Report Memorial"
                      >
                        🛡️
                      </button>
                    )}
                    <Link to={`/memorial/${m.id}`}>
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
                  </div>
                ))}
                {memorials.length === 0 && <p className="font-patrick text-xl italic bg-erased p-4 border-[3px] border-ink wobbly-sm">No memorials sketched.</p>}
              </div>
            </section>

            {/* Tales */}
            <section>
              <h2 className="font-kalam text-3xl mb-6 border-b-[3px] border-ink pb-2 inline-block">Tales ({tales.length})</h2>
              <div className="flex flex-col gap-6">
                {tales.map((t, idx) => (
                  <div key={t.id} className="relative group">
                    {/* Inline report trigger */}
                    {user && t.author?.username !== user.username && (
                      <button
                        onClick={() => {
                          setReportTargetType('TALE');
                          setReportTargetId(t.id);
                          setShowReportModal(true);
                        }}
                        className="absolute top-2 right-2 z-10 bg-white border-2 border-ink p-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:rotate-6"
                        title="Report Tale"
                      >
                        🛡️
                      </button>
                    )}
                    <Link to={`/tales/${t.slug}`}>
                      <div className={`paper-card p-6 bg-white flex justify-between items-center ${idx % 2 !== 0 ? '-rotate-2' : 'rotate-1 tack-decoration'} group-hover:rotate-0 transition-transform`}>
                        <div>
                          <h3 className="font-kalam text-3xl mb-2 group-hover:underline decoration-wavy">{t.title}</h3>
                          <p className="font-patrick text-xl font-bold">{t.chapter_count} chapters</p>
                        </div>
                        <span className="text-4xl">📖</span>
                      </div>
                    </Link>
                  </div>
                ))}
                {tales.length === 0 && <p className="font-patrick text-xl italic bg-erased p-4 border-[3px] border-ink wobbly-sm">No tales drafted.</p>}
              </div>
            </section>
          </div>
        )}

        {/* Panel 2: Milestones Timeline */}
        {activeTab === 'timeline' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="font-kalam text-3xl">Milestones & Memories Timeline</h2>
              {isOwner && (
                <button
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="btn btn-primary bg-marker text-white text-base py-1.5 px-4 hover:rotate-1"
                >
                  {showAddMilestone ? 'Cancel' : '➕ Add Milestone'}
                </button>
              )}
            </div>

            {/* Add Milestone Form */}
            {isOwner && showAddMilestone && (
              <form onSubmit={handleAddMilestone} className="paper-card bg-postit p-6 max-w-md mx-auto w-full flex flex-col gap-4 border-[3px] border-ink wobbly-sm rotate-0.5">
                <h3 className="font-kalam text-2xl mb-1">Sketch a Milestone ✏️</h3>
                <div>
                  <label className="block text-sm font-bold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Graduated Medical School, Shared a Coffee"
                    className="input w-full text-base py-1 px-2 border-[2px]"
                    value={newMilestoneTitle}
                    onChange={e => setNewMilestoneTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="input w-full text-base py-1 px-2 border-[2px]"
                    value={newMilestoneDate}
                    onChange={e => setNewMilestoneDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Description (Optional)</label>
                  <textarea
                    placeholder="Details of the memory..."
                    className="input w-full h-20 text-base py-1 px-2 border-[2px]"
                    value={newMilestoneDesc}
                    onChange={e => setNewMilestoneDesc(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingMilestone}
                  className="btn btn-primary w-full bg-ink text-white font-bold py-2 hover:bg-ink/95"
                >
                  {submittingMilestone ? 'Adding...' : 'Pin Milestone 📌'}
                </button>
              </form>
            )}

            {/* Timeline display */}
            <div className="relative pl-8 border-l-[3px] border-dashed border-ink/40 py-4 flex flex-col gap-8 max-w-2xl mx-auto w-full">
              {profile.timeline_events && profile.timeline_events.length > 0 ? (
                [...profile.timeline_events]
                  .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                  .map((ev, idx) => (
                    <div key={ev.id} className="relative group">
                      {/* Timeline point */}
                      <span className="absolute -left-[41px] top-1.5 w-5 h-5 bg-marker border-[3px] border-ink rounded-full z-10 shadow-sm"></span>

                      <div className={`paper-card bg-white p-6 ${idx % 2 === 0 ? 'rotate-0.5' : '-rotate-0.5'} border-[3px] border-ink wobbly-xs`}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-sm font-bold bg-postit px-2 py-0.5 border-[2px] border-ink wobbly-sm text-ink/70">
                              {formatDate(ev.event_date)}
                            </span>
                            <h3 className="font-kalam text-2xl mt-2 text-ink">{ev.title}</h3>
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => handleDeleteMilestone(ev.id)}
                              className="text-sm text-marker font-bold hover:underline"
                            >
                              Delete ✖
                            </button>
                          )}
                        </div>
                        {ev.description && (
                          <p className="mt-3 text-ink/80 text-lg border-t border-dashed border-ink/20 pt-2 leading-relaxed">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center italic text-ink/50 py-10 bg-erased w-full border-[3px] border-dashed border-ink/30 wobbly-sm">
                  No timeline events are pinned here yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel 3: Joined Circles */}
        {activeTab === 'circles' && (
          <div>
            <h2 className="font-kalam text-3xl mb-6">Joined Circles 👥</h2>
            {profile.joined_communities && profile.joined_communities.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {profile.joined_communities.map((c, idx) => (
                  <Link to={`/communities/${c.slug}`} key={c.id} className="group">
                    <div className={`paper-card p-6 bg-white flex items-center gap-4 ${idx % 2 === 0 ? '-rotate-1 tape-decoration' : 'rotate-1 tack-decoration'} group-hover:rotate-0 transition-transform`}>
                      {c.icon_image ? (
                        <img src={c.icon_image} alt={c.title} className="w-16 h-16 border-[2px] border-ink object-cover wobbly-xs" />
                      ) : (
                        <div className="w-16 h-16 border-[2px] border-ink bg-postit flex items-center justify-center font-kalam text-3xl wobbly-xs">
                          👥
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-kalam text-2xl text-ink group-hover:underline">{c.title}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs font-bold border border-ink bg-white px-1.5 py-0.5 rounded">
                            {c.community_type}
                          </span>
                          {c.is_archived && (
                            <span className="text-xs bg-marker text-white font-bold px-1.5 py-0.5 rounded">
                              Archived
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center italic text-ink/50 py-10 bg-erased border-[3px] border-dashed border-ink/30 wobbly-sm">
                This user has not joined any Circles yet.
              </div>
            )}
          </div>
        )}

        {/* Panel 4: Connections & Requests (Owner Only) */}
        {isOwner && activeTab === 'connections' && (
          <div className="flex flex-col gap-10">
            
            {/* Accepted Connections */}
            <section>
              <h2 className="font-kalam text-3xl mb-4 border-b-[3px] border-ink pb-2 inline-block">Circle Connections ({connections.accepted?.length || 0})</h2>
              {connectionsLoading ? (
                <div className="flex py-6 justify-center">
                  <div className="w-8 h-8 border-[3px] border-ink border-t-marker rounded-full animate-spin"></div>
                </div>
              ) : connections.accepted && connections.accepted.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {connections.accepted.map((conn) => {
                    const otherUser = conn.sender_username === user.username ? conn.receiver_username : conn.sender_username;
                    return (
                      <div key={conn.id} className="paper-card bg-white p-4 flex justify-between items-center border-[3px] border-ink wobbly-xs rotate-0.5 hover:rotate-0 transition-transform">
                        <div>
                          <Link to={`/users/${otherUser}`} className="font-kalam text-2xl text-ink hover:underline">
                            @{otherUser}
                          </Link>
                          <p className="text-sm font-bold text-ink/50">Relationship: {conn.connection_type}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespondRequest(conn.id, 'DECLINED')}
                            className="text-sm font-bold text-marker border-2 border-marker bg-white py-1 px-3 wobbly-sm hover:bg-marker hover:text-white"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="italic text-ink/60 bg-white p-4 border-[3px] border-ink wobbly-xs">No active Circle Connections yet.</p>
              )}
            </section>

            {/* Pending Incoming Requests */}
            <section>
              <h2 className="font-kalam text-3xl mb-4 border-b-[3px] border-ink pb-2 inline-block">Incoming Connection Requests ({connections.pending_incoming?.length || 0})</h2>
              {connectionsLoading ? null : connections.pending_incoming && connections.pending_incoming.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {connections.pending_incoming.map((conn) => (
                    <div key={conn.id} className="paper-card bg-postit p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-[3px] border-ink wobbly-xs -rotate-0.5">
                      <div>
                        <span className="font-bold text-base bg-white border border-ink px-2 py-0.5 rounded mr-2">
                          {conn.connection_type}
                        </span>
                        <Link to={`/users/${conn.sender_username}`} className="font-kalam text-2xl text-ink hover:underline">
                          @{conn.sender_username}
                        </Link>
                        <span className="text-base text-ink/75 block md:inline md:ml-2">wants to connect with you.</span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRespondRequest(conn.id, 'ACCEPTED')}
                          className="btn btn-primary bg-marker text-white text-base py-1 px-4"
                        >
                          Accept 👍
                        </button>
                        <button
                          onClick={() => handleRespondRequest(conn.id, 'DECLINED')}
                          className="btn btn-secondary text-base py-1 px-4"
                        >
                          Decline 👎
                        </button>
                        <button
                          onClick={() => handleRespondRequest(conn.id, 'BLOCKED')}
                          className="text-sm text-marker font-bold hover:underline"
                        >
                          Block User 🚫
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-ink/60 bg-white p-4 border-[3px] border-ink wobbly-xs">No pending incoming requests.</p>
              )}
            </section>

            {/* Pending Outgoing Requests */}
            <section>
              <h2 className="font-kalam text-3xl mb-4 border-b-[3px] border-ink pb-2 inline-block">Outgoing Connection Requests ({connections.pending_outgoing?.length || 0})</h2>
              {connectionsLoading ? null : connections.pending_outgoing && connections.pending_outgoing.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {connections.pending_outgoing.map((conn) => (
                    <div key={conn.id} className="paper-card bg-white p-4 flex justify-between items-center border-[3px] border-ink wobbly-xs rotate-0.5">
                      <div>
                        <Link to={`/users/${conn.receiver_username}`} className="font-kalam text-2xl text-ink hover:underline">
                          @{conn.receiver_username}
                        </Link>
                        <p className="text-sm font-bold text-ink/50">Request Type: {conn.connection_type}</p>
                      </div>
                      <span className="font-bold text-ink/50 text-base">⏳ Pending Approval...</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-ink/60 bg-white p-4 border-[3px] border-ink wobbly-xs">No pending outgoing requests.</p>
              )}
            </section>
          </div>
        )}

      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-ink/60 z-[999999] flex items-center justify-center p-6 backdrop-blur-[2px]">
          <div className="paper-card bg-white p-8 max-w-md w-full relative rotate-1 tack-decoration shadow-hard">
            <button
              onClick={() => { setShowEditModal(false); setEditProfileImage(null); }}
              className="absolute top-4 right-4 font-kalam text-3xl hover:text-marker transition-colors"
            >
              ✖
            </button>
            <h3 className="font-kalam text-3xl text-marker mb-4 border-b-[2px] border-dashed border-ink/20 pb-2">
              Edit Circle Profile ✏️
            </h3>
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 text-left text-xl">
              <div>
                <label className="block font-bold mb-1">Display Name</label>
                <input
                  type="text"
                  className="input w-full text-base py-1.5 px-3 border-[2px]"
                  value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="text-base"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const compressed = await compressImage(e.target.files[0]);
                      setEditProfileImage(compressed);
                    }
                  }}
                />
                {editProfileImage && (
                  <p className="text-sm text-marker font-bold mt-1">📎 Selected: {editProfileImage.name}</p>
                )}
              </div>

              <div>
                <label className="block font-bold mb-1">Bio</label>
                <textarea
                  className="input w-full h-24 text-base py-1.5 px-3 border-[2px]"
                  placeholder="Draw a bio description..."
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Privacy Level</label>
                <select
                  className="input w-full text-base py-1.5 px-3 border-[2px]"
                  value={editPrivacySetting}
                  onChange={e => setEditPrivacySetting(e.target.value)}
                >
                  <option value="PUBLIC">Public — Searchable & open to all</option>
                  <option value="CONNECTIONS_ONLY">Connections Only — Locked to circle connections</option>
                  <option value="PRIVATE">Private — Restrained completely</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  className="input w-full text-base py-1.5 px-3 border-[2px]"
                  placeholder="family, memory keeper, storyteller"
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                />
              </div>

              <div className="flex gap-4 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditProfileImage(null); }}
                  className="btn btn-secondary text-base py-1.5 px-4"
                  disabled={updatingProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary bg-marker text-white text-base py-1.5 px-6 font-bold"
                  disabled={updatingProfile}
                >
                  {updatingProfile ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safety Report Modal */}
      {showReportModal && (
        <ReportModal
          targetType={reportTargetType}
          targetId={reportTargetId}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
}
