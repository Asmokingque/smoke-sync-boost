import { Skeleton } from "@/components/ui/skeleton";

export function OrdersTableSkeleton() {
  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <Skeleton className="h-10 w-64" />
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}
