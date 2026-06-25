"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X, Phone, Mail, MessageSquare, Car, Wrench, MapPin, RefreshCw, Tag, MessagesSquare, Hash, Copy, Check, PhoneCall,
} from "lucide-react";
import type { Meeting } from "@/lib/appointments/types";
import type { IframeConfig } from "@/lib/appointments/config";
import CallDetailDrawer from "./call-drawer/CallDetailDrawer";
import { fetchConversation, type ChatMessage, type Conversation } from "@/lib/appointments/api";
import {
  customerName, fmtTime, fmtTimeRange, fmtDateLong, fmtDateShort, fmtPhone, fmtSource, fmtTransport,
  customerEmail, customerStanding, vehicleFor, vehicleLabel, vin, assigneeName, isServiceType,
} from "@/lib/appointments/format";
import { useTz } from "@/lib/appointments/tz";
import { humanize } from "@/lib/appointments/status";
import { StatusChip, Chip } from "./ui";

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.07em] text-[#9ca3af]">{children}</p>;
}
function Divider() {
  return <div className="h-px bg-[#f0f0f0]" />;
}

function CopyableId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      title="Copy to clipboard"
      className="inline-flex max-w-full items-center gap-1 rounded-md border border-[#e5e7eb] bg-[#fafafa] px-1.5 py-0.5 font-mono text-[10.5px] text-[#374151] hover:bg-[#f3f4f6]"
    >
      <span className="max-w-[150px] truncate">{value}</span>
      {copied ? <Check size={11} className="flex-shrink-0 text-[#16a34a]" /> : <Copy size={11} className="flex-shrink-0 text-[#9ca3af]" />}
    </button>
  );
}

