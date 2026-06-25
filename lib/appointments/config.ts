// Runtime config comes from the iframe URL query params injected by the parent
// console: ?env=staging|uat|prod&enterpriseId=…&teamId=…&token=…
//
// The parent passes an ENV NAME, not a base URL. The iframe maps env → base URL
// internally, so the same bundle works in every environment and the parent never
// has to know API hostnames.

export type Env = "staging" | "uat" | "prod";

// env → API base URL (no trailing slash). Confirmed with infra.
export const ENV_BASE_URLS: Record<Env, string> = {
  staging: "https://beta-api.spyne.xyz",
  uat: "https://uat-api.spyne.xyz",
  prod: "https://api.spyne.ai",
};

export interface IframeConfig {
  env: Env;
  apiBase: string;
  enterpriseId: string;
  teamId: string;
  token: string;
}

function normalizeEnv(raw: string | null): Env | null {
  const v = (raw || "").trim().toLowerCase();
  if (v === "staging" || v === "uat" || v === "prod") return v;
  if (v === "production") return "prod";
  return null;
}

// Returns null when params are absent/incomplete (e.g. running standalone) so
// the app can fall back to bundled demo data.
export function readConfig(): IframeConfig | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const env = normalizeEnv(p.get("env"));
  const enterpriseId = p.get("enterpriseId") || p.get("enterprise_id") || "";
  const teamId = p.get("teamId") || p.get("team_id") || "";
  const token = p.get("token") || "";
  if (env && enterpriseId && teamId && token) {
    return { env, apiBase: ENV_BASE_URLS[env], enterpriseId, teamId, token };
  }
  return null;
}

// Remove the (token-bearing) query string from the address bar + history after
// reading it, so the bearer token isn't left visible or in browser history.
export function scrubUrl() {
  if (typeof window === "undefined") return;
  if (window.location.search) {
    window.history.replaceState({}, "", window.location.pathname + window.location.hash);
  }
}
