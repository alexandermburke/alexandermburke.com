"use client";

import React from "react";

type RadarProps = {
  size?: number;
  className?: string;
};

export default function Radar({ size = 240, className }: RadarProps) {
  const rings = [0.22, 0.44, 0.66, 0.88];
  return (
    <div
      className={`relative overflow-hidden rounded-full border border-white/15 bg-black/40 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0">
        {rings.map(r => (
          <div
            key={r}
            className="absolute rounded-full border border-white/10"
            style={{
              width: size * r * 2,
              height: size * r * 2,
              top: size * (1 - r),
              left: size * (1 - r)
            }}
          />
        ))}
      </div>
      <div
        className="absolute left-1/2 top-1/2 h-[2px] w-1/2 origin-left bg-white/40"
        style={{ transform: "translateY(-1px)" }}
      />
      <div className="absolute inset-0 animate-radar-sweep origin-center">
        <div
          className="absolute left-1/2 top-1/2 h-[2px] w-1/2 origin-left bg-white/70"
          style={{ transform: "translateY(-1px)" }}
        />
      </div>
      {/* blips */}
      {[0.18, 0.4, 0.7].map((r, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/80 animate-pulse"
          style={{
            width: 5,
            height: 5,
            left: size / 2 + Math.cos((i + 1) * 2) * size * r - 2.5,
            top: size / 2 + Math.sin((i + 1) * 2) * size * r - 2.5
          }}
        />
      ))}
    </div>
  );
}