import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type Msg = {
  id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
};

const AdminContact = () => {
  const { isSuperAdmin } = useAuth();
  const [items, setItems] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Msg[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wider mb-6">Contact Messages</h1>
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className={`bg-gradient-card border rounded-lg p-5 ${
              m.status === "new" ? "border-primary/40" : "border-border"
            }`}>
              <div className="flex flex-wrap justify-between gap-3 mb-2">
                <div>
                  <div className="font-display text-xl">{m.customer_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {m.email ?? "—"}{m.phone ? ` · ${m.phone}` : ""}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="font-stencil text-xs text-muted-foreground uppercase">{m.status}</div>
              </div>
              <p className="text-sm text-foreground border-t border-border/50 pt-2 whitespace-pre-wrap">{m.message}</p>
              <div className="flex gap-2 mt-3">
                {m.status !== "read" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(m.id, "read")}>Mark Read</Button>
                )}
                {m.status !== "replied" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(m.id, "replied")}>Mark Replied</Button>
                )}
                {isSuperAdmin && (
                  <Button size="sm" variant="ghost" onClick={() => remove(m.id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContact;
