/**
 * AdminFormCard.tsx
 * Shared card shell for admin editor sections — title, optional hint, and an
 * optional right-hand action slot.
 */
import type { ReactNode } from "react";

type Props = {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminFormCard({ title, hint, action, children, className = "" }: Props) {
  return (
    <section className={`retina-menu-card p-5 space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-stencil text-sm tracking-[0.2em] text-gold uppercase">{title}</h2>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
