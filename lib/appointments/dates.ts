// Lightweight date helpers (Monday-first weeks). No external deps.

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // 0 = Monday
  return addDays(x, -day);
}
export function endOfWeek(d: Date): Date {
  return endOfDay(addDays(startOfWeek(d), 6));
}
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function weekDays(anchor: Date): Date[] {
  const s = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(s, i));
}
// 6x7 grid covering the month (leading/trailing days from adjacent months).
export function monthGrid(anchor: Date): Date[][] {
  const first = startOfWeek(startOfMonth(anchor));
  return Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d)),
  );
}

export function fmtMonthYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
export function fmtWeekRange(anchor: Date): string {
  const s = startOfWeek(anchor);
  const e = addDays(s, 6);
  const sameMonth = s.getMonth() === e.getMonth();
  const sStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const eStr = e.toLocaleDateString("en-US", sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" });
  return `${sStr} – ${eStr}`;
}

// Hour-of-day (float) of an ISO time in a given IANA timezone, for the week grid.
export function hourFloat(iso?: string, timeZone?: string): number {
  if (!iso) return 0;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(iso));
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return (h % 24) + m / 60;
  } catch {
    const dt = new Date(iso);
    return dt.getHours() + dt.getMinutes() / 60;
  }
}

// What calendar day (in the meeting's tz) an ISO falls on, as a yyyy-mm-dd key.
export function dayKeyInTz(iso?: string, timeZone?: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
      new Date(iso),
    );
  } catch {
    return new Date(iso).toISOString().slice(0, 10);
  }
}
export function dayKeyLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
