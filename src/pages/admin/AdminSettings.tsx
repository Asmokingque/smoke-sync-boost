import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/context/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

type Settings = Record<string, any>;

const AdminSettings = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taxRate, setTaxRate] = useState("8.25");
  const [hours, setHours] = useState<Record<string, string>>({});
  const [heroes, setHeroes] = useState({ enabled: true, discount_percent: 10, terms: "", eligible_groups: "" });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("business_settings").select("setting_key, setting_value");
      if (error) toast.error("Couldn't load settings. Please refresh and try again.");
      const map: Settings = {};
      (data ?? []).forEach((r: any) => { map[r.setting_key] = r.setting_value; });
      if (map.tax_rate?.value != null) setTaxRate((Number(map.tax_rate.value) * 100).toFixed(2));
      setHours(map.pickup_hours ?? {});
      if (map.community_heroes) {
        setHeroes({
          enabled: !!map.community_heroes.enabled,
          discount_percent: Number(map.community_heroes.discount_percent ?? 10),
          terms: map.community_heroes.terms ?? "",
          eligible_groups: (map.community_heroes.eligible_groups ?? []).join(", "),
        });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    const pct = Number(taxRate);
    if (Number.isNaN(pct) || pct < 0 || pct > 30) return toast.error("Enter a tax rate between 0 and 30 percent.");
    setSaving(true);
    const rows = [
      { setting_key: "tax_rate", setting_value: { value: pct / 100 } },
      { setting_key: "pickup_hours", setting_value: hours },
      {
        setting_key: "community_heroes",
        setting_value: {
          enabled: heroes.enabled,
          discount_percent: Number(heroes.discount_percent) || 0,
          terms: heroes.terms,
          eligible_groups: heroes.eligible_groups.split(",").map((s) => s.trim()).filter(Boolean),
        },
      },
    ];
    const { error } = await supabase.from("business_settings").upsert(rows, { onConflict: "setting_key" });
    setSaving(false);
    if (error) return toast.error("Couldn't save settings. Please try again.");
    toast.success("Business settings saved.");
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="font-serif text-4xl">Business Settings</h1>
        <span className="gold-rule-short block my-3" />
        <p className="text-sm text-muted-foreground">Tax rate, pickup hours, and the Community Heroes discount program.</p>
      </header>

      <section className="retina-menu-card p-5 space-y-4">
        <h2 className="font-stencil text-sm tracking-[0.2em] text-gold">Tax</h2>
        <div className="space-y-2 max-w-[200px]">
          <Label htmlFor="tax-rate">Sales tax (%)</Label>
          <Input
            id="tax-rate"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="h-11"
            inputMode="decimal"
            disabled={!isSuperAdmin}
          />
          {!isSuperAdmin && (
            <p className="text-xs text-muted-foreground">Only a Super Admin can change the tax rate.</p>
          )}
        </div>
      </section>


      <section className="retina-menu-card p-5 space-y-4">
        <h2 className="font-stencil text-sm tracking-[0.2em] text-gold">Pickup Hours</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DAYS.map((d) => (
            <div key={d} className="space-y-2">
              <Label htmlFor={`hours-${d}`} className="capitalize">{d}</Label>
              <Input
                id={`hours-${d}`}
                value={hours[d] ?? ""}
                placeholder="11:00 AM - 8:00 PM or Closed"
                onChange={(e) => setHours({ ...hours, [d]: e.target.value })}
                className="h-11"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="retina-menu-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-stencil text-sm tracking-[0.2em] text-gold">Community Heroes Discount</h2>
          <Switch checked={heroes.enabled} onCheckedChange={(v) => setHeroes({ ...heroes, enabled: v })} />
        </div>
        <div className="space-y-2 max-w-[200px]">
          <Label htmlFor="heroes-pct">Discount (%)</Label>
          <Input id="heroes-pct" value={heroes.discount_percent} onChange={(e) => setHeroes({ ...heroes, discount_percent: Number(e.target.value) })} className="h-11" inputMode="decimal" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroes-groups">Eligible groups (comma separated)</Label>
          <Input id="heroes-groups" value={heroes.eligible_groups} onChange={(e) => setHeroes({ ...heroes, eligible_groups: e.target.value })} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroes-terms">Terms</Label>
          <Textarea id="heroes-terms" value={heroes.terms} onChange={(e) => setHeroes({ ...heroes, terms: e.target.value })} rows={3} />
        </div>
      </section>

      <Button onClick={save} disabled={saving} className="h-11 bg-primary hover:bg-primary/90 font-stencil">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Save className="h-4 w-4" /> Save Settings</>)}
      </Button>
    </div>
  );
};

export default AdminSettings;
