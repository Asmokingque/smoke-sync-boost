/**
 * AdminMenuHistory.tsx
 * Controls: /admin/menu-history — every menu item change with one-click undo.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  changedFields,
  formatValue,
  undoPlan,
  type MenuHistoryEntry,
} from "@/lib/menuHistory";

const ACTION_LABEL = { create: "Added", update: "Edited", delete: "Deleted" } as const;

const AdminMenuHistory = () => {
  const [rows, setRows] = useState<MenuHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_item_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as MenuHistoryEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const undo = async (entry: MenuHistoryEntry) => {
    setBusy(entry.id);
    try {
      const plan = undoPlan(entry);
      const q =
        plan.kind === "update"
          ? supabase.from("menu_items").update(plan.values as never).eq("id", plan.id)
          : plan.kind === "insert"
          ? supabase.from("menu_items").insert(plan.values as never)
          : supabase.from("menu_items").delete().eq("id", plan.id);
      const { error } = await q;
      if (error) throw error;
      await supabase
        .from("menu_item_history")
        .update({ undone_at: new Date().toISOString() })
        .eq("id", entry.id);
      toast.success(`Undid change to ${entry.item_name}`);
      await load();
    } catch (e) {
      toast.error(`Undo failed: ${getErrorMessage(e)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Menu History</h1>
          <span className="gold-rule-short block my-3" />
          <p className="text-sm text-muted-foreground">
            Every menu item change, newest first. Press Undo to put an item back the way it was.
          </p>
        </div>
        <Button variant="outline" onClick={load} className="font-stencil text-xs">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading history…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No menu changes recorded yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const changes = r.action === "update" ? changedFields(r) : [];
            return (
              <li key={r.id} className="rounded-lg border border-border bg-card/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={r.action === "delete" ? "destructive" : "secondary"}>
                      {ACTION_LABEL[r.action]}
                    </Badge>
                    <span className="font-stencil">{r.item_name}</span>
                    {r.undone_at && <Badge variant="outline">Undone</Badge>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                      {r.changed_by_email ? ` · ${r.changed_by_email}` : ""}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!!r.undone_at || busy === r.id}
                      onClick={() => undo(r)}
                      className="font-stencil text-xs"
                    >
                      {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      Undo
                    </Button>
                  </div>
                </div>
                {changes.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {changes.map((c) => (
                      <li key={c.field} className="text-muted-foreground">
                        <span className="text-foreground">{c.label}:</span>{" "}
                        <span className="line-through">{formatValue(c.from)}</span> → {formatValue(c.to)}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminMenuHistory;
