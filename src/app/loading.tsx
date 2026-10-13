import React from "react";

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-64 rounded-3xl bg-slate-200/70 w-full" />

      {/* Filter and cards skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-slate-200 rounded-full" />
          <div className="h-8 w-28 bg-slate-200 rounded-full" />
          <div className="h-8 w-24 bg-slate-200 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      </div>
    </div>
  );
}
