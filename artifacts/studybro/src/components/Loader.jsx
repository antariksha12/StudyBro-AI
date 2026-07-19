import React from "react";
import { Loader2 } from "lucide-react";

export function Spinner({ size = 20, className = "" }) {
  return <Loader2 size={size} className={`animate-spin text-indigo-400 ${className}`} />;
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-900">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-sm text-slate-400 font-body">Loading StudyBro AI…</p>
      </div>
    </div>
  );
}
