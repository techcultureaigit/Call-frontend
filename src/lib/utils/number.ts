export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return roundTo((value / total) * 100);
}

export function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}
