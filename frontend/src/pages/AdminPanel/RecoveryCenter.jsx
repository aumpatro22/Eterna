import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function RecoveryCenter() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore Modal State
  const [targetItem, setTargetItem] = useState(null);
  const [targetType, setTargetType] = useState(''); // 'MEMORIAL', 'TALE', 'COMMUNITY', 'COMMUNITY_MESSAGE'
  const [restoreReason, setRestoreReason] = useState('');

  const fetchRecovery = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/recovery/');
      setData(res);
    } catch (err) {
      alert(err.message || 'Failed to load recovery content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecovery();
  }, []);

  const handleRestore = async () => {
    if (!targetItem) return;
    try {
      await api.post('/api/admin/recovery/restore/', {
        target_type: targetType,
        target_id: targetItem.id,
        reason: restoreReason
      });
      fetchRecovery();
      setTargetItem(null);
      setRestoreReason('');
      alert('Content successfully restored to active status.');
    } catch (err) {
      alert(err.message || 'Failed to restore item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    hidden_memorials = [],
    archived_memorials = [],
    hidden_tales = [],
    archived_tales = [],
    archived_communities = [],
    deleted_messages = []
  } = data || {};

  const totalItems =
    hidden_memorials.length +
    archived_memorials.length +
    hidden_tales.length +
    archived_tales.length +
    archived_communities.length +
    deleted_messages.length;

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Emergency Recovery Center</h1>
          <p className="font-patrick text-xl text-[#2E241B]/70">
            One-click restore panel. Eterna preserves memories forever; nothing is permanently deleted.
          </p>
        </div>
        <div className="bg-white border-2 border-[#2E241B] px-4 py-2 shadow-hard rounded text-right shrink-0">
          <div className="text-xs font-bold text-[#C59B5C] uppercase">Items in Graveyard</div>
          <div className="font-bold text-2xl text-red-600">{totalItems}</div>
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="bg-white border-2 border-[#2E241B] p-12 text-center rounded-lg shadow-hard">
          <span className="text-5xl">🕊️</span>
          <p className="text-xl text-[#2E241B]/60 italic mt-3">The Eterna graveyard is currently empty. All memories are active!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Memorials */}
          {(hidden_memorials.length > 0 || archived_memorials.length > 0) && (
            <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
              <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">🕊️ Hidden / Archived Memorials</h3>
              <ul className="divide-y divide-[#2E241B]/10 max-h-64 overflow-y-auto">
                {hidden_memorials.map((m) => (
                  <li key={m.id} className="py-2.5 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold">{m.full_name} <span className="text-red-500 font-normal">(Hidden)</span></div>
                      <div className="text-xs text-gray-500">Owner: {m.owner__username}</div>
                    </div>
                    <button
                      onClick={() => { setTargetItem(m); setTargetType('MEMORIAL'); }}
                      className="bg-white border border-[#2E241B] hover:bg-[#C59B5C]/10 px-2.5 py-1 text-xs font-bold rounded"
                    >
                      Restore 🕊️
                    </button>
                  </li>
                ))}
                {archived_memorials.map((m) => (
                  <li key={m.id} className="py-2.5 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold">{m.full_name} <span className="text-amber-500 font-normal">(Archived)</span></div>
                      <div className="text-xs text-gray-500">Owner: {m.owner__username}</div>
                    </div>
                    <button
                      onClick={() => { setTargetItem(m); setTargetType('MEMORIAL'); }}
                      className="bg-white border border-[#2E241B] hover:bg-[#C59B5C]/10 px-2.5 py-1 text-xs font-bold rounded"
                    >
                      Restore 🕊️
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tales */}
          {(hidden_tales.length > 0 || archived_tales.length > 0) && (
            <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
              <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">📖 Hidden / Archived Tales</h3>
              <ul className="divide-y divide-[#2E241B]/10 max-h-64 overflow-y-auto">
                {hidden_tales.map((t) => (
                  <li key={t.id} className="py-2.5 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold">{t.title} <span className="text-red-500 font-normal">(Hidden)</span></div>
                      <div className="text-xs text-gray-500">Author: {t.author__username}</div>
                    </div>
                    <button
                      onClick={() => { setTargetItem(t); setTargetType('TALE'); }}
                      className="bg-white border border-[#2E241B] hover:bg-[#C59B5C]/10 px-2.5 py-1 text-xs font-bold rounded"
                    >
                      Restore 📖
                    </button>
                  </li>
                ))}
                {archived_tales.map((t) => (
                  <li key={t.id} className="py-2.5 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold">{t.title} <span className="text-amber-500 font-normal">(Archived)</span></div>
                      <div className="text-xs text-gray-500">Author: {t.author__username}</div>
                    </div>
                    <button
                      onClick={() => { setTargetItem(t); setTargetType('TALE'); }}
                      className="bg-white border border-[#2E241B] hover:bg-[#C59B5C]/10 px-2.5 py-1 text-xs font-bold rounded"
                    >
                      Restore 📖
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Communities */}
          {archived_communities.length > 0 && (
            <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
              <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">🏡 Archived Communities</h3>
              <ul className="divide-y divide-[#2E241B]/10 max-h-64 overflow-y-auto">
                {archived_communities.map((c) => (
                  <li key={c.id} className="py-2.5 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold">{c.title}</div>
                      <div className="text-xs text-gray-500">Owner: {c.owner__username}</div>
                    </div>
                    <button
                      onClick={() => { setTargetItem(c); setTargetType('COMMUNITY'); }}
                      className="bg-white border border-[#2E241B] hover:bg-[#C59B5C]/10 px-2.5 py-1 text-xs font-bold rounded"
                    >
                      Restore 🏡
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deleted community messages */}
          {deleted_messages.length > 0 && (
            <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
              <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">💬 Deleted Community Posts</h3>
              <ul className="divide-y divide-[#2E241B]/10 max-h-64 overflow-y-auto">
                {deleted_messages.map((msg) => (
                  <li key={msg.id} className="py-2.5 flex justify-between items-center text-sm">
                    <div className="max-w-[70%]">
                      <div className="font-bold truncate">"{msg.content}"</div>
                      <div className="text-xs text-gray-500">Author: {msg.author__username} in {msg.community__title}</div>
                    </div>
                    <button
                      onClick={() => { setTargetItem(msg); setTargetType('COMMUNITY_MESSAGE'); }}
                      className="bg-white border border-[#2E241B] hover:bg-[#C59B5C]/10 px-2.5 py-1 text-xs font-bold rounded"
                    >
                      Restore 💬
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {targetItem && (
        <div className="fixed inset-0 bg-[#2E241B]/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2E241B] p-6 max-w-md w-full rounded-lg shadow-hard">
            <h3 className="font-kalam text-2xl font-bold mb-2 uppercase">Restore Content</h3>
            <p className="text-gray-600 text-sm mb-4">
              Restoring target {targetType.replace('_', ' ')} ID: <span className="font-bold text-[#2E241B]">{targetItem.id}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Reason for restoration log</label>
              <textarea
                placeholder="Reason..."
                className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] h-24 p-2 rounded"
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-3 font-bold">
              <button
                onClick={() => setTargetItem(null)}
                className="bg-white border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={!restoreReason.trim()}
                className="bg-[#2E241B] text-white px-4 py-1.5 rounded hover:bg-black disabled:opacity-50"
              >
                Restore Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
