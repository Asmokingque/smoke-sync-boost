/**
 * DevAdminSignIn.tsx
 * Development-only shortcut for verification runs: one-click sign-in with a
 * test admin account. Credentials come from local dev env vars — nothing is
 * hardcoded, and this component renders nothing in production builds.
 *
 * Add to .env.development:
 *   VITE_DEV_ADMIN_EMAIL=...
 *   VITE_DEV_ADMIN_PASSWORD=...
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

type Props = {
  /** Prefill the login form fields */
  onFill: (email: string, password: string) => void;
  /** Sign in directly with the test credentials */
  onSignIn: (email: string, password: string) => Promise<void>;
};

export function DevAdminSignIn({ onFill, onSignIn }: Props) {
  const [busy, setBusy] = useState(false);

  if (!import.meta.env.DEV) return null;

  const email = import.meta.env.VITE_DEV_ADMIN_EMAIL as string | undefined;
  const password = import.meta.env.VITE_DEV_ADMIN_PASSWORD as string | undefined;

  if (!email || !password) {
    return (
      <div className="mb-4 rounded-md border border-gold/30 bg-gold/5 p-3">
        <p className="font-stencil text-[10px] uppercase tracking-[0.2em] text-gold">Dev only</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Set <code>VITE_DEV_ADMIN_EMAIL</code> and <code>VITE_DEV_ADMIN_PASSWORD</code> in
          <code> .env.development</code> to enable the test admin shortcut.
        </p>
      </div>
    );
  }

  const run = async () => {
    setBusy(true);
    try {
      await onSignIn(email, password);
    } catch {
      toast.error("Test sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-4 rounded-md border border-gold/30 bg-gold/5 p-3 space-y-2">
      <p className="font-stencil text-[10px] uppercase tracking-[0.2em] text-gold">
        Dev only — test admin
      </p>
      <p className="text-xs text-muted-foreground break-all">{email}</p>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={run} disabled={busy} className="font-stencil">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          Sign in as admin
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onFill(email, password)}
          className="font-stencil"
        >
          Fill form
        </Button>
      </div>
    </div>
  );
}
