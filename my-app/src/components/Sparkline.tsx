"use client";

import React from "react";

export type SeriesPoint = { x: number; y: number };

type SparklineProps = {
  data: SeriesPoint[];
  width?: number;
  height?: number;
  className?: string;
  showDots?: boolean;
};

export default function Sparkline({
  data,
  width = 420,
  height = 80,
  className,
  showDots = true
}: SparklineProps) {
  const padding = 8;
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const sx = (v: number) =>
    padding + ((v - minX) / Math.max(1, maxX - minX)) * (width - padding * 2);
  const sy = (v: number) =>
    height - padding - ((v - minY) / Math.max(1, maxY - minY)) * (height - padding * 2);

  const d = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`)
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <path
        d={d}
        fill="none"
        stroke="url(#sg)"
        strokeWidth="2"
        style={{
          strokeDasharray: 1200,
          strokeDashoffset: 1200,
          animation: "dash 1.6s ease-out forwards"
        }}
      />
      {showDots &&
        data.map(p => (
          <circle
            key={`${p.x}-${p.y}`}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={2.6}
            fill="white"
            opacity={0.6}
          />
        ))}
    </svg>
  );
}