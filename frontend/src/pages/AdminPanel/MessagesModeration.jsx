import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function MessagesModeration() {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 30;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
      setOffset(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Actions
  const [actionMsg, setActionMsg] = useState(null);
  const [actionType, setActionType] = useState(''); // 'soft_delete' | 'restore'
  const [actionReason, setActionReason] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/admin/messages/?search=${search}&status=${statusFilter}&limit=${limit}&offset=${offset}`
      );
      setMessages(res.messages);
      setTotal(res.total);
    } catch (err) {
      alert(err.message || 'Failed to load community messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [search, statusFilter, offset]);

  const handleAction = async () => {
    if (!actionMsg) return;
    try {
      await api.post(`/api/admin/messages/${actionMsg.id}/action/`, {
        action: actionType,
        reason: actionReason
      });
      fetchMessages();
      setActionMsg(null);
      setActionReason('');
    } catch (err) {
      alert(err.message || 'Failed to moderate message');
    }
  };

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Message Moderation</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">
          Soft delete or restore community messages. Private direct messages are strictly excluded.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-2 border-[#2E241B] p-4 rounded-lg shadow-hard">
        <div>
          <label className="block text-sm font-bold mb-1">Search content or author</label>
          <input
            type="text"
            placeholder="Search words, author..."
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
            <option value="">All Posts</option>
            <option value="active">Active & Visible</option>
            <option value="deleted">Soft-Deleted</option>
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

      {/* Message Feed */}
      <div className="bg-white border-2 border-[#2E241B] rounded-lg shadow-hard overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xl text-[#2E241B]/60 italic py-16">No community messages found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2E241B] text-[#F8F5F0] border-b-2 border-[#2E241B]">
                  <th className="p-3">Community Circle</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Post Content</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E241B]/10">
                {messages.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#C59B5C]">{m.community_title}</td>
                    <td className="p-3 font-bold">{m.author}</td>
                    <td className="p-3 max-w-sm">
                      {m.is_deleted ? (
                        <span className="text-red-500 italic bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          [This message was deleted]
                        </span>
                      ) : (
                        <div className="truncate text-base leading-relaxed">
                          {m.content}
                          {m.image && <span className="ml-2 text-xs text-blue-500 font-mono">[Image Attached]</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-sm text-[#2E241B]/60 shrink-0">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {m.is_deleted ? (
                        <span className="text-red-500 font-bold">Soft-Deleted</span>
                      ) : (
                        <span className="text-green-600 font-bold">Visible</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1 shrink-0">
                      {m.is_deleted ? (
                        <button
                          onClick={() => { setActionMsg(m); setActionType('restore'); }}
                          className="bg-green-50 text-green-700 border border-green-300 px-2.5 py-1 text-sm rounded font-bold hover:bg-green-100"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => { setActionMsg(m); setActionType('soft_delete'); }}
                          className="bg-red-50 text-red-700 border border-red-300 px-2.5 py-1 text-sm rounded font-bold hover:bg-red-100"
                        >
                          Soft-Delete
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
      {actionMsg && (
        <div className="fixed inset-0 bg-[#2E241B]/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2E241B] p-6 max-w-md w-full rounded-lg shadow-hard">
            <h3 className="font-kalam text-2xl font-bold mb-2 uppercase">
              {actionType === 'soft_delete' ? 'Soft-Delete' : 'Restore'} Post
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Moderate post by: <span className="font-bold text-[#2E241B]">{actionMsg.author}</span>.
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
                onClick={() => setActionMsg(null)}
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
