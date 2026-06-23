import { useState } from 'react';

export default function Analytics() {
  const [filter, setFilter] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'

  // Growth mock data based on filter
  const getMockData = () => {
    if (filter === 'daily') {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        users: [12, 19, 15, 25, 32, 28, 30],
        memorials: [5, 9, 8, 12, 14, 11, 10],
        communities: [1, 2, 2, 4, 3, 5, 2],
        storage: [2.1, 2.3, 2.4, 2.6, 2.9, 3.1, 3.2] // MB
      };
    }
    if (filter === 'weekly') {
      return {
        labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'],
        users: [80, 120, 150, 190, 240, 310, 350],
        memorials: [35, 48, 62, 75, 90, 112, 130],
        communities: [12, 15, 18, 22, 26, 30, 35],
        storage: [15, 18, 22, 28, 35, 42, 48]
      };
    }
    // Monthly default
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      users: [200, 350, 600, 950, 1400, 2100, 2900],
      memorials: [90, 160, 270, 410, 620, 890, 1200],
      communities: [20, 35, 55, 80, 115, 160, 220],
      storage: [120, 180, 290, 420, 610, 890, 1200]
    };
  };

  const data = getMockData();

  // Simple helper to find max for SVG scaling
  const maxUser = Math.max(...data.users);
  const maxMem = Math.max(...data.memorials);
  const maxComm = Math.max(...data.communities);
  const maxStorage = Math.max(...data.storage);

  return (
    <div className="space-y-6 font-patrick text-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Analytics & Metrics</h1>
          <p className="font-patrick text-xl text-[#2E241B]/70">Analyze user expansion, memorial retention, and system resources</p>
        </div>
        <div className="flex bg-white border-2 border-[#2E241B] rounded-lg overflow-hidden shrink-0">
          {['daily', 'weekly', 'monthly'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 font-bold uppercase text-xs border-r border-[#2E241B] last:border-r-0 ${
                filter === type ? 'bg-[#2E241B] text-white' : 'bg-white hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Users Growth Chart */}
        <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
          <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">User Growth</h3>
          <div className="h-48 w-full border-b border-l border-[#2E241B]/20 relative flex items-end justify-between px-4 pb-2 pt-6">
            {data.users.map((val, idx) => {
              const pct = (val / maxUser) * 100;
              return (
                <div key={idx} className="flex flex-col items-center w-full group">
                  <span className="text-xs font-mono font-bold bg-[#2E241B] text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 absolute bottom-full" style={{ bottom: `${pct}%` }}>
                    {val}
                  </span>
                  <div className="bg-[#2E241B] w-8 hover:bg-[#C59B5C] transition-colors rounded-t" style={{ height: `${pct || 1}%`, minHeight: '4px' }}></div>
                  <span className="text-xs text-gray-500 mt-1">{data.labels[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Memorials Growth Chart */}
        <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
          <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">Memorial Growth</h3>
          <div className="h-48 w-full border-b border-l border-[#2E241B]/20 relative flex items-end justify-between px-4 pb-2 pt-6">
            {data.memorials.map((val, idx) => {
              const pct = (val / maxMem) * 100;
              return (
                <div key={idx} className="flex flex-col items-center w-full group">
                  <span className="text-xs font-mono font-bold bg-[#C59B5C] text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 absolute" style={{ bottom: `${pct}%` }}>
                    {val}
                  </span>
                  <div className="bg-[#C59B5C] w-8 hover:bg-[#2E241B] transition-colors rounded-t" style={{ height: `${pct || 1}%`, minHeight: '4px' }}></div>
                  <span className="text-xs text-gray-500 mt-1">{data.labels[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Growth Chart */}
        <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
          <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">Support Circles</h3>
          <div className="h-48 w-full border-b border-l border-[#2E241B]/20 relative flex items-end justify-between px-4 pb-2 pt-6">
            {data.communities.map((val, idx) => {
              const pct = (val / maxComm) * 100;
              return (
                <div key={idx} className="flex flex-col items-center w-full group">
                  <span className="text-xs font-mono font-bold bg-[#2E241B] text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 absolute" style={{ bottom: `${pct}%` }}>
                    {val}
                  </span>
                  <div className="bg-[#2E241B] w-8 hover:bg-[#C59B5C] transition-colors rounded-t" style={{ height: `${pct || 1}%`, minHeight: '4px' }}></div>
                  <span className="text-xs text-gray-500 mt-1">{data.labels[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Storage Growth Chart */}
        <div className="bg-white border-2 border-[#2E241B] p-6 rounded-lg shadow-hard space-y-4">
          <h3 className="font-kalam text-2xl font-bold text-[#C59B5C]">Storage Growth</h3>
          <div className="h-48 w-full border-b border-l border-[#2E241B]/20 relative flex items-end justify-between px-4 pb-2 pt-6">
            {data.storage.map((val, idx) => {
              const pct = (val / maxStorage) * 100;
              return (
                <div key={idx} className="flex flex-col items-center w-full group">
                  <span className="text-xs font-mono font-bold bg-[#C59B5C] text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 absolute" style={{ bottom: `${pct}%` }}>
                    {val} {filter === 'daily' ? 'MB' : 'GB'}
                  </span>
                  <div className="bg-[#C59B5C] w-8 hover:bg-[#2E241B] transition-colors rounded-t" style={{ height: `${pct || 1}%`, minHeight: '4px' }}></div>
                  <span className="text-xs text-gray-500 mt-1">{data.labels[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
