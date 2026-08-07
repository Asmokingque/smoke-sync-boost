/**
 * PaymentConnectorSettingsModal.tsx
 * Edits public-only connector settings. Secret VALUES are never entered here —
 * only the reference names of Edge Function secrets that must be added later.
 */
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ShieldAlert } from "lucide-react";
import type { PaymentConnector } from "@/lib/paymentConnectors";

export function PaymentConnectorSettingsModal({
  connector,
  open,
  onOpenChange,
  onSave,
}: {
  connector: PaymentConnector | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (patch: Partial<PaymentConnector>) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [publicConfig, setPublicConfig] = useState("");
  const [secretRefs, setSecretRefs] = useState("");
  const [webhookStatus, setWebhookStatus] = useState("not_configured");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!connector) return;
    setDisplayName(connector.display_name);
    setTestMode(connector.test_mode);
    setPublicConfig(JSON.stringify(connector.public_config ?? {}, null, 2));
    setSecretRefs((connector.secret_refs ?? []).join(", "));
    setWebhookStatus(connector.webhook_status);
    setNotes(connector.notes ?? "");
    setJsonError(null);
  }, [connector]);

  const save = async () => {
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(publicConfig || "{}");
    } catch {
      setJsonError("Public config must be valid JSON.");
      return;
    }
    setSaving(true);
    await onSave({
      display_name: displayName,
      test_mode: testMode,
      public_config: parsed,
      secret_refs: secretRefs.split(",").map((s) => s.trim()).filter(Boolean),
      webhook_status: webhookStatus,
      notes,
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Configure {connector?.display_name ?? "Connector"}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-md border border-gold/30 bg-gold/5 p-3 text-xs flex gap-2">
          <ShieldAlert className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <span className="text-muted-foreground">
            Never paste secret API keys here. Store secret values as backend function secrets — this
            form saves only public config and the secret <em>reference names</em>.
          </span>
        </div>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pc-name">Display name</Label>
            <Input id="pc-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-11" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-sm">Test mode</div>
              <p className="text-xs text-muted-foreground">Sandbox credentials only — no live charges.</p>
            </div>
            <Switch checked={testMode} onCheckedChange={setTestMode} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pc-config">Public config (JSON)</Label>
            <Textarea
              id="pc-config"
              rows={5}
              value={publicConfig}
              onChange={(e) => { setPublicConfig(e.target.value); setJsonError(null); }}
              className="font-mono text-xs"
            />
            {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pc-secrets">Secret reference names (comma separated)</Label>
            <Input id="pc-secrets" value={secretRefs} onChange={(e) => setSecretRefs(e.target.value)} className="h-11 font-mono text-xs" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pc-webhook">Webhook status</Label>
            <Input id="pc-webhook" value={webhookStatus} onChange={(e) => setWebhookStatus(e.target.value)} className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pc-notes">Notes</Label>
            <Textarea id="pc-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90 font-stencil">
            {saving ? "Saving…" : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
