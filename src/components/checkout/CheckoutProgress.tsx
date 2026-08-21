type CheckoutProgressProps = {
  currentStep: 1 | 2 | 3;
};

const steps = ["Customer Info", "Order Details", "Review & Submit"];

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((step, index) => {
        const stepNumber = (index + 1) as 1 | 2 | 3;
        const active = stepNumber <= currentStep;
        return (
          <div
            key={step}
            className={`rounded-2xl border p-4 ${active ? "border-gold/40 bg-card text-foreground" : "border-border bg-background/50 text-muted-foreground"}`}
          >
            <div className="font-stencil text-[10px] uppercase tracking-[0.25em]">Step {stepNumber}</div>
            <div className="mt-1 font-serif text-lg">{step}</div>
          </div>
        );
      })}
    </div>
  );
}
