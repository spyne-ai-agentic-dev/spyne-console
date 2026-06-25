"use client"

/**
 * CallConversationDrawer — right-side detail pane, modeled 1:1 on the Vini Call-Logs drawer.
 *
 *  - Call mode: loads the end-call report (recording, transcript, AI analysis) by callId.
 *  - Conversation mode: loads the customer's conversations; each row drills into its call.
 *
 * Tabs mirror prod exactly: Highlights · Customer · Summary · Appointment · Transcript.
 * For SMS/chat items the "Transcript" tab becomes "Conversation", the audio player is
 * hidden, and the thread auto-scrolls to the point where the action item was created.
 *
 * Props: { item, mode: 'call' | 'conversation', onClose }
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { CHANNEL_META, CUSTOMERS, ageLabel, ageMinutes } from './data'
import { fetchCallReport, fetchConversations } from './be-client'
import { normalizeCallReport } from './be-mapper'

const MESSAGING = new Set(['sms', 'chat'])

function fmtClock(sec) {
  if (sec == null) return ''
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// Absolute timestamp for SMS turns (no call-relative seconds): "Jun 6, 2:02 PM".
function fmtStamp(ms) {
  if (!ms) return ''
  const d = new Date(ms)
  if (isNaN(d.getTime())) return ''
  let h = d.getHours()
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${MON[d.getMonth()]} ${d.getDate()}, ${h}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`
}

// SMS conversations carry their thread inline in `smsMessages` (direction out=agent / in=customer,
// body=text, createdAt=timestamp). Map to the shared turn shape, oldest-first.
function smsTurns(conv) {
  const arr = Array.isArray(conv?.smsMessages) ? [...conv.smsMessages] : []
  arr.sort((a, b) => (Date.parse(a.createdAt || 0) || 0) - (Date.parse(b.createdAt || 0) || 0))
  return arr
    .map((m) => ({
      role: m.direction === 'out' ? 'agent' : 'customer',
      text: m.body || m.message || m.text || '',
      atSec: null,
      atMs: m.createdAt ? Date.parse(m.createdAt) : null,
    }))
    .filter((m) => m.text)
}

function CopyIcon({ value, title = 'Copy' }) {
  const [done, setDone] = useState(false)
  if (!value) return null
  return (
    <button
      onClick={() => { try { navigator.clipboard?.writeText(String(value)); setDone(true); setTimeout(() => setDone(false), 1200) } catch {} }}
      title={title}
      className="spyne-focus-ring ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-spyne-page-bg"
      style={{ color: 'var(--spyne-text-muted)' }}
    >
      <MaterialSymbol name={done ? 'check' : 'content_copy'} size={14} />
    </button>
  )
}

function SectionHead({ icon, title, copyValue }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex" style={{ color: 'var(--spyne-text-muted)' }}><MaterialSymbol name={icon} size={16} /></span>
      <span className="text-[12.5px] font-bold" style={{ color: 'var(--spyne-text-primary)' }}>{title}</span>
      <CopyIcon value={copyValue} />
    </div>
  )
}

function SubLabel({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>{children}</p>
}

/* ── Highlights blocks ───────────────────────────────────────────── */

function CallIdRow({ callId }) {
  return (
    <div className="spyne-card flex flex-col gap-1.5 p-3.5">
      <SectionHead icon="tag" title="Call ID" copyValue={callId} />
      <div className="break-all rounded-lg border border-spyne-border px-3 py-2 font-mono text-[11.5px]" style={{ background: 'var(--spyne-page-bg)', color: 'var(--spyne-text-secondary)' }}>{callId || '—'}</div>
    </div>
  )
}

function KeyHighlights({ points }) {
  if (!points?.length) return null
  return (
    <div className="spyne-card flex flex-col gap-2.5 p-3.5">
      <SectionHead icon="lightbulb" title="Key Highlights" copyValue={points.join('\n')} />
      <ol className="flex flex-col gap-2">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums" style={{ background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' }}>{i + 1}</span>
            <span className="text-[12.5px] leading-snug" style={{ color: 'var(--spyne-text-secondary)' }}>{p}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function PersonRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--spyne-page-bg)', color: 'var(--spyne-text-muted)' }}><MaterialSymbol name={icon} size={16} /></span>
      <div className="min-w-0">
        <p className="text-[10px]" style={{ color: 'var(--spyne-text-muted)' }}>{label}</p>
        <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{value || '—'}</p>
      </div>
    </div>
  )
}

