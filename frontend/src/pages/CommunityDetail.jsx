import { useState, useEffect, useRef } from 'react';
import { compressImage } from '../utils/imageCompression';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import ReportModal from '../components/layout/ReportModal';
import SEO from '../components/layout/SEO';

export default function CommunityDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Basic States
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetType, setReportTargetType] = useState('COMMUNITY');
  const [reportTargetId, setReportTargetId] = useState(null);

  // Form States
  const [inputText, setInputText] = useState('');
  const [inputImage, setInputImage] = useState(null);
  const [postLoading, setPostLoading] = useState(false);

  // Moderator Action States
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const prevSlug = useRef(null);
  const prevMessagesLength = useRef(0);

  // Tab state for left panel: 'info', 'members', 'requests' (moderators only)
  const [activeLeftTab, setActiveLeftTab] = useState('info');

  // Mobile layout section toggle: 'chat' (Noticeboard) or 'about' (Rules, People, Requests)
  const [mobileActiveSection, setMobileActiveSection] = useState('chat');

  useEffect(() => {
    setCommunity(null);
    setMessages([]);
    fetchCommunity();
  }, [slug]);

  useEffect(() => {
    if (community && community.is_member) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [community]);

  useEffect(() => {
    if (!slug) return;

    const isNewSlug = prevSlug.current !== slug;
    const hasNewMessages = messages.length > prevMessagesLength.current;
    
    if (isNewSlug && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      prevSlug.current = slug;
      prevMessagesLength.current = messages.length;
    } else if (hasNewMessages) {
      const lastMsg = messages[messages.length - 1];
      const isMyMsg = lastMsg && lastMsg.author_username === user?.username;
      
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 120;
        if (isMyMsg || isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
      prevMessagesLength.current = messages.length;
    } else {
      prevMessagesLength.current = messages.length;
    }
  }, [messages, slug, user]);

  const fetchCommunity = async () => {
    try {
      const data = await api.get(`/api/communities/${slug}/`);
      setCommunity(data);

      if (data.is_member) {
        fetchMembers();
        if (data.is_admin) {
          fetchJoinRequests();
        }
      }
    } catch {
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await api.get(`/api/communities/${slug}/feed/`);
      setMessages(data.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await api.get(`/api/communities/${slug}/members/`);
      setMembers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const data = await api.get(`/api/communities/${slug}/requests/`);
      setJoinRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async () => {
    try {
      const data = await api.post(`/api/communities/${slug}/join/`);
      if (data.status === 'request_sent') {
        alert('Join request sent! Moderators will review your request.');
      } else {
        alert('Joined successfully!');
      }
      fetchCommunity();
    } catch (e) {
      alert(e.message || 'Failed to join community.');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this support circle?')) return;
    try {
      await api.post(`/api/communities/${slug}/leave/`);
      alert('You have left the community.');
      navigate('/communities');
    } catch (e) {
      alert(e.message || 'Failed to leave.');
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to ARCHIVE this community? This operation is permanent and disables all posting.')) return;
    try {
      await api.post(`/api/communities/${slug}/archive/`);
      alert('Community has been archived.');
      fetchCommunity();
    } catch (e) {
      alert(e.message || 'Failed to archive.');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !inputImage) return;
    setPostLoading(true);

    const formData = new FormData();
    formData.append('content', inputText);
    if (inputImage) {
      formData.append('image', inputImage);
    }

    try {
      const newMsg = await api.post(`/api/communities/${slug}/post/`, formData);
      setMessages(prev => [...prev, newMsg]);
      setInputText('');
      setInputImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      alert('Failed to send message.');
    } finally {
      setPostLoading(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Are you sure you want to delete this message? This soft delete keeps a placeholder.')) return;
    try {
      await api.post(`/api/communities/messages/${msgId}/delete/`);
      // Update state immediately
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_deleted: true } : m));
    } catch (e) {
      alert('Failed to delete message.');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    setInviteLoading(true);
    setInviteError('');

    try {
      await api.post(`/api/communities/${slug}/invite/`, { username: inviteUsername });
      alert(`Invitation sent to ${inviteUsername}!`);
      setInviteUsername('');
    } catch (err) {
      setInviteError(err.message || 'Failed to send invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await api.post(`/api/communities/requests/${requestId}/respond/`, { status });
      alert(`Request has been ${status.toLowerCase()}.`);
      fetchJoinRequests();
      fetchMembers();
    } catch (e) {
      alert('Failed to respond to request.');
    }
  };

  const handleUpdateRole = async (username, newRole) => {
    try {
      await api.post(`/api/communities/${slug}/members/${username}/role/`, { role: newRole });
      alert(`Role updated successfully to ${newRole === 'CO_ADMIN' ? 'Co-Admin' : 'Member'}.`);
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Failed to update role.');
    }
  };

  const handleRemoveMember = async (username) => {
    if (!window.confirm(`Are you sure you want to remove ${username} from the community?`)) return;
    try {
      await api.post(`/api/communities/${slug}/members/${username}/remove/`);
      alert('Member removed.');
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-[4px] border-ink border-t-marker rounded-full animate-spin"></div>
    </div>
  );
  if (!community) return <div className="text-center font-kalam text-4xl mt-12">Community not found.</div>;

  const showJoin = user && !community.is_member && !community.is_archived && community.community_type === 'PUBLIC';
  const showChat = community.is_member || community.community_type === 'PUBLIC';

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] gap-6">
      <SEO 
        title={`${community.title} – Support Community | Eterna`}
        description={community.description || "Join this Eterna circle to connect and share support."}
      />
      
      {/* Cover / Header Polaroid Banner */}
      <div className="relative border-[3px] border-ink wobbly-sm overflow-hidden bg-white shadow-md flex flex-col md:flex-row gap-6 p-6 rotate-0.5">
        {community.cover_image && (
          <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
            <img src={community.cover_image} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        
        {/* Community Icon */}
        <div className="w-20 h-20 bg-erased border-[3px] border-ink rounded wobbly-sm flex items-center justify-center font-kalam text-5xl flex-shrink-0 z-10 shadow-sm">
          {community.icon_image ? (
            <img src={community.icon_image} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            '👥'
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 z-10 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="font-kalam text-4xl md:text-5xl truncate">{community.title}</h1>
            {community.community_type === 'PRIVATE' ? (
              <span className="bg-marker text-white font-patrick px-2 py-0.5 border-[2px] border-ink wobbly-sm text-sm -rotate-2">Private Circle</span>
            ) : (
              <span className="bg-paper text-ink font-patrick px-2 py-0.5 border-[2px] border-ink wobbly-sm text-sm rotate-1">Public Circle</span>
            )}
            {community.is_archived && (
              <span className="bg-ink text-white font-patrick px-2 py-0.5 border-[2px] border-ink wobbly-sm text-sm rotate-2">Archived (Read Only)</span>
            )}
          </div>
          <p className="font-patrick text-xl text-ink/75 truncate">{community.description}</p>
        </div>

        {/* Buttons / Member Count */}
        <div className="flex items-center gap-4 z-10 self-center">
          <span className="font-patrick text-2xl font-bold border-[3px] border-dashed border-ink p-3 wobbly-sm bg-white -rotate-1">
            👥 {community.member_count}
          </span>
          {showJoin && (
            <button 
              onClick={handleJoin} 
              disabled={community.has_pending_request}
              className="btn btn-primary text-xl"
            >
              {community.has_pending_request ? 'Pending Approval...' : 'Request Access'}
            </button>
          )}
          {community.is_member && community.my_role !== 'ADMIN' && (
            <button onClick={handleLeave} className="btn btn-secondary text-lg">Leave Circle</button>
          )}
          {community.is_owner && !community.is_archived && (
            <button onClick={handleArchive} className="btn btn-secondary text-lg bg-marker text-white hover:bg-marker/90">Archive Circle</button>
          )}
          {user && !community.is_owner && (
            <button
              onClick={() => {
                setReportTargetType('COMMUNITY');
                setReportTargetId(community.id);
                setShowReportModal(true);
              }}
              className="btn btn-secondary text-lg text-marker border-2 border-marker hover:bg-marker hover:text-white"
            >
              🛡️ Report Circle
            </button>
          )}
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      {showChat ? (
        <>
          {/* Mobile Tab Selector */}
          <div className="md:hidden flex border-[3px] border-ink bg-white w-full font-kalam text-lg wobbly-sm mb-4 divide-x-[3px] divide-ink overflow-hidden">
            <button
              onClick={() => setMobileActiveSection('chat')}
              className={`flex-1 py-2 text-center font-bold transition-colors ${
                mobileActiveSection === 'chat' ? 'bg-postit text-ink' : 'bg-white hover:bg-erased'
              }`}
            >
              💬 Noticeboard
            </button>
            <button
              onClick={() => setMobileActiveSection('about')}
              className={`flex-1 py-2 text-center font-bold transition-colors ${
                mobileActiveSection === 'about' ? 'bg-postit text-ink' : 'bg-white hover:bg-erased'
              }`}
            >
              ℹ️ Circle Info
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-8 flex-1 min-h-0">
            
            {/* Left Panel: Info / Members / Requests (Tabs) */}
            <div className={`${mobileActiveSection === 'about' ? 'flex' : 'hidden'} md:flex md:col-span-1 paper-card bg-white p-6 flex-col gap-4 overflow-y-auto tack-decoration -rotate-0.5`}>
            <div className="flex border-b-[2px] border-ink/20 pb-2 mb-2 font-kalam text-lg gap-2 flex-wrap">
              <button 
                onClick={() => setActiveLeftTab('info')} 
                className={`px-2 py-0.5 rounded border-[2px] border-ink ${activeLeftTab === 'info' ? 'bg-postit font-bold' : 'bg-transparent'}`}
              >
                Rules
              </button>
              {community.is_member && (
                <button 
                  onClick={() => setActiveLeftTab('members')} 
                  className={`px-2 py-0.5 rounded border-[2px] border-ink ${activeLeftTab === 'members' ? 'bg-postit font-bold' : 'bg-transparent'}`}
                >
                  People
                </button>
              )}
              {community.is_admin && (
                <button 
                  onClick={() => setActiveLeftTab('requests')} 
                  className={`px-2 py-0.5 rounded border-[2px] border-ink ${activeLeftTab === 'requests' ? 'bg-postit font-bold' : 'bg-transparent'}`}
                >
                  Requests ({joinRequests.length})
                </button>
              )}
            </div>

            {/* Tab: Info / Rules / Welcome Message */}
            {activeLeftTab === 'info' && (
              <div className="flex flex-col gap-4 text-left font-patrick">
                {community.welcome_message && (
                  <div className="bg-postit/40 p-4 border-[2px] border-ink border-dashed wobbly-xs -rotate-1">
                    <h4 className="font-kalam text-xl font-bold mb-1">Welcome Message 🌸</h4>
                    <p className="text-lg italic">"{community.welcome_message}"</p>
                  </div>
                )}
                <div>
                  <h4 className="font-kalam text-2xl font-bold mb-2 underline decoration-wavy">Circle Rules</h4>
                  <pre className="whitespace-pre-wrap font-patrick text-xl leading-relaxed text-ink/80">{community.rules}</pre>
                </div>
              </div>
            )}

            {/* Tab: Members List & Promotion/Removal */}
            {activeLeftTab === 'members' && (
              <div className="flex flex-col gap-4 text-left font-patrick">
                
                {/* Invite Member form for moderators */}
                {community.is_admin && !community.is_archived && (
                  <form onSubmit={handleInvite} className="bg-erased p-3 border-[2px] border-ink wobbly-xs mb-2">
                    <h5 className="font-kalam text-lg font-bold mb-2">Invite Trusted Member</h5>
                    {inviteError && <p className="text-marker text-sm mb-1">{inviteError}</p>}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="input text-base flex-1 py-1 px-2" 
                        placeholder="Username" 
                        required
                        value={inviteUsername}
                        onChange={e => setInviteUsername(e.target.value)}
                      />
                      <button type="submit" disabled={inviteLoading} className="btn btn-primary text-sm py-1 px-3">
                        {inviteLoading ? 'Sending...' : 'Invite'}
                      </button>
                    </div>
                  </form>
                )}

                <h4 className="font-kalam text-2xl font-bold border-b-[2px] border-ink/10 pb-1 mb-2">Members ({members.length})</h4>
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                  {members.map(m => {
                    const isTargetAdmin = m.role === 'ADMIN';
                    const isTargetCoAdmin = m.role === 'CO_ADMIN';
                    
                    return (
                      <div key={m.id} className="flex justify-between items-center bg-paper/50 p-2 border-[2px] border-ink rounded wobbly-xs">
                        <div>
                          <span className="font-bold text-lg block">{m.username}</span>
                          <span className="text-xs font-bold text-marker/80 bg-white px-1.5 py-0.5 border border-ink/10 rounded">
                            {m.role}
                          </span>
                        </div>

                        {/* Mod Controls */}
                        {community.is_member && !community.is_archived && (
                          <div className="flex gap-1">
                            {/* Promote / Demote (ADMIN only) */}
                            {community.my_role === 'ADMIN' && !isTargetAdmin && (
                              <button 
                                onClick={() => handleUpdateRole(m.username, isTargetCoAdmin ? 'MEMBER' : 'CO_ADMIN')}
                                className="text-xs bg-postit border border-ink px-1.5 py-0.5 rounded hover:bg-ink hover:text-white"
                                title={isTargetCoAdmin ? 'Demote to regular Member' : 'Promote to Co-Admin'}
                              >
                                {isTargetCoAdmin ? 'Demote' : 'Promote'}
                              </button>
                            )}

                            {/* Remove Member */}
                            {community.is_admin && !isTargetAdmin && (
                              // Co-admin can only remove regular members
                              (community.my_role === 'ADMIN' || (community.my_role === 'CO_ADMIN' && !isTargetCoAdmin)) && (
                                <button 
                                  onClick={() => handleRemoveMember(m.username)}
                                  className="text-xs bg-white text-marker border border-marker/40 px-1.5 py-0.5 rounded hover:bg-marker hover:text-white font-bold"
                                  title="Remove from community"
                                  aria-label="Remove from community"
                                >
                                  ✖
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Join Requests (Moderators Only) */}
            {activeLeftTab === 'requests' && community.is_admin && (
              <div className="flex flex-col gap-4 text-left font-patrick">
                <h4 className="font-kalam text-2xl font-bold border-b-[2px] border-ink/10 pb-1 mb-2">Pending Requests</h4>
                <div className="flex flex-col gap-3">
                  {joinRequests.length === 0 ? (
                    <p className="italic text-ink/60">No pending join requests.</p>
                  ) : (
                    joinRequests.map(r => (
                      <div key={r.id} className="bg-postit p-3 border-[2px] border-ink rounded wobbly-sm flex flex-col gap-2">
                        <div>
                          <span className="font-bold text-lg">{r.username}</span>
                          <span className="text-xs text-ink/60 block">Requested {new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRespondRequest(r.id, 'APPROVED')} 
                            className="bg-white border-[2px] border-ink px-2 py-0.5 text-sm hover:bg-ink hover:text-white font-bold flex-1"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRespondRequest(r.id, 'REJECTED')} 
                            className="bg-white border-[2px] border-ink text-marker px-2 py-0.5 text-sm hover:bg-marker hover:text-white font-bold flex-1"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Chat Area */}
          <div className={`${mobileActiveSection === 'chat' ? 'flex' : 'hidden'} md:flex md:col-span-3 paper-card bg-white flex-col min-h-0 rotate-0.5`}>
            {community.is_member ? (
              <>
                {/* Messages Feed */}
                <div 
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-erased" 
                  style={{ backgroundImage: 'radial-gradient(#e5e0d8 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
                >
                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 font-patrick">
                      <span className="text-5xl mb-2">✏️</span>
                      <p className="text-2xl font-bold text-ink/60">The noticeboard is currently blank.</p>
                      <p className="text-lg text-ink/50">Write the first note to start the circle.</p>
                    </div>
                  ) : (
                    messages.map((m, idx) => {
                      const isDeleted = m.is_deleted;
                      const isAuthor = user && m.author_username === user.username;
                      const isMod = community.is_member && community.is_admin;
                      const showDelete = !isDeleted && user && (isAuthor || isMod);
                      
                      return (
                        <div key={m.id} className="flex flex-col gap-1 align-start max-w-[85%] self-start relative">
                          <div className="flex items-baseline gap-2 pl-2">
                            <span className="font-kalam text-xl font-bold">{m.author_username}</span>
                            <span className="font-patrick text-base text-ink/60">
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                            
                            {/* Report Button */}
                            {!isDeleted && user && !isAuthor && (
                              <button
                                onClick={() => {
                                  setReportTargetType('MESSAGE');
                                  setReportTargetId(m.id);
                                  setShowReportModal(true);
                                }}
                                className="ml-2 text-ink/30 hover:text-marker text-xs"
                                title="Report Message"
                              >
                                🛡️
                              </button>
                            )}
                            {/* Delete Button */}
                            {showDelete && (
                              <button
                                onClick={() => handleDeleteMessage(m.id)}
                                className="ml-2 text-ink/30 hover:text-marker font-bold text-xs"
                                title="Delete Message"
                                aria-label="Delete Message"
                              >
                                ✖
                              </button>
                            )}
                          </div>

                          {/* Message Content Bubble */}
                          <div className={`p-4 border-[3px] border-ink wobbly-sm font-patrick text-xl shadow-sm ${
                            isDeleted 
                              ? 'bg-paper/40 text-ink/40 border-dashed italic' 
                              : idx % 2 === 0 ? 'bg-white -rotate-0.5' : 'bg-postit rotate-0.5'
                          }`}>
                            {isDeleted ? (
                              '[This message was deleted]'
                            ) : (
                              <>
                                {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                                {m.image && (
                                  <div className="mt-3 border-2 border-ink wobbly-xs rounded overflow-hidden max-w-sm bg-white shadow-sm rotate-0.5">
                                    <img src={m.image} alt="Upload" className="w-full object-contain max-h-60" />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form at Bottom */}
                <form onSubmit={handleSend} className="p-4 border-t-[3px] border-ink bg-white flex flex-col gap-2">
                  {community.is_archived ? (
                    <div className="text-center font-patrick text-xl font-bold text-ink/50 py-2">
                      🚫 This circle has been archived. Writing is disabled.
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          className="input flex-1"
                          value={inputText}
                          onChange={e => setInputText(e.target.value)}
                          placeholder="Scribble a message on the board..."
                          disabled={postLoading}
                        />
                        <button 
                          type="submit" 
                          disabled={postLoading || (!inputText.trim() && !inputImage)}
                          className="btn btn-primary text-xl"
                        >
                          {postLoading ? '...' : 'Post'}
                        </button>
                      </div>

                      {/* Image Attachment Input */}
                      <div className="flex items-center gap-4 text-sm font-patrick">
                        <label className="cursor-pointer bg-erased hover:bg-paper border-2 border-ink px-2 py-0.5 rounded wobbly-sm flex items-center gap-1 select-none">
                          📸 Attach Image
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const compressed = await compressImage(file);
                                setInputImage(compressed);
                              } else {
                                setInputImage(null);
                              }
                            }}
                          />
                        </label>
                        {inputImage && (
                          <span className="text-ink/60 truncate flex items-center gap-1">
                            📎 {inputImage.name}
                            <button 
                              type="button" 
                              onClick={() => { setInputImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                              className="text-marker font-bold"
                            >
                              [remove]
                            </button>
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 font-patrick bg-erased gap-6">
                <span className="text-6xl mb-2">💬</span>
                <h3 className="font-kalam text-3xl font-bold text-ink">Join the Circle</h3>
                <p className="text-xl max-w-md text-ink/75 leading-relaxed">
                  {user 
                    ? "This chat feed is private to members of this community. Join this support circle to view the board, see notifications, and post your own messages."
                    : "You must be logged in and a member of this community to view the chat and post messages."}
                </p>
                {user ? (
                  <button
                    onClick={handleJoin}
                    className="btn btn-primary text-xl px-8 py-3 shadow-hard hover:scale-105 transition-transform w-fit"
                  >
                    Join Support Circle
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate('/login')}
                      className="btn btn-primary text-xl px-6 py-2 shadow-hard hover:scale-105 transition-transform"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="btn btn-secondary text-xl px-6 py-2 shadow-hard hover:scale-105 transition-transform"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </>
      ) : (
        <div className="paper-card p-16 text-center flex-1 flex flex-col items-center justify-center bg-erased wobbly-sm rotate-1">
          <span className="text-7xl mb-4 opacity-50">🔒</span>
          <h2 className="font-kalam text-5xl mb-4">Private Support Circle</h2>
          <p className="font-patrick text-2xl mb-6">This board is private. You must receive an invitation from moderators to view content and participate.</p>
          {community.has_pending_invite && (
            <div className="bg-white p-6 border-[3px] border-ink wobbly-sm rotate-1 shadow-md max-w-md">
              <p className="font-kalam text-xl font-bold mb-4">🌸 You have been invited to join this support circle!</p>
              {/* Accept invite buttons - we can implement this later or find the request id */}
              <p className="text-base text-ink/75">Go to your notifications or dashboard to accept the invitation, or accept via invitation list (implemented in Profile page).</p>
            </div>
          )}
        </div>
      )}

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
