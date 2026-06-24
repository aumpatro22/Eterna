import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function GoogleLoginButton({ label = 'Continue with Google' }) {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    if (!supabase) {
      setError('Google login is not configured yet. Make sure VITE_SUPABASE_URL (starting with http:// or https://) and VITE_SUPABASE_ANON_KEY are set.');
      return;
    }
    setLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (oauthError) throw oauthError;
      // Navigation happens via redirect — no need to navigate() here
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        id="google-login-btn"
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border-[3px] border-ink/70 hover:border-ink hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-patrick text-xl text-ink py-3 px-4 rounded-none font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontFamily: 'Patrick Hand, cursive' }}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-dashed border-ink rounded-full animate-spin" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            {/* Google "G" SVG logo */}
            <svg width="20" height="20" viewBox="0 0 48 48" className="flex-shrink-0">
              <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
              <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
              <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
              <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
              <path fill="none" d="M2 2h44v44H2z"/>
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-sm font-patrick text-marker font-bold text-center">{error}</p>
      )}
    </div>
  );
}
