export type OrderTimelineEntry = {
  id: string;
  previous_status: string | null;
  new_status: string;
  notes: string | null;
  created_at: string;
};

export function OrderTimeline({ entries }: { entries: OrderTimelineEntry[] }) {
  if (!entries.length) {
    return <p className="text-sm text-muted-foreground">No status changes yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.id} className="relative border-l border-gold/20 pl-4">
          <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-gold" />
          <p className="font-medium text-foreground">
            {entry.previous_status ? `${entry.previous_status} → ${entry.new_status}` : entry.new_status}
          </p>
          <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
          {entry.notes && <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>}
        </li>
      ))}
    </ol>
  );
}
