// AuraFinance OS — View Loading Skeleton
// Provides zero-CLS layout reservation during route code-splitting lazy hydration

import React from 'react';

export default function ViewSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-aura-border/40 rounded-xl" />
          <div className="h-4 w-72 bg-aura-border/20 rounded-lg" />
        </div>
        <div className="h-9 w-32 bg-aura-border/30 rounded-xl" />
      </div>

      {/* Bento grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="h-32 bg-aura-border/30 rounded-2xl" />
        <div className="h-32 bg-aura-border/30 rounded-2xl" />
        <div className="h-32 bg-aura-border/30 rounded-2xl" />
      </div>

      {/* Main card skeleton */}
      <div className="h-80 bg-aura-border/20 rounded-3xl p-6 space-y-4">
        <div className="h-6 w-56 bg-aura-border/40 rounded-xl" />
        <div className="h-48 w-full bg-aura-border/10 rounded-2xl" />
      </div>
    </div>
  );
}
