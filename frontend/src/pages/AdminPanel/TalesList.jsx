import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function TalesList() {
  const [tales, setTales] = useState([]);
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
  const [actionTale, setActionTale] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');

  const fetchTales = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/admin/tales/?search=${search}&status=${statusFilter}&limit=${limit}&offset=${offset}`
      );
      setTales(res.tales);
      setTotal(res.total);
    } catch (err) {
      alert(err.message || 'Failed to load tales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTales();
  }, [search, statusFilter, offset]);

  const handleAction = async () => {
    if (!actionTale) return;
    try {
      await api.post(`/api/admin/tales/${actionTale.id}/action/`, {
        action: actionType,
        reason: actionReason
      });
      fetchTales();
      setActionTale(null);
      setActionReason('');
    } catch (err) {
      alert(err.message || 'Failed to execute tale action');
    }
  };

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Tales Archives</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Moderate, hide or archive user scrapbook stories</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-2 border-[#2E241B] p-4 rounded-lg shadow-hard">
        <div>
          <label className="block text-sm font-bold mb-1">Search Tale</label>
          <input
            type="text"
            placeholder="Tale title or author..."
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
        ) : tales.length === 0 ? (
          <p className="text-center text-xl text-[#2E241B]/60 italic py-16">No tales found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2E241B] text-[#F8F5F0] border-b-2 border-[#2E241B]">
                  <th className="p-3">Tale Title</th>
                  <th className="p-3">Subtitle</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Chapters</th>
                  <th className="p-3">Visibility</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E241B]/10">
                {tales.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#2E241B]">{t.title}</td>
                    <td className="p-3 text-sm text-gray-500">{t.subtitle || 'None'}</td>
                    <td className="p-3">{t.author}</td>
                    <td className="p-3 font-mono text-sm">{t.chapter_count} chapters</td>
                    <td className="p-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">
                        {t.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="p-3">
                      {t.is_hidden ? (
                        <span className="text-red-600 font-bold">✕ Hidden</span>
                      ) : t.is_archived ? (
                        <span className="text-amber-600 font-bold">🗄 Archived</span>
                      ) : (
                        <span className="text-green-600 font-bold">🟢 Active</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {t.is_hidden || t.is_archived ? (
                        <button
                          onClick={() => { setActionTale(t); setActionType('restore'); }}
                          className="bg-green-50 text-green-700 border border-green-300 px-2.5 py-1 text-sm rounded font-bold hover:bg-green-100"
                        >
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => { setActionTale(t); setActionType('hide'); }}
                            className="bg-red-50 text-red-700 border border-red-300 px-2.5 py-1 text-sm rounded font-bold hover:bg-red-100"
                          >
                            Hide
                          </button>
                          <button
                            onClick={() => { setActionTale(t); setActionType('archive'); }}
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
      {actionTale && (
        <div className="fixed inset-0 bg-[#2E241B]/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2E241B] p-6 max-w-md w-full rounded-lg shadow-hard">
            <h3 className="font-kalam text-2xl font-bold mb-2 uppercase">{actionType} Tale</h3>
            <p className="text-gray-600 text-sm mb-4">
              Action targets tale: <span className="font-bold text-[#2E241B]">{actionTale.title}</span>.
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
                onClick={() => setActionTale(null)}
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
