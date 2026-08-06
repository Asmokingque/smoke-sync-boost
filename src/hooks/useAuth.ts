import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AdminLevel = "super_admin" | "admin" | null;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [adminLevel, setAdminLevel] = useState<AdminLevel>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndProfile = async (uid: string) => {
      setRoleLoading(true);
      const [{ data: adminRow }, { data: profileData }] = await Promise.all([
        supabase
          .from("admin_users")
          .select("role, is_active")
          .eq("user_id", uid)
          .eq("is_active", true)
          .maybeSingle(),
        supabase.from("profiles").select("must_change_password").eq("user_id", uid).maybeSingle(),
      ]);
      const role = adminRow?.role;
      setAdminLevel(role === "super_admin" ? "super_admin" : role === "admin" ? "admin" : null);
      setMustChangePassword(!!profileData?.must_change_password);
      setRoleLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => checkRoleAndProfile(sess.user.id), 0);
      } else {
        setAdminLevel(null);
        setMustChangePassword(false);
        setRoleLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkRoleAndProfile(session.user.id);
      } else {
        setRoleLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    user,
    adminLevel,
    isAdmin: adminLevel !== null,
    isSuperAdmin: adminLevel === "super_admin",
    mustChangePassword,
    loading: loading || roleLoading,
  };
}
