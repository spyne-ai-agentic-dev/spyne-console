// Ported from spyne-console-microfrontends (apps/converse-ai/types/call-record.ts)
// — only the shapes the call-details drawer reads.

export interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: number;
}

export interface CallRecord {
  call_id: string;
  customer_id?: string;
  ai_score?: number;
  summary?: string;
  title?: string;
  recordingUrl?: string;
  ended_at?: string;
  createdAt?: string;
}

// End-call report payload from /conversation/vapi/end-call-report-by-id
export interface CallReportData {
  callId: string;
  callDetails: {
    agentInfo?: {
      agentName: string;
      agentType: string;
    };
    callType?: string;
    startedAt?: string;
    endedAt?: string;
    recordingUrl: string;
    analysis: {
      summary: string;
    };
    messages: Array<{
      role: string;
      message: string;
      secondsFromStart: number;
    }>;
    name: string;
    email: string | null;
    mobile: string;
    callStatus?: string;
  };
  createdAt: string;
  callDuration?: number;
  report: {
    title: string;
    summary: string[];
    actionItems: string[];
    queryResolved?: string;
    Outcome?: string;
    overview: {
      overall: {
        customerIntent?: string;
        sentiment?: string;
        sentimentScore?: number;
        aiResponseQuality: {
          score: string;
          metrics: {
            responseRelevanceAndClarity: string;
            followUpPrompting: string;
            engagemetRetention: string;
            toneAndProfessionalism: string;
          };
          whatAiDidBetter: string[];
          whatAiCouldHaveDoneBetter: string[];
        };
      };
      appointmentScheduled: string;
      appointmentType: string;
      appointmentDetails: string[];
    };
    topics?: Record<string, string>;
  };
  aiResponseQualityScore: number;
  leadDetails?: {
    customer_name: string;
    mobile_number: string;
    lead_type: string;
    stage: string;
  };
}
