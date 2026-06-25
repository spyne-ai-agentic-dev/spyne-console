// Ported from spyne-console-microfrontends (apps/converse-ai/lib/call-utils-extended.ts)
// — the helpers the call-details drawer uses, verbatim.

import type { CallRecord } from "@/types/call-record";

// VAPI recordings live on S3 but are served via CloudFront; rewrite the host.
export function convertToCdnUrl(s3Url: string): string {
  if (!s3Url) return "";

  if (s3Url.includes("d1dm0o5huagnd6.cloudfront.net")) {
    return s3Url;
  }

  const s3BaseUrl = "https://spyne-prod-conversational-ai.s3.us-east-1.amazonaws.com/vapi-recording/";
  const cdnBaseUrl = "https://d1dm0o5huagnd6.cloudfront.net/vapi-recording/";

  if (s3Url.startsWith(s3BaseUrl)) {
    const filename = s3Url.replace(s3BaseUrl, "");
    return `${cdnBaseUrl}${filename}`;
  }

  return s3Url;
}

export const getTimeAgo = (call: CallRecord, timezone?: string | null) => {
  if (!call.ended_at) return "Recently";

  const callEndTime = new Date(call.ended_at);
  let diffMs: number;

  if (timezone) {
    const nowInTz = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
    const callEndInTz = new Date(callEndTime.toLocaleString("en-US", { timeZone: timezone }));
    diffMs = nowInTz.getTime() - callEndInTz.getTime();
  } else {
    diffMs = new Date().getTime() - callEndTime.getTime();
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  } else if (diffHours < 24) {
    return `${diffHours} hr${diffHours > 1 ? "s" : ""}`;
  } else {
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  }
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const copyToClipboard = async (
  text: string,
  onSuccess: () => void,
  onError?: (err: Error) => void,
): Promise<void> => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      onSuccess();
    } catch {
      fallbackCopyToClipboard(text, onSuccess, onError);
    }
  } else {
    fallbackCopyToClipboard(text, onSuccess, onError);
  }
};

export const fallbackCopyToClipboard = (
  text: string,
  onSuccess: () => void,
  onError?: (err: Error) => void,
): void => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    onSuccess();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Fallback copy failed:", error);
    onError?.(error);
  }
  document.body.removeChild(textArea);
};
