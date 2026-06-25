"use client"

/**
 * CallConversationDrawer — right-side overlay opened from an item's "Listen" (call) or
 * "Transcript" (conversation) action, modeled on the Vini console Call-Logs detail pane.
 *
 *  - Call mode: loads the end-call report (recording, transcript, AI summary) by callId.
 *  - Conversation mode: loads the customer's conversations; each row drills into its call.
 *
 * Props: { item, mode: 'call' | 'conversation', onClose }
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { INTENT_TAXONOMY, CHANNEL_META, CUSTOMERS, ageLabel, ageMinutes } from './data'
import { fetchCallReport, fetchConversations } from './be-client'
import { normalizeCallReport } from './be-mapper'

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
      <span className="w-32 flex-shrink-0 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>{label}</span>
      <span className="min-w-0 flex-1" style={{ color: 'var(--spyne-text-primary)' }}>{children ?? '—'}</span>
    </div>
  )
}

function fmtDuration(s) {
  if (s == null) return '—'
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

function TranscriptView({ report }) {
  const lines = (report?.transcript || '').split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length) {
    return (
      <div className="flex flex-col gap-2">
        {lines.map((line, i) => {
          const m = line.match(/^([A-Za-z][\w ]{0,18}):\s*(.*)$/)
          const who = m ? m[1] : ''
          const text = m ? m[2] : line
          const isAgent = /^(ai|assistant|agent|vini|emily|bot)/i.test(who)
          return (
            <div key={i} className="flex flex-col">
              {who ? <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: isAgent ? 'var(--spyne-primary)' : 'var(--spyne-text-muted)' }}>{who}</span> : null}
              <span className="text-[12px] leading-snug" style={{ color: 'var(--spyne-text-secondary)' }}>{text}</span>
            </div>
          )
        })}
      </div>
    )
  }
  if (Array.isArray(report?.messages) && report.messages.length) {
    return (
      <div className="flex flex-col gap-2">
        {report.messages.map((m, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: m.role === 'assistant' ? 'var(--spyne-primary)' : 'var(--spyne-text-muted)' }}>{m.role === 'assistant' ? 'AI' : 'Customer'}</span>
            <span className="text-[12px] leading-snug" style={{ color: 'var(--spyne-text-secondary)' }}>{m.content}</span>
          </div>
        ))}
      </div>
    )
  }
  return <p style={{ color: 'var(--spyne-text-muted)' }}>No transcript available.</p>
}

const TABS = ['Highlights', 'Summary', 'Transcript', 'Customer']

export default function CallConversationDrawer({ item, mode, onClose }) {
  const [tab, setTab] = useState('Highlights')
  const [viewCallId, setViewCallId] = useState(mode === 'call' ? (item?.source_call_id || null) : null)
  const [report, setReport] = useState(null)
  const [convs, setConvs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Conversation mode: load the customer's conversations.
  useEffect(() => {
    if (mode !== 'conversation' || !item?.customer_id) return
    let cancelled = false
    setLoading(true); setError(null)
    fetchConversations(item.customer_id)
      .then((r) => { if (!cancelled) setConvs(r.conversations) })
      .catch((e) => { if (!cancelled) setError(String(e?.message || e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [mode, item?.customer_id])

  // Load the call report whenever a call is being viewed.
  useEffect(() => {
    if (!viewCallId) return
    let cancelled = false
    setLoading(true); setError(null); setReport(null)
    fetchCallReport(viewCallId)
      .then((raw) => { if (!cancelled) setReport(raw ? normalizeCallReport(raw) : null) })
      .catch((e) => { if (!cancelled) setError(String(e?.message || e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [viewCallId])

  if (typeof document === 'undefined' || !item) return null

  const cust = CUSTOMERS[item.customer_id]
  const name = report?.customerName ?? cust?.name ?? item.customer_name ?? 'Unknown'
  const phone = report?.customerMobile ?? cust?.phone ?? ''
  const intent = INTENT_TAXONOMY[item.intent_id]
  const channel = CHANNEL_META[item.source_channel]
  const showCallDetail = !!viewCallId
  const inConvList = mode === 'conversation' && !viewCallId

  const body = (
    <div className="console-v2-sales-root">
      <div onClick={onClose} className="fixed inset-0 z-[199]" style={{ background: 'rgba(15,23,42,0.45)' }} />
      <div className="spyne-float spyne-animate-slide-up fixed right-0 top-0 z-[200] flex h-full w-[480px] max-w-[94vw] flex-col" style={{ background: 'var(--spyne-surface)' }} role="dialog" aria-modal="true" aria-label={mode === 'call' ? 'Call detail' : 'Conversation detail'}>
        {/* Header */}
        <div className="flex flex-shrink-0 items-start gap-2.5 border-b border-spyne-border px-4 py-3.5">
          {mode === 'conversation' && viewCallId ? (
            <button onClick={() => { setViewCallId(null); setReport(null) }} aria-label="Back" className="spyne-focus-ring mt-0.5 inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-spyne-page-bg" style={{ color: 'var(--spyne-text-muted)' }}><MaterialSymbol name="arrow_back" size={18} /></button>
          ) : (
            <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-lg" style={{ background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' }}><MaterialSymbol name={mode === 'call' ? 'call' : 'forum'} size={16} /></span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold leading-snug" style={{ color: 'var(--spyne-text-primary)' }}>{report?.outcome || item.intent_recap || (mode === 'call' ? 'Call detail' : 'Conversation')}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px]" style={{ color: 'var(--spyne-text-muted)' }}>
              <MaterialSymbol name="schedule" size={13} /> {ageLabel(ageMinutes(item))} ago
              {channel ? <span className="inline-flex items-center gap-1">· <MaterialSymbol name={channel.symbol} size={13} /> {channel.label}</span> : null}
              {report?.durationSec != null ? <span>· {fmtDuration(report.durationSec)}</span> : null}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="spyne-focus-ring inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-spyne-page-bg" style={{ color: 'var(--spyne-text-muted)' }}><MaterialSymbol name="close" size={20} /></button>
        </div>

        {loading && <div className="flex flex-1 items-center justify-center text-[12px]" style={{ color: 'var(--spyne-text-muted)' }}>Loading…</div>}
        {error && !loading && <div className="flex flex-1 items-center justify-center px-6 text-center text-[12px]" style={{ color: 'var(--spyne-danger-text)' }}>Couldn’t load detail: {error}</div>}

        {/* Conversation list */}
        {!loading && !error && inConvList && (
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>{name}'s conversations</p>
            {(convs || []).length === 0 ? (
              <p className="text-[12px]" style={{ color: 'var(--spyne-text-muted)' }}>No conversations found.</p>
            ) : (
              (convs || []).map((c) => {
                const isThis = c.conversationId === item.source_conversation_id
                return (
                  <button key={c.conversationId || c._id} onClick={() => c.callId && setViewCallId(c.callId)} disabled={!c.callId}
                    className="spyne-card flex flex-col gap-1 p-3 text-left transition-colors hover:border-spyne-primary disabled:cursor-not-allowed disabled:opacity-50"
                    style={isThis ? { borderColor: 'var(--spyne-primary)' } : undefined}>
                    <div className="flex items-center gap-2">
                      <span className="spyne-badge spyne-badge-neutral" style={{ fontSize: 10 }}>{c.type || 'call'}</span>
                      {isThis ? <span className="spyne-badge" style={{ fontSize: 10, background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' }}>this item</span> : null}
                      <span className="ml-auto text-[10px]" style={{ color: 'var(--spyne-text-muted)' }}>{c.status}</span>
                    </div>
                    <span className="text-[12.5px] font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{c.callTitle || 'Conversation'}</span>
                    {c.summary ? <span className="line-clamp-2 text-[11.5px]" style={{ color: 'var(--spyne-text-muted)' }}>{c.summary}</span> : null}
                    {c.callId ? <span className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: 'var(--spyne-primary)' }}><MaterialSymbol name="play_circle" size={13} /> Open call</span> : null}
                  </button>
                )
              })
            )}
          </div>
        )}

        {/* Call detail */}
        {!loading && !error && showCallDetail && (
          <>
            {report?.recordingUrl ? (
              <div className="flex-shrink-0 border-b border-spyne-border px-4 py-3">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls preload="none" src={report.recordingUrl} className="w-full" style={{ height: 36 }} />
              </div>
            ) : null}

            <div className="flex flex-shrink-0 gap-4 border-b border-spyne-border px-4">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} className="spyne-focus-ring -mb-px border-b-2 py-2 text-[12px] font-semibold transition-colors" style={{ borderColor: tab === t ? 'var(--spyne-primary)' : 'transparent', color: tab === t ? 'var(--spyne-primary)' : 'var(--spyne-text-muted)' }}>{t}</button>
              ))}
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 text-[12.5px]" style={{ color: 'var(--spyne-text-secondary)' }}>
              {tab === 'Highlights' && (
                <>
                  <Field label="Call ID"><Copyable value={viewCallId} /></Field>
                  <Field label="Conversation ID"><Copyable value={item.source_conversation_id} /></Field>
                  <Field label="Outcome">{report?.outcome}</Field>
                  <Field label="Customer intent">{report?.customerIntent}</Field>
                  <Field label="Sentiment">{report?.sentiment}{report?.sentimentScore != null ? ` (${report.sentimentScore})` : ''}</Field>
                  <Field label="Query resolved">{report?.queryResolved}</Field>
                  <Field label="Intent / SLA">{intent?.display_name ?? item.intent_id} · {intent?.sla_hours ?? '?'}h</Field>
                  <Field label="AI score">{report?.aiScore != null ? report.aiScore : '—'}{report?.callScore != null ? ` · call ${report.callScore}` : ''}</Field>
                </>
              )}
              {tab === 'Summary' && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>Summary</p>
                  <p className="leading-snug">{report?.summary || '—'}</p>
                  {item.intent_recap ? (
                    <>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>What needs doing</p>
                      <p style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>{item.intent_recap}</p>
                    </>
                  ) : null}
                </>
              )}
              {tab === 'Transcript' && <TranscriptView report={report} />}
              {tab === 'Customer' && (
                <>
                  <Field label="Name"><span style={{ fontWeight: 600 }}>{name}</span></Field>
                  <Field label="Phone">{phone || '—'}</Field>
                  <Field label="Customer ID"><Copyable value={item.customer_id} /></Field>
                  <Field label="Repeat calls">{item.repeat_caller_count ?? 0}</Field>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
  return createPortal(body, document.body)
}
