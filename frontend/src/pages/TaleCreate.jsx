import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function TaleCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    is_public: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.post('/api/tales/create/', form);
      navigate(`/tales/${data.slug}`);
    } catch (err) {
      setError(err.message || 'Failed to create tale.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 select-none">
      <div className="paper-card p-8 md:p-12 -rotate-1 tape-decoration">
        <div className="text-center mb-10 border-b-[3px] border-dashed border-ink pb-6">
          <h1 className="font-kalam text-5xl mb-4">Write a New Tale</h1>
          <p className="font-patrick text-2xl">Pen down a narrative, memory, or tribute to share.</p>
        </div>

        {error && (
          <div className="bg-marker/20 border-[3px] border-marker p-4 wobbly-sm font-patrick text-xl text-ink font-bold mb-8 rotate-1">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="bg-erased p-6 border-[3px] border-ink wobbly-sm rotate-1">
            <h3 className="font-kalam text-3xl mb-6">1. Story Identity</h3>
            
            <div className="flex flex-col gap-6">
              <div>
                <label className="input-label">Title *</label>
                <input
                  className="input"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Grandma's Garden Memories"
                />
              </div>

              <div>
                <label className="input-label">Subtitle</label>
                <input
                  className="input"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. A collection of summer afternoons"
                />
              </div>

              <div>
                <label className="input-label">Description / Synopsis *</label>
                <textarea
                  className="input"
                  required
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Briefly describe what this tale is about..."
                />
              </div>
            </div>
          </div>

          <div className="bg-postit p-6 border-[3px] border-ink wobbly-sm -rotate-1">
            <h3 className="font-kalam text-3xl mb-6">2. Privacy Settings</h3>
            
            <label className="flex items-center gap-4 cursor-pointer font-kalam text-2xl group select-none">
              <div className={`w-8 h-8 border-[3px] border-ink wobbly-sm flex items-center justify-center transition-colors ${form.is_public ? 'bg-marker' : 'bg-white'}`}>
                {form.is_public && <span className="text-white">X</span>}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={form.is_public}
                onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
              />
              <span className="group-hover:underline decoration-wavy">Make this story public for everyone</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary text-3xl py-4 mt-4 rotate-1 w-full"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Open Notebook'}
          </button>
        </form>
      </div>
    </div>
  );
}
