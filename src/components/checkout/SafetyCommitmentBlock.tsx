import { ShieldCheck } from "lucide-react";

/**
 * Styled safety & PPE commitment block using BBQ brand tokens.
 * Drop inside checkout, catering, or any page that needs a trust signal.
 */
export function SafetyCommitmentBlock() {
  return (
    <div className="rounded-lg border-l-4 border-gold bg-card/80 backdrop-blur-sm p-5 md:p-6 shadow-card">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 shrink-0 rounded-md bg-gold/10 p-2.5 border border-gold/20">
          <ShieldCheck className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h3 className="font-serif text-lg md:text-xl tracking-tight text-foreground mb-2">
            Our Commitment to Safety
          </h3>
          <span className="gold-rule-short block mb-3" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Safety is always a top priority for us. We lead by example every day by reinforcing our policies, demonstrating proper procedures, and making sure the right PPE is worn whenever it’s required.
          </p>
        </div>
      </div>
    </div>
  );
}
