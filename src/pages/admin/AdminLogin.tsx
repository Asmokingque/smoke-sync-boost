import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth, ACCESS_DENIED_MESSAGE, INACTIVE_MESSAGE } from "@/context/AdminAuthProvider";
import { shortEventId } from "@/lib/adminAccessLog";
import { DevAdminSignIn } from "@/components/admin/DevAdminSignIn";
import { z } from "zod";
import logo from "@/assets/logo.png";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);



const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, mustChangePassword, loading, signIn } = useAdminAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const deniedShown = useRef(false);

  useEffect(() => {
    const state = location.state as
      | { denied?: boolean; inactive?: boolean; eventId?: string | null }
      | null;
    if (state?.denied && !deniedShown.current) {
      deniedShown.current = true;
      const msg = state.inactive ? INACTIVE_MESSAGE : ACCESS_DENIED_MESSAGE;
      setError(msg);
      if (state.eventId) setEventId(state.eventId);
      toast.error(msg, {
        description: state.eventId ? `Event ID: ${shortEventId(state.eventId)}` : undefined,
      });
    }
  }, [location.state]);

  if (!loading && user && isAdmin) {
    return <Navigate to={mustChangePassword ? "/change-password" : "/admin"} replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEventId(null);
    const parsed = emailSchema.safeParse(form.email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const result = await signIn(parsed.data, form.password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Sign in failed");
      setEventId(result.eventId ?? null);
      return;
    }
    navigate("/admin", { replace: true });
  };

  const devSignIn = async (email: string, password: string) => {
    setError(null);
    setEventId(null);
    const result = await signIn(email, password);
    if (!result.ok) {
      setError(result.error ?? "Sign in failed");
      setEventId(result.eventId ?? null);
      return;
    }
    navigate("/admin", { replace: true });
  };





  const resetPassword = async () => {
    const parsed = emailSchema.safeParse(form.email);
    if (!parsed.success) return toast.error("Enter your email first, then tap reset.");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/change-password`,
    });
    if (resetError) return toast.error(resetError.message);
    toast.success("Password reset link sent — check your inbox.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md retina-menu-card ring-gold-soft p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="Anderson's Smoking Que" className="h-14 w-14 object-contain mb-3" width={56} height={56} />
          <p className="font-stencil text-[11px] uppercase tracking-[0.3em] text-gold">Anderson&rsquo;s Smoking Que</p>
          <div className="mt-4 rounded-full border border-gold/40 bg-gold/10 p-3">
            <Lock className="h-5 w-5 text-gold" />
          </div>
          <h1 className="font-serif text-4xl mt-3">Admin Login</h1>
          <span className="gold-rule-short mx-auto block my-3" />
          <p className="text-sm text-muted-foreground">Secure dashboard access</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="block">{error}</span>
              {eventId && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(eventId);
                    toast.success("Event ID copied.");
                  }}
                  title={eventId}
                  className="font-stencil text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold underline-offset-4 hover:underline"
                >
                  Event ID: {shortEventId(eventId)} — tap to copy
                </button>
              )}
            </div>
          </div>
        )}

        <DevAdminSignIn
          onFill={(email, password) => setForm({ email, password })}
          onSignIn={devSignIn}
        />


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
            {busy ? (<><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>) : (<><Lock className="h-4 w-4" /> Login</>)}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-6 text-xs text-muted-foreground">
          <button type="button" onClick={resetPassword} className="hover:text-primary underline-offset-4 hover:underline">
            Forgot password?
          </button>
          <Link to="/" className="hover:text-primary">← Back to site</Link>
        </div>

        <p className="mt-6 text-center font-stencil text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Authorized access only
        </p>
      </div>
    </main>
  );
};

export default AdminLogin;
