import React from 'react';

export const AnalyticsLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading analytics data">
      {/* Top Metric Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-[#1A2332] rounded" />
              <div className="w-6 h-6 rounded-lg bg-[#1A2332]" />
            </div>
            <div className="h-8 w-20 bg-[#1A2332] rounded" />
            <div className="h-2.5 w-32 bg-[#1A2332] rounded" />
          </div>
        ))}
      </div>

      {/* Main Chart Skeleton */}
      <div className="p-6 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-[#1A2332] rounded" />
            <div className="h-3 w-72 bg-[#1A2332] rounded" />
          </div>
          <div className="h-6 w-24 bg-[#1A2332] rounded-full" />
        </div>
        <div className="h-64 w-full bg-[#1A2332]/50 rounded-xl" />
      </div>

      {/* Table Skeletons */}
      <div className="p-5 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-3">
        <div className="h-4 w-36 bg-[#1A2332] rounded" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-[#1A2332]/60 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};
