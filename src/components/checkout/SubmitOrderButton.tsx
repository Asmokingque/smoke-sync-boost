type SubmitOrderButtonProps = {
  submitting: boolean;
  disabled?: boolean;
};

export function SubmitOrderButton({ submitting, disabled }: SubmitOrderButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || submitting}
      className="h-14 w-full rounded-full border border-gold/40 bg-gradient-to-r from-primary to-primary/80 px-6 font-stencil text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-ember disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submitting ? "Submitting Order…" : "Submit Order"}
    </button>
  );
}
