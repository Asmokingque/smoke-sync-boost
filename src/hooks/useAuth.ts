import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndProfile = async (uid: string) => {
      setRoleLoading(true);
      const [{ data: roleData }, { data: profileData }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
        supabase.from("profiles").select("must_change_password").eq("user_id", uid).maybeSingle(),
      ]);
      setIsAdmin(!!roleData);
      setMustChangePassword(!!profileData?.must_change_password);
      setRoleLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => checkRoleAndProfile(sess.user.id), 0);
      } else {
        setIsAdmin(false);
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

  return { session, user, isAdmin, mustChangePassword, loading: loading || roleLoading };
}
