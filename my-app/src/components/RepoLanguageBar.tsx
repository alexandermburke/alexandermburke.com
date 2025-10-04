"use client";

import React from "react";

type Segment = { name: string; pct: number };

export default function RepoLanguageBar({ langs }: { langs: { name: string; bytes: number }[] }) {
  const total = langs.reduce((acc, l) => acc + l.bytes, 0);
  const segs: Segment[] = langs.map(l => ({ name: l.name, pct: total ? (l.bytes / total) * 100 : 0 }));
  return (
    <div className="mt-2">
      <div className="flex h-2 w-full overflow-hidden rounded">
        {segs.map(s => (
          <div key={s.name} className="bg-white/10" style={{ width: `${s.pct}%` }} />
        ))}
      </div>
      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-white/60">
        {segs.map(s => (
          <span key={s.name} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
} 