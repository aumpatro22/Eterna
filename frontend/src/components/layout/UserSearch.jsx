import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function UserSearch({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.get(`/api/users/search/?q=${encodeURIComponent(query)}&limit=5`);
        setResults(data.results || []);
        setOpen(true);
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (username) => {
    setOpen(false);
    setQuery('');
    navigate(`/profile/${username}`);
    if (onNavigate) onNavigate();
  };

  return (
    <div ref={wrapperRef} className="relative z-[60] flex items-center">
      <div className="relative">
        <input
          type="text"
          placeholder="Search people..."
          className="input font-patrick w-40 md:w-56 py-1.5 px-3 pr-8 text-base border-[3px] border-ink rounded wobbly-xs focus:ring-0 focus:outline-none focus:border-marker transition-colors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setOpen(true); }}
        />
        <svg className="w-5 h-5 absolute right-2 top-2 text-ink/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {open && (
        <div className="absolute top-full mt-2 w-full min-w-[220px] right-0 md:left-0 bg-white border-[3px] border-ink p-2 shadow-hard wobbly-sm max-h-80 overflow-y-auto">
          {loading && <div className="text-sm font-patrick text-ink/70 text-center py-2 animate-pulse">Searching memories...</div>}
          
          {!loading && results.length === 0 && (
            <div className="text-sm font-patrick text-ink/70 text-center py-2">No people found.</div>
          )}
          
          {!loading && results.map((profile) => (
            <button
              key={profile.user.username}
              className="w-full flex items-center gap-3 p-2 hover:bg-postit cursor-pointer border-b-[2px] border-ink/10 last:border-0 transition-colors text-left"
              onClick={() => handleSelect(profile.user.username)}
            >
              <img
                src={profile.avatar_url || `${import.meta.env.BASE_URL}default_avatar.jpg`}
                alt={profile.user.username}
                className="w-10 h-10 rounded-full border-[2px] border-ink object-cover"
                onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.jpg` }}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold font-kalam text-base leading-tight text-ink truncate">
                  {profile.display_name || profile.user.username}
                </span>
                <span className="text-sm font-patrick text-ink/70 leading-tight truncate">
                  @{profile.user.username}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
