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

export const equalWeights = (n: number): number[] => new Array(n).fill(1);

// ---- Per-person split engine -------------------------------------------------

export type SplitInput = {
  items: { name: string; price: number; assignees: string[] }[];
  people: { id: string; name: string }[];
  tax: number;
  tip: { mode: "percent" | "amount"; value: number };
};

export type ItemizedRow = {
  name: string;
  price: number;
  tax: number;
  tip: number;
  total: number;
};

export type PersonResult = {
  id: string;
  name: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  items: { name: string; amount: number }[];
};

export type SplitResult = {
  itemized: ItemizedRow[];
  perPerson: PersonResult[];
  unassigned: {
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
    count: number;
  };
  totals: { subtotal: number; tax: number; tip: number; total: number };
  subtotalCents: number;
  taxCents: number;
  tipCents: number;
};

const itemName = (name: string | undefined, index: number) =>
  name?.trim() ? name : `Item ${index + 1}`;

/**
 * Single source of truth for results. All arithmetic is in integer cents, so
 * every view reconciles exactly:
 *   Σ per-item tax === total tax,  Σ per-person total + unassigned === grand total.
 */
export const computeSplit = (input: SplitInput): SplitResult => {
  const { items, people, tax, tip } = input;

  const priceCents = items.map((it) => toCents(it.price));
  const subtotalCents = priceCents.reduce((a, c) => a + c, 0);
  const taxCents = toCents(tax);
  const tipCents =
    tip.mode === "percent"
      ? Math.round((subtotalCents * (Number.isFinite(tip.value) ? tip.value : 0)) / 100)
      : toCents(tip.value);

  // Allocate tax & tip across items proportionally to price.
  const itemTax = allocateProportional(priceCents, taxCents);
  const itemTip = allocateProportional(priceCents, tipCents);

  const itemized: ItemizedRow[] = items.map((it, i) => ({
    name: itemName(it.name, i),
    price: fromCents(priceCents[i]),
    tax: fromCents(itemTax[i]),
    tip: fromCents(itemTip[i]),
    total: fromCents(priceCents[i] + itemTax[i] + itemTip[i]),
  }));

  const validIds = new Set(people.map((p) => p.id));
  const acc = new Map(
    people.map((p) => [
      p.id,
      { subtotal: 0, tax: 0, tip: 0, items: [] as { name: string; amount: number }[] },
    ])
  );
  const unassignedCents = { subtotal: 0, tax: 0, tip: 0, count: 0 };

  items.forEach((it, i) => {
    const assignees = (it.assignees ?? []).filter((id) => validIds.has(id));
    const k = assignees.length;
    if (k === 0) {
      unassignedCents.subtotal += priceCents[i];
      unassignedCents.tax += itemTax[i];
      unassignedCents.tip += itemTip[i];
      unassignedCents.count += 1;
      return;
    }
    const weights = equalWeights(k);
    const priceShares = allocateProportional(weights, priceCents[i]);
    const taxShares = allocateProportional(weights, itemTax[i]);
    const tipShares = allocateProportional(weights, itemTip[i]);
    assignees.forEach((id, j) => {
      const entry = acc.get(id)!;
      entry.subtotal += priceShares[j];
      entry.tax += taxShares[j];
      entry.tip += tipShares[j];
      entry.items.push({
        name: itemName(it.name, i),
        amount: fromCents(priceShares[j] + taxShares[j] + tipShares[j]),
      });
    });
  });

  const perPerson: PersonResult[] = people.map((p) => {
    const entry = acc.get(p.id)!;
    return {
      id: p.id,
      name: p.name,
      subtotal: fromCents(entry.subtotal),
      tax: fromCents(entry.tax),
      tip: fromCents(entry.tip),
      total: fromCents(entry.subtotal + entry.tax + entry.tip),
      items: entry.items,
    };
  });

  return {
    itemized,
    perPerson,
    unassigned: {
      subtotal: fromCents(unassignedCents.subtotal),
      tax: fromCents(unassignedCents.tax),
      tip: fromCents(unassignedCents.tip),
      total: fromCents(
        unassignedCents.subtotal + unassignedCents.tax + unassignedCents.tip
      ),
      count: unassignedCents.count,
    },
    totals: {
      subtotal: fromCents(subtotalCents),
      tax: fromCents(taxCents),
      tip: fromCents(tipCents),
      total: fromCents(subtotalCents + taxCents + tipCents),
    },
    subtotalCents,
    taxCents,
    tipCents,
  };
};
