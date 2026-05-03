import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SmokeBackground } from "@/components/ui/SmokeBackground";

/**
 * Dark glassmorphism section with optional smoke/ember backdrop.
 * Use as a hero or featured wrapper.
 */
export function GlassSection({
  children,
  className,
  withSmoke = false,
  density = "md",
}: {
  children: ReactNode;
  className?: string;
  withSmoke?: boolean;
  density?: "sm" | "md" | "lg";
}) {
  return (
    <section className={cn("relative overflow-hidden retina-glass border-y border-border/60", className)}>
      {withSmoke && <SmokeBackground density={density} />}
      <div className="relative">{children}</div>
    </section>
  );
}
