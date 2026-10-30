import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`skeleton-shimmer bg-white/[0.05] rounded ${className}`}
    />
  );
}

export function HeroSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <Skeleton className="w-24 h-3.5" />
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-36 h-3.5" />
        </div>
        <Skeleton className="w-16 h-16 rounded-xl" />
      </div>
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-32 h-12" />
          <div className="flex gap-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-28 h-4" />
          </div>
        </div>
        <Skeleton className="w-40 h-9 rounded-lg" />
      </div>
    </div>
  );
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#111724] border border-white/[0.07] rounded-xl p-3.5 flex flex-col justify-between min-h-[96px]"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-16 h-3" />
            <Skeleton className="w-3.5 h-3.5 rounded-full" />
          </div>
          <div className="mt-2 space-y-1">
            <Skeleton className="w-14 h-6" />
            <Skeleton className="w-20 h-2.5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PredictionCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-28 h-3.5" />
        <Skeleton className="w-16 h-4 rounded-full" />
      </div>
      <Skeleton className="w-36 h-4" />
      <div className="my-4 flex items-center justify-center gap-5">
        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-full h-3" />
        </div>
      </div>
      <Skeleton className="w-full h-3.5 pt-2" />
    </div>
  );
}
