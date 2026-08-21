const groups = ["Law Enforcement", "Firefighters", "Teachers", "Veterans"] as const;

type CommunityHeroesSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CommunityHeroesSelector({ value, onChange }: CommunityHeroesSelectorProps) {
  return (
    <div className="rounded-2xl border border-gold/20 bg-card p-5">
      <div className="font-serif text-2xl text-foreground">Community Heroes Deal</div>
      <p className="mt-1 text-sm text-gold">Community Heroes Deal — 10% off eligible orders.</p>
      <p className="mt-1 text-xs text-muted-foreground">Valid ID may be requested at pickup or delivery.</p>
      <p className="mt-1 text-xs text-muted-foreground">Never upload or send ID photos through checkout.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange("")}
          className={`rounded-xl border px-4 py-3 text-left ${value === "" ? "border-gold bg-background/80" : "border-border bg-background/40 hover:border-gold/30"}`}
        >
          <div className="font-stencil text-xs uppercase tracking-[0.2em]">No Community Group</div>
        </button>
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => onChange(group)}
            className={`rounded-xl border px-4 py-3 text-left ${value === group ? "border-gold bg-background/80" : "border-border bg-background/40 hover:border-gold/30"}`}
          >
            <div className="font-stencil text-xs uppercase tracking-[0.2em]">{group}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
