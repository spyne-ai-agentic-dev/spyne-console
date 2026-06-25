"use client";

import React, { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import type { Meeting } from "@/lib/appointments/types";
import {
  customerName, fmtTime, fmtPhone, fmtDateShort, vehicleFor, vehicleLabel, vin, assigneeName,
} from "@/lib/appointments/format";
import { useTz } from "@/lib/appointments/tz";
import { Td, StatusChip, Chip } from "./ui";

type SortKey = "time" | "customer" | "assignee" | "booked" | "status";
interface Sort {
  key: SortKey;
  dir: "asc" | "desc";
}

function valueFor(m: Meeting, key: SortKey): string | number {
  switch (key) {
    case "time": return new Date(m.meetingStartTime || 0).getTime();
    case "booked": return new Date(m.createdAt || 0).getTime();
    case "customer": return customerName(m).toLowerCase();
    case "assignee": return assigneeName(m).toLowerCase();
    case "status": return (m.status || "").toLowerCase();
  }
}

function SortTh({ label, k, sort, onSort }: { label: string; k: SortKey; sort: Sort; onSort: (k: SortKey) => void }) {
  const active = sort.key === k;
  return (
    <th className="px-4 py-2.5 text-left">
      <button
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${active ? "text-[#111]" : "text-[#6b7280] hover:text-[#111]"}`}
      >
        {label}
        {active ? (
          sort.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />
        ) : (
          <ChevronsUpDown size={11} className="text-[#cbd0d6]" />
        )}
      </button>
    </th>
  );
}

function PlainTh({ label }: { label: string }) {
  return <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">{label}</th>;
}

export default function TableView({
  meetings,
  service,
  onSelect,
}: {
  meetings: Meeting[];
  service: boolean;
  onSelect: (m: Meeting) => void;
}) {
  const [sort, setSort] = useState<Sort>({ key: "time", dir: "asc" });
  const dtz = useTz();

  function onSort(k: SortKey) {
    setSort((s) => (s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" }));
  }

  const rows = useMemo(() => {
    const sorted = [...meetings].sort((a, b) => {
      const av = valueFor(a, sort.key);
      const bv = valueFor(b, sort.key);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [meetings, sort]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col style={{ width: "82px" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "92px" }} />
          <col style={{ width: "104px" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
            <SortTh label="Time" k="time" sort={sort} onSort={onSort} />
            <SortTh label="Customer" k="customer" sort={sort} onSort={onSort} />
            <PlainTh label="Vehicle" />
            <PlainTh label={service ? "Services" : "Type"} />
            <SortTh label={service ? "Advisor" : "Rep"} k="assignee" sort={sort} onSort={onSort} />
            <SortTh label="Booked" k="booked" sort={sort} onSort={onSort} />
            <SortTh label="Status" k="status" sort={sort} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {rows.map((m, i) => {
            const v = vehicleFor(m);
            const phone = m.customerData?.mobileNumber;
            const services = m.servicesRequested ?? [];
            return (
              <tr
                key={m.id || i}
                onClick={() => onSelect(m)}
                className="cursor-pointer border-b border-[#f5f5f5] last:border-0 transition-colors hover:bg-[#faf8ff]"
              >
                <Td>
                  <span className="whitespace-nowrap text-[12px] font-semibold tabular-nums text-[#374151]">
                    {fmtTime(m.meetingStartTime, dtz ?? m.timezone)}
                  </span>
                </Td>
                <Td>
                  <div className="truncate text-[13px] font-bold text-[#111]">{customerName(m)}</div>
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 block text-[11px] tabular-nums text-[#813fed]"
                    >
                      {fmtPhone(phone)}
                    </a>
                  )}
                </Td>
                <Td>
                  {v ? (
                    <>
                      <div className="truncate text-[13px] font-medium text-[#111]">{vehicleLabel(v) || "Vehicle"}</div>
                      {vin(v) && <div className="mt-0.5 font-mono text-[11px] text-[#9ca3af]">···{vin(v).slice(-6)}</div>}
                    </>
                  ) : (
                    <span className="text-[12px] text-[#9ca3af]">—</span>
                  )}
                </Td>
                {service ? (
                  <Td>
                    {services.length > 0 ? (
                      <span className="text-[12px] text-[#374151]">
                        {services[0]}
                        {services.length > 1 && <span className="text-[#9ca3af]"> +{services.length - 1}</span>}
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#9ca3af]">—</span>
                    )}
                  </Td>
                ) : (
                  <Td>{m.intent ? <Chip value={m.intent} /> : <span className="text-[12px] text-[#9ca3af]">—</span>}</Td>
                )}
                <Td>
                  <span className="block truncate text-[12px] text-[#6b7280]">{assigneeName(m)}</span>
                </Td>
                <Td>
                  <span className="whitespace-nowrap text-[12px] tabular-nums text-[#6b7280]">
                    {fmtDateShort(m.createdAt, dtz) || "—"}
                  </span>
                </Td>
                <Td>
                  <StatusChip value={m.status} />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
