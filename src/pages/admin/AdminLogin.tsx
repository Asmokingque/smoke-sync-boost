import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import logo from "@/assets/logo.png";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);

const DENIED = "Access denied. This account is not authorized for the admin dashboard.";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, mustChangePassword, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const deniedShown = useRef(false);

  useEffect(() => {
    if ((location.state as { denied?: boolean } | null)?.denied && !deniedShown.current) {
      deniedShown.current = true;
      toast.error(DENIED);
    }
  }, [location.state]);

  if (!loading && user && isAdmin) {
    return <Navigate to={mustChangePassword ? "/change-password" : "/admin"} replace />;
  }


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(form.email);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data,
      password: form.password,
    });
    if (error || !data.user) {
      setBusy(false);
      return toast.error(error?.message ?? "Sign in failed");
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("user_id", data.user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!adminRow) {
      await supabase.auth.signOut();
      setBusy(false);
      return toast.error(DENIED);
    }

    setBusy(false);
    toast.success(adminRow.role === "super_admin" ? "Welcome back, Super Admin." : "Welcome back.");
    navigate("/admin", { replace: true });
  };

  const resetPassword = async () => {
    const parsed = emailSchema.safeParse(form.email);
    if (!parsed.success) return toast.error("Enter your email first, then tap reset.");
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/change-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent — check your inbox.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md retina-menu-card ring-gold-soft p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="Anderson's Smoking Que" className="h-14 w-14 object-contain mb-3" width={56} height={56} />
          <h1 className="font-serif text-4xl">Admin Sign In</h1>
          <span className="gold-rule-short mx-auto block my-3" />
          <p className="text-xs text-muted-foreground font-stencil tracking-[0.2em]">Authorized staff only</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-12"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full h-12 bg-primary hover:bg-primary/90 font-stencil">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><ShieldCheck className="h-4 w-4" /> Sign In</>)}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-6 text-xs text-muted-foreground">
          <button type="button" onClick={resetPassword} className="hover:text-primary underline-offset-4 hover:underline">
            Forgot password?
          </button>
          <Link to="/" className="hover:text-primary">← Back to site</Link>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
