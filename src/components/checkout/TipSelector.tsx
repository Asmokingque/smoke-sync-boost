import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type TipSelectorProps = {
  value: "none" | "10" | "15" | "20" | "custom";
  customValue: string;
  onChange: (value: "none" | "10" | "15" | "20" | "custom") => void;
  onCustomValueChange: (value: string) => void;
};

export function TipSelector({ value, customValue, onChange, onCustomValueChange }: TipSelectorProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <div>
        <div className="font-serif text-2xl text-foreground">Tip</div>
        <p className="text-sm text-muted-foreground">Show some love to the team.</p>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => next && onChange(next as TipSelectorProps["value"])}
        className="grid grid-cols-2 gap-2 sm:grid-cols-5"
      >
        <ToggleGroupItem value="none" className="h-11 rounded-xl border border-border bg-background/40">No Tip</ToggleGroupItem>
        <ToggleGroupItem value="10" className="h-11 rounded-xl border border-border bg-background/40">10%</ToggleGroupItem>
        <ToggleGroupItem value="15" className="h-11 rounded-xl border border-border bg-background/40">15%</ToggleGroupItem>
        <ToggleGroupItem value="20" className="h-11 rounded-xl border border-border bg-background/40">20%</ToggleGroupItem>
        <ToggleGroupItem value="custom" className="h-11 rounded-xl border border-border bg-background/40">Custom</ToggleGroupItem>
      </ToggleGroup>
      {value === "custom" && (
        <input
          value={customValue}
          onChange={(event) => onCustomValueChange(event.target.value)}
          inputMode="decimal"
          placeholder="0.00"
          className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm"
        />
      )}
    </div>
  );
}
