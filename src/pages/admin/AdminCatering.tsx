import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string | null;
  event_date: string | null;
  event_time: string | null;
  event_location: string | null;
  guest_count: number | null;
  food_requested: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const STATUSES = ["all", "new", "contacted", "booked", "closed"] as const;
type Filter = typeof STATUSES[number];

const statusClasses: Record<string, string> = {
  new: "bg-primary/20 text-primary border-primary/40",
  contacted: "bg-accent/20 text-accent-foreground border-accent/40",
  booked: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  closed: "bg-muted text-muted-foreground border-border",
};

const csvEscape = (v: unknown) => {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
};

const AdminCatering = () => {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("catering_inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Inquiry[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("catering_inquiries").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    fetchData();
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length, new: 0, contacted: 0, booked: 0, closed: 0 };
    items.forEach((i) => { c[i.status] = (c[i.status] ?? 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const headers = [
      "Submitted", "Status", "Name", "Email", "Phone", "Service Type",
      "Event Date", "Event Time", "Location", "Guest Count",
      "Food Requested", "Message",
    ];
    const rows = filtered.map((i) => [
      new Date(i.created_at).toISOString(), i.status, i.name, i.email, i.phone,
      i.service_type, i.event_date, i.event_time, i.event_location, i.guest_count,
      i.food_requested, i.message,
    ]);
    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catering-inquiries-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} inquir${filtered.length === 1 ? "y" : "ies"}`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-3xl tracking-wider">Catering Inquiries</h1>
        <Button onClick={exportCsv} variant="outline" className="font-stencil">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-stencil uppercase border transition-colors ${
              filter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background/40 text-foreground/70 border-border hover:border-primary/50"
            }`}
          >
            {s} <span className="opacity-70">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No inquiries to show.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((i) => (
            <div key={i.id} className="bg-gradient-card border border-border rounded-lg p-5">
              <div className="flex flex-wrap justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-display text-xl">{i.name}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-stencil uppercase ${statusClasses[i.status] ?? statusClasses.closed}`}>
                      {i.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">{i.email} · {i.phone}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Submitted {new Date(i.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  {i.service_type && <div className="font-stencil text-xs text-primary uppercase">{i.service_type}</div>}
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
              <div className="flex flex-wrap gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setStatus(i.id, "contacted")}>Mark Contacted</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(i.id, "booked")}>Mark Booked</Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(i.id, "closed")}>Close</Button>
                {i.status !== "new" && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(i.id, "new")}>Reopen</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCatering;
