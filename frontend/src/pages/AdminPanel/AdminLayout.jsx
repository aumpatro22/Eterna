import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';

// Views
import Dashboard from './Dashboard';
import UsersList from './UsersList';
import SessionsList from './SessionsList';
import MemorialsList from './MemorialsList';
import TalesList from './TalesList';
import CommunitiesList from './CommunitiesList';
import MessagesModeration from './MessagesModeration';
import ReportsCenter from './ReportsCenter';
import MediaLibrary from './MediaLibrary';
import ContactMessages from './ContactMessages';
import OwnershipRequests from './OwnershipRequests';
import RecoveryCenter from './RecoveryCenter';
import Analytics from './Analytics';
import DatabaseHealth from './DatabaseHealth';
import AuditLogs from './AuditLogs';
import PlatformStatus from './PlatformStatus';

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Global search everywhere state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchFocus, setSearchFocus] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await api.get(`/api/admin/global-search/?q=${searchQuery}`);
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#F8F5F0] z-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Auth roles guard
  const isAdmin = user && (user.role === 'ADMIN' || user.is_superuser);
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-[#F8F5F0] z-50 flex items-center justify-center p-6 text-center select-none font-patrick">
        <div className="bg-white border-3 border-[#2E241B] p-12 max-w-lg w-full rounded-lg shadow-hard -rotate-1">
          <h1 className="font-kalam text-5xl text-red-600 font-bold mb-4">403 Forbidden</h1>
          <p className="text-2xl text-[#2E241B] mb-8">
            Access denied. You must be signed in with Eterna admin credentials to access the moderation archives.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/" className="btn btn-secondary px-6 py-2">Return Home</Link>
            <Link to="/login" className="btn btn-primary px-6 py-2">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: '🏠 Dashboard', path: '/admin-panel' },
    { name: '👥 Users', path: '/admin-panel/users' },
    { name: '👥 Sessions', path: '/admin-panel/sessions' },
    { name: '📚 Memorials', path: '/admin-panel/memorials' },
    { name: '📖 Tales', path: '/admin-panel/tales' },
    { name: '🏡 Communities', path: '/admin-panel/communities' },
    { name: '💬 Messages', path: '/admin-panel/messages' },
    { name: '🚩 Reports', path: '/admin-panel/reports' },
    { name: '🖼 Media Library', path: '/admin-panel/media' },
    { name: '📧 Support Inbox', path: '/admin-panel/contact' },
    { name: '🗝 Ownership Claims', path: '/admin-panel/ownership' },
    { name: '🚪 Recovery Center', path: '/admin-panel/recovery' },
    { name: '📊 Analytics', path: '/admin-panel/analytics' },
    { name: '🗄 System Health', path: '/admin-panel/health' },
    { name: '📝 Audit Logs', path: '/admin-panel/audit-logs' },
    { name: '⚙ Settings', path: '/admin-panel/status' }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F5F0] text-[#2E241B] font-patrick select-text relative">
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#2E241B] text-[#F8F5F0] flex flex-col justify-between border-r border-[#C59B5C]/30 shrink-0 select-none transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Header */}
          <div className="p-6 border-b border-[#F8F5F0]/10 flex justify-between items-center relative">
            <div className="flex flex-col items-center flex-1">
              <h1 className="font-kalam text-3xl font-bold text-[#C59B5C] tracking-wide text-center">ETERNA</h1>
              <p className="text-xs uppercase tracking-widest text-[#F8F5F0]/50 font-sans mt-1 text-center">Archive moderations</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-[#F8F5F0] hover:text-[#C59B5C] text-2xl font-bold p-1 absolute right-4 top-5"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Links list */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin-panel'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-lg rounded transition-all ${
                    isActive
                      ? 'bg-[#C59B5C]/15 text-[#C59B5C] font-bold border-l-4 border-[#C59B5C] pl-3'
                      : 'hover:bg-[#C59B5C]/5 text-[#F8F5F0]/85 hover:text-white'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#F8F5F0]/10 bg-black/10 shrink-0">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="truncate">
              <div className="font-bold text-white truncate">{user.username}</div>
              <span className="text-xs text-[#C59B5C] font-bold uppercase font-mono">{user.role || 'STAFF'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-[#F8F5F0] hover:text-[#C59B5C] px-2.5 py-1 text-xs rounded border border-[#F8F5F0]/20 font-bold shrink-0 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-white border-b border-[#2E241B]/10 h-16 px-4 md:px-6 flex justify-between items-center shrink-0 shadow-sm relative z-30 select-none">
          
          <div className="flex items-center flex-1 mr-4 min-w-0">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 mr-3 text-xl font-bold bg-[#F8F5F0] border border-[#2E241B] rounded hover:bg-[#C59B5C]/15 active:bg-[#C59B5C]/30 transition-colors cursor-pointer select-none"
              aria-label="Open menu"
            >
              ☰
            </button>

            {/* Universal Search bar */}
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search everywhere..."
                className="w-full bg-[#F8F5F0] border border-[#2E241B]/20 focus:border-[#C59B5C] px-4 py-1.5 pl-10 rounded-full font-patrick text-base outline-none transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
              />
              <span className="absolute left-4.5 top-2.5 text-xs opacity-40">🔍</span>

              {/* Global Search Dropdown */}
              {searchFocus && searchResults && (
                <div className="absolute top-11 left-0 w-96 bg-white border-2 border-[#2E241B] shadow-hard rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto text-left font-patrick">
                  {/* Users result */}
                  {searchResults.users.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#C59B5C] uppercase border-b border-gray-100 pb-1 mb-1.5">Users</h4>
                      <ul className="space-y-1">
                        {searchResults.users.map((u) => (
                          <li key={u.id}>
                            <Link to="users" className="block hover:bg-gray-50 px-2 py-0.5 rounded text-sm">
                              <span className="font-bold">{u.username}</span> <span className="text-gray-500 text-xs">({u.email})</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Memorials result */}
                  {searchResults.memorials.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#C59B5C] uppercase border-b border-gray-100 pb-1 mb-1.5">Memorials</h4>
                      <ul className="space-y-1">
                        {searchResults.memorials.map((m) => (
                          <li key={m.id}>
                            <Link to="memorials" className="block hover:bg-gray-50 px-2 py-0.5 rounded text-sm">
                              <span className="font-bold">{m.full_name}</span> <span className="text-xs text-gray-500 font-mono">Owner: {m.owner}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Communities result */}
                  {searchResults.communities.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#C59B5C] uppercase border-b border-gray-100 pb-1 mb-1.5">Communities</h4>
                      <ul className="space-y-1">
                        {searchResults.communities.map((c) => (
                          <li key={c.id}>
                            <Link to="communities" className="block hover:bg-gray-50 px-2 py-0.5 rounded text-sm">
                              <span className="font-bold">{c.title}</span> <span className="text-xs text-gray-500 font-mono">Owner: {c.owner}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {searchResults.users.length === 0 &&
                   searchResults.memorials.length === 0 &&
                   searchResults.communities.length === 0 && (
                    <p className="text-sm italic text-gray-500 text-center py-2">No matching records found.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 items-center shrink-0">
            <Link
              to="/"
              className="bg-white border border-[#2E241B] hover:bg-gray-50 px-3 py-1 text-sm font-bold rounded flex items-center gap-1.5 transition-colors"
            >
              Back to Website ➜
            </Link>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersList currentUser={user} />} />
            <Route path="/sessions" element={<SessionsList currentUser={user} />} />
            <Route path="/memorials" element={<MemorialsList />} />
            <Route path="/tales" element={<TalesList />} />
            <Route path="/communities" element={<CommunitiesList currentUser={user} />} />
            <Route path="/messages" element={<MessagesModeration />} />
            <Route path="/reports" element={<ReportsCenter currentUser={user} />} />
            <Route path="/media" element={<MediaLibrary />} />
            <Route path="/contact" element={<ContactMessages />} />
            <Route path="/ownership" element={<OwnershipRequests />} />
            <Route path="/recovery" element={<RecoveryCenter />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/health" element={<DatabaseHealth />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/status" element={<PlatformStatus currentUser={user} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
