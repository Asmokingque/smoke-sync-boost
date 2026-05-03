import { cn } from "@/lib/utils";

/**
 * Thin, gradient divider line — used above/below crimson menu headings.
 */
export function SmokeDivider({ className, variant = "smoke" }: { className?: string; variant?: "smoke" | "bone" }) {
  return <div aria-hidden className={cn(variant === "bone" ? "menu-divider" : "smoke-divider", className)} />;
}
