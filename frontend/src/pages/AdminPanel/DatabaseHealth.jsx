import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function DatabaseHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/api/admin/database-health/');
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load database health diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-md">
        <p className="font-bold">Error loading database diagnostics</p>
        <p>{error}</p>
      </div>
    );
  }

  const { database, cloudinary, render, redis, api_latency_ms, last_backup } = data || {};

  return (
    <div className="space-y-8 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Database & System Health</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Realtime diagnostics, connection pools, Cloudinary files, and latency telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Supabase / PostgreSQL status */}
        <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">Supabase Database</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
              database.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {database.status}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Connection Pool</span>
              <span className="font-mono">{database.connections} / {database.connection_limit}</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  (database.connections / database.connection_limit) > 0.8 ? 'bg-red-500 animate-pulse' : 'bg-[#C59B5C]'
                }`}
                style={{ width: `${(database.connections / database.connection_limit) * 100}%` }}
              ></div>
            </div>
            {(database.connections / database.connection_limit) > 0.8 && (
              <p className="text-xs text-red-600 font-bold">⚠️ Warning: Database connection limits exceeding 80% capacity.</p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
            <span>Database Size</span>
            <span className="font-bold font-mono">{database.size_gb} GB / 2 GB</span>
          </div>
        </div>

        {/* Cloudinary Integration */}
        <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">Cloudinary Storage</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
              cloudinary.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {cloudinary.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Uploaded Media size</span>
            <span className="font-bold font-mono">{formatSize(cloudinary.total_storage_used_bytes)}</span>
          </div>
          <p className="text-xs text-gray-500 italic leading-normal">
            Storage calculates profile avatars, memorial covers, story chapters, and community message attachment sizes.
          </p>
        </div>

        {/* API Latency */}
        <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
          <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">API Response latency</h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl">⚡</span>
            <div>
              <p className="text-3xl font-bold font-mono text-[#2E241B]">{api_latency_ms} ms</p>
              <p className="text-xs text-gray-500">View diagnostic response round-trip time</p>
            </div>
          </div>
        </div>

        {/* Render Infrastructure */}
        <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
          <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">Render Host Server</h3>
          <div className="flex justify-between items-center text-sm">
            <span>Infrastructure Status</span>
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold font-mono">
              {render.status}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Redis cache server</span>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold font-mono">
              {redis.status}
            </span>
          </div>
        </div>
      </div>

      {/* Backups Panel */}
      <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard">
        <h3 className="font-kalam text-2xl font-bold text-[#2E241B] mb-3">🗄️ Automated Database Backups</h3>
        <div className="flex justify-between items-center text-sm font-patrick border-t border-gray-100 pt-3">
          <span>Last automated database backup</span>
          <span className="font-bold font-mono text-[#C59B5C]">
            {last_backup ? new Date(last_backup).toLocaleString() : 'No backup history found'}
          </span>
        </div>
        <p className="text-xs text-gray-500 italic mt-3">
          Prepare for scheduled backups. Nightly cron migrations synchronize data files directly into encrypted recovery blocks.
        </p>
      </div>
    </div>
  );
}
