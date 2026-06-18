import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="paper-card p-8 md:p-12 max-w-md w-full -rotate-1 tape-decoration">
        <div className="text-center mb-8">
          <h1 className="font-kalam text-5xl mb-2 decoration-wavy underline">Sign In</h1>
          <p className="font-patrick text-xl">Welcome back to the sketchbook.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-marker/20 border-[3px] border-marker p-4 wobbly-sm font-patrick text-xl text-ink font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="input-label">Username</label>
            <input className="input" type="text" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="Your username" required autoFocus />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input className="input" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Your password" required />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2 text-2xl" disabled={loading}>
            {loading ? 'Scribbling...' : 'Login'}
          </button>
        </form>

        <p className="text-center font-patrick text-xl mt-8 pt-6 border-t-[3px] border-dashed border-ink/30">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold hover:text-pen hover:underline decoration-wavy">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
