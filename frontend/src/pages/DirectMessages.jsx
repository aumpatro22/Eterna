import { useState, useEffect, useRef } from 'react';
import { compressImage } from '../utils/imageCompression';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function DirectMessages() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Conversations states
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [convLoading, setConvLoading] = useState(true);

  // Message states
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [inputImage, setInputImage] = useState(null);
  const [sendLoading, setSendLoading] = useState(false);

  // Search/New conversation states
  const [newChatUsername, setNewChatUsername] = useState('');
  const [newChatLoading, setNewChatLoading] = useState(false);
  const [newChatError, setNewChatError] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);

  // Live Search recommendations
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Mobile layout state
  const [showChatListOnMobile, setShowChatListOnMobile] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const prevActiveConvId = useRef(null);
  const prevMessagesLength = useRef(0);
  const searchWrapperRef = useRef(null);

  const autoStartChat = async (targetUsername) => {
    try {
      const data = await api.post('/api/conversations/create/', { username: targetUsername });
      setConversations(prev => {
        if (prev.some(c => c.id === data.id)) return prev;
        return [data, ...prev];
      });
      setActiveConv(data);
      setShowChatListOnMobile(false);
      setShowNewChatForm(false);
    } catch (e) {
      console.error('Failed to auto-start conversation', e);
    }
  };

  useEffect(() => {
    fetchConversations();
    if (location.state?.startChatWith) {
      autoStartChat(location.state.startChatWith);
    }
  }, [location.state]);

  useEffect(() => {
    if (activeConv) {
      setMessages([]);
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [activeConv]);

  useEffect(() => {
    if (!activeConv) return;

    const isNewConv = prevActiveConvId.current !== activeConv.id;
    const hasNewMessages = messages.length > prevMessagesLength.current;
    
    if (isNewConv && messages.length > 0) {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        }, 50);
      }
      prevActiveConvId.current = activeConv.id;
      prevMessagesLength.current = messages.length;
    } else if (hasNewMessages) {
      const lastMsg = messages[messages.length - 1];
      const isMyMsg = lastMsg && lastMsg.sender_username === user?.username;
      
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 120;
        if (isMyMsg || isNearBottom) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 50);
        }
      }
      prevMessagesLength.current = messages.length;
    } else {
      prevMessagesLength.current = messages.length;
    }
  }, [messages, activeConv, user]);

  // Click outside search recommendations list to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced user search matching what user types
  useEffect(() => {
    if (!newChatUsername.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      setShowDropdown(true);
      try {
        const data = await api.get(`/api/users/search/?q=${encodeURIComponent(newChatUsername)}&limit=5`);
        setSearchResults(data.results || []);
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [newChatUsername]);

  const fetchConversations = async () => {
    try {
      const data = await api.get('/api/conversations/');
      setConversations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setConvLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeConv) return;
    try {
      const data = await api.get(`/api/conversations/${activeConv.id}/messages/`);
      setMessages(data.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!newChatUsername.trim()) return;
    setNewChatLoading(true);
    setNewChatError('');

    try {
      const data = await api.post('/api/conversations/create/', { username: newChatUsername });
      
      // Update conversations list
      setConversations(prev => {
        if (prev.some(c => c.id === data.id)) return prev;
        return [data, ...prev];
      });
      
      setActiveConv(data);
      setShowChatListOnMobile(false);
      setNewChatUsername('');
      setShowNewChatForm(false);
    } catch (err) {
      setNewChatError(err.message || 'User not found or invalid.');
    } finally {
      setNewChatLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeConv) return;
    if (!inputText.trim() && !inputImage) return;
    setSendLoading(true);

    const formData = new FormData();
    formData.append('content', inputText);
    if (inputImage) {
      formData.append('image', inputImage);
    }

    try {
      const data = await api.post(`/api/conversations/${activeConv.id}/messages/send/`, formData);
      setMessages(prev => [...prev, data]);
      setInputText('');
      setInputImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Refresh conversations list to show updated last message
      fetchConversations();
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSendLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!activeConv) return;
    const blockAction = activeConv.is_blocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${blockAction} this conversation?`)) return;

    try {
      const data = await api.post(`/api/conversations/${activeConv.id}/block/`);
      
      // Update activeConv state locally
      const updatedConv = {
        ...activeConv,
        is_blocked: data.status === 'blocked',
        blocked_by: data.status === 'blocked' ? user.id : null
      };
      
      setActiveConv(updatedConv);
      setConversations(prev => prev.map(c => c.id === activeConv.id ? updatedConv : c));
      alert(`Conversation ${data.status}.`);
    } catch (err) {
      alert(err.message || 'Failed to block/unblock conversation.');
    }
  };

  // Helper to get target participant name
  const getParticipantName = (conv) => {
    if (!conv || !conv.participants) return 'Chat';
    const other = conv.participants.find(p => p.username !== user.username);
    return other ? other.username : 'User';
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 font-patrick">
      
      {/* Left Pane: Conversations list & search */}
      <div className={`${showChatListOnMobile ? 'flex' : 'hidden'} md:flex md:col-span-1 paper-card bg-white p-6 flex-col gap-4 md:w-80 w-full overflow-y-auto tack-decoration -rotate-0.5`}>
        <h3 className="font-kalam text-3xl border-b-[3px] border-ink pb-2 mb-2">My Conversations</h3>

        {/* Start new conversation */}
        <div ref={searchWrapperRef} className="relative mb-2">
          {!showNewChatForm ? (
            <button
              type="button"
              onClick={() => setShowNewChatForm(true)}
              className="btn btn-secondary w-full text-base py-1.5 px-3 flex items-center justify-center gap-1 bg-white hover:bg-postit/40"
            >
              ➕ Start a New Chat
            </button>
          ) : (
            <form onSubmit={handleStartChat} className="bg-erased p-3 border-[2px] border-ink wobbly-sm">
              <div className="flex justify-between items-center mb-2 border-b border-ink/10 pb-1">
                <h4 className="font-kalam text-lg font-bold">Start a New Chat</h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatForm(false);
                    setNewChatUsername('');
                    setNewChatError('');
                  }}
                  className="text-marker font-bold text-xs hover:underline"
                >
                  ✕ Close
                </button>
              </div>
              {newChatError && <p className="text-marker text-sm mb-1">{newChatError}</p>}
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input text-base flex-1 py-1 px-2"
                  placeholder="Enter username..."
                  required
                  value={newChatUsername}
                  onChange={e => {
                    setNewChatUsername(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (newChatUsername.trim()) {
                      setShowDropdown(true);
                    }
                  }}
                />
                <button type="submit" disabled={newChatLoading} className="btn btn-primary text-sm py-1 px-3">
                  {newChatLoading ? '...' : 'Chat'}
                </button>
              </div>

              {/* Live Search Recommendations */}
              {showDropdown && newChatUsername.trim() && (
                <div className="mt-2 bg-white border-[2px] border-ink p-1 wobbly-xs max-h-48 overflow-y-auto flex flex-col gap-1 z-10">
                  {searchLoading && <div className="text-xs text-ink/75 p-1 animate-pulse">Searching...</div>}
                  {!searchLoading && searchResults.length === 0 && (
                    <div className="text-xs text-ink/50 italic p-1">No users found.</div>
                  )}
                  {!searchLoading && searchResults.map(profile => (
                    <div 
                      key={profile.user.username} 
                      className="flex items-center justify-between p-1.5 hover:bg-postit/50 rounded border-b border-ink/10 last:border-0"
                    >
                      <div 
                        onClick={() => {
                          setNewChatUsername(profile.user.username);
                          autoStartChat(profile.user.username);
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                      >
                        <img
                          src={profile.avatar_url || `${import.meta.env.BASE_URL}default_avatar.jpg`}
                          alt={profile.user.username}
                          className="w-7 h-7 rounded-full border border-ink object-cover"
                          onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.jpg` }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs truncate leading-tight">
                            {profile.display_name || profile.user.username}
                          </span>
                          <span className="text-[10px] text-ink/60 truncate leading-none">
                            @{profile.user.username}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setNewChatUsername(profile.user.username);
                            autoStartChat(profile.user.username);
                            setShowDropdown(false);
                          }}
                          className="text-[10px] font-bold bg-postit border border-ink px-1.5 py-0.5 rounded hover:bg-postit/80"
                        >
                          Chat
                        </button>
                        <Link
                          to={`/profile/${profile.user.username}`}
                          className="text-[10px] font-bold bg-white border border-ink px-1.5 py-0.5 rounded hover:bg-erased/80 text-center"
                        >
                          Explore
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          )}
        </div>

        {/* List of active chats */}
        <div className="flex flex-col gap-3">
          {convLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-[2px] border-ink border-t-marker rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <p className="italic text-ink/60 text-center py-4">No conversations yet.</p>
          ) : (
            conversations.map(c => {
              const name = getParticipantName(c);
              const isSelected = activeConv && activeConv.id === c.id;
              
              return (
                <button
                  key={c.id}
                  onClick={() => { setActiveConv(c); setShowChatListOnMobile(false); }}
                  className={`text-left p-3 border-[3px] border-ink wobbly-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-postit rotate-1 shadow-sm'
                      : 'bg-white hover:-rotate-1'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-kalam text-xl text-ink">{name}</span>
                    {c.is_blocked && (
                      <span className="text-xs bg-marker text-white px-1 rounded">Blocked</span>
                    )}
                  </div>
                  {c.last_message ? (
                    <div className="text-sm text-ink/75 truncate">
                      <strong>{c.last_message.sender === user.username ? 'You: ' : ''}</strong>
                      {c.last_message.content || '📷 Photo'}
                    </div>
                  ) : (
                    <span className="text-xs text-ink/50 italic">New Conversation</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Chat History & Inputs */}
      <div className={`${!showChatListOnMobile ? 'flex' : 'hidden'} md:flex flex-1 paper-card bg-white flex-col min-h-0 rotate-0.5`}>
        {activeConv ? (
          <>
            {/* Active chat header */}
            <div className="p-4 border-b-[3px] border-ink bg-postit flex justify-between items-center rotate-0.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowChatListOnMobile(true)}
                  className="md:hidden bg-white border-[2px] border-ink px-2.5 py-1 text-base font-bold wobbly-sm hover:-rotate-1 active:translate-y-0.5 mr-1"
                >
                  ← Back
                </button>
                <h3 className="font-kalam text-2xl md:text-3xl">Chat with {getParticipantName(activeConv)}</h3>
              </div>
              <div className="flex gap-2">
                {activeConv.is_blocked ? (
                  activeConv.blocked_by === user.id ? (
                    <button onClick={handleBlockToggle} className="btn btn-secondary text-base py-1 px-3 bg-white">
                      🔓 Unblock Chat
                    </button>
                  ) : (
                    <span className="text-marker font-bold text-sm bg-white/80 border-[2px] border-ink p-1 rounded">
                      🚫 Conversation Blocked
                    </span>
                  )
                ) : (
                  <button onClick={handleBlockToggle} className="btn btn-secondary text-base py-1 px-3 bg-white text-marker hover:bg-marker hover:text-white">
                    🚫 Block User
                  </button>
                )}
              </div>
            </div>

            {/* Messages history */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-erased"
              style={{ backgroundImage: 'radial-gradient(#e5e0d8 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
            >
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 font-patrick">
                  <span className="text-5xl mb-2">🌸</span>
                  <p className="text-2xl font-bold text-ink/50">This conversation is quiet.</p>
                  <p className="text-lg text-ink/40">Say hello to start building connections.</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = user && m.sender_username === user.username;
                  
                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col gap-1 max-w-[75%] ${
                        isMe ? 'self-end align-end' : 'self-start align-start'
                      }`}
                    >
                      <div className={`flex items-baseline gap-2 px-1 ${isMe ? 'justify-end' : ''}`}>
                        {!isMe && <span className="font-kalam text-lg font-bold">{m.sender_username}</span>}
                        <span className="text-xs text-ink/50">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>

                      <div className={`p-4 border-[3px] border-ink wobbly-sm text-xl shadow-sm ${
                        isMe 
                          ? 'bg-postit rotate-0.5' 
                          : 'bg-white -rotate-0.5'
                      }`}>
                        {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                        {m.image && (
                          <div className="mt-3 border-2 border-ink wobbly-xs rounded overflow-hidden w-full max-w-[260px] sm:max-w-sm bg-white shadow-sm rotate-0.5">
                            <img src={m.image} alt="Direct share" className="w-full object-contain max-h-60" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Messages send form */}
            <form onSubmit={handleSend} className="p-4 border-t-[3px] border-ink bg-white flex flex-col gap-2">
              {activeConv.is_blocked ? (
                <div className="text-center font-bold text-marker/75 py-2">
                  🚫 Conversation is blocked. You cannot send messages.
                </div>
              ) : (
                <>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Write a private letter..."
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      disabled={sendLoading}
                    />
                    <button 
                      type="submit" 
                      disabled={sendLoading || (!inputText.trim() && !inputImage)}
                      className="btn btn-primary text-xl"
                    >
                      {sendLoading ? '...' : 'Send'}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm font-patrick">
                    <label className="cursor-pointer bg-erased hover:bg-paper border-2 border-ink px-2 py-0.5 rounded wobbly-sm flex items-center gap-1 select-none">
                      📸 Share Photo
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-erased">
            <span className="text-7xl mb-4 opacity-50">✉️</span>
            <h2 className="font-kalam text-4xl mb-2">Private Letters</h2>
            <p className="text-2xl text-ink/75 max-w-md">Select a contact from the sidebar or search a username above to start messaging privately.</p>
          </div>
        )}
      </div>
    </div>
  );
}
