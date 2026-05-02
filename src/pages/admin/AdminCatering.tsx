import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminCatering = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from("catering_inquiries").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("catering_inquiries").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    fetch();
  };

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wider mb-6">Catering Inquiries</h1>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : items.length === 0 ? (
        <p className="text-muted-foreground">No inquiries yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.id} className="bg-gradient-card border border-border rounded-lg p-5">
              <div className="flex flex-wrap justify-between gap-3 mb-2">
                <div>
                  <div className="font-display text-xl">{i.name}</div>
                  <div className="text-sm text-muted-foreground">{i.email} · {i.phone}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Submitted {new Date(i.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-stencil text-xs text-muted-foreground uppercase">{i.status}</div>
                  {i.event_date && <div className="text-sm">{i.event_date}{i.event_time ? ` · ${i.event_time}` : ""}</div>}
                  {i.guest_count && <div className="text-sm">{i.guest_count} guests</div>}
                  {i.event_location && <div className="text-sm text-muted-foreground">{i.event_location}</div>}
                </div>
              </div>
              {i.food_requested && (
                <div className="text-sm border-t border-border/50 pt-2 mt-2">
                  <span className="font-stencil text-xs text-primary uppercase mr-2">Food:</span>
                  <span className="text-muted-foreground">{i.food_requested}</span>
                </div>
              )}
              {i.message && <p className="text-sm text-muted-foreground border-t border-border/50 pt-2 mt-2">{i.message}</p>}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setStatus(i.id, "contacted")}>Mark Contacted</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(i.id, "booked")}>Mark Booked</Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(i.id, "closed")}>Close</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCatering;
