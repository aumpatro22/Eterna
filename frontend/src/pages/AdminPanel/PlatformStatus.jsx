import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function PlatformStatus({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({
    maintenance_mode: false,
    announcement_banner: '',
    banner_enabled: false,
    last_backup_at: null,
    updated_at: null
  });

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/platform-status/');
      setStatus(res);
    } catch (err) {
      alert(err.message || 'Failed to load platform status settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggleMaint = (val) => {
    if (currentUser.role !== 'ADMIN') return;
    setStatus({ ...status, maintenance_mode: val });
  };

  const handleToggleBanner = (val) => {
    if (currentUser.role !== 'ADMIN') return;
    setStatus({ ...status, banner_enabled: val });
  };

  const handleTextChange = (e) => {
    if (currentUser.role !== 'ADMIN') return;
    setStatus({ ...status, announcement_banner: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (currentUser.role !== 'ADMIN') {
      alert('Only Admins can modify platform status controls.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/admin/platform-status/', status);
      setStatus(res);
      alert('Platform configurations saved successfully.');
    } catch (err) {
      alert(err.message || 'Failed to update platform settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Platform Status & Settings</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Toggle maintenance modes, broadcast alerts or inspect backups</p>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm font-bold">
          ⚠️ View-only access: Platform configurations can only be modified by Super Admins.
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg space-y-6">
        
        {/* Maintenance mode */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-6 gap-6">
          <div className="space-y-1">
            <h3 className="font-kalam text-2xl font-bold text-[#2E241B]">Toggle Maintenance Mode</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Locks Eterna to standard visitors. Active staff accounts can continue moderating database contents during lockout.
            </p>
          </div>
          <div className="shrink-0 flex items-center">
            <button
              type="button"
              disabled={!isAdmin}
              onClick={() => handleToggleMaint(!status.maintenance_mode)}
              className={`w-16 h-8 rounded-full transition-colors relative border-2 border-[#2E241B] disabled:opacity-50 ${
                status.maintenance_mode ? 'bg-red-500' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-0.5 w-6.5 h-6.5 rounded-full bg-white transition-transform border border-[#2E241B]/20 ${
                status.maintenance_mode ? 'translate-x-8' : 'translate-x-0.5'
              }`} style={{ left: 0 }} />
            </button>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-kalam text-2xl font-bold text-[#2E241B]">Announcement Banner Alert</h3>
              <p className="text-sm text-gray-500">
                Display scheduled warnings or update notifications globally at the top of Eterna homepage.
              </p>
            </div>
            <div className="shrink-0 flex items-center">
              <button
                type="button"
                disabled={!isAdmin}
                onClick={() => handleToggleBanner(!status.banner_enabled)}
                className={`w-16 h-8 rounded-full transition-colors relative border-2 border-[#2E241B] disabled:opacity-50 ${
                  status.banner_enabled ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-0.5 w-6.5 h-6.5 rounded-full bg-white transition-transform border border-[#2E241B]/20 ${
                  status.banner_enabled ? 'translate-x-8' : 'translate-x-0.5'
                }`} style={{ left: 0 }} />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-bold text-[#2E241B]">Banner Alert Content</label>
            <textarea
              disabled={!isAdmin}
              placeholder="e.g. Scheduled database maintenance tonight at 12:00 AM UTC..."
              className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] p-3 rounded h-24 font-patrick text-base disabled:opacity-75"
              value={status.announcement_banner}
              onChange={handleTextChange}
            />
          </div>
        </div>

        {isAdmin && (
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#2E241B] hover:bg-black text-[#F8F5F0] px-6 py-2 rounded font-bold"
            >
              {submitting ? 'Saving changes...' : 'Save Settings'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
