import { Skeleton } from "@/components/ui/skeleton";

export function DashboardMetricSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-4 h-10 w-1/2" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );
}
