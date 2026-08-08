/**
 * ConnectorAutoTestCard.tsx
 * Super Admin control for the nightly automated connector test run.
 * Stores its config in business_settings.connector_auto_test.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CalendarClock, Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

const SETTING_KEY = "connector_auto_test";
const LAST_RUN_KEY = "connector_auto_test_last_run";

type Config = { enabled: boolean; hour_utc: number };
const DEFAULT_CONFIG: Config = { enabled: false, hour_utc: 8 };

export function ConnectorAutoTestCard({ onTested }: { onTested: () => void }) {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [lastRun, setLastRun] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("business_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [SETTING_KEY, LAST_RUN_KEY]);
    for (const row of data ?? []) {
      if (row.setting_key === SETTING_KEY) setConfig({ ...DEFAULT_CONFIG, ...(row.setting_value as any) });
      if (row.setting_key === LAST_RUN_KEY) setLastRun(row.setting_value);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (next: Config) => {
    setSaving(true);
    setConfig(next);
    const { error } = await supabase
      .from("business_settings")
      .upsert({ setting_key: SETTING_KEY, setting_value: next as never }, { onConflict: "setting_key" });
    setSaving(false);
    if (error) return toast.error("Couldn't save the schedule.");
    toast.success(next.enabled ? "Nightly connector testing is on." : "Nightly connector testing is off.");
  };

  const runNow = async () => {
    setRunning(true);
    const { data, error } = await supabase.functions.invoke("test-payment-connectors", {
      body: { manual: true },
    });
    setRunning(false);
    if (error || !(data as any)?.ok) {
      return toast.error(error?.message ?? (data as any)?.message ?? "Test run failed.");
    }
    const results = (data as any).results ?? [];
    toast.success(`Tested ${results.length} connector(s); ${results.filter((r: any) => r.ok).length} passed.`);
    await load();
    onTested();
  };

  return (
    <section className="retina-menu-card p-5 space-y-4">
      <h2 className="font-stencil text-sm tracking-[0.2em] text-gold flex items-center gap-2">
        <CalendarClock className="h-4 w-4" /> Automated Connector Testing
      </h2>
      <p className="text-sm text-muted-foreground">
        Runs the same checks as Test Connector for every provider on a nightly schedule and updates
        each connector's status and Last tested time automatically.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <Switch
            id="auto-test"
            checked={config.enabled}
            disabled={saving}
            onCheckedChange={(enabled) => save({ ...config, enabled })}
          />
          <Label htmlFor="auto-test" className="text-sm">Run nightly</Label>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="auto-test-hour" className="text-sm text-muted-foreground">At</Label>
          <select
            id="auto-test-hour"
            value={config.hour_utc}
            onChange={(e) => save({ ...config, hour_utc: Number(e.target.value) })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{String(h).padStart(2, "0")}:00 UTC</option>
            ))}
          </select>
        </div>

        <Button variant="outline" className="h-10" onClick={runNow} disabled={running}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          {running ? "Running…" : "Run all now"}
        </Button>
      </div>

      {lastRun?.ran_at && (
        <p className="text-xs text-muted-foreground">
          Last automated run {new Date(lastRun.ran_at).toLocaleString()} · {lastRun.passed}/{lastRun.total} passed
          {lastRun.manual ? " (manual)" : ""}
        </p>
      )}
    </section>
  );
}