function SummaryActionItems({ summaryText, actionItems, summaryLabel = 'Call Summary' }) {
  return (
    <div className="flex flex-col gap-2.5">
      <SubLabel>Summary &amp; Action Items</SubLabel>
      <div>
        <p className="mb-1 text-[11px] font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>{summaryLabel}</p>
        <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--spyne-text-secondary)' }}>{summaryText || '—'}</p>
      </div>
      {actionItems?.length > 0 && (
        <div className="rounded-lg border-l-[3px] px-3 py-2.5" style={{ borderColor: 'var(--spyne-primary)', background: 'var(--spyne-primary-soft)' }}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-primary)' }}>Next Action Required</p>
          <ul className="flex flex-col gap-1">
            {actionItems.map((a, i) => (
              <li key={i} className="flex gap-1.5 text-[12px] leading-snug" style={{ color: 'var(--spyne-text-primary)' }}>
                <span style={{ color: 'var(--spyne-primary)' }}>•</span><span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function CustomerInfoSummary({ name, phone, summaryText, actionItems }) {
  const copy = [name, phone, summaryText, ...(actionItems || [])].filter(Boolean).join('\n')
  return (
    <div className="spyne-card flex flex-col gap-3.5 p-3.5">
      <SectionHead icon="person" title="Customer Information & Summary" copyValue={copy} />
      <div className="flex flex-col gap-2.5">
        <SubLabel>Customer Information</SubLabel>
        <PersonRow icon="person" label="Customer Name" value={name} />
        <PersonRow icon="call" label="Phone Number" value={phone} />
      </div>
      <div className="border-t border-spyne-border pt-3.5">
        <SummaryActionItems summaryText={summaryText} actionItems={actionItems} />
      </div>
    </div>
  )
}

/* ── AI Performance ──────────────────────────────────────────────── */

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[10px]" style={{ color: 'var(--spyne-text-muted)' }}>{label}</p>
      <p className="text-[20px] font-bold leading-tight tabular-nums" style={{ color: value === '—' ? 'var(--spyne-text-muted)' : 'var(--spyne-success-text)' }}>{value}</p>
    </div>
  )
}

function BulletBox({ tone, title, items, icon }) {
  const c = tone === 'success'
    ? { bg: 'var(--spyne-success-subtle)', bd: 'var(--spyne-success-muted)', ink: 'var(--spyne-success-text)' }
    : { bg: 'var(--spyne-warning-subtle)', bd: 'var(--spyne-warning-muted)', ink: 'var(--spyne-warning-text)' }
  return (
    <div className="rounded-lg border px-3 py-2.5" style={{ background: c.bg, borderColor: c.bd }}>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: c.ink }}>{title}</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex gap-1.5 text-[12px] leading-snug" style={{ color: 'var(--spyne-text-secondary)' }}>
            <span className="mt-0.5 inline-flex shrink-0" style={{ color: c.ink }}><MaterialSymbol name={icon} size={14} /></span><span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AiPerformance({ aiQuality }) {
  const q = aiQuality || {}
  const hasAny = q.score != null || q.relevanceClarity != null || q.didWell?.length || q.improve?.length
  if (!hasAny) return null
  const copy = `Overall ${q.score ?? '—'}/10 · Relevance ${q.relevanceClarity ?? '—'}/10`
  return (
    <div className="spyne-card flex flex-col gap-3 p-3.5">
      <SectionHead icon="bolt" title="AI Performance Analysis" copyValue={copy} />
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Overall Score" value={q.score != null ? `${q.score} / 10` : '—'} />
        <Stat label="Relevance & Clarity" value={q.relevanceClarity != null ? `${q.relevanceClarity} / 10` : '—'} />
      </div>
      {q.didWell?.length > 0 && <BulletBox tone="success" title="What AI Did Well" items={q.didWell} icon="check_circle" />}
      {q.improve?.length > 0 && <BulletBox tone="warning" title="Areas for Improvement" items={q.improve} icon="lightbulb" />}
    </div>
  )
}

/* ── Appointment ─────────────────────────────────────────────────── */

function AppointmentBlock({ appointment }) {
  const a = appointment || {}
  // Match prod: an empty appointmentDetails reads as "No appointment scheduled" even when the
  // scheduled flag is set (a callback is surfaced under Next Action, not here).
  const has = (a.details && a.details.length > 0) || !!a.type
  return (
    <div className="spyne-card flex flex-col gap-2.5 p-3.5">
      <SectionHead icon="event" title="Appointment" />
      {has ? (
        <div className="flex flex-col gap-1.5 text-[12.5px]" style={{ color: 'var(--spyne-text-secondary)' }}>
          {a.type ? <p><span className="font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>Type:</span> {a.type}</p> : null}
          {(a.details || []).map((d, i) => <p key={i}>{d}</p>)}
        </div>
      ) : (
        <p className="py-6 text-center text-[12px]" style={{ color: 'var(--spyne-text-muted)' }}>No appointment scheduled</p>
      )}
    </div>
  )
}

/* ── Transcript / Conversation ───────────────────────────────────── */

function MessageTurns({ messages, transcript, isMessaging, scrollToMs }) {
  const markerRef = useRef(null)

  // Parse fallback transcript string ("AI: …\nCustomer: …") when structured messages are absent.
  const turns = useMemo(() => {
    if (Array.isArray(messages) && messages.length) return messages
    return (transcript || '')
      .split('\n').map((l) => l.trim()).filter(Boolean)
      .map((line) => {
        const m = line.match(/^([A-Za-z][\w ]{0,18}):\s*(.*)$/)
        const who = m ? m[1] : ''
        const text = m ? m[2] : line
        return { role: /^(ai|assistant|agent|vini|emily|bot)/i.test(who) ? 'agent' : 'customer', text, atSec: null, atMs: null }
      })
  }, [messages, transcript])

  // The turn nearest the action-item creation time → the SMS scroll target.
  const markerIdx = useMemo(() => {
    if (!isMessaging || !scrollToMs) return -1
    let best = -1, bestD = Infinity
    turns.forEach((m, i) => { if (m.atMs) { const d = Math.abs(m.atMs - scrollToMs); if (d < bestD) { bestD = d; best = i } } })
    return best
  }, [turns, scrollToMs, isMessaging])

  const jumpToMarker = () => markerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  useEffect(() => { if (markerIdx >= 0) { const t = setTimeout(() => markerRef.current?.scrollIntoView({ block: 'center' }), 60); return () => clearTimeout(t) } }, [markerIdx])

  if (!turns.length) return <p className="py-6 text-center text-[12px]" style={{ color: 'var(--spyne-text-muted)' }}>No {isMessaging ? 'conversation' : 'transcript'} available.</p>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SectionHead icon={isMessaging ? 'forum' : 'description'} title={isMessaging ? 'Conversation' : 'Transcript'} copyValue={turns.map((t) => `${t.role === 'agent' ? 'Agent' : 'Customer'}: ${t.text}`).join('\n')} />
      </div>
      {markerIdx >= 0 && (
        <button onClick={jumpToMarker} className="spyne-focus-ring inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors" style={{ background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' }}>
          <MaterialSymbol name="my_location" size={13} /> Jump to where this item was created
        </button>
      )}
      <div className="flex flex-col gap-3">
        {turns.map((m, i) => {
          const agent = m.role === 'agent'
          const isMarker = i === markerIdx
          return (
            <div key={i} ref={isMarker ? markerRef : null} className="flex flex-col gap-2">
              {isMarker && (
                <div className="flex items-center gap-2 py-0.5">
                  <span className="h-px flex-1" style={{ background: 'var(--spyne-primary)' }} />
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide" style={{ background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' }}><MaterialSymbol name="bookmark" size={12} /> Action item created</span>
                  <span className="h-px flex-1" style={{ background: 'var(--spyne-primary)' }} />
                </div>
              )}
              <div className="flex gap-2.5">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[9.5px] font-bold" style={agent ? { background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' } : { background: 'var(--spyne-page-bg)', color: 'var(--spyne-text-muted)' }}>{agent ? 'AI' : 'CU'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] font-bold" style={{ color: agent ? 'var(--spyne-primary)' : 'var(--spyne-text-secondary)' }}>{agent ? 'Agent' : 'Customer'}</span>
                    {m.atSec != null
                      ? <span className="text-[10px] tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>{fmtClock(m.atSec)}</span>
                      : m.atMs ? <span className="text-[10px] tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>{fmtStamp(m.atMs)}</span> : null}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: 'var(--spyne-text-secondary)' }}>{m.text}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Drawer ──────────────────────────────────────────────────────── */

const baseTabs = (msgLabel) => ['Highlights', 'Customer', 'Summary', 'Appointment', msgLabel]

export default function CallConversationDrawer({ item, mode, onClose }) {
  const isMessaging = MESSAGING.has(item?.source_channel)
  const msgLabel = isMessaging ? 'Conversation' : 'Transcript'
  const TABS = baseTabs(msgLabel)

  const [tab, setTab] = useState('Highlights')
  const [viewCallId, setViewCallId] = useState(mode === 'call' ? (item?.source_call_id || null) : null)
  const [smsView, setSmsView] = useState(null) // an SMS conversation object (rendered from inline smsMessages)
  const [report, setReport] = useState(null)
  const [convs, setConvs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Conversation mode: load the customer's conversations (scoped to the embed's department).
  useEffect(() => {
    if (mode !== 'conversation' || !item?.customer_id) return
    let cancelled = false
    setLoading(true); setError(null)
    fetchConversations(item.customer_id)
      .then((r) => {
        if (cancelled) return
        setConvs(r.conversations)
        // Land directly on the conversation this action item was created from.
        const src = (r.conversations || []).find((c) => (c.conversationId || c._id) === item.source_conversation_id)
        if (src) {
          if (src.callId) setViewCallId(src.callId)
          else if (Array.isArray(src.smsMessages) && src.smsMessages.length) setSmsView(src)
        }
      })
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
  const channel = CHANNEL_META[item.source_channel]
  const showCallDetail = !!viewCallId
  const inConvList = mode === 'conversation' && !viewCallId && !smsView
  const scrollToMs = item.created_at ? Date.parse(item.created_at) : null

  const ageMin = report?.createdAt ? Math.floor((Date.now() - Date.parse(report.createdAt)) / 60000) : ageMinutes(item)
  const title = report?.title || report?.outcome || item.intent_recap || (isMessaging ? 'Conversation' : 'Call detail')

  const body = (
    <div className="console-v2-sales-root">
      <div onClick={onClose} className="fixed inset-0 z-[199]" style={{ background: 'rgba(15,23,42,0.45)' }} />
      <div className="spyne-float spyne-animate-slide-up fixed right-0 top-0 z-[200] flex h-full w-[480px] max-w-[94vw] flex-col" style={{ background: 'var(--spyne-surface)' }} role="dialog" aria-modal="true" aria-label={isMessaging ? 'Conversation detail' : 'Call detail'}>
        {/* Header */}
        <div className="flex flex-shrink-0 items-start gap-2.5 border-b border-spyne-border px-4 py-3.5">
          {mode === 'conversation' && (viewCallId || smsView) ? (
            <button onClick={() => { setViewCallId(null); setSmsView(null); setReport(null); setTab('Highlights') }} aria-label="Back to conversations" className="spyne-focus-ring mt-0.5 inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-spyne-page-bg" style={{ color: 'var(--spyne-text-muted)' }}><MaterialSymbol name="arrow_back" size={18} /></button>
          ) : (
            <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-lg" style={{ background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' }}><MaterialSymbol name={isMessaging ? (channel?.symbol || 'forum') : 'call'} size={16} /></span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold leading-snug" style={{ color: 'var(--spyne-text-primary)' }}>{title}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px]" style={{ color: 'var(--spyne-text-muted)' }}>
              <MaterialSymbol name="schedule" size={13} /> {ageLabel(ageMin)}
              {channel ? <span className="inline-flex items-center gap-1">· <MaterialSymbol name={channel.symbol} size={13} /> {channel.label}</span> : null}
              {!isMessaging && report?.durationSec != null ? <span>· {fmtClock(report.durationSec)}</span> : null}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="spyne-focus-ring inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-spyne-page-bg" style={{ color: 'var(--spyne-text-muted)' }}><MaterialSymbol name="close" size={20} /></button>
        </div>

        {loading && <div className="flex flex-1 items-center justify-center text-[12px]" style={{ color: 'var(--spyne-text-muted)' }}>Loading…</div>}
        {error && !loading && <div className="flex flex-1 items-center justify-center px-6 text-center text-[12px]" style={{ color: 'var(--spyne-danger-text)' }}>Couldn’t load detail: {error}</div>}

        {/* Conversation list (pick a thread to open) */}
        {!loading && !error && inConvList && (
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>{name}'s conversations</p>
            {(convs || []).length === 0 ? (
              <p className="text-[12px]" style={{ color: 'var(--spyne-text-muted)' }}>No conversations found.</p>
            ) : (
              (convs || []).map((c) => {
                const isThis = (c.conversationId || c._id) === item.source_conversation_id
                const smsCount = Array.isArray(c.smsMessages) ? c.smsMessages.length : 0
                const isSms = (c.type === 'sms' || c.type === 'chat') || (!c.callId && smsCount > 0)
                const openable = !!c.callId || smsCount > 0
                const lastSms = smsCount > 0 ? (c.smsMessages.find((m) => (m.body || m.message))?.body || '') : ''
                const open = () => { if (c.callId) setViewCallId(c.callId); else if (smsCount > 0) setSmsView(c) }
                return (
                  <button key={c.conversationId || c._id} onClick={open} disabled={!openable}
                    className="spyne-card flex flex-col gap-1 p-3 text-left transition-colors hover:border-spyne-primary disabled:cursor-not-allowed disabled:opacity-50"
                    style={isThis ? { borderColor: 'var(--spyne-primary)' } : undefined}>
                    <div className="flex items-center gap-2">
                      <span className="spyne-badge spyne-badge-neutral inline-flex items-center gap-1" style={{ fontSize: 10 }}><MaterialSymbol name={isSms ? 'sms' : 'call'} size={12} /> {c.type || (isSms ? 'sms' : 'call')}</span>
                      {isThis ? <span className="spyne-badge" style={{ fontSize: 10, background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' }}>this item</span> : null}
                      <span className="ml-auto text-[10px]" style={{ color: 'var(--spyne-text-muted)' }}>{c.status}</span>
                    </div>
                    <span className="text-[12.5px] font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{c.callTitle || (isSms ? 'SMS conversation' : 'Conversation')}</span>
                    {c.summary ? <span className="line-clamp-2 text-[11.5px]" style={{ color: 'var(--spyne-text-muted)' }}>{Array.isArray(c.summary) ? c.summary.join(' ') : c.summary}</span>
                      : lastSms ? <span className="line-clamp-2 text-[11.5px]" style={{ color: 'var(--spyne-text-muted)' }}>{lastSms}</span> : null}
                    {openable ? <span className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: 'var(--spyne-primary)' }}><MaterialSymbol name={isSms ? 'forum' : 'play_circle'} size={13} /> Open {isSms ? `conversation${smsCount ? ` · ${smsCount} msgs` : ''}` : 'call'}</span>
                      : <span className="mt-0.5 text-[10px]" style={{ color: 'var(--spyne-text-muted)' }}>No transcript available</span>}
                  </button>
                )
              })
            )}
          </div>
        )}

        {/* Detail */}
        {!loading && !error && showCallDetail && (
          <>
            {/* Audio player — calls only (hidden for SMS/chat) */}
            {!isMessaging && report?.recordingUrl ? (
              <div className="flex-shrink-0 border-b border-spyne-border px-4 py-3">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls preload="none" src={report.recordingUrl} className="w-full" style={{ height: 36 }} />
              </div>
            ) : null}

            <div className="flex flex-shrink-0 gap-3 overflow-x-auto border-b border-spyne-border px-4">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} className="spyne-focus-ring -mb-px shrink-0 border-b-2 py-2 text-[12px] font-semibold transition-colors" style={{ borderColor: tab === t ? 'var(--spyne-primary)' : 'transparent', color: tab === t ? 'var(--spyne-primary)' : 'var(--spyne-text-muted)' }}>{t}</button>
              ))}
            </div>

            <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-4">
              {tab === 'Highlights' && (
                <>
                  <CallIdRow callId={viewCallId} />
                  <KeyHighlights points={report?.summaryPoints} />
                  <CustomerInfoSummary name={name} phone={phone} summaryText={report?.summaryText} actionItems={report?.actionItems} />
                </>
              )}
              {tab === 'Customer' && (
                <>
                  <CustomerInfoSummary name={name} phone={phone} summaryText={report?.summaryText} actionItems={report?.actionItems} />
                  <AiPerformance aiQuality={report?.aiQuality} />
                </>
              )}
              {tab === 'Summary' && (
                <>
                  <div className="spyne-card flex flex-col gap-3.5 p-3.5">
                    <SummaryActionItems summaryText={report?.summaryText} actionItems={report?.actionItems} />
                  </div>
                  <AiPerformance aiQuality={report?.aiQuality} />
                  <AppointmentBlock appointment={report?.appointment} />
                  <MessageTurns messages={report?.messages} transcript={report?.transcript} isMessaging={isMessaging} scrollToMs={scrollToMs} />
                </>
              )}
              {tab === 'Appointment' && <AppointmentBlock appointment={report?.appointment} />}
              {tab === msgLabel && <MessageTurns messages={report?.messages} transcript={report?.transcript} isMessaging={isMessaging} scrollToMs={scrollToMs} />}
            </div>
          </>
        )}

        {/* SMS / chat conversation detail — rendered from inline smsMessages (no audio, no report tabs) */}
        {!loading && !error && smsView && (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {(smsView.summary) ? (
              <div className="spyne-card flex flex-col gap-1.5 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>Summary</p>
                <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--spyne-text-secondary)' }}>{Array.isArray(smsView.summary) ? smsView.summary.join(' ') : smsView.summary}</p>
              </div>
            ) : null}
            <MessageTurns messages={smsTurns(smsView)} isMessaging scrollToMs={scrollToMs} />
          </div>
        )}
      </div>
    </div>
  )
  return createPortal(body, document.body)
}
