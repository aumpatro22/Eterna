import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [totalStorage, setTotalStorage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/media/?type=${typeFilter}&user=${userSearch}`);
      setMedia(res.media);
      setTotalStorage(res.total_storage_used);
    } catch (err) {
      alert(err.message || 'Failed to load media items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [typeFilter, userSearch]);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Media Library</h1>
          <p className="font-patrick text-xl text-[#2E241B]/70">Inspect image uploads, audio voice notes and calculate storage usages</p>
        </div>
        <div className="bg-white border-2 border-[#2E241B] px-4 py-2 shadow-hard rounded text-right shrink-0">
          <div className="text-xs font-bold text-[#C59B5C] uppercase">Total Media Size</div>
          <div className="font-bold text-2xl text-[#2E241B]">{formatSize(totalStorage)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-2 border-[#2E241B] p-4 rounded-lg shadow-hard">
        <div>
          <label className="block text-sm font-bold mb-1">Search User uploads</label>
          <input
            type="text"
            placeholder="Search username..."
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">File Type</label>
          <select
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Uploads</option>
            <option value="image">Images</option>
            <option value="audio">Audio Voice Notes</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setTypeFilter(''); setUserSearch(''); }}
            className="w-full bg-white border-2 border-[#2E241B] py-1.5 font-bold hover:bg-gray-100 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
        </div>
      ) : media.length === 0 ? (
        <p className="text-center text-xl text-[#2E241B]/60 italic py-16">No media assets found matching query.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {media.map((item) => (
            <div key={item.id} className="bg-white border-2 border-[#2E241B] rounded-lg shadow-hard overflow-hidden flex flex-col hover:-rotate-1 transition-transform">
              <div className="h-32 bg-gray-100 flex items-center justify-center border-b border-gray-200 overflow-hidden relative shrink-0">
                {item.type === 'image' ? (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🎙️</span>
                )}
                <span className="absolute bottom-1 right-1 bg-black/60 text-white font-mono text-[10px] px-1 rounded">
                  {item.model}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between text-sm">
                <div>
                  <div className="font-bold text-[#2E241B] truncate" title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">By: {item.owner}</div>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400">{new Date(item.uploaded_at).toLocaleDateString()}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#C59B5C] font-bold hover:underline"
                  >
                    Open URL
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
