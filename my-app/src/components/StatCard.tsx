"use client";

import React from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="card p-4">
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/40">{hint}</div> : null}
    </div>
  );
}