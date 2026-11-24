/** Multipliers to watts. Used ONLY for sorting and range filtering, never to rewrite displayed values. */
const FACTORS: Record<string, number> = {
  w: 1,
  wp: 1,
  va: 1,
  kw: 1e3,
  kwp: 1e3,
  kva: 1e3,
  mw: 1e6,
  mwp: 1e6,
};

export function unitFactor(unit: string): number {
  return FACTORS[unit.trim().toLowerCase()] ?? 1;
}

export function capacityKey(value: number, unit: string): string {
  return `${value} ${unit}`.trim();
}
