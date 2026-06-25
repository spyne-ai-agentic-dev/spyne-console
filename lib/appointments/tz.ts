import { createContext, useContext } from "react";

// The dealer/team timezone (IANA) that ALL UI timestamps render in.
// Undefined until resolved from get-working-days; callers fall back to the
// meeting's own timezone in the meantime.
export const TzContext = createContext<string | undefined>(undefined);

export function useTz(): string | undefined {
  return useContext(TzContext);
}
