import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldAlert, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type AdminRow = {
  id: string;
  email: string;
  role: "admin" | "super_admin" | "customer";
  is_active: boolean;
  user_id: string | null;
  created_at: string;
};

const emailSchema = z.string().trim().email("Enter a valid email").max(255);

const AdminUsers = () => {
  const { isSuperAdmin, loading } = useAuth();
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<{ email: string; role: "admin" | "super_admin" }>({ email: "", role: "admin" });

  const load = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, role, is_active, user_id, created_at")
      .order("created_at");
    if (error) toast.error(error.message);
    setRows((data as AdminRow[]) ?? []);
    setFetching(false);
  };

  useEffect(() => { load(); }, []);

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(form.email);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.from("admin_users").insert({ email: parsed.data, role: form.role });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Admin added. They get access after signing up with that email.");
    setForm({ email: "", role: "admin" });
    load();
  };

  const toggleActive = async (row: AdminRow) => {
    const { error } = await supabase.from("admin_users").update({ is_active: !row.is_active }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(row.is_active ? "Access revoked" : "Access restored");
    load();
  };

  const remove = async (row: AdminRow) => {
    const { error } = await supabase.from("admin_users").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Admin removed");
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-lg retina-menu-card ring-gold-soft p-8 text-center mx-auto">
        <ShieldAlert className="h-10 w-10 text-gold mx-auto mb-3" />
        <h1 className="font-serif text-3xl mb-2">Super Admin only</h1>
        <p className="text-sm text-muted-foreground">Only a Super Admin can manage admin accounts and permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h1 className="font-serif text-4xl">Users & Admins</h1>
        <span className="gold-rule-short block my-3" />
        <p className="text-sm text-muted-foreground">
          Admin access is granted by email. A person only gets in after they sign up or sign in with that exact email address.
        </p>
      </header>

      <form onSubmit={addAdmin} className="retina-menu-card p-5 grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="new-admin-email">Email</Label>
          <Input id="new-admin-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11" placeholder="name@asmokingque.com" />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as "admin" | "super_admin" })}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={busy} className="h-11 bg-primary hover:bg-primary/90 font-stencil">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><UserPlus className="h-4 w-4" /> Add</>)}
        </Button>
      </form>

      <div className="retina-menu-card divide-y divide-border">
        {fetching ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No admins yet.</p>
        ) : rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex-1 min-w-[200px]">
              <div className="font-medium break-all">{row.email}</div>
              <div className="text-xs text-muted-foreground">
                {row.user_id ? "Account linked" : "Awaiting first sign-up"}
              </div>
            </div>
            <Badge variant={row.role === "super_admin" ? "default" : "secondary"} className="font-stencil">
              {row.role === "super_admin" ? <><ShieldCheck className="h-3 w-3 mr-1" /> Super Admin</> : "Admin"}
            </Badge>
            <Badge variant={row.is_active ? "outline" : "destructive"}>{row.is_active ? "Active" : "Disabled"}</Badge>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="font-stencil" onClick={() => toggleActive(row)}>
                {row.is_active ? "Disable" : "Enable"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={row.role === "super_admin"}
                title={row.role === "super_admin" ? "Super Admins cannot be deleted here" : "Remove admin"}
                onClick={() => remove(row)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
