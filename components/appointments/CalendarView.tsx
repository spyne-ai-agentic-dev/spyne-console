"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Meeting } from "@/lib/appointments/types";
import {
  customerName, fmtTime, fmtTimeRange, fmtPhone, fmtSource, fmtTransport, vehicleFor, vehicleLabel, vin, assigneeName,
} from "@/lib/appointments/format";
import { statusStyle, humanize } from "@/lib/appointments/status";
import { monthGrid, weekDays, sameDay, dayKeyInTz, dayKeyLocal, hourFloat } from "@/lib/appointments/dates";
import { useTz } from "@/lib/appointments/tz";
import { StatusChip, Chip } from "./ui";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function groupByDay(meetings: Meeting[], tz?: string): Map<string, Meeting[]> {
  const map = new Map<string, Meeting[]>();
  for (const m of meetings) {
    const k = dayKeyInTz(m.meetingStartTime, tz ?? m.timezone);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(m);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => new Date(a.meetingStartTime || 0).getTime() - new Date(b.meetingStartTime || 0).getTime());
  }
  return map;
}

function fmtHourLabel(h: number): string {
  const period = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${period}`;
}

function groupByHour(list: Meeting[], tz?: string): { hour: number; items: Meeting[] }[] {
  const map = new Map<number, Meeting[]>();
  for (const m of list) {
    const h = Math.floor(hourFloat(m.meetingStartTime, tz ?? m.timezone));
    if (!map.has(h)) map.set(h, []);
    map.get(h)!.push(m);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([hour, items]) => ({ hour, items }));
}

// ── shared chip content (month) ──
// Same status-dot + name language as the Daily table and Weekly grid (no colored
// chip background), so all three views read as one product.
function ApptChipContent({ m, service, lines }: { m: Meeting; service: boolean; lines: 1 | 2 | 3 }) {
  const dtz = useTz();
  const v = vehicleFor(m);
  const sec1 = service ? (m.servicesRequested?.[0] ?? vehicleLabel(v)) : vehicleLabel(v);
  const dot = statusStyle(m.status).dot;
  return (
    <>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: dot }} />
        <span className="shrink-0 text-[10px] font-semibold tabular-nums text-[#6b7280]">
          {fmtTime(m.meetingStartTime, dtz ?? m.timezone)}
        </span>
        <span className="truncate text-[11px] font-semibold leading-tight text-[#111]">{customerName(m)}</span>
      </div>
      {lines >= 2 && sec1 && <div className="truncate pl-3 text-[10px] leading-tight text-[#9ca3af]">{sec1}</div>}
      {lines >= 3 && <div className="truncate pl-3 text-[10px] leading-tight text-[#9ca3af]">{assigneeName(m)}</div>}
    </>
  );
}

// ── hover quick-view ──
// Shared body; Month wraps it in a CSS group-hover popover, Week renders it in a
// portal (the week grid is a scroll container, so an absolute popover would clip).
function QuickViewBody({ m, service }: { m: Meeting; service: boolean }) {
  const dtz = useTz();
  const v = vehicleFor(m);
  const phone = m.customerData?.mobileNumber;
  const services = m.servicesRequested ?? [];
  return (
    <>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-bold text-[#111]">{customerName(m)}</p>
        <StatusChip value={m.status} dot={false} />
      </div>
      <p className="text-[11.5px] text-[#6b7280]">{fmtTimeRange(m, dtz ?? m.timezone)}</p>
      {v && (
        <p className="mt-1.5 text-[12px] font-medium text-[#111]">
          {vehicleLabel(v)} {vin(v) && <span className="font-mono text-[10px] text-[#9ca3af]">···{vin(v).slice(-6)}</span>}
        </p>
      )}
      {service && services.length > 0 && <p className="mt-1 text-[11.5px] text-[#6b7280]">{services.join(", ")}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Chip value={service ? "service" : m.intent || "sales"} />
        {m.transportationOption && (
          <span className="inline-flex items-center rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-semibold text-[#3730a3]">
            {fmtTransport(m.transportationOption)}
          </span>
        )}
      </div>
      <div className="mt-2 border-t border-[#f0f0f0] pt-2 text-[11.5px] text-[#6b7280]">
        <div>{assigneeName(m)}{m.source ? ` · ${fmtSource(m.source)}` : ""}</div>
        {phone && <div className="tabular-nums text-[#813fed]">{fmtPhone(phone)}</div>}
      </div>
    </>
  );
}

type HoverFn = (m: Meeting, el: HTMLElement) => void;

const HOVER_W = 240;

// Portal-rendered quick-view that measures itself and clamps within the viewport, so it
// never clips at the bottom/right edges (the month grid is overflow-hidden and the week
// grid is a scroll container). Shared by both Month and Week.
function HoverCard({ m, rect, service }: { m: Meeting; rect: DOMRect; service: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number }>(() => ({ left: rect.right + 8, top: rect.top }));

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const margin = 8;
    // Horizontal: prefer right of the anchor, flip left if it would overflow.
    let left = rect.right + margin;
    if (left + width > window.innerWidth - margin) left = rect.left - margin - width;
    left = Math.max(margin, Math.min(left, window.innerWidth - margin - width));
    // Vertical: align to the anchor top, shift up if it would overflow the bottom.
    let top = rect.top;
    if (top + height > window.innerHeight - margin) top = window.innerHeight - margin - height;
    top = Math.max(margin, top);
    setPos({ left, top });
  }, [rect]);

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", left: pos.left, top: pos.top, width: HOVER_W }}
      className="animate-pop-in pointer-events-none z-[70] rounded-xl border border-[#e5e7eb] bg-white p-3 text-left shadow-lg"
    >
      <QuickViewBody m={m} service={service} />
    </div>,
    document.body,
  );
}

// Shared hover state: captures the anchor's rect so HoverCard can position relative to it.
function useHoverCard() {
  const [hover, setHover] = useState<{ m: Meeting; rect: DOMRect } | null>(null);
  const show: HoverFn = (m, el) => setHover({ m, rect: el.getBoundingClientRect() });
  const hide = () => setHover(null);
  return { hover, show, hide };
}

// ── month ──
function MonthChip({ m, service, onSelect, onHover, onHoverEnd }: {
  m: Meeting; service: boolean; onSelect: (m: Meeting) => void; onHover: HoverFn; onHoverEnd: () => void;
}) {
  return (
    <button
      onClick={() => onSelect(m)}
      onMouseEnter={(e) => onHover(m, e.currentTarget)}
      onMouseLeave={onHoverEnd}
      className="block w-full overflow-hidden rounded-md px-1.5 py-1 text-left hover:bg-[#faf8ff]"
    >
      <ApptChipContent m={m} service={service} lines={2} />
    </button>
  );
}

export function MonthView({
  meetings, service, anchor, today, onSelect, onOpenDay,
}: {
  meetings: Meeting[]; service: boolean; anchor: Date; today: Date;
  onSelect: (m: Meeting) => void; onOpenDay: (d: Date) => void;
}) {
  const dtz = useTz();
  const grid = monthGrid(anchor);
  const byDay = groupByDay(meetings, dtz);
  const month = anchor.getMonth();
  const { hover, show, hide } = useHoverCard();
  return (
    <>
    <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
      <div className="grid grid-cols-7 border-b border-[#e5e7eb] bg-[#fafafa]">
        {DOW.map((d) => (
          <div key={d} className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.flat().map((cell, i) => {
          const list = byDay.get(dayKeyLocal(cell)) ?? [];
          const isToday = sameDay(cell, today);
          const dim = cell.getMonth() !== month;
          const shown = list.slice(0, 3);
          const extra = list.length - shown.length;
          return (
            <div key={i} className={`min-h-[104px] border-b border-r border-[#f0f0f0] p-1 ${i % 7 === 6 ? "border-r-0" : ""} ${dim ? "bg-[#fcfcfd]" : "bg-white"}`}>
              <div className="mb-1 flex items-center justify-between px-1">
                <button
                  onClick={() => onOpenDay(cell)}
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${isToday ? "bg-[#813fed] text-white" : dim ? "text-[#cbd0d6]" : "text-[#374151] hover:bg-[#f3f4f6]"}`}
                >
                  {cell.getDate()}
                </button>
              </div>
              <div className="flex flex-col gap-0.5">
                {shown.map((m, j) => (
                  <MonthChip key={m.id || j} m={m} service={service} onSelect={onSelect} onHover={show} onHoverEnd={hide} />
                ))}
                {extra > 0 && (
                  <button onClick={() => onOpenDay(cell)} className="px-1.5 text-left text-[10px] font-semibold text-[#813fed] hover:underline">
                    +{extra} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    {hover && typeof document !== "undefined" && <HoverCard m={hover.m} rect={hover.rect} service={service} />}
    </>
  );
}

// ── week (agenda per day, grouped by hour inline) ──
// Card carries no time (the hour header conveys it): status dot · customer · type.
// "type" is the service line for service appts, the intent for sales.
function apptType(m: Meeting, service: boolean): string {
  if (service) return m.servicesRequested?.[0] ?? "";
  return m.intent ? humanize(m.intent) : "";
}

function AgendaRow({ m, service, onSelect, onHover, onHoverEnd }: {
  m: Meeting; service: boolean; onSelect: (m: Meeting) => void; onHover: HoverFn; onHoverEnd: () => void;
}) {
  const dot = statusStyle(m.status).dot;
  const type = apptType(m, service);
  return (
    <button
      onClick={() => onSelect(m)}
      onMouseEnter={(e) => onHover(m, e.currentTarget)}
      onMouseLeave={onHoverEnd}
      className="flex w-full items-start gap-1.5 px-2.5 py-1.5 text-left hover:bg-[#faf8ff]"
    >
      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: dot }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-semibold leading-snug text-[#111]">{customerName(m)}</span>
        {type && <span className="block truncate text-[10px] font-semibold uppercase tracking-wide leading-snug text-[#9ca3af]">{type}</span>}
      </span>
    </button>
  );
}

// One day's cell within a shared hour row. The week is a single 7-column grid
// where every hour is a grid row, so each hour band (and the next hour below it)
// lines up across all days regardless of how many appts a given cell holds.
const HOUR_CAP = 3;
function HourCell({ hour, items, service, leftBorder, onSelect, onHover, onHoverEnd }: {
  hour: number; items: Meeting[]; service: boolean; leftBorder: boolean;
  onSelect: (m: Meeting) => void; onHover: HoverFn; onHoverEnd: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, HOUR_CAP);
  const extra = items.length - HOUR_CAP;
  const empty = items.length === 0;
  return (
    <div className={`flex flex-col ${leftBorder ? "border-l border-[#f0f0f0]" : ""}`}>
      <div className="flex items-center justify-between border-t border-[#ededf2] bg-[#f5f3fb] px-2.5 py-1">
        <span className={`text-[11px] font-bold tabular-nums tracking-wide ${empty ? "text-[#cbbfe6]" : "text-[#4c2389]"}`}>{fmtHourLabel(hour)}</span>
        {!empty && <span className="text-[9.5px] font-bold tabular-nums text-[#9b87c9]">{items.length}</span>}
      </div>
      {shown.map((m, j) => (
        <AgendaRow key={m.id || j} m={m} service={service} onSelect={onSelect} onHover={onHover} onHoverEnd={onHoverEnd} />
      ))}
      {extra > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="px-2.5 py-1.5 text-left text-[10.5px] font-bold text-[#813fed] hover:underline"
        >
          {expanded ? "Show less" : `+${extra} more`}
        </button>
      )}
    </div>
  );
}

export function AgendaWeek({
  meetings, service, anchor, today, onSelect, onOpenDay,
}: {
  meetings: Meeting[]; service: boolean; anchor: Date; today: Date;
  onSelect: (m: Meeting) => void; onOpenDay: (d: Date) => void;
}) {
  const dtz = useTz();
  const days = weekDays(anchor);
  const byDay = groupByDay(meetings, dtz);
  const { hover, show, hide } = useHoverCard();

  // Per-day hour map + the union of hours present across the week. Every column
  // renders the same hour rows so 9 AM/10 AM/… align across days.
  const cols = days.map((d) => {
    const list = byDay.get(dayKeyLocal(d)) ?? [];
    const map = new Map<number, Meeting[]>();
    for (const g of groupByHour(list, dtz)) map.set(g.hour, g.items);
    return { d, total: list.length, map };
  });
  const hours = [...new Set(cols.flatMap((c) => [...c.map.keys()]))].sort((a, b) => a - b);

  return (
    <>
      <div className="overflow-auto rounded-xl border border-[#e5e7eb] bg-white" style={{ maxHeight: "72vh" }}>
        <div className="grid min-w-[840px]" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
          {/* day headers */}
          {cols.map(({ d, total }, i) => {
            const isToday = sameDay(d, today);
            return (
              <button
                key={`h${i}`}
                onClick={() => onOpenDay(d)}
                className={`sticky top-0 z-10 flex h-[38px] items-center justify-between gap-1 border-b border-[#f0f0f0] bg-[#fafafa] px-2.5 hover:bg-[#f3f4f6] ${i ? "border-l border-[#f0f0f0]" : ""}`}
              >
                <span className="flex items-baseline gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">{DOW[i]}</span>
                  <span className={`text-[13px] font-bold ${isToday ? "text-[#813fed]" : "text-[#374151]"}`}>{d.getDate()}</span>
                </span>
                {total > 0 && (
                  <span className="rounded-full bg-[#813fed] px-2 py-0.5 text-[10px] font-bold tabular-nums text-white">{total}</span>
                )}
              </button>
            );
          })}
          {/* hour rows — one grid row per hour, 7 cells each, auto-aligned */}
          {hours.map((h) =>
            cols.map(({ map }, i) => (
              <HourCell
                key={`${h}-${i}`}
                hour={h}
                items={map.get(h) ?? []}
                service={service}
                leftBorder={i > 0}
                onSelect={onSelect}
                onHover={show}
                onHoverEnd={hide}
              />
            )),
          )}
        </div>
      </div>
      {hover && typeof document !== "undefined" && <HoverCard m={hover.m} rect={hover.rect} service={service} />}
    </>
  );
}
