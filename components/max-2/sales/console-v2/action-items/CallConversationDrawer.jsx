"use client"

/**
 * CallConversationDrawer — right-side overlay opened from an item's "Listen" (call) or
 * "Transcript" (conversation) action, modeled on the Vini console Call-Logs detail pane:
 * header + (call) audio player + tabs (Highlights / Customer / Summary / Transcript) + Call/
 * Conversation ID. Populated from the action item we already have; the audio recording, the
 * full transcript, and AI highlights load from the call/conversation detail endpoint (GET) —
 * wired once that contract is provided (placeholders until then).
 *
 * Props: { item, mode: 'call' | 'conversation', onClose }
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { INTENT_TAXONOMY, CHANNEL_META, CUSTOMERS, ageLabel, ageMinutes } from './data'

function Copyable({ value }) {
  const [done, setDone] = useState(false)
  if (!value) return <span style={{ color: 'var(--spyne-text-muted)' }}>—</span>
  return (
    <button
      onClick={() => { try { navigator.clipboard?.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200) } catch {} }}
      className="spyne-focus-ring inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] transition-colors hover:bg-spyne-page-bg"
      style={{ color: 'var(--spyne-text-secondary)' }}
      title="Copy"
    >
      {value} <MaterialSymbol name={done ? 'check' : 'content_copy'} size={13} />
    </button>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-28 flex-shrink-0 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  )
}

const TABS = ['Highlights', 'Customer', 'Summary', 'Transcript']

export default function CallConversationDrawer({ item, mode, onClose }) {
  const [tab, setTab] = useState('Highlights')
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  if (typeof document === 'undefined' || !item) return null

  const isCall = mode === 'call'
  const cust = CUSTOMERS[item.customer_id]
  const name = cust?.name ?? item.customer_name ?? 'Unknown'
  const phone = cust?.phone ?? ''
  const intent = INTENT_TAXONOMY[item.intent_id]
  const channel = CHANNEL_META[item.source_channel]

  const body = (
    <div className="console-v2-sales-root">
      <div onClick={onClose} className="fixed inset-0 z-[199]" style={{ background: 'rgba(15,23,42,0.45)' }} />
      <div
        className="spyne-float spyne-animate-slide-up fixed right-0 top-0 z-[200] flex h-full w-[460px] max-w-[94vw] flex-col"
        style={{ background: 'var(--spyne-surface)' }}
        role="dialog"
        aria-modal="true"
        aria-label={isCall ? 'Call detail' : 'Conversation detail'}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-start gap-2.5 border-b border-spyne-border px-4 py-3.5">
          <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-lg" style={{ background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' }}>
            <MaterialSymbol name={isCall ? 'call' : 'forum'} size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold leading-snug" style={{ color: 'var(--spyne-text-primary)' }}>
              {item.intent_recap || (isCall ? 'Call detail' : 'Conversation detail')}
            </h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px]" style={{ color: 'var(--spyne-text-muted)' }}>
              <MaterialSymbol name="schedule" size={13} /> {ageLabel(ageMinutes(item))} ago
              {channel ? <span className="inline-flex items-center gap-1">· <MaterialSymbol name={channel.symbol} size={13} /> {channel.label}</span> : null}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="spyne-focus-ring inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-spyne-page-bg" style={{ color: 'var(--spyne-text-muted)' }}>
            <MaterialSymbol name="close" size={20} />
          </button>
        </div>

        {/* Audio player (call mode) — placeholder until the recording URL is wired from call detail */}
        {isCall && (
          <div className="flex flex-shrink-0 items-center gap-3 border-b border-spyne-border px-4 py-3" title="Recording loads from call detail">
            <button className="spyne-focus-ring inline-flex size-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--spyne-primary)', color: '#fff' }}>
              <MaterialSymbol name="play_arrow" size={20} />
            </button>
            <span className="flex-shrink-0 font-mono text-[11px]" style={{ color: 'var(--spyne-text-muted)' }}>0:00 / —</span>
            <div className="flex flex-1 items-center gap-0.5 overflow-hidden">
              {Array.from({ length: 44 }).map((_, i) => (
                <span key={i} className="inline-block w-0.5 flex-shrink-0 rounded-full" style={{ height: 4 + ((i * 7) % 16), background: 'var(--spyne-border-strong)' }} />
              ))}
            </div>
            <MaterialSymbol name="download" size={16} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-shrink-0 gap-4 border-b border-spyne-border px-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="spyne-focus-ring -mb-px border-b-2 py-2 text-[12px] font-semibold transition-colors"
              style={{ borderColor: tab === t ? 'var(--spyne-primary)' : 'transparent', color: tab === t ? 'var(--spyne-primary)' : 'var(--spyne-text-muted)' }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 text-[12.5px]" style={{ color: 'var(--spyne-text-secondary)' }}>
          {tab === 'Highlights' && (
            <>
              <Field label="Call ID"><Copyable value={item.source_call_id} /></Field>
              <Field label="Conversation ID"><Copyable value={item.source_conversation_id} /></Field>
              <Field label="Customer"><span style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>{name}</span>{phone ? ` · ${phone}` : ''}</Field>
              <Field label="Intent">{intent?.display_name ?? item.intent_id} · SLA {intent?.sla_hours ?? '?'}h</Field>
              <div className="mt-1 rounded-lg border border-spyne-border p-3" style={{ background: 'var(--spyne-page-bg)' }}>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>Key highlights</p>
                <p style={{ color: 'var(--spyne-text-muted)' }}>Loads from {isCall ? 'call' : 'conversation'} detail.</p>
              </div>
            </>
          )}
          {tab === 'Customer' && (
            <>
              <Field label="Name"><span style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>{name}</span></Field>
              <Field label="Phone">{phone || '—'}</Field>
              <Field label="Customer ID"><Copyable value={item.customer_id} /></Field>
              <Field label="Repeat calls">{item.repeat_caller_count ?? 0}</Field>
            </>
          )}
          {tab === 'Summary' && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>What needs doing</p>
              <p style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>{item.intent_recap || '—'}</p>
              {item.source_message ? (
                <>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>Source</p>
                  <p className="italic leading-snug" style={{ color: 'var(--spyne-text-muted)' }}>“{item.source_message}”</p>
                </>
              ) : null}
            </>
          )}
          {tab === 'Transcript' && (
            <>
              {item.source_message ? (
                <div className="border-l-2 pl-3" style={{ borderColor: 'var(--spyne-border)' }}>
                  <p className="italic leading-snug" style={{ color: 'var(--spyne-text-secondary)' }}>“{item.source_message}”</p>
                </div>
              ) : null}
              <p style={{ color: 'var(--spyne-text-muted)' }}>Full transcript loads from {isCall ? 'call' : 'conversation'} detail.</p>
            </>
          )}
        </div>

        {/* Footer — open in the Vini console (host routes by id via postMessage) */}
        <div className="flex-shrink-0 border-t border-spyne-border px-4 py-3">
          <button
            onClick={() => {
              try {
                window.parent?.postMessage(
                  { type: isCall ? 'spyne:open-call' : 'spyne:open-conversation', callId: item.source_call_id, conversationId: item.source_conversation_id },
                  '*',
                )
              } catch {}
            }}
            disabled={isCall ? !item.source_call_id : !item.source_conversation_id}
            className="spyne-btn-secondary !h-9 w-full justify-center !text-[12.5px] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MaterialSymbol name="open_in_new" size={15} /> Open in Vini console
          </button>
        </div>
      </div>
    </div>
  )
  return createPortal(body, document.body)
}
