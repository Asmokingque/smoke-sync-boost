import { useState } from "react";
import { useNavigate, Link, Navigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const emailSchema = z.string().trim().email("Invalid email").max(255);
const passwordSchema = z.string().min(8, "Password must be 8+ characters").max(72);

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/account";
  const { user, mustChangePassword, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [signinForm, setSigninForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", display_name: "" });

  if (!loading && user) return <Navigate to={mustChangePassword ? "/change-password" : redirect} replace />;

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const e1 = emailSchema.safeParse(signinForm.email);
    if (!e1.success) return toast.error(e1.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: e1.data, password: signinForm.password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate(redirect);
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const e1 = emailSchema.safeParse(signupForm.email);
    const p1 = passwordSchema.safeParse(signupForm.password);
    if (!e1.success) return toast.error(e1.error.issues[0].message);
    if (!p1.success) return toast.error(p1.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: e1.data,
      password: p1.data,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: signupForm.display_name || e1.data.split("@")[0] },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you're signed in.");
    navigate("/account");
  };

  return (
    <SiteLayout>
      <section className="container py-16 max-w-md">
        <div className="bg-gradient-card border border-border rounded-lg p-6 md:p-8">
          <h1 className="font-display text-3xl mb-6 tracking-wider text-center">Welcome</h1>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" required value={signinForm.email} onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-pw">Password</Label>
                  <Input id="si-pw" type="password" required value={signinForm.password} onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })} className="h-12" />
                </div>
                <Button type="submit" disabled={busy} className="w-full h-12 bg-primary hover:bg-primary/90 font-stencil">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Name</Label>
                  <Input id="su-name" value={signupForm.display_name} onChange={(e) => setSignupForm({ ...signupForm, display_name: e.target.value })} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" required value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pw">Password</Label>
                  <Input id="su-pw" type="password" required value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} className="h-12" />
                  <p className="text-xs text-muted-foreground">8+ characters</p>
                </div>
                <Button type="submit" disabled={busy} className="w-full h-12 bg-primary hover:bg-primary/90 font-stencil">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/" className="hover:text-primary">← Back to home</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Auth;
