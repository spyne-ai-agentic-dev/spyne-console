// Status-agnostic styling. The API's `status` enum is intentionally NOT
// hardcoded — known values get a color, ANYTHING ELSE falls back to a neutral
// chip showing the raw (humanized) label. A brand-new status never breaks, is
// never hidden, and is never miscolored as "confirmed".

export interface ChipStyle {
  dot: string;
  bg: string;
  text: string;
}

const NEUTRAL: ChipStyle = { dot: "#9ca3af", bg: "#f3f4f6", text: "#374151" };

// Known statuses → reporting-vini palette. Extend freely; absence is safe.
const KNOWN_STATUS: Record<string, ChipStyle> = {
  scheduled: { dot: "#6366f1", bg: "#eef2ff", text: "#3730a3" },
  confirmed: { dot: "#16a34a", bg: "#dcfce7", text: "#065f46" },
  unconfirmed: { dot: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
  rescheduled: { dot: "#813fed", bg: "#f3eaff", text: "#6d28d9" },
  cancelled: { dot: "#dc2626", bg: "#fee2e2", text: "#991b1b" },
  canceled: { dot: "#dc2626", bg: "#fee2e2", text: "#991b1b" },
  no_show: { dot: "#dc2626", bg: "#fee2e2", text: "#991b1b" },
  "no-show": { dot: "#dc2626", bg: "#fee2e2", text: "#991b1b" },
  showed: { dot: "#16a34a", bg: "#dcfce7", text: "#065f46" },
  visited: { dot: "#16a34a", bg: "#dcfce7", text: "#065f46" },
  completed: { dot: "#16a34a", bg: "#dcfce7", text: "#065f46" },
};

// Humanize any raw value: "no_show" / "no-show" → "No-show".
export function humanize(raw?: string | null): string {
  if (!raw) return "Unknown";
  return raw
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function statusStyle(raw?: string | null): ChipStyle {
  if (!raw) return NEUTRAL;
  return KNOWN_STATUS[raw.toLowerCase()] ?? NEUTRAL;
}

// Generic chip color for any categorical value (source, transport, type…),
// derived deterministically so unknown values still look intentional.
const ACCENTS: ChipStyle[] = [
  { dot: "#813fed", bg: "#f3eaff", text: "#6d28d9" },
  { dot: "#6366f1", bg: "#eef2ff", text: "#3730a3" },
  { dot: "#0891b2", bg: "#cffafe", text: "#155e75" },
  { dot: "#ca8a04", bg: "#fef9c3", text: "#854d0e" },
];
export function accentFor(raw?: string | null): ChipStyle {
  if (!raw) return NEUTRAL;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}
