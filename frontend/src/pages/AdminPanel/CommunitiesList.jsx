import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function CommunitiesList({ currentUser }) {
  const [communities, setCommunities] = useState([]);
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

  // Drawer / details modal
  const [selectedComm, setSelectedComm] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  // Actions
  const [actionComm, setActionComm] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');

  // Delete community state
  const [deleteTargetComm, setDeleteTargetComm] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/admin/communities/?search=${search}&status=${statusFilter}&limit=${limit}&offset=${offset}`
      );
      setCommunities(res.communities);
      setTotal(res.total);
    } catch (err) {
      alert(err.message || 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [search, statusFilter, offset]);

  const viewCommunityDetails = async (comm) => {
    setSelectedComm(comm);
    setDetailsLoading(true);
    try {
      const res = await api.get(`/api/admin/communities/${comm.id}/details/`);
      setDetailsData(res);
    } catch (err) {
      alert(err.message || 'Failed to load community details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionComm) return;
    try {
      await api.post(`/api/admin/communities/${actionComm.id}/action/`, {
        action: actionType,
        reason: actionReason
      });
      fetchCommunities();
      setActionComm(null);
      setActionReason('');
      if (selectedComm && selectedComm.id === actionComm.id) {
        setSelectedComm(null);
        setDetailsData(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to execute community action');
    }
  };

  const handleDeleteCommunity = async () => {
    if (!deleteTargetComm || !deleteReason.trim()) return;
    setDeleting(true);
    try {
      const res = await api.post(`/api/admin/communities/${deleteTargetComm.id}/action/`, {
        action: 'delete',
        reason: deleteReason,
      });
      if (res.status === 'deleted') {
        if (selectedComm && selectedComm.id === deleteTargetComm.id) {
          setSelectedComm(null);
          setDetailsData(null);
        }
        setDeleteTargetComm(null);
        setDeleteReason('');
        fetchCommunities();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete community');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Communities circles</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Moderate support circles, lock discussions or archive inactive communities</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-2 border-[#2E241B] p-4 rounded-lg shadow-hard">
        <div>
          <label className="block text-sm font-bold mb-1">Search Community</label>
          <input
            type="text"
            placeholder="Title or owner..."
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
            <option value="active">Active</option>
            <option value="locked">Locked</option>
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
        ) : communities.length === 0 ? (
          <p className="text-center text-xl text-[#2E241B]/60 italic py-16">No communities found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2E241B] text-[#F8F5F0] border-b-2 border-[#2E241B]">
                  <th className="p-3">Community Circle</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Members</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E241B]/10">
                {communities.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#2E241B]">{c.title}</td>
                    <td className="p-3">{c.owner}</td>
                    <td className="p-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">{c.community_type}</span>
                    </td>
                    <td className="p-3 font-mono text-sm">{c.member_count} members</td>
                    <td className="p-3">
                      {c.is_archived ? (
                        <span className="text-amber-600 font-bold">🗄 Archived</span>
                      ) : c.is_locked ? (
                        <span className="text-red-600 font-bold">🔒 Locked</span>
                      ) : (
                        <span className="text-green-600 font-bold">🟢 Active</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1 shrink-0">
                      <button
                        onClick={() => viewCommunityDetails(c)}
                        className="bg-white border border-[#2E241B] px-2.5 py-1 text-sm rounded hover:bg-gray-100"
                      >
                        Inspect
                      </button>
                      {currentUser?.role === 'ADMIN' && (
                        <button
                          onClick={() => { setDeleteTargetComm(c); setDeleteReason(''); }}
                          className="bg-red-50 hover:bg-red-100 border border-red-400 px-2.5 py-1 text-sm rounded text-red-700 font-bold"
                          title="Permanently delete this community"
                        >
                          🗑 Delete
                        </button>
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
      {actionComm && (
        <div className="fixed inset-0 bg-[#2E241B]/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2E241B] p-6 max-w-md w-full rounded-lg shadow-hard">
            <h3 className="font-kalam text-2xl font-bold mb-2 uppercase">{actionType} Community</h3>
            <p className="text-gray-600 text-sm mb-4">
              Action targets circle: <span className="font-bold text-[#2E241B]">{actionComm.title}</span>.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Reason for audit log</label>
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
                onClick={() => setActionComm(null)}
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

      {/* Delete Community Confirmation Modal */}
      {deleteTargetComm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-red-600 p-6 max-w-md w-full rounded-xl shadow-2xl font-patrick text-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">☠</span>
              <div>
                <h3 className="font-kalam text-2xl font-bold text-red-700">Permanently Delete Community</h3>
                <p className="text-sm text-gray-600">This action is <strong>irreversible</strong>. All data will be wiped.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm">
              <p className="font-bold text-red-800">Community to be deleted:</p>
              <p className="text-red-700 font-bold">{deleteTargetComm.title}</p>
              <p className="text-red-600 mt-1">⚠ All posts, memberships, and files in this circle will be permanently erased.</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-1 text-red-700">Mandatory Deletion Reason (for audit log)</label>
              <textarea
                placeholder="State the reason for permanently removing this community..."
                className="w-full bg-red-50 border-2 border-red-400 focus:border-red-600 h-24 p-2 rounded outline-none"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 font-bold">
              <button
                onClick={() => { setDeleteTargetComm(null); setDeleteReason(''); }}
                disabled={deleting}
                className="bg-white border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCommunity}
                disabled={!deleteReason.trim() || deleting}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? 'Deleting...' : '☠ Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Side Panel */}
      {selectedComm && (
        <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#F8F5F0] border-l-3 border-[#2E241B] shadow-hard z-40 flex flex-col font-patrick">
          <div className="p-6 bg-[#2E241B] text-[#F8F5F0] flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-kalam text-3xl font-bold">Circle Inspector</h2>
              <p className="text-sm opacity-80">Moderating {selectedComm.title}</p>
            </div>
            <button
              onClick={() => { setSelectedComm(null); setDetailsData(null); }}
              className="text-[#C59B5C] font-bold hover:text-white text-xl"
            >
              ✕ Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white border-2 border-[#2E241B] p-4 rounded">
              <h4 className="font-kalam text-lg font-bold text-[#C59B5C] mb-2">Actions</h4>
              <div className="flex gap-2">
                {selectedComm.is_archived || selectedComm.is_locked ? (
                  <button
                    onClick={() => { setActionComm(selectedComm); setActionType('restore'); }}
                    className="bg-green-50 text-green-700 border border-green-300 px-3 py-1 rounded text-sm font-bold hover:bg-green-100"
                  >
                    Restore Circle
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setActionComm(selectedComm); setActionType('archive'); }}
                      className="bg-amber-50 text-amber-700 border border-amber-300 px-3 py-1 rounded text-sm font-bold hover:bg-amber-100"
                    >
                      Archive Circle
                    </button>
                    <button
                      onClick={() => { setActionComm(selectedComm); setActionType('lock'); }}
                      className="bg-red-50 text-red-700 border border-red-300 px-3 py-1 rounded text-sm font-bold hover:bg-red-100"
                    >
                      Lock Circle
                    </button>
                  </>
                )}

                {!selectedComm.is_archived && selectedComm.is_locked && (
                  <button
                    onClick={() => { setActionComm(selectedComm); setActionType('unlock'); }}
                    className="bg-green-50 text-green-700 border border-green-300 px-3 py-1 rounded text-sm font-bold hover:bg-green-100"
                  >
                    Unlock Circle
                  </button>
                )}

                {currentUser?.role === 'ADMIN' && (
                  <button
                    onClick={() => { setDeleteTargetComm(selectedComm); setDeleteReason(''); }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold ml-auto"
                    title="Permanently delete this community and all its data"
                  >
                    ☠ Permanently Delete
                  </button>
                )}
              </div>
            </div>

            {detailsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
              </div>
            ) : detailsData ? (
              <>
                {/* Administrators */}
                <div className="bg-white border-2 border-[#2E241B] p-4 rounded space-y-2">
                  <h4 className="font-kalam text-lg font-bold text-[#C59B5C]">Administrators</h4>
                  <ul className="divide-y divide-gray-100">
                    {detailsData.admins.map(adm => (
                      <li key={adm.id} className="py-1 text-sm font-bold text-[#2E241B]">
                        👑 {adm.username}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Co-Admins */}
                <div className="bg-white border-2 border-[#2E241B] p-4 rounded space-y-2">
                  <h4 className="font-kalam text-lg font-bold text-[#C59B5C]">Co-Admins</h4>
                  {detailsData.co_admins.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No co-admins assigned.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {detailsData.co_admins.map(co => (
                        <li key={co.id} className="py-1 text-sm">
                          ✨ {co.username}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Join Requests */}
                <div className="bg-white border-2 border-[#2E241B] p-4 rounded space-y-2">
                  <h4 className="font-kalam text-lg font-bold text-[#C59B5C]">Pending Join Requests</h4>
                  {detailsData.join_requests.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No pending requests.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {detailsData.join_requests.map(req => (
                        <li key={req.id} className="py-1 flex justify-between items-center text-sm">
                          <span>👤 {req.username}</span>
                          <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Banned Members */}
                <div className="bg-white border-2 border-[#2E241B] p-4 rounded space-y-2">
                  <h4 className="font-kalam text-lg font-bold text-red-600">Banned Members</h4>
                  {detailsData.banned_members.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No members banned from circle.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {detailsData.banned_members.map(ban => (
                        <li key={ban.id} className="py-1.5 text-sm">
                          <div className="font-bold">❌ {ban.username}</div>
                          {ban.reason && <div className="text-xs text-red-500 italic">Reason: {ban.reason}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
