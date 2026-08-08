/**
 * PaymentProviderCard.tsx
 * Provider summary card on /admin/payment-connectors.
 */
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PaymentConnectorStatusBadge } from "./PaymentConnectorStatusBadge";
import { PaymentMethodToggle } from "./PaymentMethodToggle";
import { ConnectorTestResult, type ConnectorCheck } from "./ConnectorTestResult";
import { deriveStatus, type PaymentConnector, type PaymentMethod } from "@/lib/paymentConnectors";
import { Settings2, PlugZap } from "lucide-react";

export function PaymentProviderCard({
  connector,
  methods,
  onConfigure,
  onTest,
  onToggleConnector,
  onToggleMethod,
  testing,
  testResult,
}: {
  connector: PaymentConnector;
  methods: PaymentMethod[];
  onConfigure: () => void;
  onTest: () => void;
  onToggleConnector: (enabled: boolean) => void;
  onToggleMethod: (method: PaymentMethod, enabled: boolean) => void;
  testing?: boolean;
  testResult?: { ok: boolean; message: string; checks: ConnectorCheck[] };
}) {
  const status = deriveStatus(connector);
  const updated = connector.last_tested_at ?? connector.updated_at;


  return (
    <section className="retina-menu-card ring-gold-soft p-5 space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">{connector.display_name}</h2>
          <p className="text-[11px] text-muted-foreground mt-1">
            Last updated {updated ? new Date(updated).toLocaleString() : "—"}
            {connector.last_tested_at && (
              <> · Last tested {new Date(connector.last_tested_at).toLocaleString()}</>
            )}
          </p>

        </div>
        <div className="flex items-center gap-3">
          <PaymentConnectorStatusBadge status={status} />
          <Switch checked={connector.enabled} onCheckedChange={onToggleConnector} />
        </div>
      </header>

      <div>
        <div className="font-stencil text-[10px] tracking-[0.2em] text-gold uppercase mb-2">
          Supported Methods
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {methods.map((m) => (
            <PaymentMethodToggle
              key={m.id}
              method={m}
              disabled={!connector.enabled}
              onToggle={(v) => onToggleMethod(m, v)}
            />
          ))}
          {methods.length === 0 && (
            <p className="text-xs text-muted-foreground">No methods registered for this provider.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="outline" className="h-10" onClick={onConfigure}>
          <Settings2 className="h-4 w-4" /> Configure
        </Button>
        <Button variant="outline" className="h-10" onClick={onTest} disabled={testing}>
          <PlugZap className="h-4 w-4" /> {testing ? "Testing…" : "Test Connector"}
        </Button>
      </div>

      {testResult ? (
        <ConnectorTestResult
          ok={testResult.ok}
          message={testResult.message}
          checks={testResult.checks}
          testedAt={connector.last_tested_at}
        />
      ) : connector.last_test_result ? (
        <p className="text-xs text-muted-foreground">Last result: {connector.last_test_result}</p>
      ) : null}
    </section>
  );
}

