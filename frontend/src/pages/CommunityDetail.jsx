import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function CommunityDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchCommunity();
  }, [slug]);

  useEffect(() => {
    if (activeChannel) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchCommunity = async () => {
    try {
      const data = await api.get(`/api/communities/${slug}/`);
      setCommunity(data);
      if (data.channels?.length > 0) setActiveChannel(data.channels[0]);
    } catch {
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeChannel) return;
    try {
      const data = await api.get(`/api/communities/${slug}/c/${activeChannel.slug}/feed/`);
      setMessages(data.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/api/communities/${slug}/join/`);
      fetchCommunity();
    } catch (e) {
      alert('Failed to join');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChannel) return;
    try {
      const newMsg = await api.post(`/api/communities/${slug}/c/${activeChannel.slug}/post/`, { content: input });
      setMessages(prev => [...prev, newMsg]);
      setInput('');
    } catch (e) {
      alert('Failed to send');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-[4px] border-ink border-t-marker rounded-full animate-spin"></div>
    </div>
  );
  if (!community) return <div className="text-center font-kalam text-4xl mt-12">Community not found.</div>;

  const showJoin = user && !community.is_member;
  const showChat = community.is_member || community.is_public;

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      
      {/* Header */}
      <div className="paper-card p-6 mb-8 flex justify-between items-center bg-postit tape-decoration rotate-1">
        <div>
          <h1 className="font-kalam text-4xl mb-1">{community.name}</h1>
          <p className="font-patrick text-xl">{community.description}</p>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-patrick text-xl font-bold border-[3px] border-dashed border-ink p-2 wobbly-sm bg-white -rotate-2">
            👥 {community.member_count}
          </span>
          {showJoin && <button onClick={handleJoin} className="btn btn-primary text-xl">Join Group</button>}
        </div>
      </div>

      {showChat ? (
        <div className="grid md:grid-cols-4 gap-8 flex-1 min-h-0">
          {/* Sidebar Channels */}
          <div className="md:col-span-1 paper-card bg-white p-6 flex flex-col gap-4 overflow-y-auto tack-decoration -rotate-1">
            <h3 className="font-kalam text-2xl border-b-[3px] border-ink pb-2 mb-2">Channels</h3>
            {community.channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch)}
                className={`text-left p-3 border-[3px] border-ink wobbly-sm font-patrick text-xl font-bold transition-transform ${
                  activeChannel?.id === ch.id 
                    ? 'bg-marker text-white rotate-2' 
                    : 'bg-erased hover:-rotate-1'
                }`}
              >
                # {ch.name}
              </button>
            ))}
          </div>

          {/* Chat Area */}
          <div className="md:col-span-3 paper-card bg-white flex flex-col min-h-0 rotate-1">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-erased" style={{ backgroundImage: 'radial-gradient(#e5e0d8 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
              {messages.map((m, idx) => (
                <div key={m.id} className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2 pl-2">
                    <span className="font-kalam text-xl font-bold">{m.author_username}</span>
                    <span className="font-patrick text-base text-ink/60">{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`p-4 border-[3px] border-ink wobbly-sm font-patrick text-xl inline-block max-w-[80%] ${idx % 2 === 0 ? 'bg-white -rotate-1' : 'bg-postit rotate-1'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {community.is_member ? (
              <form onSubmit={handleSend} className="p-4 border-t-[3px] border-ink bg-white">
                <div className="flex gap-4">
                  <input
                    type="text"
                    className="input flex-1"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Scribble in #${activeChannel?.name || '...'}`}
                  />
                  <button type="submit" className="btn btn-primary text-xl">Post</button>
                </div>
              </form>
            ) : (
              <div className="p-6 text-center font-patrick text-xl font-bold border-t-[3px] border-ink bg-erased">
                You must join this community to send messages.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="paper-card p-16 text-center flex-1 flex flex-col items-center justify-center bg-erased">
          <span className="text-7xl mb-4 opacity-50">🔒</span>
          <h2 className="font-kalam text-5xl mb-4">Private Board</h2>
          <p className="font-patrick text-2xl">You need to join to view the notes posted here.</p>
        </div>
      )}
    </div>
  );
}
