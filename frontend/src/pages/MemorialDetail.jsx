import { useState, useEffect } from 'react';
import { compressImage } from '../utils/imageCompression';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import InteractiveCandle from '../components/Memorial/InteractiveCandle';
import CassetteTapePlayer from '../components/Memorial/CassetteTapePlayer';
import ReportModal from '../components/layout/ReportModal';
import SEO from '../components/layout/SEO';

const formatLocalTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatCalendarDate = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function MemorialDetail() {
  const { id: rawId } = useParams();
  const id = rawId && rawId.includes('-') ? rawId.split('-')[0] : rawId;
  const { user } = useAuth();
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);

  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetType, setReportTargetType] = useState('MEMORIAL');
  const [reportTargetId, setReportTargetId] = useState(null);
  
  // Tab states: 'overview', 'memories', 'timeline', 'photos', 'contributors'
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [messageForm, setMessageForm] = useState({ author_name: '', author_email: '', content: '' });
  
  const [memoryForm, setMemoryForm] = useState({
    title: '',
    story: '',
    memory_date: '',
    visibility: 'PUBLIC',
    image: null,
    voice_note: null
  });
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memoryError, setMemoryError] = useState('');

  const [inviteForm, setInviteForm] = useState({ username: '', role: 'FAMILY_MEMBER' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  
  const [contributors, setContributors] = useState([]);
  const [invitations, setInvitations] = useState([]);

  // Timeline creation states
  const [timelineForm, setTimelineForm] = useState({ title: '', event_date: '', description: '', image: null });
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState('');
  const [showTimelineForm, setShowTimelineForm] = useState(false);

  useEffect(() => {
    fetchMemorial();
  }, [id, user]);

  const fetchMemorial = async () => {
    try {
      const data = await api.get(`/api/memorials/${id}/`);
      setMemorial(data);
      if (user) {
        setMessageForm(prev => ({
          ...prev,
          author_name: user.first_name || user.username,
          author_email: user.email
        }));
        // Fetch contributors for all authenticated users to check contributor permissions
        fetchContributors();
      }
    } catch (err) {
      console.error(err);
      setMemorial(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributors = async () => {
    try {
      const contribs = await api.get(`/api/memorials/${id}/contributors/`);
      setContributors(contribs);
      
      // Since invitations lists pending invitations, let's fetch them if owner.
      // Wait, let's list invitations via backend. Wait, backend lists invitations for the LOGGED-IN user.
      // Can an owner view sent invitations?
      // Our ContributorInvitation model in DB has invitations. We can query them or serialize them on the memorial!
      // Wait, does the memorial detail return invitations? No, but we can query them or add an endpoint if needed.
      // For now, let's assume we can invite by username and show status.
    } catch (err) {
      console.error('Failed to load contributors', err);
    }
  };

  const handleAddTimeline = async (e) => {
    e.preventDefault();
    if (!timelineForm.title.trim() || !timelineForm.event_date) return;
    setTimelineLoading(true);
    setTimelineError('');

    const formData = new FormData();
    formData.append('title', timelineForm.title);
    formData.append('event_date', timelineForm.event_date);
    formData.append('description', timelineForm.description);
    if (timelineForm.image) {
      formData.append('image', timelineForm.image);
    }

    try {
      const newEv = await api.post(`/api/memorials/${id}/timeline/`, formData);
      setMemorial(prev => ({
        ...prev,
        timeline_events: [...(prev.timeline_events || []), newEv].sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      }));
      setTimelineForm({ title: '', event_date: '', description: '', image: null });
      setShowTimelineForm(false);
    } catch (err) {
      setTimelineError(err.message || 'Failed to add milestone.');
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleDeleteTimeline = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await api.delete(`/api/memorials/timeline/${eventId}/delete/`);
      setMemorial(prev => ({
        ...prev,
        timeline_events: prev.timeline_events.filter(ev => ev.id !== eventId)
      }));
    } catch (err) {
      alert('Failed to delete milestone.');
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      await api.delete(`/api/memorials/memories/${memoryId}/delete/`);
      setMemorial(prev => ({
        ...prev,
        memories: prev.memories.filter(m => m.id !== memoryId)
      }));
    } catch (err) {
      alert('Failed to delete memory.');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Are you sure you want to delete this guestbook message?')) return;
    try {
      await api.delete(`/api/memorials/messages/${msgId}/delete/`);
      setMemorial(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== msgId)
      }));
    } catch (err) {
      alert('Failed to delete guestbook message.');
    }
  };

  const handleLeaveMessage = async (e) => {
    e.preventDefault();
    try {
      const newMsg = await api.post(`/api/memorials/${id}/messages/`, messageForm);
      setMemorial(prev => ({ ...prev, messages: [newMsg, ...prev.messages] }));
      setMessageForm({ author_name: '', author_email: '', content: '' });
      if (user) {
        setMessageForm(prev => ({
          ...prev,
          author_name: user.first_name || user.username,
          author_email: user.email
        }));
      }
    } catch (err) {
      alert('Failed to leave message.');
    }
  };

  const handleLightCandle = async (litBy, message) => {
    try {
      const newCandle = await api.post(`/api/memorials/${id}/candles/`, { lit_by: litBy, message });
      setMemorial(prev => ({ ...prev, candles: [newCandle, ...prev.candles] }));
    } catch (err) {
      alert('Failed to light candle.');
    }
  };

  const handleAddMemory = async (e) => {
    e.preventDefault();
    setMemoryLoading(true);
    setMemoryError('');

    const formData = new FormData();
    formData.append('title', memoryForm.title);
    formData.append('story', memoryForm.story);
    formData.append('visibility', memoryForm.visibility);
    if (memoryForm.memory_date) formData.append('memory_date', memoryForm.memory_date);
    if (memoryForm.image) formData.append('image', memoryForm.image);
    if (memoryForm.voice_note) formData.append('voice_note', memoryForm.voice_note);

    try {
      const newMemory = await api.post(`/api/memorials/${id}/memories/`, formData);
      setMemorial(prev => ({
        ...prev,
        memories: [newMemory, ...prev.memories]
      }));
      setMemoryForm({
        title: '',
        story: '',
        memory_date: '',
        visibility: 'PUBLIC',
        image: null,
        voice_note: null
      });
      // Reset file inputs manually if needed
      document.getElementById('memory-image-input').value = '';
      document.getElementById('memory-audio-input').value = '';
    } catch (err) {
      setMemoryError(err.message || 'Failed to post memory.');
    } finally {
      setMemoryLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError('');

    try {
      const data = await api.post(`/api/memorials/${id}/contributors/invite/`, inviteForm);
      alert(`Invitation sent to ${inviteForm.username}!`);
      setInviteForm({ username: '', role: 'FAMILY_MEMBER' });
      fetchContributors();
    } catch (err) {
      setInviteError(err.message || 'Failed to invite user.');
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-[4px] border-ink border-t-marker rounded-full animate-spin"></div>
    </div>
  );
  if (!memorial) return <div className="text-center font-kalam text-4xl mt-12">Memorial not found.</div>;

  const isOwner = user && memorial && memorial.owner_id === user.id;
  const isContributor = user && (
    isOwner || 
    contributors.some(c => c.username === user.username)
  );

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": memorial.full_name,
    "birthDate": memorial.birth_date,
    "deathDate": memorial.passing_date,
    "description": memorial.biography,
    "image": memorial.profile_image_url || 'https://eterna-five-phi.vercel.app/eterna-logo.webp',
    "url": `https://eterna-five-phi.vercel.app/memorial/${rawId}`
  };

  return (
    <div className="flex flex-col gap-8">
      <SEO 
        title={`${memorial.full_name} – Memorial & Life Timeline | Eterna`}
        description={`In loving memory of ${memorial.full_name} (${memorial.birth_date ? new Date(memorial.birth_date).getFullYear() : ''} - ${memorial.passing_date ? new Date(memorial.passing_date).getFullYear() : ''}). Read biography, view timeline milestones, see photos, and share memories.`}
        keywords={`${memorial.full_name}, memorial, timeline, biography, memory lane, family history, Eterna`}
        canonicalUrl={`https://eterna-five-phi.vercel.app/memorial/${rawId}`}
        ogType="profile"
        ogImage={memorial.profile_image_url}
        jsonLd={personSchema}
      />
      
      {/* Cover Banner (Landscape Cover Image) */}
      {memorial.cover_image_url && (
        <div className="w-full h-64 md:h-80 border-[3px] border-ink wobbly-sm overflow-hidden bg-erased rotate-1 relative shadow-hard">
          <img src={memorial.cover_image_url} alt="Cover Banner" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-ink/5 pointer-events-none"></div>
        </div>
      )}

      {/* Main Details and Tabbed Display */}
      <div className="grid md:grid-cols-3 gap-8 items-start">
        
        {/* Main Content Areas */}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          {/* Header Polaroid style */}
          <div className="paper-card bg-white p-6 pb-10 -rotate-1 tack-decoration">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="border-[3px] border-ink wobbly-sm overflow-hidden bg-erased w-48 h-48 flex-shrink-0 relative shadow-md">
                {memorial.profile_image_url ? (
                  <img src={memorial.profile_image_url} alt={memorial.full_name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-kalam text-4xl opacity-20">No Profile Photo</div>
                )}
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h1 className="font-kalam text-4xl md:text-5xl mb-2">{memorial.full_name}</h1>
                
                {(memorial.birth_date || memorial.passing_date) && (
                  <p className="font-patrick text-2xl text-ink/75 mb-3">
                    {memorial.birth_date ? new Date(memorial.birth_date).toLocaleDateString() : '?'} — {memorial.passing_date ? new Date(memorial.passing_date).toLocaleDateString() : '?'}
                  </p>
                )}

                {/* Experience Tags */}
                {memorial.tags && memorial.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {memorial.tags.map(t => (
                      <span key={t.id} className="px-2 py-0.5 border-[2px] border-ink bg-postit text-sm font-patrick rounded rotate-1">
                        🏷️ {t.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="font-patrick text-lg border-t-[2px] border-dashed border-ink/20 pt-3 text-ink/70">
                  Preserved by <Link to={`/profile/${memorial.owner_username}`} className="font-bold hover:underline hover:text-marker">{memorial.owner_username}</Link>
                  {memorial.visibility !== 'PUBLIC' && (
                    <span className="ml-3 px-2 py-0.5 bg-marker text-white text-xs font-bold rounded">
                      🔒 {memorial.visibility}
                    </span>
                  )}
                  {user && memorial.owner_username !== user.username && (
                    <button
                      onClick={() => {
                        setReportTargetType('MEMORIAL');
                        setReportTargetId(memorial.id);
                        setShowReportModal(true);
                      }}
                      className="ml-3 hover:text-marker text-sm font-bold underline cursor-pointer"
                    >
                      🛡️ Report Memorial
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b-[3px] border-ink font-kalam text-xl gap-2 md:gap-4 flex-wrap">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`px-4 py-2 border-[3px] border-b-0 border-ink rounded-t-lg transition-colors ${activeTab === 'overview' ? 'bg-white font-bold -translate-y-1' : 'bg-erased hover:bg-white'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('memories')} 
              className={`px-4 py-2 border-[3px] border-b-0 border-ink rounded-t-lg transition-colors ${activeTab === 'memories' ? 'bg-white font-bold -translate-y-1' : 'bg-erased hover:bg-white'}`}
            >
              Memory Lane ({memorial.memories?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('timeline')} 
              className={`px-4 py-2 border-[3px] border-b-0 border-ink rounded-t-lg transition-colors ${activeTab === 'timeline' ? 'bg-white font-bold -translate-y-1' : 'bg-erased hover:bg-white'}`}
            >
              Timeline ({memorial.timeline_events?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('photos')} 
              className={`px-4 py-2 border-[3px] border-b-0 border-ink rounded-t-lg transition-colors ${activeTab === 'photos' ? 'bg-white font-bold -translate-y-1' : 'bg-erased hover:bg-white'}`}
            >
              Gallery ({((memorial.profile_image_url ? 1 : 0) + (memorial.photos?.length || 0))})
            </button>
            {isOwner && (
              <button 
                onClick={() => setActiveTab('contributors')} 
                className={`px-4 py-2 border-[3px] border-b-0 border-ink rounded-t-lg transition-colors ${activeTab === 'contributors' ? 'bg-white font-bold -translate-y-1' : 'bg-erased hover:bg-white'}`}
              >
                Contributors
              </button>
            )}
          </div>

          {/* Tab 1: Overview (Life Story & Tribute & Messages) */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              {memorial.biography && (
                <div className="paper-card p-6 rotate-1">
                  <h3 className="font-kalam text-3xl mb-4 underline decoration-wavy">Life Story</h3>
                  <div className="font-patrick text-xl leading-relaxed whitespace-pre-wrap">{memorial.biography}</div>
                </div>
              )}
              
              {memorial.tribute && (
                <div className="paper-card bg-postit p-6 -rotate-1 tape-decoration">
                  <h3 className="font-kalam text-3xl mb-4">AI Sketch of Tribute ✨</h3>
                  <div className="font-patrick text-xl leading-relaxed whitespace-pre-wrap">{memorial.tribute}</div>
                </div>
              )}

              {/* Guestbook Section */}
              <div className="paper-card p-6 rotate-1">
                <h3 className="font-kalam text-3xl mb-6">Guestbook Messages ({memorial.messages.length})</h3>
                
                <form onSubmit={handleLeaveMessage} className="mb-10 bg-erased p-4 border-[3px] border-ink border-dashed wobbly-sm -rotate-1">
                  <h4 className="font-kalam text-xl mb-4">Write a Heartfelt Note</h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input 
                      className="input bg-white" 
                      placeholder="Your Name" 
                      required 
                      value={messageForm.author_name} 
                      onChange={e => setMessageForm({...messageForm, author_name: e.target.value})} 
                    />
                    <input 
                      className="input bg-white" 
                      type="email" 
                      placeholder="Email (optional)" 
                      value={messageForm.author_email} 
                      onChange={e => setMessageForm({...messageForm, author_email: e.target.value})} 
                    />
                  </div>
                  <textarea 
                    className="input bg-white mb-4 font-patrick text-lg" 
                    placeholder="Leave some comforting words..." 
                    required 
                    rows="3" 
                    value={messageForm.content} 
                    onChange={e => setMessageForm({...messageForm, content: e.target.value})} 
                  />
                  <button type="submit" className="btn btn-secondary text-lg">Pin Note</button>
                </form>

                {/* Permanent Messages list without likes or reactions */}
                <div className="flex flex-col gap-6">
                  {memorial.messages.length === 0 ? (
                    <p className="font-patrick text-xl italic text-ink/65 text-center py-6">The guestbook is currently quiet. Leave a note above.</p>
                  ) : (
                    memorial.messages.map((msg, idx) => (
                      <div key={msg.id} className={`p-4 border-[3px] border-ink ${idx % 2 === 0 ? 'bg-white rotate-0.5' : 'bg-postit -rotate-0.5'} wobbly-sm shadow-md relative`}>
                        <div className="absolute top-2 right-2 flex gap-2">
                          {user && (
                            <button
                              onClick={() => {
                                setReportTargetType('MEMORIAL_MESSAGE');
                                setReportTargetId(msg.id);
                                setShowReportModal(true);
                              }}
                              className="text-ink/40 hover:text-marker text-sm"
                              title="Report Message"
                            >
                              🛡️
                            </button>
                          )}
                          {isContributor && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-ink/40 hover:text-marker font-bold text-sm"
                              title="Delete Message"
                              aria-label="Delete Message"
                            >
                              ✖
                            </button>
                          )}
                        </div>
                        <div className="flex justify-between items-start mb-2 border-b-[2px] border-dashed border-ink/20 pb-2 mr-6">
                          <span className="font-kalam text-xl font-bold">{msg.author_name}</span>
                          <span className="font-patrick text-sm text-ink/60">{formatLocalTime(msg.created_at)}</span>
                        </div>
                        <p className="font-patrick text-xl whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Memory Lane (List & Form) */}
          {activeTab === 'memories' && (
            <div className="flex flex-col gap-8">
              
              {/* Add Memory Form */}
              {user && (
                <div className="paper-card bg-postit p-6 rotate-1">
                  <h3 className="font-kalam text-3xl mb-4">Add a Memory to the Lane</h3>
                  {memoryError && (
                    <div className="bg-marker/10 border-l-4 border-marker p-3 font-patrick text-lg mb-4">
                      {memoryError}
                    </div>
                  )}
                  <form onSubmit={handleAddMemory} className="flex flex-col gap-4">
                    <div>
                      <label className="input-label text-sm">Title</label>
                      <input 
                        className="input bg-white" 
                        required 
                        value={memoryForm.title} 
                        onChange={e => setMemoryForm({...memoryForm, title: e.target.value})} 
                        placeholder="e.g. Grandma's Garden Lessons" 
                      />
                    </div>
                    <div>
                      <label className="input-label text-sm">The Story</label>
                      <textarea 
                        className="input bg-white font-patrick text-lg" 
                        required 
                        rows="4" 
                        value={memoryForm.story} 
                        onChange={e => setMemoryForm({...memoryForm, story: e.target.value})} 
                        placeholder="Tell the memory in detail..."
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label text-sm">When did this happen? (Optional)</label>
                        <input 
                          type="date" 
                          className="input bg-white" 
                          value={memoryForm.memory_date} 
                          onChange={e => setMemoryForm({...memoryForm, memory_date: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="input-label text-sm">Memory Visibility</label>
                        <select 
                          className="input bg-white font-patrick text-lg" 
                          value={memoryForm.visibility} 
                          onChange={e => setMemoryForm({...memoryForm, visibility: e.target.value})}
                        >
                          <option value="PUBLIC">Public (Visible to everyone)</option>
                          <option value="FAMILY_ONLY">Family & Contributors Only</option>
                          <option value="PRIVATE">Private (Only me)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label text-sm">Attach Photo (Optional)</label>
                        <input 
                          id="memory-image-input"
                          type="file" 
                          className="input bg-white text-sm" 
                          accept="image/*" 
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const compressed = await compressImage(file);
                              setMemoryForm({...memoryForm, image: compressed});
                            } else {
                              setMemoryForm({...memoryForm, image: null});
                            }
                          }} 
                        />
                      </div>
                      <div>
                        <label className="input-label text-sm">Attach Voice Note / Audio File (Optional)</label>
                        <input 
                          id="memory-audio-input"
                          type="file" 
                          className="input bg-white text-sm" 
                          accept="audio/*" 
                          onChange={e => setMemoryForm({...memoryForm, voice_note: e.target.files[0]})} 
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary text-xl self-end py-2 px-6" disabled={memoryLoading}>
                      {memoryLoading ? 'Saving...' : 'Pin Memory'}
                    </button>
                  </form>
                </div>
              )}

              {/* Memory Lane Display */}
              <div className="flex flex-col gap-8">
                {(!memorial.memories || memorial.memories.length === 0) ? (
                  <p className="font-patrick text-xl italic text-ink/65 text-center py-12 bg-white border-[3px] border-ink wobbly-sm">
                    No memories shared yet. Pin the first memory above.
                  </p>
                ) : (
                  memorial.memories.map((mem, idx) => (
                    <div key={mem.id} className={`paper-card p-6 ${idx % 2 === 0 ? '-rotate-0.5 bg-white' : 'rotate-0.5 bg-erased'} relative`}>
                      <div className="absolute top-4 right-4 flex gap-3">
                        {user && mem.author_username !== user.username && (
                          <button
                            onClick={() => {
                              setReportTargetType('MEMORY');
                              setReportTargetId(mem.id);
                              setShowReportModal(true);
                            }}
                            className="text-ink/40 hover:text-marker text-base"
                            title="Report Memory"
                          >
                            🛡️
                          </button>
                        )}
                        {user && (isContributor || mem.author_username === user.username) && (
                          <button
                            onClick={() => handleDeleteMemory(mem.id)}
                            className="text-ink/40 hover:text-marker font-bold text-base"
                            title="Delete Memory"
                            aria-label="Delete Memory"
                          >
                            ✖
                          </button>
                        )}
                      </div>
                      <div className="flex justify-between items-start mb-4 border-b-[2px] border-dashed border-ink/20 pb-2 mr-6">
                        <div>
                          <h4 className="font-kalam text-3xl mb-1">{mem.title}</h4>
                          <p className="font-patrick text-sm text-ink/75">
                            Shared by <strong>{mem.author_username}</strong> 
                            {mem.memory_date && ` • Event Date: ${formatCalendarDate(mem.memory_date)}`}
                            {mem.visibility !== 'PUBLIC' && (
                              <span className="ml-2 px-1 bg-marker text-white text-xs rounded">🔒 {mem.visibility}</span>
                            )}
                          </p>
                        </div>
                        <span className="font-patrick text-sm text-ink/60">{formatLocalTime(mem.created_at)}</span>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Memory Image */}
                        {mem.image_url && (
                          <div className="w-full md:w-48 border-[2px] border-ink wobbly-sm overflow-hidden flex-shrink-0 bg-white shadow-sm rotate-1">
                            <img src={mem.image_url} alt={mem.title} className="w-full object-cover max-h-48" loading="lazy" />
                          </div>
                        )}
                        
                        <div className="flex-1 flex flex-col gap-4">
                          <p className="font-patrick text-xl leading-relaxed whitespace-pre-wrap">{mem.story}</p>
                          
                          {/* Memory Voice Note */}
                          {mem.voice_note_url && (
                            <div className="flex flex-col gap-1 mt-2 bg-postit/50 p-3 border-[2px] border-ink wobbly-xs w-full max-w-sm">
                              <span className="font-kalam text-sm">🎙️ Voice Note Tribute</span>
                              <audio src={mem.voice_note_url} controls className="w-full h-8" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Timeline (Milestones list) */}
          {activeTab === 'timeline' && (
            <div className="paper-card p-6 rotate-1">
              <h3 className="font-kalam text-3xl mb-6 underline decoration-wavy">Life Milestones</h3>

              {/* Add Timeline Event (Milestone) Form for Owner/Contributors */}
              {isContributor && (
                <div className="mb-8">
                  {!showTimelineForm ? (
                    <button 
                      onClick={() => setShowTimelineForm(true)} 
                      className="btn btn-primary font-kalam font-bold text-xl flex items-center gap-2"
                    >
                      ➕ Add Timeline Milestone
                    </button>
                  ) : (
                    <div className="paper-card bg-paper p-6 -rotate-0.5 border-[3px] border-ink w-full max-w-lg mb-6">
                      <h4 className="font-kalam text-2xl font-bold mb-4 border-b-[2px] border-dashed border-ink/20 pb-2">Add Milestone Event</h4>
                      {timelineError && (
                        <div className="bg-marker/10 border-l-4 border-marker p-3 font-patrick text-lg mb-4">
                          {timelineError}
                        </div>
                      )}
                      <form onSubmit={handleAddTimeline} className="flex flex-col gap-4 font-patrick text-lg">
                        <div>
                          <label className="input-label text-sm">Event Date *</label>
                          <input 
                            type="date" 
                            className="input bg-white" 
                            required 
                            value={timelineForm.event_date} 
                            onChange={e => setTimelineForm({...timelineForm, event_date: e.target.value})} 
                          />
                        </div>
                        <div>
                          <label className="input-label text-sm">Event Title *</label>
                          <input 
                            className="input" 
                            required 
                            placeholder="e.g. Born in Chicago, IL" 
                            value={timelineForm.title} 
                            onChange={e => setTimelineForm({...timelineForm, title: e.target.value})} 
                          />
                        </div>
                        <div>
                          <label className="input-label text-sm">Description (Optional)</label>
                          <textarea 
                            className="input h-24" 
                            placeholder="Describe this life milestone..." 
                            value={timelineForm.description} 
                            onChange={e => setTimelineForm({...timelineForm, description: e.target.value})} 
                          />
                        </div>
                        <div>
                          <label className="input-label text-sm">Event Photo (Optional)</label>
                          <input 
                            type="file" 
                            className="input bg-white text-sm" 
                            accept="image/*" 
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const compressed = await compressImage(file);
                                setTimelineForm({...timelineForm, image: compressed});
                              } else {
                                setTimelineForm({...timelineForm, image: null});
                              }
                            }} 
                          />
                        </div>
                        <div className="flex gap-3 mt-2">
                          <button type="submit" className="btn btn-primary px-6 py-2" disabled={timelineLoading}>
                            {timelineLoading ? 'Adding...' : 'Save Milestone'}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => { setShowTimelineForm(false); setTimelineError(''); }} 
                            className="btn btn-secondary px-4 py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {(!memorial.timeline_events || memorial.timeline_events.length === 0) ? (
                <p className="font-patrick text-xl italic text-ink/65 text-center py-6">No milestones added yet.</p>
              ) : (
                <div className="relative border-l-[3px] border-ink pl-8 ml-4 flex flex-col gap-8 py-4">
                  {memorial.timeline_events.map((ev, idx) => (
                    <div key={ev.id} className="relative animate-fade-in">
                      {/* Timeline dot */}
                      <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-[3px] border-ink bg-marker flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                      </div>

                      <div className={`p-4 border-[3px] border-ink wobbly-sm bg-white shadow-md inline-block max-w-lg ${idx % 2 === 0 ? 'rotate-0.5' : '-rotate-0.5'} relative`}>
                        {isContributor && (
                          <button
                            onClick={() => handleDeleteTimeline(ev.id)}
                            className="absolute top-2 right-2 text-ink/40 hover:text-marker font-bold text-sm"
                            title="Delete Milestone"
                            aria-label="Delete Milestone"
                          >
                            ✖
                          </button>
                        )}
                        <span className="font-kalam font-bold text-xl text-marker block mb-1">
                          {formatCalendarDate(ev.event_date)}
                        </span>
                        <h4 className="font-kalam text-2xl mb-2">{ev.title}</h4>
                        {ev.image_url && (
                          <div className="border-[2px] border-ink overflow-hidden max-h-48 mb-3 wobbly-xs">
                            <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        )}
                        {ev.description && (
                          <p className="font-patrick text-lg leading-relaxed text-ink/85">{ev.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Photo Gallery */}
          {activeTab === 'photos' && (
            <div className="paper-card p-6 -rotate-1">
              <h3 className="font-kalam text-3xl mb-6 underline decoration-wavy">Photo Album</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                
                {/* Profile Photo */}
                {memorial.profile_image_url && (
                  <div className="bg-white p-3 border-[3px] border-ink rotate-1 shadow-md wobbly-sm">
                    <div className="border-[2px] border-ink overflow-hidden aspect-square bg-erased">
                      <img src={memorial.profile_image_url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <p className="font-patrick text-center mt-2 text-sm">Portrait</p>
                  </div>
                )}

                {/* Additional Photos */}
                {memorial.photos && memorial.photos.map((ph, idx) => (
                  <div key={ph.id} className={`bg-white p-3 border-[3px] border-ink shadow-md wobbly-sm ${idx % 2 === 0 ? '-rotate-1' : 'rotate-2'}`}>
                    <div className="border-[2px] border-ink overflow-hidden aspect-square bg-erased">
                      <img src={ph.image_url} alt={ph.caption || 'Album Image'} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <p className="font-patrick text-center mt-2 text-sm">{ph.caption || 'Memory'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Contributors Management Dashboard */}
          {activeTab === 'contributors' && isOwner && (
            <div className="flex flex-col gap-8">
              
              {/* Invite Form */}
              <div className="paper-card p-6 bg-white rotate-1">
                <h3 className="font-kalam text-3xl mb-4">Invite a Contributor</h3>
                <p className="font-patrick text-lg text-ink/75 mb-4">
                  Invite a trusted relative or friend by their username. They can add stories, upload photos, and edit information.
                </p>

                {inviteError && (
                  <div className="bg-marker/10 border-l-4 border-marker p-3 font-patrick text-lg mb-4">
                    {inviteError}
                  </div>
                )}

                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="input-label text-sm">Username</label>
                    <input 
                      className="input" 
                      required 
                      value={inviteForm.username} 
                      onChange={e => setInviteForm({...inviteForm, username: e.target.value})} 
                      placeholder="e.g. relative_username" 
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <label className="input-label text-sm">Role</label>
                    <select 
                      className="input bg-white" 
                      value={inviteForm.role} 
                      onChange={e => setInviteForm({...inviteForm, role: e.target.value})}
                    >
                      <option value="FAMILY_MEMBER">Family Member</option>
                      <option value="EDITOR">Editor (Can edit biography/tribute)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary px-6 py-3 text-xl w-full sm:w-auto" disabled={inviteLoading}>
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </form>
              </div>

              {/* Contributors list */}
              <div className="paper-card p-6 bg-postit -rotate-1">
                <h3 className="font-kalam text-3xl mb-4">Existing Contributors</h3>
                <div className="flex flex-col gap-3">
                  {contributors.length === 0 ? (
                    <p className="font-patrick text-xl italic text-ink/65">No external contributors added yet.</p>
                  ) : (
                    contributors.map(c => (
                      <div key={c.id} className="flex justify-between items-center bg-white p-3 border-[2px] border-ink font-patrick text-lg wobbly-xs">
                        <div>
                          <strong>{c.username}</strong> <span className="text-ink/60">({c.email || 'No Email'})</span>
                        </div>
                        <span className="px-2 py-0.5 bg-marker text-white text-xs font-bold rounded">
                          {c.role}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar (Candles & Music) */}
        <div className="md:col-span-1 flex flex-col gap-8 sticky top-24">
          
          {/* Cassette Tape Player */}
          <CassetteTapePlayer />

          {/* Interactive Candle Lighting */}
          <InteractiveCandle 
            candlesCount={memorial.candles?.length || 0}
            onLight={handleLightCandle}
          />

          {/* Lit Candles List */}
          <div className="paper-card p-6 -rotate-1">
            <h4 className="font-kalam text-2xl mb-4 border-b-2 border-dashed border-ink/20 pb-2">Ignited Flames</h4>
            <div className="flex flex-col gap-4 max-h-[250px] overflow-y-auto pr-2">
              {memorial.candles && memorial.candles.map((candle, idx) => (
                <div key={candle.id} className={`flex gap-3 items-center p-3 border-[3px] border-ink wobbly-sm ${idx % 2 === 0 ? '-rotate-2 bg-white' : 'rotate-1 bg-erased'}`}>
                  <span className="text-3xl animate-pulse">🔥</span>
                  <div>
                    <div className="font-kalam text-xl leading-tight">{candle.lit_by}</div>
                    {candle.message && <div className="font-patrick text-lg italic mt-1 leading-tight">"{candle.message}"</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

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
