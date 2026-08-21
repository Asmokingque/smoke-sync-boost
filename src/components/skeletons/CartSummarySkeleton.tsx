import { Skeleton } from "@/components/ui/skeleton";

export function CartSummarySkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
