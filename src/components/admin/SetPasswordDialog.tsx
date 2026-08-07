/**
 * SetPasswordDialog.tsx
 * Super Admin only: force-set a new password for an admin account without
 * sending a reset email. Calls the admin-set-password edge function.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, KeyRound, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGIT = "23456789";
const SYMBOL = "!@#$%&*?";

/** Cryptographically random password that always satisfies the server rules. */
const generatePassword = (length = 16) => {
  const all = UPPER + LOWER + DIGIT + SYMBOL;
  const required = [UPPER, LOWER, DIGIT, SYMBOL];
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b, i) =>
    i < required.length ? required[i][b % required[i].length] : all[b % all.length],
  );
  // Fisher-Yates shuffle with crypto randomness
  const shuffle = new Uint32Array(chars.length);
  crypto.getRandomValues(shuffle);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffle[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: { id: string; email: string; user_id: string | null } | null;
};

export const SetPasswordDialog = ({ open, onOpenChange, admin }: Props) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirm("");
      setShow(false);
    }
  }, [open]);

  const autoGenerate = () => {
    const next = generatePassword();
    setPassword(next);
    setConfirm(next);
    setShow(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard.");
    } catch {
      toast.error("Couldn't copy — select and copy it manually.");
    }
  };

  const submit = async () => {
    if (!admin) return;
    if (password.length < 10) return toast.error("Password must be at least 10 characters.");
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return toast.error("Include an uppercase letter, a lowercase letter, and a number.");
    }
    if (password !== confirm) return toast.error("Passwords don't match.");

    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-set-password", {
      body: { adminId: admin.id, newPassword: password },
    });
    setBusy(false);

    const message = (data as { error?: string } | null)?.error;
    if (error || message) {
      return toast.error(message ?? error?.message ?? "Couldn't set the password.");
    }

    toast.success(`Password updated for ${admin.email}. Share it with them securely.`);
    onOpenChange(false);
  };

  const notSignedUp = admin && !admin.user_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-gold" />
            Set a new password
          </DialogTitle>
          <DialogDescription>
            {notSignedUp
              ? "This admin hasn't signed up yet, so there's no account password to set."
              : `Immediately replaces the password for ${admin?.email ?? ""}. No reset email is sent — share the new password with them securely.`}
          </DialogDescription>
        </DialogHeader>

        {!notSignedUp && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="force-password">New password</Label>
                <Button type="button" variant="ghost" size="sm" onClick={autoGenerate}>
                  <RefreshCw className="h-3.5 w-3.5" /> Generate
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="force-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-20 font-mono"
                  autoComplete="new-password"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShow((s) => !s)}>
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={!password} onClick={copy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                At least 10 characters with an uppercase letter, a lowercase letter, and a number.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="force-password-confirm">Confirm password</Label>
              <Input
                id="force-password-confirm"
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-11 font-mono"
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={busy || !!notSignedUp}
            className="bg-primary hover:bg-primary/90 font-stencil"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
