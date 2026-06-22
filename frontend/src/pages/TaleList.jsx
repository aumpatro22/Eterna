import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import SEO from '../components/layout/SEO';

export default function TaleList() {
  const [tales, setTales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTales();
  }, []);

  const fetchTales = async () => {
    try {
      const data = await api.get('/api/tales/');
      setTales(data.results || data);
    } catch {
      setTales([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <SEO 
        title="Eternal Tales & Family Legacy Stories – Eterna"
        description="Browse through the collections of family stories, letters, and memories on Eterna."
      />
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-[3px] border-dashed border-ink pb-8">
        <div>
          <h1 className="font-kalam text-5xl mb-2 decoration-wavy underline decoration-marker">Eternal Tales</h1>
          <p className="font-patrick text-2xl">Stories that transcend time, sketched out for all to read.</p>
        </div>
        <Link to="/tales/create" className="btn btn-primary text-2xl -rotate-2">Write a Tale</Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-[4px] border-ink border-t-marker rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {tales.map((tale, idx) => (
            <Link to={`/tales/${tale.slug}`} key={tale.id} className="group">
              <div className={`paper-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'} group-hover:rotate-0 transition-transform`}>
                <div className="flex-1">
                  <h2 className="font-kalam text-4xl mb-2 group-hover:underline decoration-wavy decoration-pen">{tale.title}</h2>
                  {tale.subtitle && <h3 className="font-patrick text-2xl text-ink/70 mb-4">{tale.subtitle}</h3>}
                  <p className="font-patrick text-xl line-clamp-2 mb-6">{tale.description}</p>
                  <div className="flex items-center gap-6 font-patrick text-lg font-bold border-t-[3px] border-dashed border-ink/20 pt-4">
                    <span>✍️ Written by {tale.author_username}</span>
                    <span>📖 {tale.chapter_count} chapters</span>
                  </div>
                </div>
                <div className="hidden md:flex w-24 h-24 border-[3px] border-ink bg-postit wobbly-sm items-center justify-center text-5xl font-kalam -rotate-12 group-hover:rotate-12 transition-transform">
                  ?
                </div>
              </div>
            </Link>
          ))}
          {tales.length === 0 && (
            <div className="paper-card p-12 text-center rotate-1 bg-erased">
              <h3 className="font-kalam text-3xl mb-4">No stories yet</h3>
              <p className="font-patrick text-xl">The sketchbook is empty. Pick up a pen and start writing.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
