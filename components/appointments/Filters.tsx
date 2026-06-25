"use client";

import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type BookedRange = "any" | "today" | "yesterday" | "7d" | "30d" | "custom";

const triggerCls =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[12px] font-semibold text-[#6b7280] hover:text-[#111]";

// Shared dropdown shell: click-away overlay + animated popover container. Both the
// multi-select filters and the single-select Booked filter render through this so they
// look and behave identically.
function FilterPopover({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="animate-pop-in absolute left-0 z-40 mt-1 min-w-[220px] max-w-[min(320px,90vw)] rounded-xl border border-[#e5e7eb] bg-white p-1 shadow-lg">
        {children}
      </div>
    </>
  );
}

const optionRowCls =
  "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-[#374151] hover:bg-[#f9fafb]";

// Multi-select dropdown. Options are passed in (derived from loaded data), so
// unknown values still appear and nothing is hard-coded.
export function MultiFilter({
  label,
  options,
  selected,
  onChange,
  format = (v) => v,
  searchable = false,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  format?: (v: string) => string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const count = selected.size;

  function toggle(o: string) {
    const next = new Set(selected);
    if (next.has(o)) next.delete(o);
    else next.add(o);
    onChange(next);
  }

  const needle = q.trim().toLowerCase();
  const shown =
    searchable && needle
      ? options.filter((o) => format(o).toLowerCase().includes(needle) || o.toLowerCase().includes(needle))
      : options;

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className={`${triggerCls} ${count > 0 ? "border-[#d8caff] text-[#111]" : ""}`}>
        {label}
        {count > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#813fed] px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
        <ChevronDown size={13} />
      </button>
      <FilterPopover open={open} onClose={() => setOpen(false)}>
        {searchable && (
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="mb-1 w-full rounded-md border border-[#e5e7eb] px-2 py-1.5 text-[12px] text-[#111] outline-none placeholder:text-[#9ca3af] focus:border-[#d8caff]"
            autoFocus
          />
        )}
        <div className="max-h-[240px] overflow-auto">
          {shown.length === 0 ? (
            <p className="px-2 py-2 text-[12px] text-[#9ca3af]">{options.length === 0 ? "No options" : "No matches"}</p>
          ) : (
            shown.map((o) => (
              <label key={o} className={optionRowCls}>
                <input
                  type="checkbox"
                  checked={selected.has(o)}
                  onChange={() => toggle(o)}
                  className="h-3.5 w-3.5 flex-shrink-0 accent-[#813fed]"
                />
                <span className="min-w-0 truncate" title={format(o)}>{format(o)}</span>
              </label>
            ))
          )}
        </div>
      </FilterPopover>
    </div>
  );
}

const BOOKED_OPTIONS: { value: BookedRange; label: string }[] = [
  { value: "any", label: "Booked: Any time" },
  { value: "today", label: "Booked: Today" },
  { value: "yesterday", label: "Booked: Yesterday" },
  { value: "7d", label: "Booked: Last 7 days" },
  { value: "30d", label: "Booked: Last 30 days" },
  { value: "custom", label: "Booked: Custom…" },
];

export function BookedDateFilter({
  value,
  from,
  to,
  onValue,
  onFrom,
  onTo,
}: {
  value: BookedRange;
  from: string;
  to: string;
  onValue: (v: BookedRange) => void;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dateInput =
    "h-8 rounded-lg border border-[#e5e7eb] bg-white px-2 text-[12px] text-[#111] outline-none focus:border-[#d8caff]";
  const current = BOOKED_OPTIONS.find((o) => o.value === value) ?? BOOKED_OPTIONS[0];

  function select(v: BookedRange) {
    onValue(v);
    setOpen(false);
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="relative">
        <button onClick={() => setOpen((o) => !o)} className={`${triggerCls} ${value !== "any" ? "border-[#d8caff] text-[#111]" : ""}`}>
          {current.label}
          <ChevronDown size={13} />
        </button>
        <FilterPopover open={open} onClose={() => setOpen(false)}>
          {BOOKED_OPTIONS.map((o) => {
            const active = o.value === value;
            return (
              <button key={o.value} onClick={() => select(o.value)} className={`${optionRowCls} ${active ? "text-[#111]" : ""}`}>
                <Check size={13} className={`flex-shrink-0 ${active ? "text-[#813fed]" : "invisible"}`} />
                <span className="min-w-0 truncate">{o.label}</span>
              </button>
            );
          })}
        </FilterPopover>
      </div>
      {value === "custom" && (
        <>
          <input type="date" value={from} max={to || undefined} onChange={(e) => onFrom(e.target.value)} className={dateInput} aria-label="Booked from" />
          <span className="text-[11px] text-[#9ca3af]">to</span>
          <input type="date" value={to} min={from || undefined} onChange={(e) => onTo(e.target.value)} className={dateInput} aria-label="Booked to" />
        </>
      )}
    </div>
  );
}
