/**
 * AdminAuthProvider.tsx
 * Single source of truth for admin authentication + role state.
 * Wraps every /admin route (and /change-password) in App.tsx.
 *
 * Exposes: user, adminProfile, role, isSuperAdmin, isAdmin, loading,
 *          signIn, signOut, refreshAdminProfile.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { logAdminDenial, shortEventId } from "@/lib/adminAccessLog";

export type AdminRole = "super_admin" | "admin" | null;

export type AdminProfile = {
  id: string;
  user_id: string | null;
  email: string;
  role: "super_admin" | "admin";
  is_active: boolean;
};

export const ACCESS_DENIED_MESSAGE =
  "Access denied. This account is not authorized for the admin dashboard.";
export const INACTIVE_MESSAGE = "This admin account is inactive.";

type SignInResult = { ok: boolean; error?: string; role?: AdminRole; eventId?: string };

type AdminAuthValue = {
  session: Session | null;
  user: User | null;
  adminProfile: AdminProfile | null;
  role: AdminRole;
  /** Alias kept for existing call sites. */
  adminLevel: AdminRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  mustChangePassword: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: (opts?: { silent?: boolean }) => Promise<void>;
  refreshAdminProfile: () => Promise<AdminProfile | null>;
};

const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);

async function fetchAdminRow(uid: string) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, user_id, email, role, is_active")
    .eq("user_id", uid)
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  if (data.role !== "super_admin" && data.role !== "admin") return null;
  return data as AdminProfile;
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const currentUserId = useRef<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    setProfileLoading(true);
    const [adminRow, { data: profileData }] = await Promise.all([
      fetchAdminRow(uid),
      supabase.from("profiles").select("must_change_password").eq("user_id", uid).maybeSingle(),
    ]);
    setAdminProfile(adminRow);
    setMustChangePassword(!!profileData?.must_change_password);
    setProfileLoading(false);
    return adminRow;
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      currentUserId.current = sess?.user?.id ?? null;
      if (sess?.user) {
        // Defer Supabase calls out of the auth callback.
        setTimeout(() => loadProfile(sess.user.id), 0);
      } else {
        setAdminProfile(null);
        setMustChangePassword(false);
        setProfileLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      currentUserId.current = sess?.user?.id ?? null;
      setSessionLoading(false);
      if (sess?.user) loadProfile(sess.user.id);
      else setProfileLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async (opts?: { silent?: boolean }) => {
    await supabase.auth.signOut();
    setAdminProfile(null);
    setMustChangePassword(false);
    if (!opts?.silent) toast.success("Signed out.");
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
      if (error || !data.user) {
        const message =
          error?.message === "Invalid login credentials"
            ? "Invalid email or password. Please check your admin credentials."
            : error?.message ?? "Sign in failed. Please try again.";
        toast.error(message);
        return { ok: false, error: message };
      }

      const adminRow = await fetchAdminRow(data.user.id);

      if (!adminRow) {
        // Log while the session is still valid (RLS requires auth.uid()).
        const eventId = await logAdminDenial({
          reason: "unauthorized",
          email,
          userId: data.user.id,
        });
        await signOut({ silent: true });
        toast.error(ACCESS_DENIED_MESSAGE, { description: `Event ID: ${shortEventId(eventId)}` });
        return { ok: false, error: ACCESS_DENIED_MESSAGE, eventId };
      }
      if (!adminRow.is_active) {
        const eventId = await logAdminDenial({
          reason: "inactive",
          email,
          userId: data.user.id,
          role: adminRow.role,
        });
        await signOut({ silent: true });
        toast.error(INACTIVE_MESSAGE, { description: `Event ID: ${shortEventId(eventId)}` });
        return { ok: false, error: INACTIVE_MESSAGE, eventId };
      }


      setAdminProfile(adminRow);
      toast.success(
        adminRow.role === "super_admin" ? "Welcome back, Super Admin." : "Welcome back."
      );
      return { ok: true, role: adminRow.role };
    },
    [signOut]
  );

  const refreshAdminProfile = useCallback(async () => {
    const uid = currentUserId.current;
    if (!uid) return null;
    return loadProfile(uid);
  }, [loadProfile]);

  const activeProfile = adminProfile?.is_active ? adminProfile : null;
  const role: AdminRole = activeProfile?.role ?? null;

  const value: AdminAuthValue = {
    session,
    user,
    adminProfile,
    role,
    adminLevel: role,
    isAdmin: role !== null,
    isSuperAdmin: role === "super_admin",
    mustChangePassword,
    loading: sessionLoading || profileLoading,
    signIn,
    signOut,
    refreshAdminProfile,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
