"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, CalendarClock, CalendarDays, CalendarRange, Search, Loader2, AlertCircle,
} from "lucide-react";
import type { Meeting, ServiceType } from "@/lib/appointments/types";
import { fetchMeetings, fetchTeamTimezone } from "@/lib/appointments/api";
import { readConfig, scrubUrl, type IframeConfig } from "@/lib/appointments/config";
import { TzContext } from "@/lib/appointments/tz";
import {
  startOfWeek, endOfWeek, startOfDay, endOfDay, weekDays, monthGrid, addDays,
  fmtWeekRange, fmtMonthYear, dayKeyInTz, dayKeyLocal, sameDay,
} from "@/lib/appointments/dates";
import { customerName, vehicleLabel, vehicleFor, assigneeName, fmtSource } from "@/lib/appointments/format";
import { humanize } from "@/lib/appointments/status";
import { Card, EmptyState } from "./ui";
import TableView from "./TableView";
import { MonthView, AgendaWeek } from "./CalendarView";
import DetailDrawer from "./DetailDrawer";
import { MultiFilter, BookedDateFilter, type BookedRange } from "./Filters";

type View = "daily" | "weekly" | "monthly";

const VIEWS: { id: View; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

const TABS: { id: ServiceType; label: string }[] = [
  { id: "sales", label: "Sales" },
  { id: "service", label: "Service" },
];

function LoadingBlock() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-[#9ca3af]">
      <Loader2 size={22} className="animate-spin" />
      <p className="text-[12.5px]">Loading appointments…</p>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#fecaca] bg-[#fef2f2] px-6 py-12 text-center">
      <AlertCircle size={24} className="text-[#dc2626]" />
      <p className="text-[13.5px] font-bold text-[#111]">Couldn&apos;t load appointments</p>
      <p className="max-w-[440px] text-[12px] leading-snug text-[#6b7280]">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 rounded-lg bg-[#813fed] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#6d28d9]"
      >
        Retry
      </button>
    </div>
  );
}

interface AppointmentsViewProps {
  dept?: ServiceType;
}

export default function AppointmentsView({ dept }: AppointmentsViewProps) {
  // The real current day (client clock), used for the Today button, today
  // highlight, and the relative "Booked" filters.
  const [today] = useState(() => startOfDay(new Date()));
  const [serviceType, setServiceType] = useState<ServiceType>(dept ?? "sales");
  const [view, setView] = useState<View>("daily");
  const [anchor, setAnchor] = useState<Date>(today);
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [query, setQuery] = useState("");

  // filters
  const [fStatus, setFStatus] = useState<Set<string>>(new Set());
  const [fAssignee, setFAssignee] = useState<Set<string>>(new Set());
  const [fSource, setFSource] = useState<Set<string>>(new Set());
  const [fType, setFType] = useState<Set<string>>(new Set());
  const [fService, setFService] = useState<Set<string>>(new Set()); // service-line filter (Service tab only)
  const [fBooked, setFBooked] = useState<BookedRange>("any");
  const [fBookedFrom, setFBookedFrom] = useState("");
  const [fBookedTo, setFBookedTo] = useState("");
  function clearFilters() {
    setFStatus(new Set());
    setFAssignee(new Set());
    setFSource(new Set());
    setFType(new Set());
    setFService(new Set());
    setFBooked("any");
    setFBookedFrom("");
    setFBookedTo("");
  }
  const activeFilterCount =
    fStatus.size + fAssignee.size + fSource.size + fType.size + fService.size + (fBooked !== "any" ? 1 : 0);

  // ── async data ──
  const [periodMeetings, setPeriodMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const pickedDefaultTab = useRef(false);

  // Read parent-injected config (env, ids, token) from the iframe URL once on
  // mount (client-only, SSR-safe), then scrub the token out of the address bar.
  const [boot, setBoot] = useState<{ config: IframeConfig | null; ready: boolean }>({
    config: null,
    ready: false,
  });
  useEffect(() => {
    const c = readConfig();
    scrubUrl();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount read of URL config
    setBoot({ config: c, ready: true });
  }, []);
  const config = boot.config;
  const configReady = boot.ready;

  // Dealer/team timezone — all timestamps render in this zone. Resolved once.
  const [dealerTz, setDealerTz] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!configReady) return;
    let cancelled = false;
    fetchTeamTimezone(config)
      .then((tz) => {
        if (!cancelled) setDealerTz(tz);
      })
      .catch(() => {
        /* keep undefined → fall back to each meeting's own timezone */
      });
    return () => {
      cancelled = true;
    };
  }, [config, configReady]);

  const service = serviceType === "service";
  const monthMode = view === "monthly";

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (monthMode) {
      const g = monthGrid(anchor);
      return { rangeStart: startOfDay(g[0][0]), rangeEnd: endOfDay(g[5][6]) };
    }
    return { rangeStart: startOfWeek(anchor), rangeEnd: endOfWeek(anchor) };
  }, [anchor, monthMode]);

  useEffect(() => {
    if (!configReady) return;
    let cancelled = false;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show loading while the range/tab fetches
    setLoading(true);
    fetchMeetings(config, { serviceType, startDate: rangeStart, endDate: rangeEnd }, { signal: controller.signal })
      .then((r) => {
        if (cancelled) return;
        // One-time default: 0 sales appts in the current week → default to Service.
        if (!pickedDefaultTab.current) {
          pickedDefaultTab.current = true;
          if (serviceType === "sales" && r.meetings.length === 0) {
            setServiceType("service");
            return;
          }
        }
        setPeriodMeetings(r.meetings);
        setError(null);
      })
      .catch((e: unknown) => {
        // Ignore aborts (range/tab changed before this request resolved).
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) return;
        setError(e instanceof Error ? e.message : "Request failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [config, configReady, serviceType, rangeStart, rangeEnd, nonce]);

  // filter options derived from the loaded range (status-agnostic; unknown values appear)
  const filterOptions = useMemo(() => {
    const status = new Set<string>();
    const assignee = new Set<string>();
    const sourceSet = new Set<string>();
    const type = new Set<string>();
    const svc = new Set<string>();
    for (const m of periodMeetings) {
      if (m.status) status.add(m.status);
      assignee.add(assigneeName(m));
      if (m.source) sourceSet.add(m.source);
      if (m.intent) type.add(m.intent);
      for (const s of m.servicesRequested ?? []) if (s) svc.add(s);
    }
    const sorted = (s: Set<string>) => [...s].sort();
    return { status: sorted(status), assignee: sorted(assignee), source: sorted(sourceSet), type: sorted(type), service: sorted(svc) };
  }, [periodMeetings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = today.getTime();
    return periodMeetings.filter((m) => {
      if (q) {
        const veh = vehicleLabel(vehicleFor(m)).toLowerCase();
        if (!customerName(m).toLowerCase().includes(q) && !veh.includes(q)) return false;
      }
      if (fStatus.size && !fStatus.has(m.status || "")) return false;
      if (fAssignee.size && !fAssignee.has(assigneeName(m))) return false;
      if (fSource.size && !fSource.has(m.source || "")) return false;
      if (fType.size && !fType.has(m.intent || "")) return false;
      if (fService.size && !(m.servicesRequested ?? []).some((s) => fService.has(s))) return false;
      if (fBooked !== "any" && m.createdAt) {
        const c = new Date(m.createdAt).getTime();
        const day = 86400000;
        if (fBooked === "today" && now - c > day) return false;
        if (fBooked === "yesterday") {
          const ys = addDays(today, -1).getTime();
          const ye = endOfDay(addDays(today, -1)).getTime();
          if (c < ys || c > ye) return false;
        }
        if (fBooked === "7d" && now - c > 7 * day) return false;
        if (fBooked === "30d" && now - c > 30 * day) return false;
        if (fBooked === "custom") {
          if (fBookedFrom && c < new Date(`${fBookedFrom}T00:00:00`).getTime()) return false;
          if (fBookedTo && c > new Date(`${fBookedTo}T23:59:59.999`).getTime()) return false;
        }
      }
      return true;
    });
  }, [periodMeetings, query, fStatus, fAssignee, fSource, fType, fService, fBooked, fBookedFrom, fBookedTo, today]);

  const days = weekDays(anchor);
  const countsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of filtered) {
      const k = dayKeyInTz(m.meetingStartTime, dealerTz ?? m.timezone);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, [filtered, dealerTz]);

  const dayMeetings = useMemo(
    () => filtered.filter((m) => dayKeyInTz(m.meetingStartTime, dealerTz ?? m.timezone) === dayKeyLocal(anchor)),
    [filtered, anchor, dealerTz],
  );

  // ── navigation ──
  function step(delta: number) {
    if (view === "monthly") {
      setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + delta, 1));
    } else if (view === "daily") {
      setAnchor((a) => addDays(a, delta));
    } else {
      setAnchor((a) => addDays(a, delta * 7));
    }
    setSelected(null);
  }
  function goToday() {
    setAnchor(today);
    setSelected(null);
  }
  function openDay(d: Date) {
    setView("daily");
    setAnchor(d);
    setSelected(null);
  }

  const periodLabel =
    view === "monthly"
      ? fmtMonthYear(anchor)
      : view === "daily"
        ? anchor.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
        : fmtWeekRange(anchor);
  // Count must match the period the label describes. Daily view fetches the whole
  // week (for the day strip), so use the day's count, not the full range's.
  const totalCount = view === "daily" ? dayMeetings.length : filtered.length;

  const seg = "px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all inline-flex items-center gap-1.5";
  const navBtn =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] hover:text-[#111] hover:bg-[#f9fafb] transition-colors";

  return (
    <TzContext.Provider value={dealerTz}>
    <div className="mx-auto max-w-[1400px] px-6 py-6">

      {/* toolbar — search + view (left), period + nav (right) */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-2.5">
            <Search size={13} className="text-[#9ca3af]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or vehicle…"
              className="w-44 bg-transparent text-[12px] text-[#111] outline-none placeholder:text-[#9ca3af]"
            />
          </div>
          <div className="inline-flex items-center gap-1 rounded-lg bg-[#f3f4f6] p-1">
            {VIEWS.map((vw) => (
              <button
                key={vw.id}
                onClick={() => {
                  setView(vw.id);
                  setSelected(null);
                }}
                className={`${seg} ${view === vw.id ? "bg-white text-[#111] shadow-sm" : "text-[#6b7280] hover:text-[#111]"}`}
              >
                {vw.id === "daily" ? <CalendarClock size={13} /> : vw.id === "weekly" ? <CalendarRange size={13} /> : <CalendarDays size={13} />}
                {vw.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#6b7280]">
            <span className="font-bold text-[#111]">{periodLabel}</span> · {totalCount} appt{totalCount !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => step(-1)} className={navBtn}>
              <ChevronLeft size={15} />
            </button>
            <button onClick={goToday} className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[12px] font-semibold text-[#6b7280] hover:text-[#111]">
              Today
            </button>
            <button onClick={() => step(1)} className={navBtn}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">Filters</span>
        <MultiFilter label="Status" options={filterOptions.status} selected={fStatus} onChange={setFStatus} format={humanize} />
        <MultiFilter label={service ? "Advisor" : "Rep"} options={filterOptions.assignee} selected={fAssignee} onChange={setFAssignee} />
        <MultiFilter label="Source" options={filterOptions.source} selected={fSource} onChange={setFSource} format={fmtSource} />
        <MultiFilter label="Type" options={filterOptions.type} selected={fType} onChange={setFType} format={humanize} />
        {service && (
          <MultiFilter label="Services Booked" options={filterOptions.service} selected={fService} onChange={setFService} format={humanize} searchable />
        )}
        <BookedDateFilter value={fBooked} from={fBookedFrom} to={fBookedTo} onValue={setFBooked} onFrom={setFBookedFrom} onTo={setFBookedTo} />
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-[12px] font-semibold text-[#813fed] hover:underline">
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* body */}
      {view === "daily" ? (
        <Card pad={false}>
          {/* week strip — day picker */}
          <div className="grid grid-cols-7 gap-1 border-b border-[#f0f0f0] p-3">
            {days.map((d) => {
              const count = countsByDay.get(dayKeyLocal(d)) ?? 0;
              const isSel = sameDay(d, anchor);
              const isToday = sameDay(d, today);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => {
                    setAnchor(d);
                    setSelected(null);
                  }}
                  className={`flex flex-col items-center gap-0.5 rounded-xl py-2.5 transition-colors ${isSel ? "bg-[#f3eaff]" : isToday ? "ring-1 ring-inset ring-[#e0d8f5] hover:bg-[#f9fafb]" : "hover:bg-[#f9fafb]"}`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSel ? "text-[#813fed]" : "text-[#9ca3af]"}`}>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className={`text-[18px] font-bold leading-tight ${isSel ? "text-[#813fed]" : isToday ? "text-[#111]" : "text-[#374151]"}`}>
                    {d.getDate()}
                  </span>
                  {count > 0 ? (
                    <span className={`mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${isSel ? "bg-[#813fed] text-white" : "bg-[#eaecef] text-[#6b7280]"}`}>
                      {count}
                    </span>
                  ) : (
                    <span className="mt-0.5 text-[10px] leading-4 text-[#cbd0d6]">—</span>
                  )}
                </button>
              );
            })}
          </div>
          {loading ? (
            <LoadingBlock />
          ) : error ? (
            <div className="p-4">
              <ErrorBlock message={error} onRetry={() => setNonce((n) => n + 1)} />
            </div>
          ) : dayMeetings.length > 0 ? (
            <TableView meetings={dayMeetings} service={service} onSelect={setSelected} />
          ) : (
            <div className="p-4">
              <EmptyState icon={<CalendarDays size={26} />} title="No appointments this day" body="Pick another day above, or change the week." />
            </div>
          )}
        </Card>
      ) : loading ? (
        <Card pad={false}>
          <LoadingBlock />
        </Card>
      ) : error ? (
        <ErrorBlock message={error} onRetry={() => setNonce((n) => n + 1)} />
      ) : totalCount > 0 ? (
        view === "monthly" ? (
          <MonthView meetings={filtered} service={service} anchor={anchor} today={today} onSelect={setSelected} onOpenDay={openDay} />
        ) : (
          <AgendaWeek meetings={filtered} service={service} anchor={anchor} today={today} onSelect={setSelected} onOpenDay={openDay} />
        )
      ) : (
        <EmptyState icon={<CalendarDays size={26} />} title="No appointments in this range" body="Try a different period, or switch tabs." />
      )}

      <DetailDrawer meeting={selected} config={config} onClose={() => setSelected(null)} />
    </div>
    </TzContext.Provider>
  );
}
