// Ported from spyne-console-microfrontends (apps/converse-ai/components/Call-Logs/constants.ts)
// — the drawer's tab/section config and message-role helpers, verbatim.

export const DRAWER_TABS = [
  { id: "highlights", label: "Highlights" },
  { id: "customer", label: "Customer" },
  { id: "summary", label: "Summary" },
  { id: "appointment", label: "Appointment" },
  { id: "transcript", label: "Transcript" },
] as const;

export type DrawerTabType = (typeof DRAWER_TABS)[number]["id"];

export const SIDEBAR_SECTIONS = [
  { id: "highlights", label: "Key Highlights", icon: "MdOutlineError", copyLabel: "highlights" },
  { id: "customer", label: "Customer Information & Summary", icon: "FaUser", copyLabel: "customer" },
  { id: "ai", label: "AI Performance Analysis", icon: "FaBolt", copyLabel: "ai" },
  { id: "appointment", label: "Appointment", icon: "FaCalendar", copyLabel: "appointment" },
  { id: "transcript", label: "Transcript", icon: "FaFileAlt", copyLabel: "transcript" },
] as const;

export const getScoreColor = (score: number): string => {
  if (score >= 7) return "text-green-600";
  if (score >= 5) return "text-orange-600";
  return "text-red-600";
};

export const isAgentMessage = (role: string): boolean => {
  return ["bot", "assistant"].includes(role);
};

export const getMessageRoleLabel = (role: string): string => {
  return isAgentMessage(role) ? "Agent" : "Customer";
};

export const getMessageRoleBadge = (role: string): { label: string; bgClass: string; textClass: string } => {
  const isAgent = isAgentMessage(role);
  return {
    label: isAgent ? "AI" : "CU",
    bgClass: isAgent ? "bg-purple-200" : "bg-green-200",
    textClass: isAgent ? "text-purple-700" : "text-green-700",
  };
};
