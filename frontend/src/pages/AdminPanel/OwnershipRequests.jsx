import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function OwnershipRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  // Modal actions
  const [actionReq, setActionReq] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/ownership-requests/?status=${statusFilter}`);
      setRequests(res);
    } catch (err) {
      alert(err.message || 'Failed to load transfer requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleAction = async () => {
    if (!actionReq) return;
    try {
      await api.post(`/api/admin/ownership-requests/${actionReq.id}/action/`, {
        action: actionType,
        reason: actionReason
      });
      fetchRequests();
      setActionReq(null);
      setActionReason('');
    } catch (err) {
      alert(err.message || 'Failed to moderate request');
    }
  };

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Memorial Ownership Transfers</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Review claims and transfer memorial management to family members</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-[#2E241B] p-4 rounded-lg shadow-hard flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <span className="font-bold">Filter Status:</span>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1 border border-[#2E241B] rounded ${statusFilter === 'PENDING' ? 'bg-[#2E241B] text-white font-bold' : 'bg-white hover:bg-gray-100'}`}
          >
            Pending Claims
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1 border border-[#2E241B] rounded ${statusFilter === 'APPROVED' ? 'bg-[#2E241B] text-white font-bold' : 'bg-white hover:bg-gray-100'}`}
          >
            Approved Transfers
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1 border border-[#2E241B] rounded ${statusFilter === 'REJECTED' ? 'bg-[#2E241B] text-white font-bold' : 'bg-white hover:bg-gray-100'}`}
          >
            Rejected Claims
          </button>
        </div>
      </div>

      {/* Requests */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
        </div>
      ) : requests.length === 0 ? (
        <p className="text-center text-xl text-[#2E241B]/60 italic py-16">No ownership requests found.</p>
      ) : (
        <div className="space-y-6">
          {requests.map((r) => (
            <div key={r.id} className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg hover:rotate-0.5 transition-transform">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-kalam text-2xl font-bold text-[#2E241B]">Transfer for: {r.memorial_name}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Requester: <span className="font-bold text-[#C59B5C]">{r.requester}</span> | Current Owner: <span className="font-bold text-gray-600">{r.current_owner}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    r.status === 'PENDING' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                    r.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {r.status}
                  </span>
                  {r.status === 'PENDING' && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setActionReq(r); setActionType('reject'); }}
                        className="bg-red-50 text-red-700 border border-red-300 px-3 py-1 text-xs font-bold rounded hover:bg-red-100"
                      >
                        Reject Transfer
                      </button>
                      <button
                        onClick={() => { setActionReq(r); setActionType('approve'); }}
                        className="bg-green-50 text-green-700 border border-green-300 px-3 py-1 text-xs font-bold rounded hover:bg-green-100"
                      >
                        Approve Transfer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 bg-[#F8F5F0] border border-[#2E241B]/20 rounded text-base space-y-3 leading-relaxed">
                <div>
                  <strong className="text-[#2E241B] block">Claim Reason:</strong>
                  <p className="mt-1 italic">"{r.claim_reason}"</p>
                </div>
                {r.proof_description && (
                  <div>
                    <strong className="text-[#2E241B] block">Verification Proof Submitted:</strong>
                    <p className="mt-1">{r.proof_description}</p>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-400 text-right mt-3 font-mono">
                Claim Submitted: {new Date(r.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {actionReq && (
        <div className="fixed inset-0 bg-[#2E241B]/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2E241B] p-6 max-w-md w-full rounded-lg shadow-hard">
            <h3 className="font-kalam text-2xl font-bold mb-2 uppercase">{actionType} Ownership Transfer</h3>
            <p className="text-gray-600 text-sm mb-4">
              Confirm transfer of memorial: <span className="font-bold text-[#2E241B]">{actionReq.memorial_name}</span>.
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
                onClick={() => setActionReq(null)}
                className="bg-white border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={!actionReason.trim()}
                className="bg-[#2E241B] text-white px-4 py-1.5 rounded hover:bg-black disabled:opacity-50"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
