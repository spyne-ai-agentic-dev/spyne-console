"use client";

/* ──────────────────────────────────────────────────────────────────────────
 * Reports — Sales / Service reporting, ported from reporting-vini with a
 * fully static mock-data layer (no backend). One component renders both the
 * department Overview and the per-agent Reports detail, scoped to the two
 * agents that department runs (inbound + outbound).
 * ────────────────────────────────────────────────────────────────────────── */

import "./reports.css";
import { useMemo, useState } from "react";
import {
  AGENTS,
  AgentData,
  Bucket,
  BUCKET_LABELS,
  BUCKET_FACTOR,
  fmtInt,
  fmtMoney,
  fmtMoneyFull,
  fleetTotals,
  fleetFunnel,
  FLEET_DELTAS,
  TOP_CAMPAIGNS,
  DATA_HEALTH,
  COMPLIANCE,
  Card,
  SectionLabel,
  DateFilter,
  StepFunnel,
  SplitBar,
  TrendBars,
  Sparkline,
  InlineBar,
  DeltaPill,
  QueryBars,
  DayTrend,
  Sankey,
  Th,
  Td,
  RAG_STYLE,
  BenchmarkBox,
  CompareTable,
} from "./kit";

const AGENT_COLOR: Record<string, string> = {
  sales_ib: "#6366f1",
  sales_ob: "#813fed",
  service_ib: "#10b981",
  service_ob: "#f59e0b",
};
const OUTCOME_COLORS = ["#6366f1", "#813fed", "#10b981", "#f59e0b", "#0ea5e9", "#94a3b8", "#ef4444", "#14b8a6"];
const APPT_COST = 150; // $ per booked appointment — used to turn appointments into a dollar value

export type ReportDept = "Sales" | "Service";
export type ReportView = "overview" | "reports";

