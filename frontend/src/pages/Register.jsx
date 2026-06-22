import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', password: '', password2: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.password2) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      if (err.data) {
        const msgs = Object.entries(err.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          .join('\n');
        setError(msgs);
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12">
      <div className="paper-card p-5 sm:p-6 md:p-12 max-w-xl w-full rotate-1 tack-decoration">
        <div className="text-center mb-10 border-b-[3px] border-dashed border-ink pb-6">
          <h1 className="font-kalam text-5xl mb-2">Join Eterna</h1>
          <p className="font-patrick text-2xl">Start your sketchbook of memories.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-marker/20 border-[3px] border-marker p-4 wobbly-sm font-patrick text-xl text-ink font-bold whitespace-pre-line -rotate-1">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">First Name</label>
              <input className="input" type="text" required
                value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Last Name</label>
              <input className="input" type="text" required
                value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="input-label">Username</label>
            <input className="input" type="text" required
              value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          </div>

          <div>
            <label className="input-label">Email</label>
            <input className="input" type="email" required
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">Password</label>
              <input className="input" type="password" required minLength={8}
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Confirm Password</label>
              <input className="input" type="password" required minLength={8}
                value={form.password2} onChange={e => setForm({...form, password2: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-6 text-2xl" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center font-patrick text-xl mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-bold md:hover:text-pen md:hover:underline decoration-wavy">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
