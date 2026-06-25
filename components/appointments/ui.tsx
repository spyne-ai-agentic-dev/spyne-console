import React from "react";
import { statusStyle, humanize, accentFor, type ChipStyle } from "@/lib/appointments/status";

// Reporting-vini design kit (ported): Card, Th/Td, EmptyState,
// plus status-agnostic chips. Colors/radii match apps/reporting-vini.

export function Card({
  title,
  sub,
  right,
  children,
  pad = true,
}: {
  title?: string;
  sub?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  pad?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
      {title && (
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <div>
            <p className="text-[14px] font-bold text-[#111]">{title}</p>
            {sub && <p className="text-[11.5px] text-[#6b7280] mt-0.5">{sub}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={pad ? "px-6 py-5" : ""}>{children}</div>
    </section>
  );
}

export function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#6b7280] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top ${align === "right" ? "text-right" : "text-left"} ${className}`}>{children}</td>;
}

export function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#e0e0e0] bg-[#fcfcfd] px-6 py-12 text-center">
      <span className="text-[#9ca3af]">{icon}</span>
      <p className="text-[13.5px] font-bold text-[#111]">{title}</p>
      <p className="max-w-[440px] text-[12px] leading-snug text-[#6b7280]">{body}</p>
    </div>
  );
}

// ── status-agnostic chips ──────────────────────────────────────────────
export function StatusChip({ value, dot = true }: { value?: string | null; dot?: boolean }) {
  const s = statusStyle(value);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />}
      {humanize(value)}
    </span>
  );
}

// Generic categorical chip (source, transport, intent…) — deterministic accent
// so unfamiliar values still look intentional.
export function Chip({ value, style }: { value?: string | null; style?: ChipStyle }) {
  if (!value) return null;
  const s = style ?? accentFor(value);
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {humanize(value)}
    </span>
  );
}