/**
 * adminAccessLog.ts
 * Records admin dashboard access denials (unauthorized / inactive) to the
 * `admin_access_denials` table and returns a short event ID for support.
 *
 * The event ID is generated client-side so it can be shown in the UI even if
 * the insert fails (offline, RLS, etc.). Logging must happen BEFORE sign-out,
 * while auth.uid() still matches the row's user_id.
 */
import { supabase } from "@/integrations/supabase/client";

export type DenialReason = "unauthorized" | "inactive";

export type DenialLogInput = {
  reason: DenialReason;
  email?: string | null;
  userId?: string | null;
  role?: string | null;
  path?: string;
};

/** Short, human-readable form of the event UUID shown in the UI. */
export function shortEventId(eventId: string) {
  return eventId.slice(0, 8).toUpperCase();
}

export async function logAdminDenial(input: DenialLogInput): Promise<string> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    await supabase.from("admin_access_denials").insert({
      id,
      reason: input.reason,
      attempted_email: input.email ?? null,
      user_id: input.userId ?? null,
      admin_role: input.role ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      path: input.path ?? (typeof window !== "undefined" ? window.location.pathname : null),
    });
  } catch {
    // Never block the denial flow on logging failures.
  }

  return id;
}
