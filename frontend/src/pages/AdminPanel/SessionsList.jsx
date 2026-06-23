import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function SessionsList({ currentUser }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/sessions/');
      setSessions(res);
    } catch (err) {
      alert(err.message || 'Failed to load user sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminate = async (key) => {
    if (currentUser.role !== 'ADMIN') {
      alert('Only Admins are permitted to terminate active user sessions.');
      return;
    }
    if (!confirm('Are you sure you want to terminate this active user session? The user will be immediately logged out.')) {
      return;
    }
    try {
      await api.delete('/api/admin/sessions/', { session_key: key });
      setSessions(sessions.filter(s => s.session_key !== key));
      alert('Session terminated successfully.');
    } catch (err) {
      alert(err.message || 'Failed to terminate session');
    }
  };

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Active User Sessions</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Track active user sessions and terminate unauthorized logins</p>
      </div>

      <div className="bg-white border-2 border-[#2E241B] rounded-lg shadow-hard overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
          </div>
        ) : sessions.length === 0 ? (
          <p className="font-patrick text-center text-xl text-[#2E241B]/60 italic py-16">No active user sessions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2E241B] text-[#F8F5F0] border-b-2 border-[#2E241B]">
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Session Key</th>
                  <th className="p-3">Expires At</th>
                  <th className="p-3">Last Active</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E241B]/10">
                {sessions.map((s, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#2E241B]">{s.username}</td>
                    <td className="p-3">{s.email}</td>
                    <td className="p-3 font-mono text-sm">{s.session_key.substring(0, 12)}...</td>
                    <td className="p-3 text-sm">{new Date(s.expire_date).toLocaleString()}</td>
                    <td className="p-3 text-sm">
                      {s.last_seen ? new Date(s.last_seen).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleTerminate(s.session_key)}
                        disabled={currentUser.role !== 'ADMIN'}
                        className="bg-red-50 text-red-700 border border-red-300 px-3 py-1 text-sm font-bold rounded hover:bg-red-100 disabled:opacity-50"
                      >
                        Terminate Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
