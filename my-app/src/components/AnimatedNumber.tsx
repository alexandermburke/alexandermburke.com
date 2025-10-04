"use client";

import React from "react";

export type NumberFormatter = (n: number) => string;

type AnimatedNumberProps = {
  value: number;
  durationMs?: number;
  formatter?: NumberFormatter;
  className?: string;
};

export default function AnimatedNumber({
  value,
  durationMs = 900,
  formatter,
  className
}: AnimatedNumberProps) {
  const [display, setDisplay] = React.useState<number>(0);
  const startRef = React.useRef<number | null>(null);
  const fromRef = React.useRef<number>(0);
  const toRef = React.useRef<number>(value);
  const displayRef = React.useRef<number>(0);

  React.useEffect(() => {
    displayRef.current = display;
  }, [display]);

  React.useEffect(() => {
    fromRef.current = displayRef.current;
    toRef.current = value;
    startRef.current = null;

    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      const v = fromRef.current + (toRef.current - fromRef.current) * eased;
      setDisplay(v);
      if (p < 1) requestAnimationFrame(step);
    };

    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [value, durationMs]);

  const fmt = formatter ?? ((n: number) => Math.round(n).toLocaleString());
  return <span className={className}>{fmt(display)}</span>;
}
