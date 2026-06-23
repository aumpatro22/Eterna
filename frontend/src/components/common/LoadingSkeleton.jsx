import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 w-full animate-pulse select-none">
      <div className="paper-card p-8 bg-white max-w-md w-full text-center relative rotate-1 tack-decoration shadow-hard flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin mb-4"></div>
        <h2 className="font-kalam text-2xl text-[#2E241B] mb-2">Turning the page...</h2>
        <p className="font-patrick text-lg text-[#2E241B]/55">Loading memories</p>
      </div>
    </div>
  );
}