export default function Reports({
  dept,
  view,
  initialAgent,
  onOpenAgent,
}: {
  dept: ReportDept;
  view: ReportView;
  initialAgent?: string;
  onOpenAgent?: (agentId: string) => void;
}) {
  const [bucket, setBucket] = useState<Bucket>("last30");
  const [custom, setCustom] = useState<{ start: string; end: string } | null>(null);

  // mock numbers in data.ts are per-day; scale them by the selected window (custom ≈ 30d)
  const factor = custom ? 27.5 : BUCKET_FACTOR[bucket];
  const periodLabel = custom ? `${custom.start} – ${custom.end}` : BUCKET_LABELS[bucket];

  const agents = useMemo(() => AGENTS.filter((a) => a.dept === dept), [dept]);

  return (
    <div className="reports-scope flex flex-col bg-[#fafafa]">
      {/* header */}
      <div className="sticky top-0 z-20 border-b border-[#f0f0f0] bg-white px-8 py-4">
        <div className="mx-auto flex max-w-[1320px] items-end justify-between gap-4">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6366f1]">Reports</span>
            <h1 className="text-[20px] font-bold tracking-[-0.2px] text-[#111]">
              {dept} · {view === "overview" ? "Overview" : "Agent performance"}
            </h1>
            <p className="mt-0.5 text-[12.5px] text-[#6b7280]">
              {view === "overview"
                ? `Your control-tower report — every ${dept.toLowerCase()} agent, call and appointment in one place.`
                : `ROI, pipeline and quality by agent — ${dept} inbound & outbound.`}
            </p>
          </div>
          <DateFilter
            bucket={bucket}
            custom={custom}
            onPreset={(b) => { setBucket(b); setCustom(null); }}
            onCustom={(r) => setCustom(r)}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1320px] flex-1 px-8 pt-7 pb-24">
        {view === "overview" ? (
          <OverviewView dept={dept} agents={agents} factor={factor} periodLabel={periodLabel} onOpenAgent={onOpenAgent} />
        ) : (
          <AgentDetailView agents={agents} factor={factor} periodLabel={periodLabel} initialAgent={initialAgent} />
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════ OVERVIEW ════════════════════════════ */
function OverviewView({
  dept,
  agents,
  factor,
  periodLabel,
  onOpenAgent,
}: {
  dept: ReportDept;
  agents: AgentData[];
  factor: number;
  periodLabel: string;
  onOpenAgent?: (agentId: string) => void;
}) {
  const scale = (n: number) => Math.round(n * factor);
  const ft = useMemo(() => fleetTotals(agents), [agents]);
  const funnel = useMemo(() => fleetFunnel(agents).map((s) => ({ label: s.label, value: scale(s.value) })), [agents, factor]);

  const appts = scale(ft.appointments);
  const valueCreated = appts * APPT_COST;

  const ranked = useMemo(() => [...agents].sort((a, b) => b.metrics.appointments - a.metrics.appointments), [agents]);
  const maxAppts = Math.max(1, ...agents.map((a) => a.metrics.appointments));

  // outbound campaigns this department runs (TOP_CAMPAIGNS is tagged "Sales OB" / "Service OB")
  const campaigns = TOP_CAMPAIGNS.filter((c) => c.agent.startsWith(dept));
  const maxConv = Math.max(1, ...campaigns.map((c) => c.conversions));
  const connectRate = Math.round(ft.connectRate * 100);

  return (
    <div className="flex flex-col gap-9">
      {/* 1 · value headline */}
      <section className="overflow-hidden rounded-[28px] border border-[#ddd0fb] bg-gradient-to-br from-[#1c1033] via-[#2a1656] to-[#3a1d6e] text-white shadow-[0_20px_60px_-24px_rgba(58,29,110,0.7)]">
        <div className="flex flex-col gap-7 px-9 pt-8 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#c4b5fd]">Value created · {periodLabel}</p>
            <div className="mt-3 flex items-end gap-4">
              <span className="text-[64px] font-black leading-[0.9] tracking-[-0.03em] text-white">{fmtMoneyFull(valueCreated)}</span>
            </div>
            <p className="mt-3 max-w-[560px] text-[14px] leading-snug text-[#d6cdf0]">
              From <b className="text-white">{fmtInt(appts)} appointments</b> booked across your live {dept.toLowerCase()} agents, at{" "}
              <b className="text-white">{fmtMoneyFull(APPT_COST)}</b> per appointment.
            </p>
          </div>
          <DeltaBadge label="appointments vs prior" delta={FLEET_DELTAS.appointments} />
        </div>
        <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 bg-black/15 sm:grid-cols-4">
          <HeroTile label="Appointments" value={fmtInt(appts)} delta={FLEET_DELTAS.appointments} />
          <HeroTile label="Conversations" value={fmtInt(scale(ft.conversations))} delta={FLEET_DELTAS.calls} />
          <HeroTile label="Calls handled" value={fmtInt(scale(ft.calls))} delta={FLEET_DELTAS.calls} />
          <HeroTile label="After-hours captured" value={fmtInt(scale(ft.afterHours))} />
        </div>
      </section>

      {/* 2 · who drove it */}
      <div className="flex flex-col gap-3.5">
        <SectionLabel hint="Click an agent for the full report">Who drove it</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {ranked.map((a, i) => (
            <button
              key={a.id}
              onClick={() => onOpenAgent?.(a.id)}
              className="group flex items-center gap-4 rounded-2xl border border-[#e9e9ee] bg-white px-5 py-4 text-left shadow-sm transition-all hover:border-[#c4b5fd] hover:shadow-md"
            >
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#f3eaff] text-[12px] font-extrabold text-[#813fed]">{i + 1}</span>
              <span className="text-[22px] leading-none">{a.icon}</span>
              <div className="w-[150px] flex-none">
                <p className="text-[13.5px] font-bold text-[#111]">{a.name}</p>
                <p className="text-[10.5px] font-medium uppercase tracking-wide text-[#9ca3af]">{a.dept} · {a.dir}</p>
              </div>
              <div className="hidden flex-1 items-center justify-around gap-4 md:flex">
                <MicroStat label="Leads" value={fmtInt(scale(a.report.leadsAttempted))} />
                <MicroStat label="Connect" value={`${a.metrics.connectRate}%`} />
                <MicroStat label="Appts" value={fmtInt(scale(a.metrics.appointments))} />
                <span className="hidden lg:inline"><Sparkline values={a.trend7} color={AGENT_COLOR[a.id]} width={70} height={26} /></span>
              </div>
              <div className="w-[170px] flex-none">
                <div className="flex items-baseline justify-between">
                  <span className="text-[19px] font-extrabold tabular-nums text-[#10b981]">{fmtMoney(scale(a.metrics.appointments) * APPT_COST)}</span>
                  <span className="text-[10px] text-[#9ca3af]">value</span>
                </div>
                <div className="mt-1.5"><InlineBar pct={(a.metrics.appointments / maxAppts) * 100} color={AGENT_COLOR[a.id]} /></div>
              </div>
              <span className="text-[15px] font-bold text-[#d8caff] group-hover:text-[#813fed]">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3 · what's working */}
      <div className="flex flex-col gap-3.5">
        <SectionLabel hint="where revenue is won">What&apos;s working</SectionLabel>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Top campaigns" sub="Outbound campaigns, ranked by conversions">
            <div className="flex flex-col gap-2.5">
              {campaigns.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-[#111]">{c.name}</p>
                    <p className="truncate text-[10.5px] text-[#9ca3af]">{c.agent} · {fmtInt(c.dispatched)} dispatched · {c.connect}% connect</p>
                    <div className="mt-1.5"><InlineBar pct={(c.conversions / maxConv) * 100} color="#10b981" /></div>
                  </div>
                  <div className="flex-none text-right">
                    <p className="text-[13px] font-bold tabular-nums text-[#10b981]">{fmtInt(c.conversions)}</p>
                    <p className="text-[10.5px] text-[#9ca3af]">conversions</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="The pipeline" sub="Outreach → conversation → qualified → appointment → deals">
            <StepFunnel stages={funnel} />
            <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-[#f3f4f6] pt-4 sm:grid-cols-3">
              <ContextChip label="Connect / answer" value={`${connectRate}%`} />
              <ContextChip label="After-hours captured" value={fmtInt(scale(ft.afterHours))} accent="#10b981" />
              <ContextChip label="Talk time" value={`${fmtInt((ft.talkMinutes * factor) / 60)}h`} />
            </div>
          </Card>
        </div>
      </div>

      {/* 4 · can you trust it */}
      <div className="flex flex-col gap-3.5">
        <SectionLabel hint="audit-grade hygiene you can show">Can you trust it</SectionLabel>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Compliance & consent" sub="Proof your outreach stays inside the rules">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {COMPLIANCE.map((c) => (
                <div key={c.label} className="flex items-center justify-between rounded-xl border border-[#f0f0f0] px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 text-[11.5px] text-[#6b7280]">
                    <span className="h-2 w-2 rounded-full" style={{ background: RAG_STYLE[c.status].dot }} />
                    {c.label}
                  </span>
                  <span className="text-[12px] font-bold text-[#111]">{c.value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Data health" sub="How complete the data your agents work from is">
            <div className="flex flex-col gap-3">
              {DATA_HEALTH.map((d) => (
                <div key={d.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#374151]">{d.label}</span>
                    <span className="tabular-nums font-bold text-[#111]">{d.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#f3f4f6]">
                    <div className="h-2 rounded-full" style={{ width: `${d.pct}%`, background: RAG_STYLE[d.status].dot }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════ AGENT DETAIL ════════════════════════════ */
function AgentDetailView({
  agents,
  factor,
  periodLabel,
  initialAgent,
}: {
  agents: AgentData[];
  factor: number;
  periodLabel: string;
  initialAgent?: string;
}) {
  const [activeId, setActiveId] = useState<string>(
    initialAgent && agents.some((a) => a.id === initialAgent) ? initialAgent : agents[0]?.id,
  );
  const a = agents.find((x) => x.id === activeId) ?? agents[0];
  const m = a.metrics;
  const r = a.report;
  const inbound = a.dir === "Inbound";
  const scale = (n: number) => Math.round(n * factor);
  const turnRate = r.qualifiedPct;
  const apptValue = scale(m.appointments) * APPT_COST;

  // lead journey (Sankey) — unique leads at each stage
  const sankey = useMemo(() => {
    const total = scale(r.leadsAttempted);
    const connected = Math.min(total, scale(m.conversations));
    const noConvo = Math.max(0, total - connected);
    const qualified = Math.min(connected, scale(m.qualified));
    const notQualified = Math.max(0, connected - qualified);
    const booked = Math.min(qualified, scale(m.appointments));
    const nurture = Math.max(0, qualified - booked);
    const columns = [
      [{ id: "total", label: inbound ? "Leads attempted" : "Leads dialed", color: "#813fed" }],
      [
        { id: "connected", label: "Connected", color: "#6366f1" },
        { id: "missed", label: "No conversation", color: "#dc2626" },
      ],
      [
        { id: "qualified", label: "Qualified", color: "#10b981" },
        { id: "notq", label: "Not qualified", color: "#9ca3af" },
      ],
      [
        { id: "booked", label: "Booked", color: "#10b981" },
        { id: "nurture", label: "Nurture", color: "#f59e0b" },
        { id: "lost", label: "Lost / no intent", color: "#9ca3af" },
      ],
    ];
    const links = [
      { from: "total", to: "connected", value: connected },
      { from: "total", to: "missed", value: noConvo },
      { from: "connected", to: "qualified", value: qualified },
      { from: "connected", to: "notq", value: notQualified },
      { from: "qualified", to: "booked", value: booked },
      { from: "qualified", to: "nurture", value: nurture },
      { from: "notq", to: "lost", value: notQualified },
    ];
    return { columns, links };
  }, [a, factor, inbound]);

  return (
    <div className="flex flex-col gap-6">
      {/* agent switcher */}
      <div className="grid grid-cols-2 gap-2.5">
        {agents.map((ag) => {
          const selected = ag.id === activeId;
          return (
            <button
              key={ag.id}
              onClick={() => setActiveId(ag.id)}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                selected
                  ? "border-[#813fed] bg-[#faf8ff] shadow-[0_0_0_3px_rgba(129,63,237,0.12)]"
                  : "border-[#e5e7eb] bg-white hover:border-[#c4b5fd] hover:bg-[#faf8ff]"
              }`}
            >
              <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg text-[18px] leading-none ${selected ? "bg-white shadow-sm" : "bg-[#f6f1ff]"}`}>{ag.icon}</span>
              <span className="flex flex-col">
                <span className={`text-[13px] font-bold leading-tight ${selected ? "text-[#111]" : "text-[#374151]"}`}>{ag.name}</span>
                <span className="mt-0.5 text-[11px] leading-none text-[#6b7280]">
                  <b className="tabular-nums text-[#111]">{fmtInt(scale(ag.report.leadsAttempted))}</b> leads attempted
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* value created band */}
      <section className="rounded-3xl border border-[#cdeede] bg-gradient-to-r from-[#f0fdf6] to-white shadow-sm px-7 py-6">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#059669]">Value created · {periodLabel}</p>
            <p className="mt-1 text-[42px] font-extrabold tabular-nums leading-none text-[#059669]">{fmtMoneyFull(apptValue)}</p>
            <p className="mt-2 text-[12px] text-[#6b7280]">
              <b className="text-[#111]">{fmtInt(scale(m.appointments))} appointments</b> × <b className="text-[#111]">{fmtMoneyFull(APPT_COST)}</b> per appointment
            </p>
          </div>
          <div className="rounded-2xl border border-[#cdeede] bg-white/70 px-5 py-3.5 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">Booking rate</p>
            <p className="mt-0.5 text-[22px] font-extrabold tabular-nums text-[#111]">{r.abr}%</p>
          </div>
        </div>
      </section>

      <SectionLabel hint={periodLabel}>Performance</SectionLabel>

      {/* performance — funnel + activity + breakdown */}
      <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] bg-gradient-to-r from-[#faf8ff] to-white px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white text-[17px] leading-none shadow-sm">{a.icon}</span>
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-[14px] font-bold leading-tight text-[#111]">{r.summary.person}</p>
                <span className="text-[12px] font-medium text-[#9ca3af]">{a.name}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-tight text-[#9ca3af]">Lead → appointment funnel · {periodLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-[#ece6fb]">
            <div className="text-right leading-tight">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#9ca3af]">Booking rate</p>
              <DeltaPill delta={r.deltas.abr} />
            </div>
            <p className="text-[28px] font-extrabold tabular-nums leading-none text-[#813fed]">{r.abr}%</p>
          </div>
        </div>

        <div className="px-6 py-6">
          <PerfFunnel
            stages={[
              { label: inbound ? "Leads attempted" : "Leads dialed", value: scale(r.leadsAttempted), delta: r.deltas.leadsAttempted },
              { label: "Conversations", value: scale(m.conversations) },
              { label: "Leads qualified", value: scale(m.qualified), delta: r.deltas.leadsQualified },
              { label: "Appointments booked", value: scale(m.appointments), delta: r.deltas.appointments },
            ]}
          />
        </div>

        <div className="grid grid-cols-3 divide-x divide-[#f3f4f6] border-t border-[#f0f0f0] bg-[#fcfcfd]">
          <ActivityStat label={inbound ? "Total calls" : "Calls dispatched"} value={fmtInt(scale(m.calls))} hint={`${fmtInt(scale(m.talkMinutes))} mins talk`} delta={r.deltas.totalCalls} />
          <ActivityStat label="Total SMS" value={fmtInt(scale(m.smsSent))} delta={r.deltas.totalSms} />
          <ActivityStat label="Turn rate" value={`${turnRate}%`} hint="qualified / connected" />
        </div>

        <div className="border-t border-[#f0f0f0] px-6 py-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">Call breakdown</p>
          <div className={`grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 ${inbound ? "lg:grid-cols-6" : "lg:grid-cols-4"}`}>
            {[
              { label: "During hours", value: Math.max(0, m.calls - m.afterHours) },
              { label: "After hours", value: m.afterHours },
              { label: "Connected", value: m.conversations },
              { label: "Qualified", value: m.qualified },
              ...(inbound
                ? [
                    { label: "Transferred", value: r.callFlow.transferred },
                    { label: "Lost", value: r.callFlow.lost },
                  ]
                : []),
            ].map((b) => (
              <div key={b.label} className="flex flex-col">
                <span className="text-[18px] font-bold tabular-nums leading-none text-[#111]">{fmtInt(scale(b.value))}</span>
                <span className="mt-1 text-[11px] text-[#6b7280]">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* day-on-day */}
      <Card title="Day-on-day" sub="Touched → Qualified → Appointments, per day">
        <DayTrend points={r.dayOnDay} />
      </Card>

      <SectionLabel hint={`${r.qualifiedPct}% qualified`}>Conversations &amp; outcomes</SectionLabel>

      {/* lead journey */}
      <Card title="Lead journey" sub="How unique leads move: reached → connected → qualified → booked. Ribbon width = leads.">
        <Sankey columns={sankey.columns} links={sankey.links} height={300} fmt={(n) => fmtInt(n)} />
      </Card>

      {/* query resolution + objections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Query resolution rate" sub="Share of each topic the agent resolved without a human">
          <QueryBars topics={r.queries} />
        </Card>
        <Card title="Top objections" sub="What the agent heard most">
          <div className="flex flex-col gap-3.5">
            {a.topObjections.map((o) => (
              <div key={o.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#374151]">{o.label}</span>
                  <span className="tabular-nums font-bold text-[#111]">{o.pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f3f4f6]">
                  <div className="h-2 rounded-full" style={{ width: `${o.pct}%`, background: "#813fed" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionLabel>{inbound ? "Inbound operations" : "Outbound campaigns"}</SectionLabel>

      {/* inbound: leads by source (+ speed-to-lead for sales_ib) */}
      {inbound && r.leadsBySource && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className={a.id === "sales_ib" ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card title="Leads by source" sub={`${periodLabel} · interacted → total → booked`} pad={false}>
              <table className="w-full">
                <thead className="bg-[#fafafa]">
                  <tr>
                    <Th align="left">Source</Th>
                    <Th align="right">Interacted</Th>
                    <Th align="right">Total leads</Th>
                    <Th align="right">Appts booked</Th>
                  </tr>
                </thead>
                <tbody>
                  {r.leadsBySource.map((s) => (
                    <tr key={s.source} className="border-t border-[#f0f0f0] hover:bg-[#faf8ff] transition-colors">
                      <Td align="left"><span className="text-[12.5px] font-semibold text-[#111]">{s.source}</span></Td>
                      <Td align="right"><span className="text-[12.5px] tabular-nums text-[#374151]">{fmtInt(scale(s.interacted))}</span></Td>
                      <Td align="right"><span className="text-[12.5px] tabular-nums font-semibold text-[#111]">{fmtInt(scale(s.total))}</span></Td>
                      <Td align="right"><span className="text-[12.5px] tabular-nums font-semibold text-[#10b981]">{fmtInt(scale(s.appts))}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
          {a.id === "sales_ib" && r.speedToLead && (
            <Card title="Speed to lead" sub="How fast new CRM leads get a first touch">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[30px] font-extrabold tabular-nums text-[#813fed] leading-none">{r.speedToLead.avg}</p>
                  <p className="text-[11.5px] text-[#6b7280] mt-1">{r.speedToLead.pctWithin5}% of new leads contacted within 5 min</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SummaryStat label="Touched instantly" value={fmtInt(scale(r.speedToLead.instantlyTouched))} accent="#10b981" />
                  <SummaryStat label="After-hours instant" value={fmtInt(scale(r.speedToLead.afterHoursInstant))} />
                  <SummaryStat label="Appointments booked" value={fmtInt(scale(r.speedToLead.instantAppts))} accent="#813fed" />
                  <SummaryStat label="Instant → appt" value={`${r.speedToLead.instantApptRate}%`} />
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* activity table (calls by reason / campaigns) + outbound outcomes */}
      <div className={`grid grid-cols-1 gap-6 ${inbound ? "" : "lg:grid-cols-3"}`}>
        <div className={inbound ? "" : "lg:col-span-2"}>
          <Card title={a.activityTitle} sub={periodLabel} pad={false}>
            <table className="w-full">
              <thead className="bg-[#fafafa]">
                <tr>
                  {a.activityCols.map((c, i) => (
                    <Th key={c} align={i === 0 ? "left" : "right"}>{c}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {a.activityRows.map((row, ri) => (
                  <tr key={ri} className="border-t border-[#f0f0f0] hover:bg-[#faf8ff] transition-colors">
                    {row.map((cell, ci) => (
                      <Td key={ci} align={ci === 0 ? "left" : "right"}>
                        <span className={`text-[12.5px] ${ci === 0 ? "font-semibold text-[#111]" : "tabular-nums text-[#374151]"}`}>{cell}</span>
                      </Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
        {!inbound && (
          <Card title="Outbound outcomes" sub="How outbound conversations ended">
            <SplitBar segments={a.outcomes.map((o, i) => ({ label: o.label, value: o.value, color: OUTCOME_COLORS[i % OUTCOME_COLORS.length] }))} />
          </Card>
        )}
      </div>

      {/* multi-day reply + channel mix */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Multi-day reply effectiveness" sub="When replies land, relative to the first touch">
          <TrendBars values={r.multiDayReply.map((d) => d.pct)} labels={r.multiDayReply.map((d) => d.day)} height={96} />
          <p className="mt-3 text-[11px] text-[#6b7280]">{r.multiDayReply[0].pct}% of replies arrive the same day — the rest justify the multi-day cadence.</p>
        </Card>
        <Card title="Channel mix" sub="Share of contacts by channel">
          <SplitBar
            segments={[
              { label: "Voice", value: a.channelSplit.voice, color: "#6366f1" },
              { label: "SMS", value: a.channelSplit.sms, color: "#10b981" },
            ]}
          />
          <p className="mt-4 text-[11.5px] text-[#6b7280]">
            SMS sent: <b className="text-[#111]">{fmtInt(scale(m.smsSent))}</b> · talk time: <b className="text-[#111]">{fmtInt((m.talkMinutes * factor) / 60)}h</b>
            {m.afterHours > 0 && (<> · after-hours captured: <b className="text-[#111]">{fmtInt(scale(m.afterHours))}</b></>)}
          </p>
        </Card>
      </div>

      <SectionLabel>Quality &amp; trend</SectionLabel>

      {/* quality cells */}
      <Card title="Conversation quality" sub="From live calls — the metrics we can measure today">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <QCell label={a.quality.primaryLabel} value={`${a.quality.primary}%`} status={a.quality.primaryStatus} />
          <QCell label="Avg handle time" value={a.quality.handleTime} status={a.quality.handleStatus} />
          <QCell label="CSAT" value={`${a.quality.csat}/5`} status={a.quality.csatStatus} />
          <QCell label="Positive sentiment" value={`${a.quality.sentiment}%`} />
          <QCell label={a.quality.fourthLabel} value={a.quality.fourthValue} status={a.quality.fourthStatus} />
        </div>
      </Card>

      {/* hourly + 7-day */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Time-of-day distribution" sub="When the activity happens (business hours)">
          <TrendBars values={a.hourly} labels={["7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p"]} height={88} />
        </Card>
        <Card title="7-day trend" sub={a.headlineLabel}>
          <TrendBars values={a.trend7} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} highlightLast height={88} />
        </Card>
      </div>

      {/* story — benchmarks vs industry + before/after */}
      {r.benchmarks && (
        <>
          <SectionLabel hint="vs a typical human team">Why it wins</SectionLabel>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {r.benchmarks.map((b) => (
              <BenchmarkBox key={b.label} label={b.label} ours={b.ours} theirs={b.theirs} caption={b.caption} multiplier={b.multiplier} accent={b.accent} />
            ))}
          </div>
        </>
      )}
      {r.compare && (
        <Card title="Before & after" sub="Your team before — and where the agent is now" pad={false}>
          <CompareTable columns={["Your team", "Month 1", "Month 2", "Now"]} rows={r.compare} />
        </Card>
      )}
    </div>
  );
}

/* ──────────────── small shared cells ──────────────── */
function HeroTile({ label, value, delta }: { label: string; value: string; delta?: number }) {
  const has = delta !== undefined;
  const d = delta ?? 0;
  const up = d > 0;
  return (
    <div className="px-6 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a99fce]">{label}</p>
      <p className="mt-1 text-[22px] font-extrabold tabular-nums leading-none text-white">{value}</p>
      {has && (
        <span className="mt-1.5 inline-block text-[10.5px] font-semibold" style={{ color: d === 0 ? "#a99fce" : up ? "#5eead4" : "#fca5a5" }}>
          {d === 0 ? "0%" : `${up ? "▲" : "▼"} ${Math.abs(d)}%`} vs prior
        </span>
      )}
    </div>
  );
}

function DeltaBadge({ label, delta }: { label: string; delta: number }) {
  const up = delta >= 0;
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
      <p className="text-[20px] font-extrabold tabular-nums leading-none" style={{ color: up ? "#5eead4" : "#fca5a5" }}>{up ? "▲" : "▼"} {Math.abs(delta)}%</p>
      <p className="mt-1 text-[10.5px] text-[#c4b5fd]">{label}</p>
    </div>
  );
}

function MicroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[13.5px] font-bold tabular-nums text-[#111]">{value}</p>
      <p className="text-[9.5px] font-medium uppercase tracking-wide text-[#9ca3af]">{label}</p>
    </div>
  );
}

function ContextChip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#fafafa] px-3.5 py-2.5">
      <span className="text-[11.5px] text-[#6b7280]">{label}</span>
      <span className="text-[14px] font-bold tabular-nums" style={{ color: accent ?? "#111" }}>{value}</span>
    </div>
  );
}

function PerfFunnel({ stages }: { stages: { label: string; value: number; delta?: number }[] }) {
  const max = Math.max(1, stages[0]?.value ?? 1);
  return (
    <div className="flex flex-col gap-2.5">
      {stages.map((s, i) => {
        const pct = Math.max(2, (s.value / max) * 100);
        const prev = i > 0 ? stages[i - 1].value : null;
        const conv = prev && prev > 0 ? Math.round((s.value / prev) * 100) : null;
        const isLast = i === stages.length - 1;
        return (
          <div key={s.label} className="flex items-center gap-3 sm:gap-4">
            <div className="w-[120px] flex-none sm:w-[150px]">
              <p className={`text-[24px] font-extrabold tabular-nums leading-none sm:text-[26px] ${isLast ? "text-[#10b981]" : "text-[#111]"}`}>{fmtInt(s.value)}</p>
              <p className="mt-1 text-[11px] leading-tight text-[#6b7280]">{s.label}</p>
            </div>
            <div className="w-[40px] flex-none text-right sm:w-[46px]">
              {conv !== null && (
                <span className="rounded-full bg-[#f3eaff] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#813fed]" title="conversion from the previous step">{conv}%</span>
              )}
            </div>
            <div className="flex flex-1 items-center">
              <div
                className="h-8 rounded-lg transition-all"
                style={{
                  width: `${pct}%`,
                  minWidth: 10,
                  background: isLast ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#813fed,#6366f1)",
                  opacity: 1 - i * 0.06,
                }}
              />
            </div>
            <div className="w-[92px] flex-none text-right sm:w-[104px]">{s.delta !== undefined && <DeltaPill delta={s.delta} />}</div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityStat({ label, value, hint, delta }: { label: string; value: string; hint?: string; delta?: number }) {
  return (
    <div className="px-6 py-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">{label}</p>
      <p className="mt-1 text-[20px] font-bold tabular-nums leading-none text-[#111]">{value}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {delta !== undefined && <DeltaPill delta={delta} />}
        {hint && <span className="text-[10.5px] text-[#6b7280]">{hint}</span>}
      </div>
    </div>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-[#f0f0f0] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">{label}</p>
      <p className="mt-0.5 text-[16px] font-bold tabular-nums" style={{ color: accent ?? "#111" }}>{value}</p>
    </div>
  );
}

function QCell({ label, value, status }: { label: string; value: string; status?: "green" | "amber" | "red" }) {
  return (
    <div className="rounded-xl border border-[#f0f0f0] px-4 py-3">
      <div className="flex items-center gap-1.5">
        {status && <span className="h-2 w-2 rounded-full" style={{ background: RAG_STYLE[status].dot }} />}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">{label}</p>
      </div>
      <p className="mt-1 text-[18px] font-bold tabular-nums text-[#111]">{value}</p>
    </div>
  );
}
