/**
 * AdminUsers.tsx
 * Super Admin only: invite admins by email, change roles, disable/restore
 * access, and remove admin accounts. Also documents the permission matrix.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/context/AdminAuthProvider";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { SetPasswordDialog } from "@/components/admin/SetPasswordDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, KeyRound, Loader2, Search, ShieldAlert, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type AdminRole = "admin" | "super_admin";

type AdminRow = {
  id: string;
  email: string;
  role: AdminRole | "customer";
  is_active: boolean;
  user_id: string | null;
  notes: string | null;
  created_at: string;
};

const emailSchema = z.string().trim().email("Enter a valid email").max(255);

const PERMISSIONS: { area: string; superAdmin: boolean; admin: boolean }[] = [
  { area: "Menu, specials, orders, reviews, catering", superAdmin: true, admin: true },
  { area: "Homepage, service area & business settings", superAdmin: true, admin: true },
  { area: "Delete records (menu items, categories, reviews)", superAdmin: true, admin: false },
  { area: "Site content editor", superAdmin: true, admin: false },
  { area: "Payment & checkout settings", superAdmin: true, admin: false },
  { area: "Manage admin users & roles", superAdmin: true, admin: false },
];

const AdminUsers = () => {
  const { isSuperAdmin, loading, user, refreshAdminProfile } = useAdminAuth();
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminRow | null>(null);
  const [form, setForm] = useState<{ email: string; role: AdminRole; notes: string }>({
    email: "",
    role: "admin",
    notes: "",
  });

  const load = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, role, is_active, user_id, notes, created_at")
      .order("created_at");
    if (error) toast.error(error.message);
    setRows((data as AdminRow[]) ?? []);
    setFetching(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.email.toLowerCase().includes(q) || r.role.includes(q));
  }, [rows, query]);

  const isSelf = (row: AdminRow) =>
    !!user && (row.user_id === user.id || row.email.toLowerCase() === (user.email ?? "").toLowerCase());

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(form.email);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (rows.some((r) => r.email.toLowerCase() === parsed.data.toLowerCase())) {
      return toast.error("That email already has an admin record.");
    }
    setBusy(true);
    const { error } = await supabase.from("admin_users").insert({
      email: parsed.data,
      role: form.role,
      notes: form.notes.trim() || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Invite created. Access starts once they sign up with that email.");
    setForm({ email: "", role: "admin", notes: "" });
    load();
  };

  const changeRole = async (row: AdminRow, role: AdminRole) => {
    if (row.role === role) return;
    if (isSelf(row) && role !== "super_admin") {
      return toast.error("You can't downgrade your own Super Admin account.");
    }
    const { error } = await supabase.from("admin_users").update({ role }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(`Role updated to ${role === "super_admin" ? "Super Admin" : "Admin"}.`);
    load();
    if (isSelf(row)) refreshAdminProfile();
  };

  const toggleActive = async (row: AdminRow) => {
    if (isSelf(row) && row.is_active) return toast.error("You can't disable your own access.");
    const { error } = await supabase.from("admin_users").update({ is_active: !row.is_active }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(row.is_active ? "Access revoked." : "Access restored.");
    load();
  };

  const confirmRemove = async () => {
    const row = pendingDelete;
    setPendingDelete(null);
    if (!row) return;
    const { error } = await supabase.from("admin_users").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Admin removed.");
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-lg retina-menu-card ring-gold-soft p-8 text-center mx-auto">
        <ShieldAlert className="h-10 w-10 text-gold mx-auto mb-3" />
        <h1 className="font-serif text-3xl mb-2">Super Admin only</h1>
        <p className="text-sm text-muted-foreground">
          Only a Super Admin can manage admin accounts and permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <header>
        <h1 className="font-serif text-4xl">Users &amp; Admins</h1>
        <span className="gold-rule-short block my-3" />
        <p className="text-sm text-muted-foreground">
          Admin access is granted by email. A person only gets in after they sign up or sign in with that exact
          email address.
        </p>
      </header>

      <AdminFormCard title="Invite an admin" hint="They'll have access the moment they sign up with this email.">
        <form onSubmit={invite} className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="new-admin-email">Email</Label>
            <Input
              id="new-admin-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-11"
              placeholder="name@asmokingque.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AdminRole })}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={busy} className="h-11 bg-primary hover:bg-primary/90 font-stencil">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><UserPlus className="h-4 w-4" /> Invite</>)}
          </Button>
          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="new-admin-notes">Note (optional)</Label>
            <Input
              id="new-admin-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="h-11"
              placeholder="Pitmaster — kitchen orders only"
            />
          </div>
        </form>
      </AdminFormCard>

      <AdminFormCard
        title="Admin accounts"
        hint={`${rows.length} account${rows.length === 1 ? "" : "s"}`}
        action={
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email"
              className="h-10 pl-9"
            />
          </div>
        }
      >
        <div className="divide-y divide-border">
          {fetching ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground text-center">
              {rows.length === 0 ? "No admins yet — invite one above." : "No admins match that search."}
            </p>
          ) : (
            filtered.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center gap-3 py-4">
                <div className="flex-1 min-w-[220px]">
                  <div className="font-medium break-all">
                    {row.email}
                    {isSelf(row) && <span className="ml-2 text-xs text-gold">(you)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {row.user_id ? "Account linked" : "Awaiting first sign-up"}
                    {row.notes ? ` · ${row.notes}` : ""}
                  </div>
                </div>

                <RoleBadge isSuperAdmin={row.role === "super_admin"} />

                <Select
                  value={row.role === "super_admin" ? "super_admin" : "admin"}
                  onValueChange={(v) => changeRole(row, v as AdminRole)}
                >
                  <SelectTrigger className="h-9 w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={row.is_active}
                    onCheckedChange={() => toggleActive(row)}
                    aria-label={row.is_active ? "Disable access" : "Restore access"}
                  />
                  <Badge variant={row.is_active ? "outline" : "destructive"}>
                    {row.is_active ? "Active" : "Disabled"}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isSelf(row)}
                  title={isSelf(row) ? "You can't remove your own account" : "Remove admin"}
                  onClick={() => setPendingDelete(row)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </AdminFormCard>

      <AdminFormCard title="Permissions" hint="What each role can do in the dashboard.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">
                <th className="py-2 pr-4 font-stencil">Area</th>
                <th className="py-2 px-3 font-stencil text-center">Super Admin</th>
                <th className="py-2 px-3 font-stencil text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PERMISSIONS.map((p) => (
                <tr key={p.area}>
                  <td className="py-2 pr-4">{p.area}</td>
                  <td className="py-2 px-3 text-center">
                    {p.superAdmin ? (
                      <Check className="mx-auto h-4 w-4 text-gold" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-muted-foreground" />
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {p.admin ? (
                      <Check className="mx-auto h-4 w-4 text-gold" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-muted-foreground" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminFormCard>

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this admin?"
        description={`${pendingDelete?.email ?? ""} will lose access to the dashboard immediately. This can't be undone.`}
        confirmLabel="Remove admin"
        onConfirm={confirmRemove}
      />
    </div>
  );
};

export default AdminUsers;
