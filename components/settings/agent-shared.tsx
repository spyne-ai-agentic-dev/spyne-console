'use client';

import { useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Save controls                                                              */
/* -------------------------------------------------------------------------- */

export function SaveControls({
  status = 'idle' as 'idle' | 'saving' | 'saved',
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <span className="text-xs">
        {status === 'saving' && <span className="text-black-60">Saving…</span>}
        {status === 'saved' && (
          <span className="font-medium text-green-do">Saved ✓</span>
        )}
      </span>
      <button
        type="button"
        className="rounded-lg bg-blue-light px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
      >
        Save changes
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  SubTabs — interactive, source-accurate                                     */
/* -------------------------------------------------------------------------- */

export interface SubTab {
  id: string;
  label: string;
  render: () => ReactNode;
}

export function SubTabs({ tabs, initialId }: { tabs: SubTab[]; initialId?: string }) {
  const [activeId, setActiveId] = useState(initialId ?? tabs[0]?.id);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="mb-6 flex gap-6 border-b border-black-8">
        {tabs.map((t) => {
          const selected = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(t.id)}
              className={cn(
                '-mb-px border-b-2 pb-3 text-sm font-medium transition-colors',
                selected
                  ? 'border-blue-light text-blue-light'
                  : 'border-transparent text-black-60 hover:text-black-80',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{active?.render()}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  AgentCard — matches dealer-onboarding/components/agents/agent-card.tsx     */
/* -------------------------------------------------------------------------- */

export interface AgentCardProps {
  variant: 'inbound' | 'outbound';
  label: string;
  persona: string;
  subtitle: string;
  voice: string;
  languages: string;
  phone?: string;
  cta?: string;
}

export function AgentCard({
  variant,
  label,
  persona,
  subtitle,
  voice,
  languages,
  phone,
  cta = 'Edit Agent',
}: AgentCardProps) {
  const isInbound = variant === 'inbound';
  return (
    <div className="overflow-hidden rounded-2xl border border-black-10 bg-white">
      <div className="relative flex min-h-[168px] gap-4 p-5">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-w-0 pr-12">
            <div className="truncate text-lg font-semibold text-black-dark">{persona}</div>
            <div className="mt-0.5 truncate text-sm text-black-60">{subtitle || label}</div>
          </div>

          <div className="mt-3 min-h-[24px] text-sm">
            {phone ? (
              <div className="inline-flex items-center gap-1.5 text-black-60">
                <Phone className="h-3.5 w-3.5 text-black-40" />
                <span className="font-medium text-black-dark">{phone}</span>
              </div>
            ) : (
              <div className="text-xs text-black-40">No number assigned yet</div>
            )}
          </div>

          <div className="mt-auto pt-3 text-xs text-black-60">
            <span className="font-medium text-black-80">{voice}</span>
            <span className="mx-1.5 text-black-20">·</span>
            <span>{languages}</span>
          </div>
        </div>

        <div className="relative shrink-0">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-black-10 bg-gray-lightest text-black-40">
            <UserRound className="h-10 w-10" />
          </div>
        </div>

        <span
          className={cn(
            'absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm',
            isInbound ? 'bg-green-do' : 'bg-blue-light',
          )}
          title={isInbound ? 'Inbound' : 'Outbound'}
        >
          {isInbound ? (
            <PhoneIncoming className="h-3.5 w-3.5" />
          ) : (
            <PhoneOutgoing className="h-3.5 w-3.5" />
          )}
        </span>
      </div>

      <button
        type="button"
        className="group flex w-full items-center justify-center gap-2 border-t border-black-10 bg-white px-5 py-3.5 text-sm font-semibold text-black-dark transition-colors hover:bg-black-4"
      >
        <span>{cta}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  SegmentedControl                                                           */
/* -------------------------------------------------------------------------- */

export function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-black-10 bg-white p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-blue-light text-white'
                : 'text-black-60 hover:text-black-dark',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Toggle                                                                     */
/* -------------------------------------------------------------------------- */

export function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange?.(!on)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        on ? 'bg-blue-light' : 'bg-black-12',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          on ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  PolicyCard — collapsible with status pill                                  */
/* -------------------------------------------------------------------------- */

export type PolicyCardStatus =
  | 'defaults'
  | 'enabled'
  | 'opted_out'
  | 'required'
  | 'off';

const STATUS_LABEL: Record<PolicyCardStatus, string> = {
  defaults: 'Defaults applied',
  enabled: 'Enabled',
  opted_out: 'Opted out',
  required: 'Required',
  off: 'Off',
};

const STATUS_TONE: Record<PolicyCardStatus, string> = {
  defaults: 'bg-black-5 text-black-60',
  enabled: 'bg-green-lighter text-green-do',
  opted_out: 'bg-black-5 text-black-60',
  required: 'bg-red-lightest text-red-do',
  off: 'bg-black-5 text-black-60',
};

export function PolicyCard({
  title,
  description,
  status,
  children,
}: {
  title: string;
  description?: string;
  status: PolicyCardStatus;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="overflow-hidden rounded-2xl border border-black-10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-black-dark">{title}</h3>
            <span
              className={cn(
                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                STATUS_TONE[status],
              )}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
          {description && (
            <p className="mt-1 text-xs text-black-60">{description}</p>
          )}
        </div>
        <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-light">
          {open ? 'Collapse' : 'Edit'}
        </span>
      </button>
      {open && children && (
        <div className="border-t border-black-8 bg-gray-lighter px-5 py-4 text-sm text-black-60">
          {children}
        </div>
      )}
    </section>
  );
}
