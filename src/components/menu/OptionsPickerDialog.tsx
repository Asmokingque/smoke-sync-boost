import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";

export type OptionRow = {
  id: string;
  menu_item_id: string;
  option_group: string;
  option_name: string;
  price_adjustment: number;
  is_required: boolean;
  display_order: number;
};

export type SelectedOption = {
  group: string;
  name: string;
  price_adjustment: number;
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: {
    id: string;
    name: string;
    base_price: number;
    allow_notes: boolean;
  } | null;
  onConfirm: (payload: {
    selectedOptions: SelectedOption[];
    notes: string;
    finalUnitPrice: number;
    optionLabel: string;
  }) => void;
};

// Groups that allow multiple selections (count derived from a sibling group)
const MULTI_SELECT_GROUPS: Record<string, (selections: Record<string, string[]>) => number> = {
  // For "Choose Meats", the count comes from the chosen Plate Size
  "Choose Meats": (sel) => {
    const size = sel["Plate Size"]?.[0] ?? "";
    if (size.toLowerCase().includes("three")) return 3;
    if (size.toLowerCase().includes("two")) return 2;
    return 0;
  },
};

export function OptionsPickerDialog({ open, onOpenChange, item, onConfirm }: Props) {
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  // group => array of option_name
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !item) return;
    setSelections({});
    setNotes("");
    setError(null);
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("menu_item_options")
        .select("*")
        .eq("menu_item_id", item.id)
        .order("display_order");
      setOptions((data ?? []) as OptionRow[]);
      setLoading(false);
    })();
  }, [open, item]);

  const groups = useMemo(() => {
    const map = new Map<string, OptionRow[]>();
    for (const o of options) {
      if (!map.has(o.option_group)) map.set(o.option_group, []);
      map.get(o.option_group)!.push(o);
    }
    return Array.from(map.entries());
  }, [options]);

  const toggle = (group: string, name: string) => {
    const isMulti = group in MULTI_SELECT_GROUPS;
    const limit = isMulti ? MULTI_SELECT_GROUPS[group](selections) : 1;
    setSelections((prev) => {
      const current = prev[group] ?? [];
      const has = current.includes(name);
      let next: string[];
      if (isMulti) {
        if (has) next = current.filter((n) => n !== name);
        else if (current.length >= limit) next = [...current.slice(1), name]; // bump oldest
        else next = [...current, name];
      } else {
        next = has ? [] : [name];
      }
      return { ...prev, [group]: next };
    });
    setError(null);
  };

  const summary = useMemo(() => {
    if (!item) return { adj: 0, label: "" };
    let adj = 0;
    const parts: string[] = [];
    for (const [group, opts] of groups) {
      const chosen = selections[group] ?? [];
      for (const c of chosen) {
        const row = opts.find((o) => o.option_name === c);
        if (row) adj += Number(row.price_adjustment);
      }
      if (chosen.length) parts.push(`${group}: ${chosen.join(", ")}`);
    }
    return { adj, label: parts.join(" · ") };
  }, [groups, selections, item]);

  const finalUnitPrice = (item?.base_price ?? 0) + summary.adj;

  const handleConfirm = () => {
    if (!item) return;
    // Validate required groups
    for (const [group, opts] of groups) {
      const required = opts.some((o) => o.is_required);
      if (!required) continue;
      const chosen = selections[group] ?? [];
      const isMulti = group in MULTI_SELECT_GROUPS;
      const need = isMulti ? MULTI_SELECT_GROUPS[group](selections) : 1;
      if (chosen.length < need) {
        setError(
          isMulti
            ? `Pick ${need} from "${group}" (you've picked ${chosen.length}).`
            : `Please choose a ${group}.`
        );
        return;
      }
    }
    const selectedOptions: SelectedOption[] = [];
    for (const [group, opts] of groups) {
      for (const name of selections[group] ?? []) {
        const row = opts.find((o) => o.option_name === name);
        if (row) selectedOptions.push({ group, name, price_adjustment: Number(row.price_adjustment) });
      }
    }
    onConfirm({
      selectedOptions,
      notes: notes.trim(),
      finalUnitPrice,
      optionLabel: summary.label,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wider">{item?.name}</DialogTitle>
          <DialogDescription>Customize your order, then add it to the cart.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map(([group, opts]) => {
              const isMulti = group in MULTI_SELECT_GROUPS;
              const need = isMulti ? MULTI_SELECT_GROUPS[group](selections) : 1;
              const chosen = selections[group] ?? [];
              return (
                <div key={group}>
                  <div className="flex items-baseline justify-between mb-2">
                    <Label className="font-stencil text-sm text-foreground">
                      {group}
                      {opts.some((o) => o.is_required) && <span className="text-primary ml-1">*</span>}
                    </Label>
                    {isMulti && (
                      <span className="text-xs text-muted-foreground">
                        {chosen.length}/{need || "?"}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {opts.map((o) => {
                      const selected = chosen.includes(o.option_name);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => toggle(group, o.option_name)}
                          className={`text-left rounded-md border px-3 py-2.5 text-sm transition-colors ${
                            selected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="font-stencil text-xs">{o.option_name}</div>
                          {Number(o.price_adjustment) > 0 && (
                            <div className="text-[11px] text-primary mt-0.5">
                              +${Number(o.price_adjustment).toFixed(2)}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {item?.allow_notes && (
              <div>
                <Label htmlFor="opt-notes" className="font-stencil text-sm">
                  Notes (optional)
                </Label>
                <Textarea
                  id="opt-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Sauce on the side, extra crispy, etc."
                  maxLength={200}
                  className="mt-2"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive font-stencil">{error}</p>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-between gap-2 mt-2">
          <div className="text-sm text-muted-foreground">
            <div className="font-display text-xl text-primary leading-none">
              ${finalUnitPrice.toFixed(2)}
            </div>
            {summary.adj > 0 && (
              <div className="text-[11px] mt-1">includes +${summary.adj.toFixed(2)} options</div>
            )}
          </div>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 font-stencil"
          >
            <Plus className="h-4 w-4" /> Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
