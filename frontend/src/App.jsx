import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DoodleOverlay from './components/layout/DoodleOverlay';
import ExitIntentHook from './components/layout/ExitIntentHook';

// Pages
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MemorialDetail from './pages/MemorialDetail';
import MemorialCreate from './pages/MemorialCreate';
import TaleList from './pages/TaleList';
import TaleCreate from './pages/TaleCreate';
import TaleDetail from './pages/TaleDetail';
import CommunityList from './pages/CommunityList';
import CommunityDetail from './pages/CommunityDetail';
import ProfileDetail from './pages/ProfileDetail';

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

function App() {
  const [sketchMode, setSketchMode] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className={`flex flex-col min-h-screen ${sketchMode ? 'cursor-pencil' : ''}`}>
          <Navbar sketchMode={sketchMode} setSketchMode={setSketchMode} />
          <Routes>
            {/* Landing page — full-width, no container constraint */}
            <Route path="/" element={
              <main className="flex-1 w-full">
                <Landing />
              </main>
            } />
            {/* All other pages — constrained centered layout */}
            <Route path="*" element={
              <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
                <Routes>
                  <Route path="/memorials" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/memorial/:id" element={<MemorialDetail />} />
                  <Route path="/memorials/create" element={<MemorialCreate />} />
                  <Route path="/tales" element={<TaleList />} />
                  <Route path="/tales/create" element={<TaleCreate />} />
                  <Route path="/tales/:slug" element={<TaleDetail />} />
                  <Route path="/communities" element={<CommunityList />} />
                  <Route path="/communities/:slug" element={<CommunityDetail />} />
                  <Route path="/profile/:username" element={<ProfileDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            } />
          </Routes>
          <Footer />
          <DoodleOverlay active={sketchMode} />
          <ExitIntentHook />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
