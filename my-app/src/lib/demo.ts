export type DemoNumbers = {
  isDemo: boolean;
  inflate: (n: number) => number;
  note: string;
};

export function getDemoNumbers(isDemo: boolean): DemoNumbers {
  const factor = 3.2; // visual pop, not persisted
  return {
    isDemo,
    inflate: (n: number) => (isDemo ? Math.round(n * factor) : n),
    note: isDemo ? "[Unverified Demo]" : "Live"
  };
}