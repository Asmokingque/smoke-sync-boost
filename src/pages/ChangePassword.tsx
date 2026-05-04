import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const passwordSchema = z.string().min(8, "Password must be 8+ characters").max(72);

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, loading, mustChangePassword } = useAuth();
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = passwordSchema.safeParse(pw);
    if (!p.success) return toast.error(p.error.issues[0].message);
    if (pw !== pw2) return toast.error("Passwords do not match");

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: p.data });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("user_id", user.id);
    setBusy(false);
    if (pErr) return toast.error(pErr.message);

    toast.success("Password updated.");
    navigate("/admin");
  };

  return (
    <SiteLayout>
      <section className="container py-16 max-w-md">
        <div className="bg-gradient-card border border-border rounded-lg p-6 md:p-8">
          {mustChangePassword && (
            <div className="flex items-start gap-2 mb-4 p-3 rounded-md border border-gold/30 bg-card/50">
              <ShieldAlert className="h-4 w-4 text-gold mt-0.5" />
              <p className="text-xs text-muted-foreground">
                For security, you must set a new password before continuing.
              </p>
            </div>
          )}
          <h1 className="font-display text-3xl mb-6 tracking-wider text-center">Change Password</h1>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="np">New Password</Label>
              <Input id="np" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} className="h-12" />
              <p className="text-xs text-muted-foreground">8+ characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="np2">Confirm New Password</Label>
              <Input id="np2" type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} className="h-12" />
            </div>
            <Button type="submit" disabled={busy} className="w-full h-12 bg-primary hover:bg-primary/90 font-stencil">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ChangePassword;
