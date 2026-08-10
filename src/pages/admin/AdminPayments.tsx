import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/context/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, ShieldAlert, CreditCard } from "lucide-react";
import { toast } from "sonner";

const AdminPayments = () => {
  const { isSuperAdmin, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [payAtPickup, setPayAtPickup] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState({ enabled: true, value: 5 });
  const [serviceFee, setServiceFee] = useState({ enabled: true, value: 3 });

  useEffect(() => {
    if (!isSuperAdmin) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase.from("business_settings").select("setting_key, setting_value");
      if (error) toast.error("Couldn't load payment settings. Please refresh and try again.");
      const map: Record<string, Record<string, unknown>> = {};
      (data ?? []).forEach((r) => { map[r.setting_key] = (r.setting_value ?? {}) as Record<string, unknown>; });
      setPayAtPickup(!!map.pay_at_pickup?.enabled);
      if (map.delivery_fee) setDeliveryFee({ enabled: map.delivery_fee.enabled !== false, value: Number(map.delivery_fee.value ?? 5) });
      if (map.service_fee) setServiceFee({ enabled: map.service_fee.enabled !== false, value: Number(map.service_fee.value ?? 0.03) * 100 });
      setLoading(false);
    })();
  }, [isSuperAdmin]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("business_settings").upsert([
      { setting_key: "pay_at_pickup", setting_value: { enabled: payAtPickup } },
      { setting_key: "delivery_fee", setting_value: { enabled: deliveryFee.enabled, value: Number(deliveryFee.value) || 0 } },
      { setting_key: "service_fee", setting_value: { type: "percentage", enabled: serviceFee.enabled, value: (Number(serviceFee.value) || 0) / 100 } },
    ], { onConflict: "setting_key" });
    setSaving(false);
    if (error) return toast.error("Couldn't save payment settings. Please try again.");
    toast.success("Payment settings saved.");
  };

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-lg retina-menu-card ring-gold-soft p-8 text-center mx-auto">
        <ShieldAlert className="h-10 w-10 text-gold mx-auto mb-3" />
        <h1 className="font-serif text-3xl mb-2">Super Admin only</h1>
        <p className="text-sm text-muted-foreground">Only a Super Admin can change payment and security settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="font-serif text-4xl">Payment Settings</h1>
        <span className="gold-rule-short block my-3" />
        <p className="text-sm text-muted-foreground">Card payments are processed securely by Stripe. Keys are stored server-side and never exposed here.</p>
      </header>

      <section className="retina-menu-card p-5 space-y-5">
        <h2 className="font-stencil text-sm tracking-[0.2em] text-gold flex items-center gap-2"><CreditCard className="h-4 w-4" /> Checkout Options</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">Allow pay at pickup</div>
            <p className="text-xs text-muted-foreground">Customers can place an order without paying online.</p>
          </div>
          <Switch checked={payAtPickup} onCheckedChange={setPayAtPickup} />
        </div>
      </section>

      <section className="retina-menu-card p-5 space-y-5">
        <h2 className="font-stencil text-sm tracking-[0.2em] text-gold">Fees</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2 w-[160px]">
            <Label htmlFor="delivery-fee">Delivery fee ($)</Label>
            <Input id="delivery-fee" value={deliveryFee.value} inputMode="decimal" onChange={(e) => setDeliveryFee({ ...deliveryFee, value: Number(e.target.value) })} className="h-11" />
          </div>
          <div className="flex items-center gap-2 h-11">
            <Switch checked={deliveryFee.enabled} onCheckedChange={(v) => setDeliveryFee({ ...deliveryFee, enabled: v })} />
            <span className="text-sm text-muted-foreground">Enabled</span>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2 w-[160px]">
            <Label htmlFor="service-fee">Service fee (%)</Label>
            <Input id="service-fee" value={serviceFee.value} inputMode="decimal" onChange={(e) => setServiceFee({ ...serviceFee, value: Number(e.target.value) })} className="h-11" />
          </div>
          <div className="flex items-center gap-2 h-11">
            <Switch checked={serviceFee.enabled} onCheckedChange={(v) => setServiceFee({ ...serviceFee, enabled: v })} />
            <span className="text-sm text-muted-foreground">Enabled</span>
          </div>
        </div>
      </section>

      <Button onClick={save} disabled={saving} className="h-11 bg-primary hover:bg-primary/90 font-stencil">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Save className="h-4 w-4" /> Save Payment Settings</>)}
      </Button>
    </div>
  );
};

export default AdminPayments;
