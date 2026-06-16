export type Gradient = { id: string; name: string; stops: [string, string] };

export const GRADIENTS: Gradient[] = [
  { id: "mint", name: "Mint", stops: ["#34d399", "#059669"] },
  { id: "sky", name: "Sky", stops: ["#38bdf8", "#2563eb"] },
  { id: "sunset", name: "Sunset", stops: ["#fb7185", "#f59e0b"] },
  { id: "grape", name: "Grape", stops: ["#a78bfa", "#7c3aed"] },
  { id: "slate", name: "Slate", stops: ["#94a3b8", "#334155"] },
  { id: "peach", name: "Peach", stops: ["#fda4af", "#fb923c"] },
];

/** Output canvas size for an image with a uniform pad and optional top bar. */
export function outputSize(
  imgW: number,
  imgH: number,
  padding: number,
  barHeight = 0
): { width: number; height: number } {
  return {
    width: Math.max(1, Math.round(imgW + padding * 2)),
    height: Math.max(1, Math.round(imgH + barHeight + padding * 2)),
  };
}
