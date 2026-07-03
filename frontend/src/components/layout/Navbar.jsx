import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar({ sketchMode, setSketchMode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={`sticky top-0 bg-paper/90 backdrop-blur-sm border-b-[3px] border-ink shadow-hard ${sketchMode ? 'z-[10000]' : 'z-50'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img
            src={`${import.meta.env.BASE_URL}eterna-logo.webp`}
            alt="Eterna – Preserve Memories. Share Stories."
            className="h-14 w-auto transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="font-patrick text-xl font-bold md:hover:-rotate-2 transition-transform decoration-wavy md:hover:underline">Home</Link>
          <Link to="/memorials" className="font-patrick text-xl font-bold md:hover:-rotate-2 transition-transform decoration-wavy md:hover:underline">Memorials</Link>
          <Link to="/communities" className="font-patrick text-xl font-bold md:hover:-rotate-2 transition-transform decoration-wavy md:hover:underline">Communities</Link>
          <Link to="/tales" className="font-patrick text-xl font-bold md:hover:-rotate-2 transition-transform decoration-wavy md:hover:underline">Tales</Link>
          <Link to="/about" className="font-patrick text-xl font-bold md:hover:-rotate-2 transition-transform decoration-wavy md:hover:underline">About</Link>
          {user && (
            <Link to="/messages" className="font-patrick text-xl font-bold md:hover:-rotate-2 transition-transform decoration-wavy md:hover:underline">Messages</Link>
          )}
          {user && (user.role === 'ADMIN' || user.is_superuser) && (
            <Link to="/admin-panel" className="font-patrick text-xl font-bold text-[#C59B5C] md:hover:-rotate-2 transition-transform decoration-wavy md:hover:underline">Admin</Link>
          )}

          {/* Sketch Mode Toggler */}
          <button
            onClick={() => setSketchMode(!sketchMode)}
            className={`wobbly-sm border-[3px] border-ink px-3 py-1 font-patrick font-bold text-lg transition-all select-none ${
              sketchMode 
                ? 'bg-marker text-white rotate-2 animate-pulse shadow-none translate-y-0.5' 
                : 'bg-postit text-ink md:hover:-rotate-2 md:hover:bg-postit/80 shadow-hard-hover'
            }`}
          >
            {sketchMode ? 'Drawing Active ✏️' : 'Sketch Mode ✏️'}
          </button>

          {user ? (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l-[3px] border-ink border-dashed">
              <Link to="/memorials/create" className="btn btn-primary px-4 py-2 text-base">
                Create Memorial
              </Link>
              <div className="flex items-center gap-2">
                <Link to={`/profile/${user.username}`} className="wobbly-sm bg-erased border-[3px] border-ink px-3 py-1 font-patrick font-bold md:hover:bg-postit md:hover:-rotate-2 transition-transform">
                  {user.username}
                </Link>
                <button onClick={handleLogout} className="wobbly-sm bg-white border-[3px] border-ink px-3 py-1 font-patrick font-bold md:hover:bg-marker md:hover:text-white transition-colors">
                  Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l-[3px] border-ink border-dashed">
              <Link to="/login" className="font-patrick text-xl font-bold md:hover:text-pen md:hover:underline decoration-wavy">Login</Link>
              <Link to="/register" className="btn btn-primary px-4 py-2 text-base">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden border-[3px] border-ink bg-white p-2 wobbly-sm shadow-hard active:shadow-none active:translate-y-1 active:translate-x-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <span className="font-kalam font-bold text-xl">{mobileOpen ? 'X' : 'Menu'}</span>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t-[3px] border-ink bg-white p-6 flex flex-col gap-4 font-kalam text-xl">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2.5 min-h-[44px] flex items-center md:hover:text-marker">Home</Link>
          <Link to="/memorials" onClick={() => setMobileOpen(false)} className="block py-2.5 min-h-[44px] flex items-center md:hover:text-marker">Memorials</Link>
          <Link to="/communities" onClick={() => setMobileOpen(false)} className="block py-2.5 min-h-[44px] flex items-center md:hover:text-marker">Communities</Link>
          <Link to="/tales" onClick={() => setMobileOpen(false)} className="block py-2.5 min-h-[44px] flex items-center md:hover:text-marker">Tales</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="block py-2.5 min-h-[44px] flex items-center md:hover:text-marker">About</Link>
          {user && (
            <Link to="/messages" onClick={() => setMobileOpen(false)} className="block py-2.5 min-h-[44px] flex items-center md:hover:text-marker">Messages</Link>
          )}
          {user && (user.role === 'ADMIN' || user.is_superuser) && (
            <Link to="/admin-panel" onClick={() => setMobileOpen(false)} className="block py-2.5 min-h-[44px] flex items-center text-[#C59B5C] md:hover:text-[#2E241B]">Admin</Link>
          )}
          
          <button
            onClick={() => { setSketchMode(!sketchMode); setMobileOpen(false); }}
            className={`w-full py-2 border-[3px] border-ink font-patrick font-bold wobbly-sm text-center ${
              sketchMode ? 'bg-marker text-white' : 'bg-postit text-ink'
            }`}
          >
            {sketchMode ? 'Disable Sketch Mode ✏️' : 'Enable Sketch Mode ✏️'}
          </button>

          <div className="border-t-[3px] border-dashed border-ink pt-4 flex flex-col gap-4">
            {user ? (
              <>
                <Link to="/memorials/create" onClick={() => setMobileOpen(false)} className="btn btn-primary">Create Memorial</Link>
                <Link to={`/profile/${user.username}`} onClick={() => setMobileOpen(false)} className="block py-2.5 min-h-[44px] flex items-center md:hover:text-pen">My Profile</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-left w-full block py-2.5 min-h-[44px] flex items-center md:hover:text-marker">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2.5 min-h-[44px] flex items-center md:hover:text-pen">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
