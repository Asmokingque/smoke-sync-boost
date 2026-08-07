/**
 * PaymentTestPanel.tsx
 * Calls the create-payment-session stub and shows the raw response so an admin
 * can confirm wiring before any real keys exist.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FlaskConical, Loader2 } from "lucide-react";
import type { PaymentConnector } from "@/lib/paymentConnectors";

export function PaymentTestPanel({ connectors }: { connectors: PaymentConnector[] }) {
  const [provider, setProvider] = useState(connectors[0]?.provider ?? "stripe");
  const [result, setResult] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("create-payment-session", {
      body: { provider, dryRun: true },
    });
    setResult(JSON.stringify(error ? { error: error.message, data } : data, null, 2));
    setRunning(false);
  };

  return (
    <section className="retina-menu-card p-5 space-y-4">
      <h2 className="font-stencil text-sm tracking-[0.2em] text-gold flex items-center gap-2">
        <FlaskConical className="h-4 w-4" /> Connector Test Panel
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="h-11 rounded-md border border-border bg-background px-3 text-sm"
        >
          {connectors.map((c) => (
            <option key={c.provider} value={c.provider}>{c.display_name}</option>
          ))}
        </select>
        <Button onClick={run} disabled={running} variant="outline" className="h-11">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run Test Request"}
        </Button>
      </div>
      {result && (
        <pre className="rounded-md border border-border/60 bg-background/60 p-3 text-xs overflow-x-auto">{result}</pre>
      )}
    </section>
  );
}
