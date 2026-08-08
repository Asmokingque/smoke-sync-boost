/**
 * ConnectorTestResult.tsx
 * Renders the per-check results from a connector dry-run test.
 */
import { Check, X } from "lucide-react";

export type ConnectorCheck = { label: string; ok: boolean; detail: string };

export function ConnectorTestResult({
  checks,
  message,
  ok,
  testedAt,
}: {
  checks: ConnectorCheck[];
  message: string;
  ok: boolean;
  testedAt?: string | null;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-background/60 p-3 space-y-2">
      <p className={`text-xs ${ok ? "text-foreground" : "text-destructive"}`}>{message}</p>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li key={c.label} className="flex items-start gap-2 text-xs">
            {c.ok ? (
              <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
            ) : (
              <X className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
            )}
            <span>
              <span className="font-medium">{c.label}</span>
              <span className="text-muted-foreground"> — {c.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      {testedAt && (
        <p className="text-[11px] text-muted-foreground">
          Last tested {new Date(testedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
