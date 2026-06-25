import type { Meeting, ServiceType } from "./types";
import salesJson from "@/data/sales.json";
import serviceJson from "@/data/service.json";

// Fixture-backed data layer. Swap getMeetings() for a fetch to
// GET /leads/dealer/v3/meetings (same shape) to go live — callers don't change.
const SALES = salesJson as unknown as Meeting[];
const SERVICE = serviceJson as unknown as Meeting[];

interface MeetingsQuery {
  serviceType: ServiceType;
  startDate?: Date;
  endDate?: Date;
}

export function getMeetings({ serviceType, startDate, endDate }: MeetingsQuery): Meeting[] {
  const all = serviceType === "service" ? SERVICE : SALES;
  const inRange = all.filter((m) => {
    if (!m.meetingStartTime) return false;
    const t = new Date(m.meetingStartTime).getTime();
    if (startDate && t < startDate.getTime()) return false;
    if (endDate && t > endDate.getTime()) return false;
    return true;
  });
  return inRange.sort(
    (a, b) =>
      new Date(a.meetingStartTime || 0).getTime() - new Date(b.meetingStartTime || 0).getTime(),
  );
}
