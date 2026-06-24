'use client';

import { useState } from 'react';
import { ChevronDown, Copy, Plus, Search, Trash2, Zap } from 'lucide-react';
import { SettingsPageHeader } from './page-header';
import {
  AgentCard,
  PolicyCard,
  SaveControls,
  SegmentedControl,
  SubTabs,
  Toggle,
} from './agent-shared';

export function SalesScreen() {
  return (
    <div className="mx-auto max-w-5xl">
      <SettingsPageHeader
        title="Sales"
        description="Persona, first message, voice test, deploy, and reach-out cadence for the inbound sales agent."
        actions={<SaveControls />}
      />

      <SubTabs
        tabs={[
          { id: 'agents', label: 'Agents', render: () => <AgentsPanel /> },
          {
            id: 'speed-to-lead',
            label: 'Reachout & Follow-ups',
            render: () => <SpeedToLeadPanel />,
          },
          { id: 'policies', label: 'Policies', render: () => <PoliciesPanel /> },
        ]}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Agents panel                                                               */
/* -------------------------------------------------------------------------- */

function AgentsPanel() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <AgentCard
        variant="inbound"
        label="Inbound"
        persona="Maya"
        subtitle="Handles all incoming calls 24/7"
        voice="Maya (Warm)"
        languages="English, Spanish"
        phone="+1 (312) 555-0142"
      />
      <AgentCard
        variant="outbound"
        label="Outbound"
        persona="Alex"
        subtitle="Reaches out to leads on your behalf"
        voice="Alex (Confident)"
        languages="English"
        phone="+1 (312) 555-0166"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reachout & Follow-ups panel (Speed to Lead)                                */
/* -------------------------------------------------------------------------- */

const LEAD_SOURCE_GROUPS = [
  { id: 'crm', label: 'CRM sources', count: 4, sources: ['Website form', 'Inventory inquiry', 'Trade-in form', 'Schedule a visit'] },
  { id: 'marketplace', label: 'Marketplace listings', count: 6, sources: ['AutoTrader', 'Cars.com', 'CarGurus', 'Facebook Marketplace', 'Edmunds', 'TrueCar'] },
  { id: 'oem', label: 'OEM lead programs', count: 3, sources: ['Toyota OEM', 'Ford OEM', 'Honda OEM'] },
];

function SpeedToLeadPanel() {
  const [enabled, setEnabled] = useState(true);
  const [followUpEnabled, setFollowUpEnabled] = useState(true);
  const [firstTouch, setFirstTouch] = useState('sms');
  const [nudge, setNudge] = useState('sms');
  const [expandedGroup, setExpandedGroup] = useState<string | null>('crm');

  return (
    <div className="space-y-4">
      {/* Forward email */}
      <div className="rounded-xl border border-black-10 bg-white p-4">
        <div className="text-sm font-medium text-black-60">
          Forward all new leads via email to
        </div>
        <div className="mt-2 flex max-w-md items-center gap-2 rounded-lg border border-black-10 bg-white px-3 py-2">
          <span className="flex-1 truncate text-sm text-black-60">
            leads-apexauto@vini.spyne.ai
          </span>
          <button className="text-black-40 hover:text-blue-light" aria-label="Copy">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Enable Instant Response */}
      <div className="rounded-xl border border-black-10 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-4 text-blue-light">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold text-black-dark">
                Enable Instant Response
              </div>
              <div className="mt-0.5 text-xs text-black-60">
                Automated quick responses to new leads.
              </div>
            </div>
          </div>
          <Toggle on={enabled} onChange={setEnabled} />
        </div>
      </div>

      {enabled && (
        <>
          {/* First Touch Point */}
          <SectionCard>
            <SectionRow
              title="First Touch Point"
              description="The channel used to reach a new lead for the first time."
              control={
                <SegmentedControl
                  value={firstTouch}
                  options={[
                    { value: 'sms', label: 'SMS' },
                    { value: 'call', label: 'Call' },
                  ]}
                  onChange={setFirstTouch}
                />
              }
            />
          </SectionCard>

          {/* Silence Nudge */}
          <SectionCard>
            <SectionRow
              title="Silence Nudge"
              description="If a lead replies to the first touch but then goes quiet, send one follow-up after the threshold below."
              control={
                <SegmentedControl
                  value={nudge}
                  options={[
                    { value: 'sms', label: 'SMS' },
                    { value: 'call', label: 'Call' },
                    { value: 'none', label: 'No Nudge' },
                  ]}
                  onChange={setNudge}
                />
              }
            />
            {nudge !== 'none' && (
              <div className="mt-4 max-w-sm">
                <div className="mb-1 text-xs font-medium text-black-60">
                  Nudge After{' '}
                  <span className="font-normal text-black-40">
                    (Delay before the silence nudge is sent)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    defaultValue="20"
                    className="flex-1 rounded-lg border border-black-10 bg-white px-3 py-2 text-sm text-black-dark focus:border-blue-light focus:outline-none"
                  />
                  <span className="text-sm text-black-60">Mins</span>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Lead Sources */}
          <SectionCard>
            <SectionRow
              title="Select Lead Sources to Enable Automations"
              description="Choose which incoming leads receive automated, immediate responses."
              control={
                <div className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-black-10 bg-white px-3 py-2">
                  <Search className="h-4 w-4 text-black-40" />
                  <input
                    placeholder="Search sources"
                    className="w-full bg-transparent text-sm text-black-80 outline-none placeholder:text-black-40"
                  />
                </div>
              }
            />
            <div className="mt-3 text-xs text-black-40">3 sources selected</div>
            <div className="mt-3 space-y-2">
              {LEAD_SOURCE_GROUPS.map((group) => {
                const expanded = expandedGroup === group.id;
                return (
                  <div
                    key={group.id}
                    className="overflow-hidden rounded-xl border border-black-10 bg-white"
                  >
                    <button
                      onClick={() =>
                        setExpandedGroup(expanded ? null : group.id)
                      }
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-4 w-4 items-center justify-center rounded border border-black-20 bg-white" />
                        <div>
                          <div className="text-sm font-medium text-black-80">{group.label}</div>
                          <div className="text-xs text-black-60">{group.count} sources</div>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-black-40 transition-transform ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expanded && (
                      <div className="space-y-1.5 border-t border-black-5 px-4 py-3">
                        {group.sources.map((s, i) => (
                          <label
                            key={s}
                            className="flex w-full cursor-pointer items-center gap-3 px-1 py-1 text-sm"
                          >
                            <input
                              type="checkbox"
                              defaultChecked={i < 2}
                              className="h-4 w-4 rounded border-black-20 text-blue-light"
                            />
                            <span className="text-black-80">{s}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Follow-up Sequences */}
          <SectionCard>
            <SectionRow
              title="New Lead Follow-up Sequences"
              description="Automated multi-day follow-ups if a lead doesn't engage."
              control={<Toggle on={followUpEnabled} onChange={setFollowUpEnabled} />}
            />

            {followUpEnabled && (
              <>
                <div className="mt-4 border-t border-black-5 pt-4">
                  <div className="text-sm font-semibold text-black-dark">
                    Follow-up Cadence
                  </div>
                  <div className="mt-1 text-xs text-black-60">
                    Day 1 is handled by Speed to Lead's first touch, so this
                    sequence starts at Day 2.
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-black-10 bg-white p-3">
                  <div className="space-y-2">
                    {[
                      { day: 2, time: '09:00 AM', channel: 'sms' },
                      { day: 5, time: '10:00 AM', channel: 'sms' },
                      { day: 9, time: '02:00 PM', channel: 'call' },
                      { day: 14, time: '11:00 AM', channel: 'sms' },
                    ].map((tp) => (
                      <TouchpointRow key={tp.day} day={tp.day} time={tp.time} channel={tp.channel} />
                    ))}
                  </div>
                  <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-4 px-3 py-2.5 text-sm font-medium text-blue-light transition-colors hover:bg-blue-8">
                    <Plus className="h-4 w-4" />
                    Add Touchpoint
                  </button>
                </div>
              </>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-black-10 bg-white p-4">{children}</div>;
}

function SectionRow({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-black-dark">{title}</div>
        {description && <div className="mt-0.5 text-xs text-black-60">{description}</div>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function TouchpointRow({ day, time, channel }: { day: number; time: string; channel: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-black-8 bg-gray-lighter px-3 py-2">
      <span className="text-xs font-medium uppercase tracking-wide text-black-40">Day</span>
      <input
        type="text"
        defaultValue={day}
        className="w-14 rounded-md border border-black-10 bg-white px-2 py-1 text-sm text-black-dark focus:border-blue-light focus:outline-none"
      />
      <span className="text-xs font-medium uppercase tracking-wide text-black-40">at</span>
      <input
        type="text"
        defaultValue={time}
        className="w-24 rounded-md border border-black-10 bg-white px-2 py-1 text-sm text-black-dark focus:border-blue-light focus:outline-none"
      />
      <span className="text-xs font-medium uppercase tracking-wide text-black-40">via</span>
      <SegmentedControl
        value={channel}
        options={[
          { value: 'sms', label: 'SMS' },
          { value: 'call', label: 'Call' },
        ]}
        onChange={() => {}}
      />
      <button
        aria-label="Remove touchpoint"
        className="ml-auto rounded-md p-1.5 text-black-40 hover:bg-black-4 hover:text-red-do"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Policies panel                                                             */
/* -------------------------------------------------------------------------- */

function PoliciesPanel() {
  return (
    <div className="space-y-3">
      <p className="mb-4 text-xs text-black-60">
        Facts the sales agent reads on every call. Each card is a Yes/No question —
        flip the ones this rooftop actually offers.
      </p>

      <PolicyCard
        title="Test Drives"
        status="enabled"
        description="Whether the sales agent offers test drives, and the rules around them."
      >
        Configured: In-person test drives 7 days a week. License + insurance required.
      </PolicyCard>

      <PolicyCard
        title="Shipping"
        status="enabled"
        description="Cross-state shipping availability and pricing."
      >
        Configured: Free local delivery within 50 mi. Out-of-state shipping starts at $499.
      </PolicyCard>

      <PolicyCard
        title="CPO (Certified Pre-Owned)"
        status="defaults"
        description="Warranty length and CPO certification process."
      >
        Defaults: 24-month / 24,000-mile warranty on CPO units.
      </PolicyCard>

      <PolicyCard
        title="After Hours Drop-off"
        status="opted_out"
        description="Whether customers can drop off vehicles outside business hours."
      >
        Opted out: Customers cannot drop off vehicles after hours.
      </PolicyCard>

      <PolicyCard
        title="Finance Pre-qualify"
        status="enabled"
        description="Online pre-qualification flow the agent can direct customers to."
      >
        Configured: Direct customers to apexauto.com/prequalify. Soft credit pull only.
      </PolicyCard>

      <PolicyCard
        title="Trade-in"
        status="defaults"
        description="How trade-in inquiries are handled on the call."
      >
        Defaults: Trade-in values issued only after in-person inspection.
      </PolicyCard>

      <PolicyCard
        title="Vehicle Hold"
        status="enabled"
        description="Whether customers can reserve a vehicle and the deposit terms."
      >
        Configured: Hold up to 24 hours with a $500 refundable deposit.
      </PolicyCard>

      <PolicyCard
        title="Payment Estimates"
        status="required"
        description="How the agent responds to monthly-payment questions."
      >
        Awaiting input: choose whether the agent gives payment ranges or always defers to F&amp;I.
      </PolicyCard>
    </div>
  );
}
