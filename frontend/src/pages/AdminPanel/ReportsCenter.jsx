import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function ReportsCenter({ currentUser }) {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Actions
  const [actionReport, setActionReport] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject' | 'warn_user' | 'hide_content' | 'ban_user'
  const [actionReason, setActionReason] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/admin/reports/?status=${statusFilter}&reason=${reasonFilter}&limit=${limit}&offset=${offset}`
      );
      setReports(res.reports);
      setTotal(res.total);
    } catch (err) {
      alert(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, reasonFilter, offset]);

  const handleAction = async () => {
    if (!actionReport) return;
    if (actionType === 'ban_user' && currentUser.role !== 'ADMIN') {
      alert('Only Super Admins can ban users via reports.');
      return;
    }
    try {
      await api.post(`/api/admin/reports/${actionReport.id}/action/`, {
        action: actionType,
        reason: actionReason
      });
      fetchReports();
      setActionReport(null);
      setActionReason('');
    } catch (err) {
      alert(err.message || 'Failed to moderate report');
    }
  };

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Report Safety Center</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Review abuse, plagiarism, copyright infringement or spam reports</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-2 border-[#2E241B] p-4 rounded-lg shadow-hard">
        <div>
          <label className="block text-sm font-bold mb-1">Status</label>
          <select
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          >
            <option value="">All Cases</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved / Handled</option>
            <option value="REJECTED">Rejected Case</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Reason Categories</label>
          <select
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={reasonFilter}
            onChange={(e) => { setReasonFilter(e.target.value); setOffset(0); }}
          >
            <option value="">All Categories</option>
            <option value="SPAM">Spam</option>
            <option value="HARASSMENT">Harassment</option>
            <option value="FAKE_ACCOUNT">Fake Account</option>
            <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
            <option value="COPYRIGHT">Copyright Plagiarism</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setStatusFilter(''); setReasonFilter(''); setOffset(0); }}
            className="w-full bg-white border-2 border-[#2E241B] py-1.5 font-bold hover:bg-gray-100 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border-2 border-[#2E241B] rounded-lg shadow-hard overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
          </div>
        ) : reports.length === 0 ? (
          <p className="text-center text-xl text-[#2E241B]/60 italic py-16">No reported items found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2E241B] text-[#F8F5F0] border-b-2 border-[#2E241B]">
                  <th className="p-3">Reported Target</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E241B]/10">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-bold text-[#2E241B]">{r.reported_title}</div>
                      <div className="text-xs text-gray-500 font-mono">ID: {r.reported_id} / Type: {r.reported_type}</div>
                      {r.description && <div className="text-sm text-gray-500 italic mt-1 font-patrick">Notes: "{r.description}"</div>}
                    </td>
                    <td className="p-3 font-semibold">{r.reported_owner}</td>
                    <td className="p-3 font-semibold text-[#C59B5C]">{r.reason}</td>
                    <td className="p-3">{r.reporter}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        r.status === 'PENDING' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                        r.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-y-1.5">
                      {r.status === 'PENDING' ? (
                        <div className="flex justify-end gap-1.5 shrink-0">
                          <button
                            onClick={() => { setActionReport(r); setActionType('reject'); }}
                            className="bg-white border border-gray-300 text-[#2E241B] hover:bg-gray-100 px-2 py-0.5 text-sm rounded font-bold"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => { setActionReport(r); setActionType('warn_user'); }}
                            className="bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 px-2 py-0.5 text-sm rounded font-bold"
                          >
                            Warn
                          </button>
                          <button
                            onClick={() => { setActionReport(r); setActionType('hide_content'); }}
                            className="bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 px-2 py-0.5 text-sm rounded font-bold"
                          >
                            Hide Content
                          </button>
                          {currentUser.role === 'ADMIN' && (
                            <button
                              onClick={() => { setActionReport(r); setActionType('ban_user'); }}
                              className="bg-[#2E241B] text-[#F8F5F0] hover:bg-black px-2 py-0.5 text-sm rounded font-bold"
                            >
                              Ban Author
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-[#F8F5F0] border-t border-[#2E241B]/10 p-3 flex justify-between items-center">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(prev => Math.max(0, prev - limit))}
            className="px-3 py-1 bg-white border border-[#2E241B] disabled:opacity-50 rounded hover:bg-gray-50"
          >
            ◀ Prev
          </button>
          <span className="text-[#2E241B]/60 text-lg">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
          </span>
          <button
            disabled={offset + limit >= total}
            onClick={() => setOffset(prev => prev + limit)}
            className="px-3 py-1 bg-white border border-[#2E241B] disabled:opacity-50 rounded hover:bg-gray-50"
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionReport && (
        <div className="fixed inset-0 bg-[#2E241B]/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2E241B] p-6 max-w-md w-full rounded-lg shadow-hard">
            <h3 className="font-kalam text-2xl font-bold mb-2 uppercase">Resolve Case: {actionType.replace('_', ' ')}</h3>
            <p className="text-gray-600 text-sm mb-4">
              Moderate target: <span className="font-bold text-[#2E241B]">{actionReport.reported_title}</span>.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Reason for safety action log</label>
              <textarea
                placeholder="Reason..."
                className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] h-24 p-2 rounded"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-3 font-bold">
              <button
                onClick={() => setActionReport(null)}
                className="bg-white border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={!actionReason.trim()}
                className="bg-[#2E241B] text-white px-4 py-1.5 rounded hover:bg-black disabled:opacity-50"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
