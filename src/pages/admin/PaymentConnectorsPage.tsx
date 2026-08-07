/**
 * PaymentConnectorsPage — /admin/payment-connectors (Super Admin only)
 * Manage which payment providers and methods exist. No secrets live here.
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePaymentConnectors } from "@/hooks/usePaymentConnectors";
import { PaymentProviderCard } from "@/components/payments/PaymentProviderCard";
import { PaymentConnectorSettingsModal } from "@/components/payments/PaymentConnectorSettingsModal";
import { PaymentTestPanel } from "@/components/payments/PaymentTestPanel";
import type { PaymentConnector, PaymentMethod } from "@/lib/paymentConnectors";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const PaymentConnectorsPage = () => {
  const { connectors, methods, loading, error, reload } = usePaymentConnectors();
  const [editing, setEditing] = useState<PaymentConnector | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const patchConnector = async (connector: PaymentConnector, patch: Partial<PaymentConnector>) => {
    const { error: err } = await supabase
      .from("payment_connectors")
      .update(patch as never)
      .eq("id", connector.id);
    if (err) return toast.error("Couldn't save connector. Please try again.");
    toast.success(`${connector.display_name} updated.`);
    reload();
  };

  const toggleMethod = async (method: PaymentMethod, enabled: boolean) => {
    const { error: err } = await supabase.from("payment_methods").update({ enabled }).eq("id", method.id);
    if (err) return toast.error("Couldn't update that payment method.");
    reload();
  };

  const testConnector = async (connector: PaymentConnector) => {
    setTesting(connector.provider);
    const { data, error: err } = await supabase.functions.invoke("create-payment-session", {
      body: { provider: connector.provider, dryRun: true },
    });
    const ok = !err && (data as any)?.ok === true;
    const message = err?.message ?? (data as any)?.message ?? "Connector not configured";
    await patchConnector(connector, {
      last_tested_at: new Date().toISOString(),
      last_test_result: message,
      connection_status: ok ? (connector.test_mode ? "test_mode" : "active") : "not_configured",
    });
    toast[ok ? "success" : "info"](message);
    setTesting(null);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <header>
        <h1 className="font-serif text-4xl">Payment Connectors</h1>
        <span className="gold-rule-short block my-3" />
        <p className="text-sm text-muted-foreground">
          Prepare payment platforms now, activate them later. Nothing charges a customer until a
          provider is configured with backend secrets and switched on.
        </p>
      </header>

      <div className="rounded-md border border-gold/30 bg-gold/5 p-4 text-sm flex gap-3">
        <ShieldAlert className="h-4 w-4 text-gold shrink-0 mt-0.5" />
        <span className="text-muted-foreground">
          Secret API keys are never stored or shown in this dashboard. They are saved as backend
          function secrets, and all payment processing runs server-side.
        </span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-5">
        {connectors.map((c) => (
          <PaymentProviderCard
            key={c.id}
            connector={c}
            methods={methods.filter((m) => m.provider === c.provider)}
            testing={testing === c.provider}
            onConfigure={() => setEditing(c)}
            onTest={() => testConnector(c)}
            onToggleConnector={(enabled) =>
              patchConnector(c, {
                enabled,
                connection_status: enabled ? (c.test_mode ? "test_mode" : "active") : "disabled",
              })
            }
            onToggleMethod={toggleMethod}
          />
        ))}
      </div>

      <PaymentTestPanel connectors={connectors} />

      <PaymentConnectorSettingsModal
        connector={editing}
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        onSave={async (patch) => { if (editing) await patchConnector(editing, patch); }}
      />
    </div>
  );
};

export default PaymentConnectorsPage;
