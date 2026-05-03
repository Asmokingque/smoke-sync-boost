import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/**
 * Crimson shimmer CTA — premium animated highlight sweep.
 * Use sparingly: hero primary action.
 */
export const ShimmerButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={cn(
        "group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-md",
        "bg-primary px-8 font-stencil text-base text-primary-foreground tracking-wider",
        "shadow-ember transition-all hover:shadow-[0_0_40px_hsl(var(--bbq-ember)/0.6)] hover:-translate-y-0.5",
        "border border-primary/60",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  ),
);
ShimmerButton.displayName = "ShimmerButton";
