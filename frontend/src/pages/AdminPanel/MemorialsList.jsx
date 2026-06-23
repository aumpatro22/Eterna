import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function MemorialsList() {
  const [memorials, setMemorials] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
      setOffset(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Modals state
  const [actionMemorial, setActionMemorial] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');

  const fetchMemorials = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/admin/memorials/?search=${search}&status=${statusFilter}&limit=${limit}&offset=${offset}`
      );
      setMemorials(res.memorials);
      setTotal(res.total);
    } catch (err) {
      alert(err.message || 'Failed to load memorials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemorials();
  }, [search, statusFilter, offset]);

  const handleAction = async () => {
    if (!actionMemorial) return;
    try {
      await api.post(`/api/admin/memorials/${actionMemorial.id}/action/`, {
        action: actionType,
        reason: actionReason
      });
      fetchMemorials();
      setActionMemorial(null);
      setActionReason('');
    } catch (err) {
      alert(err.message || 'Failed to execute memorial action');
    }
  };

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Memorial Archives</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Moderate, hide or archive user memorials in case of reports</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-2 border-[#2E241B] p-4 rounded-lg shadow-hard">
        <div>
          <label className="block text-sm font-bold mb-1">Search Memorial</label>
          <input
            type="text"
            placeholder="Memorial name or owner..."
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Status</label>
          <select
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active & Visible</option>
            <option value="hidden">Hidden</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setSearchVal(''); setSearch(''); setStatusFilter(''); setOffset(0); }}
            className="w-full bg-white border-2 border-[#2E241B] py-1.5 font-bold hover:bg-gray-100 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-[#2E241B] rounded-lg shadow-hard overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
          </div>
        ) : memorials.length === 0 ? (
          <p className="text-center text-xl text-[#2E241B]/60 italic py-16">No memorials found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2E241B] text-[#F8F5F0] border-b-2 border-[#2E241B]">
                  <th className="p-3">Memorial</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Visibility</th>
                  <th className="p-3">Created Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E241B]/10">
                {memorials.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-100 border rounded overflow-hidden shrink-0">
                        {m.cover_image ? (
                          <img src={m.cover_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">🌅</div>
                        )}
                      </div>
                      <span className="font-bold text-[#2E241B]">{m.full_name}</span>
                    </td>
                    <td className="p-3">{m.owner}</td>
                    <td className="p-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">{m.visibility}</span>
                    </td>
                    <td className="p-3 text-sm">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      {m.is_hidden ? (
                        <span className="text-red-600 font-bold">✕ Hidden</span>
                      ) : m.is_archived ? (
                        <span className="text-amber-600 font-bold">🗄 Archived</span>
                      ) : (
                        <span className="text-green-600 font-bold">🟢 Active</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {m.is_hidden || m.is_archived ? (
                        <button
                          onClick={() => { setActionMemorial(m); setActionType('restore'); }}
                          className="bg-green-50 text-green-700 border border-green-300 px-2.5 py-1 text-sm rounded font-bold hover:bg-green-100"
                        >
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => { setActionMemorial(m); setActionType('hide'); }}
                            className="bg-red-50 text-red-700 border border-red-300 px-2.5 py-1 text-sm rounded font-bold hover:bg-red-100"
                          >
                            Hide
                          </button>
                          <button
                            onClick={() => { setActionMemorial(m); setActionType('archive'); }}
                            className="bg-amber-50 text-amber-700 border border-amber-300 px-2.5 py-1 text-sm rounded font-bold hover:bg-amber-100"
                          >
                            Archive
                          </button>
                        </>
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
      {actionMemorial && (
        <div className="fixed inset-0 bg-[#2E241B]/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2E241B] p-6 max-w-md w-full rounded-lg shadow-hard">
            <h3 className="font-kalam text-2xl font-bold mb-2 uppercase">{actionType} Memorial</h3>
            <p className="text-gray-600 text-sm mb-4">
              Action targets memorial of: <span className="font-bold text-[#2E241B]">{actionMemorial.full_name}</span>.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Reason for action log</label>
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
                onClick={() => setActionMemorial(null)}
                className="bg-white border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={!actionReason.trim()}
                className="bg-[#2E241B] text-white px-4 py-1.5 rounded hover:bg-black disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
