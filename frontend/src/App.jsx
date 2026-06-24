import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import LoadingSkeleton from './components/common/LoadingSkeleton';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';

// Lazy-loaded heavy pages
const Landing = lazy(() => import('./pages/Landing'));
const MemorialDetail = lazy(() => import('./pages/MemorialDetail'));
const MemorialCreate = lazy(() => import('./pages/MemorialCreate'));
const TaleList = lazy(() => import('./pages/TaleList'));
const TaleCreate = lazy(() => import('./pages/TaleCreate'));
const TaleDetail = lazy(() => import('./pages/TaleDetail'));
const CommunityList = lazy(() => import('./pages/CommunityList'));
const CommunityDetail = lazy(() => import('./pages/CommunityDetail'));
const ProfileDetail = lazy(() => import('./pages/ProfileDetail'));
const DirectMessages = lazy(() => import('./pages/DirectMessages'));
const About = lazy(() => import('./pages/About'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminPanel = lazy(() => import('./pages/AdminPanel/AdminLayout'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const DataPromise = lazy(() => import('./pages/DataPromise'));

// Lazy-loaded expensive layout components
const DoodleOverlay = lazy(() => import('./components/layout/DoodleOverlay'));
const ExitIntentHook = lazy(() => import('./components/layout/ExitIntentHook'));

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="paper-card p-12 -rotate-2 tack-decoration max-w-lg w-full">
        <h1 className="font-kalam text-6xl text-marker mb-4">Oops!</h1>
        <p className="text-2xl text-ink mb-8 font-patrick">We couldn't find that page.</p>
        <a href="/" className="btn btn-primary inline-flex">Go Back Home</a>
      </div>
    </div>
  );
}

function ServerWakeUpScreen() {
  return (
    <div className="fixed inset-0 bg-paper/95 z-50 flex items-center justify-center p-6 selection:bg-postit/80">
      <div className="bg-grain"></div>
      <div className="paper-card p-12 max-w-lg w-full text-center relative tack-decoration rotate-1 flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-dashed border-ink rounded-full animate-spin mb-6"></div>
        <h1 className="font-kalam text-3xl text-marker mb-4 animate-pulse">
          Preparing your memory space...
        </h1>
        <p className="text-xl text-ink font-patrick opacity-80 leading-relaxed">
          Please wait a moment while we wake up our secure servers on Render. 
          This usually takes about 30 seconds to spin up.
        </p>
        <div className="mt-8 w-full bg-paper border-2 border-ink h-4 rounded-full overflow-hidden p-0.5">
          <div className="bg-ink h-full rounded-full animate-pulse" style={{ width: '80%' }}></div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [sketchMode, setSketchMode] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const checkHealth = async () => {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      try {
        const res = await fetch(`${BASE_URL}/api/health/`);
        if (res.ok && active) {
          setIsWakingUp(false);
          return;
        }
      } catch (err) {
        console.log("Server is still waking up...", err);
      }
      if (active) {
        setTimeout(checkHealth, 3000);
      }
    };
    checkHealth();
    return () => {
      active = false;
    };
  }, []);

  if (isWakingUp) {
    return <ServerWakeUpScreen />;
  }

  const isAdminRoute = location.pathname.startsWith('/admin-panel');
  const isChatRoute = location.pathname === '/messages' || location.pathname.startsWith('/communities/');

  if (isAdminRoute) {
    return (
      <Suspense fallback={
        <div className="fixed inset-0 bg-[#F8F5F0] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/admin-panel/*" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${sketchMode ? 'cursor-pencil' : ''}`}>
      <Navbar sketchMode={sketchMode} setSketchMode={setSketchMode} />
      <Suspense fallback={<LoadingSkeleton />}>
        <Routes>
          {/* Landing page — full-width, no container constraint */}
          <Route path="/" element={
            <main className="flex-1 w-full">
              <Landing />
            </main>
          } />
          {/* All other pages — constrained centered layout */}
          <Route path="*" element={
            <main className={`flex-1 w-full mx-auto ${
              isChatRoute 
                ? 'max-w-7xl h-[calc(100vh-80px)] px-2 py-2 md:px-4 md:py-4 overflow-hidden' 
                : 'max-w-5xl px-4 py-6 md:px-6 md:py-12'
            }`}>
              <Routes>
                <Route path="/memorials" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/memorial/:id" element={<MemorialDetail />} />
                <Route path="/memorials/create" element={<MemorialCreate />} />
                <Route path="/tales" element={<TaleList />} />
                <Route path="/tales/create" element={<TaleCreate />} />
                <Route path="/tales/:slug" element={<TaleDetail />} />
                <Route path="/communities" element={<CommunityList />} />
                <Route path="/communities/:slug" element={<CommunityDetail />} />
                <Route path="/profile/:username" element={<ProfileDetail />} />
                <Route path="/messages" element={<DirectMessages />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/trust-charter" element={<DataPromise />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          } />
        </Routes>
      </Suspense>
      {!isChatRoute && <Footer />}
      <Suspense fallback={null}>
        <DoodleOverlay active={sketchMode} />
        <ExitIntentHook />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
