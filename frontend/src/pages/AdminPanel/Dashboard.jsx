import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/admin/dashboard/');
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
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
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-md">
        <p className="font-bold">Error loading dashboard</p>
        <p>{error}</p>
      </div>
    );
  }

  const { stats, activities } = data || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Dashboard Overview</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Eterna Admin Control Room</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg relative overflow-hidden">
          <span className="absolute top-2 right-4 text-3xl opacity-20">👥</span>
          <h3 className="font-kalam text-lg font-bold text-[#C59B5C]">Total Users</h3>
          <p className="font-patrick text-4xl font-bold text-[#2E241B] mt-2">{stats.total_users}</p>
          <div className="text-sm font-patrick text-[#2E241B]/60 mt-1">
            {stats.new_users_today} joined today
          </div>
        </div>

        <div className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg relative overflow-hidden">
          <span className="absolute top-2 right-4 text-3xl opacity-20">🟢</span>
          <h3 className="font-kalam text-lg font-bold text-[#C59B5C]">Active Users</h3>
          <p className="font-patrick text-4xl font-bold text-[#2E241B] mt-2">{stats.active_users}</p>
          <div className="text-sm font-patrick text-[#2E241B]/60 mt-1">
            Active in the last 15m
          </div>
        </div>

        <div className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg relative overflow-hidden">
          <span className="absolute top-2 right-4 text-3xl opacity-20">📚</span>
          <h3 className="font-kalam text-lg font-bold text-[#C59B5C]">Memorials</h3>
          <p className="font-patrick text-4xl font-bold text-[#2E241B] mt-2">{stats.memorial_count}</p>
          <div className="text-sm font-patrick text-[#2E241B]/60 mt-1">
            Preserving family legacies
          </div>
        </div>

        <div className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg relative overflow-hidden">
          <span className="absolute top-2 right-4 text-3xl opacity-20">📖</span>
          <h3 className="font-kalam text-lg font-bold text-[#C59B5C]">Tales Count</h3>
          <p className="font-patrick text-4xl font-bold text-[#2E241B] mt-2">{stats.tales_count}</p>
          <div className="text-sm font-patrick text-[#2E241B]/60 mt-1">
            Written family memories
          </div>
        </div>

        <div className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg relative overflow-hidden">
          <span className="absolute top-2 right-4 text-3xl opacity-20">🏡</span>
          <h3 className="font-kalam text-lg font-bold text-[#C59B5C]">Communities</h3>
          <p className="font-patrick text-4xl font-bold text-[#2E241B] mt-2">{stats.community_count}</p>
          <div className="text-sm font-patrick text-[#2E241B]/60 mt-1">
            Support circles established
          </div>
        </div>

        <div className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg relative overflow-hidden">
          <span className="absolute top-2 right-4 text-3xl opacity-20">🚩</span>
          <h3 className="font-kalam text-lg font-bold text-[#C59B5C]">Pending Reports</h3>
          <p className={`font-patrick text-4xl font-bold mt-2 ${stats.pending_reports > 0 ? 'text-red-600' : 'text-[#2E241B]'}`}>
            {stats.pending_reports}
          </p>
          <div className="text-sm font-patrick text-[#2E241B]/60 mt-1">
            Require moderation review
          </div>
        </div>

        <div className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg relative overflow-hidden">
          <span className="absolute top-2 right-4 text-3xl opacity-20">🗄</span>
          <h3 className="font-kalam text-lg font-bold text-[#C59B5C]">Storage Used</h3>
          <p className="font-patrick text-3xl font-bold text-[#2E241B] mt-2">{formatSize(stats.storage_used_bytes)}</p>
          <div className="text-sm font-patrick text-[#2E241B]/60 mt-1">
            Cloudinary media assets
          </div>
        </div>

        <div className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg relative overflow-hidden">
          <span className="absolute top-2 right-4 text-3xl opacity-20">⚡</span>
          <h3 className="font-kalam text-lg font-bold text-[#C59B5C]">DB Connections</h3>
          <p className="font-patrick text-3xl font-bold text-[#2E241B] mt-2">
            {stats.db_connections} / {stats.db_connection_limit}
          </p>
          <div className="mt-2 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                (stats.db_connections / stats.db_connection_limit) > 0.8 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-[#C59B5C]'
              }`} 
              style={{ width: `${Math.min((stats.db_connections / stats.db_connection_limit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Audit Log Feed */}
      <div className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg">
        <h2 className="font-kalam text-2xl font-bold text-[#2E241B] mb-4">Recent Staff Activity</h2>
        
        {activities.length === 0 ? (
          <p className="font-patrick text-lg text-[#2E241B]/60 italic py-4">No recent administration logs found.</p>
        ) : (
          <div className="divide-y divide-[#2E241B]/10">
            {activities.map((act, idx) => (
              <div key={idx} className="py-3 flex justify-between items-start gap-4 font-patrick text-lg">
                <div>
                  <span className="font-bold text-[#C59B5C]">{act.admin}</span>{' '}
                  <span className="text-[#2E241B]/80">{act.action.toLowerCase().replace(/_/g, ' ')}</span>{' '}
                  <span className="font-mono text-sm bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                    {act.target_type}:{act.target_id}
                  </span>
                  {act.reason && (
                    <p className="text-sm text-gray-500 mt-0.5 italic">Reason: {act.reason}</p>
                  )}
                </div>
                <div className="text-sm text-[#2E241B]/50 shrink-0">
                  {new Date(act.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
