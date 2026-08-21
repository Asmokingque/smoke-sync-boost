import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSummarySkeleton() {
  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <Skeleton className="h-6 w-1/2" />
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
