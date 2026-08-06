/**
 * RoleBadge.tsx
 * Controls: the Super Admin (gold) / Admin (crimson) pill shown in the
 * admin sidebar and header.
 */
import { ShieldCheck, Shield } from "lucide-react";

export function RoleBadge({ isSuperAdmin, className = "" }: { isSuperAdmin: boolean; className?: string }) {
  const tone = isSuperAdmin
    ? "border-gold/50 bg-gold/10 text-gold"
    : "border-primary/50 bg-primary/10 text-primary";
  const Icon = isSuperAdmin ? ShieldCheck : Shield;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-stencil text-[10px] uppercase tracking-[0.2em] ${tone} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {isSuperAdmin ? "Super Admin" : "Admin"}
    </span>
  );
}
