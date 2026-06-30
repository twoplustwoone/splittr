// Curated, white-text-legible chip colors (Tailwind literals so they're kept
// by the JIT compiler). Indexed by a person's position in the list.
export const PERSON_COLORS = [
  "bg-emerald-600",
  "bg-sky-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-teal-600",
] as const;

export const personColorClass = (index: number) =>
  PERSON_COLORS[index % PERSON_COLORS.length];

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
