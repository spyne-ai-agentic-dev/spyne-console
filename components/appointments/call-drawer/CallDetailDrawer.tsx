"use client";

/* Ported from spyne-console-microfrontends (apps/converse-ai/components/Call-Logs/sidebar.tsx).
   Adaptations: Redux timezone -> useTz(); env fetch -> fetchCallReport via our
   config/Bearer; WaveformPlayer -> SimpleAudioPlayer (same ref API); layered
   z-index so it sits over the appointment drawer. */
/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect -- faithful port of console BlankCallDrawer */

import type { CallRecord, CallReportData } from "@/types/call-record";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaBolt, FaCalendar, FaClock, FaCopy, FaFileAlt, FaTimes, FaUser } from "react-icons/fa";
import { IoMdCall } from "react-icons/io";
import { MdOutlineError } from "react-icons/md";

import type { IframeConfig } from "@/lib/appointments/config";
import { fetchCallReport } from "@/lib/appointments/api";
import { convertToCdnUrl, copyToClipboard, formatTime, getTimeAgo } from "@/lib/appointments/call-utils";
import { useTz } from "@/lib/appointments/tz";

import {
  DRAWER_TABS,
  SIDEBAR_SECTIONS,
  getMessageRoleBadge,
  getMessageRoleLabel,
  getScoreColor,
} from "./constants";
import SimpleAudioPlayer, { WaveformPlayerRef } from "./simple-audio-player";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MdOutlineError,
  FaUser,
  FaBolt,
  FaCalendar,
  FaFileAlt,
};

const getIconComponent = (iconName: string) => ICON_MAP[iconName] || null;

interface CallDetailDrawerProps {
  call: CallRecord | null;
  config: IframeConfig | null;
  open: boolean;
  onClose: () => void;
  scrollToActionItems?: boolean;
}

interface SectionHeaderProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onCopy: () => void;
  isCopied: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ label, icon: Icon, onCopy, isCopied }) => (
  <h3 className="mb-4 flex items-center justify-between text-sm font-medium text-gray-900">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gray-700/30" />
      {label}
    </div>
    <button
      onClick={onCopy}
      className="h-8 w-8 rounded-md p-0 hover:bg-gray-100"
      title={isCopied ? "Copied!" : `Copy ${label.toLowerCase()}`}
    >
      <FaCopy className={`h-4 w-4 ${isCopied ? "text-green-500" : "text-gray-500"}`} />
    </button>
  </h3>
);

