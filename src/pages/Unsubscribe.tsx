import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const FN_URL = `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`;

type State = "validating" | "ready" | "submitting" | "done" | "already" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>("validating");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Missing unsubscribe token.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${FN_URL}?token=${encodeURIComponent(token)}`, {
          headers: { apikey: SUPABASE_ANON_KEY },
        });
        const data = await res.json();
        if (data.valid) setState("ready");
        else if (data.reason === "already_unsubscribed") setState("already");
        else {
          setState("error");
          setMessage(data.error ?? "Invalid or expired link.");
        }
      } catch {
        setState("error");
        setMessage("Could not validate link.");
      }
    })();
  }, [token]);

  const confirm = async () => {
    setState("submitting");
    try {
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) setState("done");
      else if (data.reason === "already_unsubscribed") setState("already");
      else {
        setState("error");
        setMessage(data.error ?? "Failed to unsubscribe.");
      }
    } catch {
      setState("error");
      setMessage("Failed to unsubscribe.");
    }
  };

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-md py-24 px-4 text-center">
        <h1 className="font-serif text-3xl text-gold mb-6">Unsubscribe</h1>

        {state === "validating" && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Validating link…</p>
          </div>
        )}

        {state === "ready" && (
          <>
            <p className="text-foreground mb-6">
              Click below to unsubscribe from emails from Anderson's Smoking Que.
            </p>
            <Button onClick={confirm} variant="default">Confirm unsubscribe</Button>
          </>
        )}

        {state === "submitting" && (
          <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
        )}

        {state === "done" && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-10 w-10 text-gold" />
            <p>You've been unsubscribed. We're sorry to see you go.</p>
          </div>
        )}

        {state === "already" && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 text-gold" />
            <p>You're already unsubscribed.</p>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-3 text-destructive">
            <AlertCircle className="h-10 w-10" />
            <p>{message}</p>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