function MessageBubble({ msg, tz }: { msg: ChatMessage; tz?: string }) {
  if (msg.role === "system") {
    return <p className="py-0.5 text-center text-[10.5px] text-[#9ca3af]">{msg.content}</p>;
  }
  const isAgent = msg.role === "ai";
  return (
    <div className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-1.5 text-[12px] leading-snug ${
          isAgent ? "bg-[#f3eaff] text-[#4c2389]" : "bg-[#f3f4f6] text-[#374151]"
        }`}
      >
        {msg.content}
      </div>
      {msg.timestamp && <span className="mt-0.5 px-1 text-[9.5px] text-[#9ca3af]">{fmtTime(msg.timestamp, tz)}</span>}
    </div>
  );
}

export default function DetailDrawer({
  meeting,
  config,
  onClose,
}: {
  meeting: Meeting | null;
  config: IframeConfig | null;
  onClose: () => void;
}) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const dtz = useTz();

  /* eslint-disable react-hooks/set-state-in-effect -- reset on meeting change + loading while transcript fetches */
  useEffect(() => {
    setCallOpen(false); // close any stale call drawer when the appointment changes
    // Calls use the call-report drawer (separate endpoint), so skip the messages
    // API entirely for them — only SMS/chat conversations load inline here.
    if (meeting?.callId || !meeting?.conversationId) {
      setConversation(null);
      return;
    }
    let cancelled = false;
    setLoadingTx(true);
    fetchConversation(config, meeting)
      .then((conv) => {
        if (cancelled) return;
        setConversation(conv);
        setTxError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setTxError(e instanceof Error ? e.message : "Couldn't load conversation");
      })
      .finally(() => {
        if (!cancelled) setLoadingTx(false);
      });
    return () => {
      cancelled = true;
    };
  }, [meeting, config]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!meeting) return null;
  if (typeof document === "undefined") return null;

  const m = meeting;
  const service = isServiceType(m.serviceType);
  const v = vehicleFor(m);
  const phone = m.customerData?.mobileNumber;
  const email = customerEmail(m);
  const standing = customerStanding(m);
  const services = m.servicesRequested ?? [];
  const notes = m.notes ?? [];
  const tradeReq = m.meta?.tradeInData?.tradeRequested;
  const tags = m.tags ?? [];

  const panel = (
    <div>
      <div onClick={onClose} className="animate-overlay-in fixed inset-0 z-[59] bg-black/25" />
      <aside className="animate-drawer-in fixed right-0 top-0 bottom-0 z-[60] flex w-[400px] max-w-full flex-col overflow-y-auto border-l border-[#e5e7eb] bg-white">
        {/* header */}
        <div className="sticky top-0 z-10 flex-shrink-0 border-b border-[#f0f0f0] bg-white px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <Chip value={service ? "service" : "sales"} />
                {m.intent && <Chip value={m.intent} />}
                <StatusChip value={m.status} />
              </div>
              <h2 className="truncate text-[18px] font-bold text-[#111]">{customerName(m)}</h2>
              <p className="mt-1 text-[12.5px] text-[#6b7280]">
                {fmtDateLong(m.meetingStartTime, dtz ?? m.timezone)} · {fmtTimeRange(m, dtz ?? m.timezone)}
              </p>
              <p className="mt-0.5 text-[12px] text-[#9ca3af]">
                {assigneeName(m)}
                {m.source ? ` · ${fmtSource(m.source)}` : ""}
              </p>
            </div>
            <button onClick={onClose} className="flex-shrink-0 rounded-md p-1 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#111]">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5">
          {/* vehicle */}
          <div>
            <Label>{service ? "Service vehicle" : "Vehicle of interest"}</Label>
            <div className="flex items-start gap-2.5">
              <Car size={15} className="mt-0.5 flex-shrink-0 text-[#9ca3af]" />
              {v ? (
                <div>
                  <p className="text-[14px] font-semibold text-[#111]">{vehicleLabel(v) || "Vehicle"}</p>
                  {vin(v) && <p className="mt-0.5 font-mono text-[11px] text-[#6b7280]">VIN {vin(v)}</p>}
                  {v.price ? <p className="mt-0.5 text-[12px] text-[#6b7280]">{String(v.price)}</p> : null}
                </div>
              ) : (
                <p className="text-[13px] text-[#9ca3af]">{service ? "No vehicle on file" : "No specific vehicle yet"}</p>
              )}
            </div>
          </div>

          {/* services (service) */}
          {service && (services.length > 0 || m.transportationOption) && (
            <>
              <Divider />
              <div>
                <Label>Services requested</Label>
                {services.length > 0 ? (
                  <ul className="flex flex-col gap-1.5">
                    {services.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-[13px] text-[#374151]">
                        <Wrench size={13} className="flex-shrink-0 text-[#9ca3af]" />
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-[#9ca3af]">None specified</p>
                )}
                {m.transportationOption && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[11px] text-[#9ca3af]">Transportation:</span>
                    <span className="inline-flex items-center rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10.5px] font-semibold text-[#3730a3]">
                      {fmtTransport(m.transportationOption)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* trade-in / tags (sales) */}
          {!service && (tradeReq || tags.length > 0) && (
            <>
              <Divider />
              <div>
                <Label>Appointment content</Label>
                {tradeReq && (
                  <div className="mb-2 flex items-center gap-2 text-[13px] text-[#374151]">
                    <RefreshCw size={13} className="text-[#9ca3af]" />
                    {/^(yes|true|y|1)$/i.test(String(tradeReq)) ? "Trade-in requested" : "No trade-in requested"}
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tags.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10.5px] font-medium text-[#6b7280]">
                        <Tag size={9} /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <Divider />
          {/* customer */}
          <div>
            <Label>Customer</Label>
            <div className="flex flex-col gap-2">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2 text-[13px] font-semibold text-[#813fed]">
                  <Phone size={13} /> {fmtPhone(phone)}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-2 truncate text-[13px] font-semibold text-[#813fed]">
                  <Mail size={13} className="flex-shrink-0" /> <span className="truncate">{email}</span>
                </a>
              )}
              {m.source && (
                <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                  <MapPin size={13} className="text-[#9ca3af]" /> Source: {fmtSource(m.source)}
                </div>
              )}
              {standing && <div className="text-[12px] text-[#9ca3af]">{standing}</div>}
              {m.externalCrmAppointmentId && (
                <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
                  <Hash size={13} className="flex-shrink-0 text-[#9ca3af]" />
                  <span className="flex-shrink-0">External appt ID</span>
                  <CopyableId value={m.externalCrmAppointmentId} />
                </div>
              )}
            </div>
          </div>

          {/* notes */}
          {notes.length > 0 && (
            <>
              <Divider />
              <div>
                <Label>Notes</Label>
                <div className="flex flex-col gap-1">
                  {notes.map((n, i) => (
                    <p key={i} className="text-[13px] leading-relaxed text-[#374151]">{n}</p>
                  ))}
                </div>
              </div>
            </>
          )}

          <Divider />
          {/* booking conversation */}
          <div>
            <Label>
              <span className="inline-flex items-center gap-1">
                <MessagesSquare size={11} className="text-[#813fed]" /> Booking conversation
              </span>
            </Label>
            {m.callId ? (
              // A call: the rich call-report drawer holds the recording + transcript,
              // so we surface a CTA here regardless of the (call-less) messages fetch.
              <button
                onClick={() => setCallOpen(true)}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[12px] font-semibold text-[#813fed] hover:bg-[#faf8ff]"
              >
                <PhoneCall size={13} /> View call details
              </button>
            ) : !m.conversationId ? (
              <p className="text-[12px] text-[#9ca3af]">
                Booked via {fmtSource(m.source) || "CRM"} — no agent conversation.
              </p>
            ) : loadingTx ? (
              <p className="text-[12px] text-[#9ca3af]">Loading conversation…</p>
            ) : txError ? (
              <p className="text-[12px] text-[#dc2626]">{txError}</p>
            ) : !conversation || conversation.messages.length === 0 ? (
              <p className="text-[12px] text-[#9ca3af]">No messages.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#9ca3af]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-semibold text-[#3730a3]">
                    {conversation.type === "call" ? <Phone size={10} /> : <MessageSquare size={10} />}
                    {conversation.type === "call" ? "Call" : conversation.type === "sms" ? "SMS" : humanize(conversation.type)}
                  </span>
                  {conversation.status && <StatusChip value={conversation.status} dot={false} />}
                  {conversation.createdAt && (
                    <span>{fmtDateShort(conversation.createdAt, dtz ?? m.timezone)} · {fmtTime(conversation.createdAt, dtz ?? m.timezone)}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2 rounded-xl bg-[#fafafa] p-3">
                  {conversation.messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} tz={dtz ?? m.timezone} />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </aside>
      <CallDetailDrawer
        call={m.callId ? { call_id: m.callId } : null}
        config={config}
        open={callOpen}
        onClose={() => setCallOpen(false)}
      />
    </div>
  );

  return createPortal(panel, document.body);
}