export default function CallDetailDrawer({ call, config, open, onClose, scrollToActionItems }: CallDetailDrawerProps) {
  const timezone = useTz();
  const [activeTab, setActiveTab] = useState("highlights");
  const [reportData, setReportData] = useState<CallReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const actionItemsRef = useRef<HTMLDivElement>(null);
  const waveformPlayerRef = useRef<WaveformPlayerRef>(null);
  const isInitializingRef = useRef(false);
  const transcriptRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const playTriggeredFromTranscriptRef = useRef(false);

  const handleCopyToClipboard = useCallback((text: string, section: string) => {
    copyToClipboard(
      text,
      () => {
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
      },
      (err) => {
        console.error("Copy failed:", err);
      },
    );
  }, []);

  const handleTranscriptClick = useCallback((secondsFromStart: number) => {
    if (waveformPlayerRef.current) {
      playTriggeredFromTranscriptRef.current = true;
      waveformPlayerRef.current.seek(secondsFromStart);
      waveformPlayerRef.current.play();
    }
  }, []);

  const handleAudioTimeUpdate = useCallback((time: number) => {
    setCurrentAudioTime(time);
  }, []);

  const handleAudioPlay = useCallback(() => {
    setIsAudioPlaying(true);
    setActiveTab("transcript");
    const playerId = `sidebar-${call?.call_id}`;
    window.dispatchEvent(new CustomEvent("audio-play-started", { detail: playerId }));
    if (!playTriggeredFromTranscriptRef.current) {
      setTimeout(() => {
        const transcriptSection = document.getElementById("section-transcript");
        if (transcriptSection) {
          transcriptSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
    playTriggeredFromTranscriptRef.current = false;
  }, [call?.call_id]);

  const handleAudioPause = useCallback(() => {
    setIsAudioPlaying(false);
  }, []);

  useEffect(() => {
    const playerId = `sidebar-${call?.call_id}`;
    const handleStopOthers = (e: CustomEvent) => {
      if (e.detail !== playerId && isAudioPlaying) {
        waveformPlayerRef.current?.pause();
        setIsAudioPlaying(false);
      }
    };

    window.addEventListener("audio-play-started" as keyof WindowEventMap, handleStopOthers as EventListener);
    return () => {
      window.removeEventListener("audio-play-started" as keyof WindowEventMap, handleStopOthers as EventListener);
    };
  }, [call?.call_id, isAudioPlaying]);

  useEffect(() => {
    if (open && call?.call_id) {
      if (isInitializingRef.current) return;

      isInitializingRef.current = true;
      setIsLoading(true);
      setError(null);
      setReportData(null);
      setIsAudioPlaying(false);
      setCurrentAudioTime(0);
      playTriggeredFromTranscriptRef.current = false;

      fetchCallReport(config, call.call_id)
        .then((data) => {
          setReportData(data);
          if (!data) {
            setError("No report data available");
          }
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
          isInitializingRef.current = false;
        });
    } else if (!open) {
      setReportData(null);
      setActiveTab("highlights");
      isInitializingRef.current = false;
      setIsAudioPlaying(false);
      setCurrentAudioTime(0);
      playTriggeredFromTranscriptRef.current = false;
    }
  }, [open, call?.call_id]);

  useEffect(() => {
    if (open && scrollToActionItems && !isLoading && actionItemsRef.current) {
      const timer = setTimeout(() => {
        actionItemsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, scrollToActionItems, isLoading]);

  useEffect(() => {
    if (!open || isLoading) return;

    const visibleSections = new Set<string>();

    const observerOptions = {
      root: contentRef.current,
      rootMargin: "-10% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.id.replace("section-", "");
        if (entry.isIntersecting) {
          visibleSections.add(sectionId);
        } else {
          visibleSections.delete(sectionId);
        }
      });

      requestAnimationFrame(() => {
        if (isAudioPlaying) {
          setActiveTab("transcript");
          return;
        }

        for (const tab of DRAWER_TABS) {
          if (visibleSections.has(tab.id)) {
            setActiveTab(tab.id);
            return;
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const elements: Element[] = [];
    DRAWER_TABS.forEach((tab) => {
      const element = document.getElementById(`section-${tab.id}`);
      if (element) {
        observer.observe(element);
        elements.push(element);
      }
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      visibleSections.clear();
    };
  }, [open, isLoading, isAudioPlaying]);

  const callData = useMemo(() => {
    const rawRecordingUrl = reportData?.callDetails?.recordingUrl || call?.recordingUrl || "";
    return {
      customerName:
        reportData?.callDetails?.name || reportData?.leadDetails?.customer_name || "Unknown",
      phoneNumber:
        reportData?.callDetails?.mobile || reportData?.leadDetails?.mobile_number || "N/A",
      recordingUrl: convertToCdnUrl(rawRecordingUrl),
      summary: reportData?.callDetails?.analysis?.summary || call?.summary || "",
      actionItems: Array.isArray(reportData?.report?.actionItems) ? reportData.report.actionItems : [],
      highlights: Array.isArray(reportData?.report?.summary) ? reportData.report.summary : [],
      aiScore: reportData?.aiResponseQualityScore || call?.ai_score || 0,
      aiMetrics: reportData?.report?.overview?.overall?.aiResponseQuality,
      messages: Array.isArray(reportData?.callDetails?.messages) ? reportData.callDetails.messages : [],
      appointmentDetails: Array.isArray(reportData?.report?.overview?.appointmentDetails)
        ? reportData.report.overview.appointmentDetails
        : [],
      appointmentType: reportData?.report?.overview?.appointmentType || "",
      appointmentScheduled: reportData?.report?.overview?.appointmentScheduled || "No",
      createdAt: reportData?.createdAt || "",
    };
  }, [reportData, call]);

  const {
    customerName,
    phoneNumber,
    recordingUrl,
    summary,
    actionItems,
    highlights,
    aiScore,
    aiMetrics,
    messages,
    appointmentDetails,
    appointmentType,
    appointmentScheduled,
  } = callData;

  const callForRelativeTime = useMemo((): CallRecord | null => {
    if (!call) return null;
    const endedAt = reportData?.callDetails?.endedAt || reportData?.createdAt || call.ended_at;
    return { ...call, ...(endedAt ? { ended_at: endedAt } : {}) };
  }, [call, reportData?.callDetails?.endedAt, reportData?.createdAt]);

  const relativeTimeLabel = useMemo(() => {
    if (!callForRelativeTime) return "N/A";
    const raw = getTimeAgo(callForRelativeTime, timezone);
    if (raw === "Recently") return "Recently";
    if (raw === "just now") return "Just now";
    return `${raw} ago`;
  }, [callForRelativeTime, timezone]);

  const activeTranscriptIndex = useMemo(() => {
    if (!isAudioPlaying || messages.length === 0) return -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].secondsFromStart <= currentAudioTime) {
        return i;
      }
    }
    return -1;
  }, [currentAudioTime, messages, isAudioPlaying]);

  useEffect(() => {
    if (activeTranscriptIndex >= 0 && isAudioPlaying) {
      const element = transcriptRefs.current.get(activeTranscriptIndex);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeTranscriptIndex, isAudioPlaying]);

  if (!call || !open) return null;

  return (
    <>
      <div onClick={onClose} className="animate-overlay-in fixed inset-0 z-[79] bg-black/30" />
      <div
        className={`fixed right-0 top-0 z-[80] flex h-screen w-[500px] max-w-full transform flex-col bg-white shadow-2xl transition-all duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex-none border-b border-gray-100 bg-white">
          <div className="px-6 pb-6 pt-4">
            <div className="flex items-start gap-3 pt-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <IoMdCall className="h-6 w-6 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="mb-2 break-words text-xl font-semibold text-gray-900">
                  {reportData?.report?.title || "Call received but the customer did not speak"}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <FaClock className="h-4 w-4" />
                    <span>{relativeTimeLabel}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-6 pb-4">
            <SimpleAudioPlayer
              key={call?.call_id}
              ref={waveformPlayerRef}
              url={recordingUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onPlay={handleAudioPlay}
              onPause={handleAudioPause}
            />
          </div>

          <div className="border-b border-gray-100 bg-white px-6">
            <nav className="flex space-x-3 overflow-x-auto">
              {DRAWER_TABS.map((tab: { id: string; label: string }) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    const element = document.getElementById(`section-${tab.id}`);
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-[#4600f2] text-[#4600f2]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div ref={contentRef} className="flex-1 overflow-y-auto bg-gray-50/50 px-6 py-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-[#4600f2]" />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-900">
                  <IoMdCall className="h-4 w-4 text-gray-700/30" />
                  Call ID
                </h3>

                <div
                  className="flex w-full items-center gap-2 rounded-[8px] bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700"
                  title={call.call_id}
                >
                  <span className="min-w-0 flex-1 truncate font-mono">{call.call_id}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(call.call_id, "callId")}
                    className="flex-shrink-0 rounded p-0.5 transition-colors hover:bg-gray-200"
                    title={copiedSection === "callId" ? "Copied!" : "Copy Call ID"}
                  >
                    <FaCopy className={`h-3.5 w-3.5 ${copiedSection === "callId" ? "text-green-500" : "text-gray-500"}`} />
                  </button>
                </div>
              </div>

              <div id="section-highlights" className="space-y-3">
                <SectionHeader
                  label={SIDEBAR_SECTIONS[0].label}
                  icon={getIconComponent(SIDEBAR_SECTIONS[0].icon)!}
                  onCopy={() => handleCopyToClipboard(highlights.join("\n"), "highlights")}
                  isCopied={copiedSection === "highlights"}
                />

                <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-5">
                  {highlights.length > 0 ? (
                    <ul className="space-y-4">
                      {highlights.map((highlight, index) => (
                        <li key={index} className="flex gap-4">
                          <span className="mt-0.5 w-4 flex-shrink-0 text-sm font-medium text-gray-400">{index + 1}.</span>
                          <span className="text-sm leading-relaxed text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No highlights available</p>
                  )}
                </div>
              </div>

              <div id="section-customer" className="space-y-3">
                <SectionHeader
                  label={SIDEBAR_SECTIONS[1].label}
                  icon={getIconComponent(SIDEBAR_SECTIONS[1].icon)!}
                  onCopy={() =>
                    handleCopyToClipboard(
                      `Customer: ${customerName}\nPhone: ${phoneNumber}\nSummary: ${summary}\nAction Items: ${actionItems.join(", ")}`,
                      "customer",
                    )
                  }
                  isCopied={copiedSection === "customer"}
                />

                <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                      <FaUser className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Customer Information</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#DAEAFE]">
                        <FaUser className="h-4 w-4 text-[#5c97df]" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 text-xs font-medium text-gray-500">Customer Name</div>
                        <div className="text-sm font-medium text-gray-900">{customerName}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                        <IoMdCall className="h-4 w-4 text-[#5c97df]" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 text-xs font-medium text-gray-500">Phone Number</div>
                        <div className="font-mono text-sm text-gray-900">{phoneNumber}</div>
                      </div>
                    </div>
                  </div>

                  <div id="section-summary" className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                      <FaFileAlt className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Summary & Action Items</span>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Call Summary</div>
                        <div className="text-sm leading-relaxed text-gray-900">{summary || "No summary available"}</div>
                      </div>

                      {actionItems.length > 0 && (
                        <div ref={actionItemsRef} className="rounded-r-lg border-l-4 border-[#4600f2] bg-[#4600f2]/5 p-4">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#4600f2]">Next Action Required</div>
                          <div className="text-sm leading-relaxed text-gray-900">
                            <ul className="space-y-1">
                              {actionItems.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="mt-0 text-[#4600f2]">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div id="section-ai" className="space-y-3">
                <SectionHeader
                  label={SIDEBAR_SECTIONS[2].label}
                  icon={getIconComponent(SIDEBAR_SECTIONS[2].icon)!}
                  onCopy={() =>
                    handleCopyToClipboard(
                      `AI Score: ${aiMetrics?.score || aiScore}/10\nWhat AI Did Well: ${aiMetrics?.whatAiDidBetter?.join(", ") || "N/A"}\nAreas for Improvement: ${aiMetrics?.whatAiCouldHaveDoneBetter?.join(", ") || "N/A"}`,
                      "ai",
                    )
                  }
                  isCopied={copiedSection === "ai"}
                />

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="mb-1 text-xs font-medium text-gray-500">Overall Score</div>
                      <div className={`text-lg font-semibold ${getScoreColor(aiScore)}`}>
                        {aiMetrics?.score || aiScore} / 10
                      </div>
                    </div>
                    {aiMetrics?.metrics?.responseRelevanceAndClarity && (
                      <div>
                        <div className="mb-1 text-xs font-medium text-gray-500">Relevance & Clarity</div>
                        <div className="text-lg font-semibold text-green-600">
                          {aiMetrics.metrics.responseRelevanceAndClarity} / 10
                        </div>
                      </div>
                    )}
                  </div>

                  {aiMetrics?.whatAiDidBetter && aiMetrics.whatAiDidBetter.length > 0 && (
                    <div className="mb-4 rounded-r-lg border-l-4 border-green-500 bg-green-500/5 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">What AI Did Well</div>
                      <ul className="space-y-1">
                        {aiMetrics.whatAiDidBetter.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-900">
                            <span className="mt-0 text-green-600">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiMetrics?.whatAiCouldHaveDoneBetter && aiMetrics.whatAiCouldHaveDoneBetter.length > 0 && (
                    <div className="rounded-r-lg border-l-4 border-orange-500 bg-orange-500/5 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600">Areas for Improvement</div>
                      <ul className="space-y-1">
                        {aiMetrics.whatAiCouldHaveDoneBetter.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-900">
                            <span className="mt-0 text-orange-600">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div id="section-appointment" className="space-y-3">
                <SectionHeader
                  label={SIDEBAR_SECTIONS[3].label}
                  icon={getIconComponent(SIDEBAR_SECTIONS[3].icon)!}
                  onCopy={() =>
                    handleCopyToClipboard(
                      `Appointment Scheduled: ${appointmentScheduled}\nType: ${appointmentType || "N/A"}\nDetails: ${appointmentDetails.join(", ") || "N/A"}`,
                      "appointment",
                    )
                  }
                  isCopied={copiedSection === "appointment"}
                />

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  {appointmentScheduled === "Yes" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="mb-1 text-xs font-medium text-gray-500">Type</div>
                          <div className="text-sm capitalize text-gray-900">{appointmentType || "N/A"}</div>
                        </div>
                        <div>
                          <div className="mb-1 text-xs font-medium text-gray-500">Status</div>
                          <div className="text-sm font-medium text-green-600">Scheduled</div>
                        </div>
                        {appointmentDetails.length > 0 && (
                          <div>
                            <div className="mb-1 text-xs font-medium text-gray-500">Details</div>
                            <div className="text-sm text-gray-900">{appointmentDetails[0]}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm text-gray-500">No appointment scheduled</p>
                    </div>
                  )}
                </div>
              </div>

              <div id="section-transcript" className="space-y-3">
                <SectionHeader
                  label={SIDEBAR_SECTIONS[4].label}
                  icon={getIconComponent(SIDEBAR_SECTIONS[4].icon)!}
                  onCopy={() =>
                    handleCopyToClipboard(
                      messages
                        .map(
                          (msg) =>
                            `[${formatTime(msg.secondsFromStart)}] ${msg.role === "bot" || msg.role === "assistant" ? "Agent" : "Customer"}: ${msg.message}`,
                        )
                        .join("\n"),
                      "transcript",
                    )
                  }
                  isCopied={copiedSection === "transcript"}
                />

                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.map((msg, index) => {
                      const isActive = activeTranscriptIndex === index;
                      return (
                        <div
                          key={index}
                          ref={(el) => {
                            if (el) {
                              transcriptRefs.current.set(index, el);
                            } else {
                              transcriptRefs.current.delete(index);
                            }
                          }}
                          onClick={() => handleTranscriptClick(msg.secondsFromStart)}
                          className={`cursor-pointer overflow-hidden rounded-xl border p-4 transition-all ${
                            isActive
                              ? "border-[#4600f2] bg-[#4600f2]/10 shadow-md ring-2 ring-[#4600f2]/30"
                              : "border-gray-200 bg-gray-50 hover:border-[#4600f2] hover:bg-[#4600f2]/5"
                          }`}
                          title="Click to jump to this point in audio"
                        >
                          <div className="flex gap-3">
                            <div
                              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                isActive
                                  ? "bg-[#4600f2] text-white"
                                  : `${getMessageRoleBadge(msg.role).bgClass} ${getMessageRoleBadge(msg.role).textClass}`
                              }`}
                            >
                              {getMessageRoleBadge(msg.role).label}
                            </div>
                            <div className="flex-1">
                              <div className="mb-2 flex items-baseline gap-3">
                                <span className={`font-semibold ${isActive ? "text-[#4600f2]" : "text-gray-900"}`}>
                                  {getMessageRoleLabel(msg.role)}
                                </span>
                                <span className={`text-xs ${isActive ? "font-medium text-[#4600f2]" : "text-[#4600f2]"} hover:underline`}>
                                  {formatTime(msg.secondsFromStart)}
                                </span>
                              </div>
                              <div className={`leading-relaxed ${isActive ? "text-gray-800" : "text-gray-700"}`}>{msg.message}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center">
                      <FaFileAlt className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                      <p className="text-sm text-gray-500">No transcript available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
