import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

/**
 * /auth/callback
 * Supabase redirects here after a successful Google OAuth flow.
 * We pick up the session, send the access_token to our Django backend,
 * and then redirect the user to the home page.
 */
export default function AuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Completing sign-in…');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client is not configured.');
        }
        // Supabase automatically exchanges the URL hash/code for a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error(sessionError?.message || 'No session returned from Supabase.');
        }

        setStatus('Verifying with Eterna…');

        // Send the Supabase access token to our Django backend
        const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${BASE_URL}/api/auth/supabase/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ access_token: session.access_token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Authentication failed on the server.');
        }

        if (!cancelled) {
          await loginWithToken(data);
          navigate('/', { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Something went wrong. Please try again.');
          setStatus('');
        }
      }
    };

    handleCallback();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="paper-card p-10 max-w-sm w-full text-center tack-decoration">
        {error ? (
          <>
            <h2 className="font-kalam text-3xl text-marker mb-4">Sign-in Failed</h2>
            <p className="font-patrick text-xl text-ink mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary w-full text-xl"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 border-4 border-dashed border-ink rounded-full animate-spin mx-auto mb-6" />
            <h2 className="font-kalam text-3xl mb-2">Almost there!</h2>
            <p className="font-patrick text-xl text-ink/70">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
