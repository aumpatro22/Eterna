import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/contact-messages/?status=${statusFilter}&limit=${limit}&offset=${offset}`);
      setMessages(res.messages);
      setTotal(res.total);
    } catch (err) {
      alert(err.message || 'Failed to load support messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, offset]);

  const handleResolve = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'PENDING' ? 'RESOLVED' : 'PENDING';
    try {
      await api.post('/api/admin/contact-messages/', { id, status: nextStatus });
      setMessages(messages.map(m => m.id === id ? { ...m, status: nextStatus } : m));
    } catch (err) {
      alert(err.message || 'Failed to update message status');
    }
  };

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div>
        <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Support Inbox</h1>
        <p className="font-patrick text-xl text-[#2E241B]/70">Respond to support, legacy help and bug requests from Eterna members</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-[#2E241B] p-4 rounded-lg shadow-hard flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <span className="font-bold">Filter Status:</span>
          <button
            onClick={() => { setStatusFilter(''); setOffset(0); }}
            className={`px-3 py-1 border border-[#2E241B] rounded ${statusFilter === '' ? 'bg-[#2E241B] text-white font-bold' : 'bg-white hover:bg-gray-100'}`}
          >
            All Messages
          </button>
          <button
            onClick={() => { setStatusFilter('PENDING'); setOffset(0); }}
            className={`px-3 py-1 border border-[#2E241B] rounded ${statusFilter === 'PENDING' ? 'bg-[#2E241B] text-white font-bold' : 'bg-white hover:bg-gray-100'}`}
          >
            Pending Review
          </button>
          <button
            onClick={() => { setStatusFilter('RESOLVED'); setOffset(0); }}
            className={`px-3 py-1 border border-[#2E241B] rounded ${statusFilter === 'RESOLVED' ? 'bg-[#2E241B] text-white font-bold' : 'bg-white hover:bg-gray-100'}`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Grid of Messages */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
        </div>
      ) : messages.length === 0 ? (
        <p className="text-center text-xl text-[#2E241B]/60 italic py-16">No support messages found.</p>
      ) : (
        <div className="space-y-6">
          {messages.map((m) => (
            <div key={m.id} className="bg-white border-2 border-[#2E241B] p-6 shadow-hard rounded-lg flex flex-col justify-between hover:rotate-0.5 transition-transform">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-kalam text-2xl font-bold text-[#2E241B]">{m.name}</h3>
                  <a href={`mailto:${m.email}`} className="text-[#C59B5C] font-bold hover:underline font-mono text-sm">
                    {m.email}
                  </a>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    m.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {m.status}
                  </span>
                  <button
                    onClick={() => handleResolve(m.id, m.status)}
                    className="border border-[#2E241B] px-3 py-1 text-sm font-bold bg-white hover:bg-[#C59B5C]/10 rounded"
                  >
                    {m.status === 'PENDING' ? 'Mark Resolved' : 'Mark Pending'}
                  </button>
                </div>
              </div>
              <div className="mt-4 p-4 bg-[#F8F5F0] border border-[#2E241B]/20 rounded text-base whitespace-pre-wrap leading-relaxed">
                {m.message}
              </div>
              <div className="text-xs text-gray-400 text-right mt-3 font-mono">
                Received: {new Date(m.created_at).toLocaleString()}
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="bg-[#F8F5F0] border border-[#2E241B]/20 p-3 flex justify-between items-center rounded">
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
      )}
    </div>
  );
}
