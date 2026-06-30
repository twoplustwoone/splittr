/**
 * Distribute `totalCents` across entries in proportion to `weightsCents`,
 * using the largest-remainder method so the returned integer cents always
 * sum to exactly `totalCents` (no penny drift).
 *
 * Works for a negative `totalCents` too: sum(raw) === totalCents exactly, so
 * the leftover after flooring is always in [0, n), and we hand those extra
 * cents to the entries with the largest fractional parts.
 */
export const allocateProportional = (
  weightsCents: number[],
  totalCents: number
): number[] => {
  const n = weightsCents.length;
  if (n === 0) return [];

  const totalWeight = weightsCents.reduce((acc, w) => acc + w, 0);
  // Nothing to weight against — can't allocate proportionally.
  if (totalWeight === 0) return new Array(n).fill(0);

  const raw = weightsCents.map((w) => (totalCents * w) / totalWeight);
  const floored = raw.map((r) => Math.floor(r));
  const used = floored.reduce((acc, c) => acc + c, 0);
  const leftover = totalCents - used; // integer in [0, n)

  const byFraction = raw
    .map((r, index) => ({ index, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);

  const result = floored.slice();
  for (let k = 0; k < leftover && k < n; k++) {
    result[byFraction[k].index] += 1;
  }

  return result;
};

export const toCents = (value: number): number =>
  Math.round((Number.isFinite(value) ? value : 0) * 100);

export const fromCents = (cents: number): number => cents / 100;
