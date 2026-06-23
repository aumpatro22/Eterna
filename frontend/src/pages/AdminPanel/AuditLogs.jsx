import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
      setOffset(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/admin/audit-logs/?search=${search}&target_type=${targetFilter}&limit=${limit}&offset=${offset}`
      );
      setLogs(res.logs);
      setTotal(res.total);
    } catch (err) {
      alert(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, targetFilter, offset]);

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Audit Trails</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Read-only chronological feed of all administrative security actions</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-2 border-[#2E241B] p-4 rounded-lg shadow-hard">
        <div>
          <label className="block text-sm font-bold mb-1">Search staff logs</label>
          <input
            type="text"
            placeholder="Staff name, action description..."
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Target Model Type</label>
          <select
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={targetFilter}
            onChange={(e) => { setTargetFilter(e.target.value); setOffset(0); }}
          >
            <option value="">All Models</option>
            <option value="USER">User Account</option>
            <option value="MEMORIAL">Memorial</option>
            <option value="TALE">Tale Story</option>
            <option value="COMMUNITY">Community Circle</option>
            <option value="COMMUNITY_MESSAGE">Post Message</option>
            <option value="REPORT">Report Ticket</option>
            <option value="OWNERSHIP_REQUEST">Ownership Claims</option>
            <option value="SETTINGS">System Settings</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setSearchVal(''); setSearch(''); setTargetFilter(''); setOffset(0); }}
            className="w-full bg-white border-2 border-[#2E241B] py-1.5 font-bold hover:bg-gray-100 rounded"
          >
            Reset Search
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border-2 border-[#2E241B] rounded-lg shadow-hard overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-xl text-[#2E241B]/60 italic py-16">No staff activities logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2E241B] text-[#F8F5F0] border-b-2 border-[#2E241B]">
                  <th className="p-3">Staff User</th>
                  <th className="p-3">Action Description</th>
                  <th className="p-3">Target Object</th>
                  <th className="p-3">Reason / Details</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E241B]/10 text-base">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#C59B5C]">{log.admin}</td>
                    <td className="p-3 font-semibold text-[#2E241B]">{log.action.replace('_', ' ')}</td>
                    <td className="p-3 font-mono text-xs">
                      <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {log.target_type}:{log.target_id}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 max-w-sm font-patrick text-sm italic leading-relaxed">
                      {log.reason || 'No description provided'}
                    </td>
                    <td className="p-3 text-right text-gray-400 font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
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
            ◀ Prev Page
          </button>
          <span className="text-[#2E241B]/60 text-lg">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
          </span>
          <button
            disabled={offset + limit >= total}
            onClick={() => setOffset(prev => prev + limit)}
            className="px-3 py-1 bg-white border border-[#2E241B] disabled:opacity-50 rounded hover:bg-gray-50"
          >
            Next Page ▶
          </button>
        </div>
      </div>
    </div>
  );
}
