/**
 * SectionHeader.tsx
 * Controls: the badge + title + gold line + subtitle block used at the top of
 * nearly every website section. Change it once here and every section updates.
 */
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Props = {
  /** Small uppercase pill above the title */
  badge?: string;
  badgeIcon?: LucideIcon;
  /** Main heading */
  title: string;
  /** Supporting sentence under the heading */
  subtitle?: string;
  /** Center the block (default) or align left */
  align?: "center" | "left";
  className?: string;
};

export function SectionHeader({
  badge,
  badgeIcon: Icon,
  title,
  subtitle,
  align = "center",
  className = "",
}: Props) {
  const centered = align === "center";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={`${centered ? "text-center" : ""} mb-10 ${className}`}
    >
      {badge && (
        <span className="luxury-badge mb-4 inline-flex items-center gap-2">
          {Icon && <Icon className="h-3 w-3" />}
          {badge}
        </span>
      )}
      <h2 className="luxury-menu-title text-4xl md:text-5xl mb-3">{title}</h2>
      <span className={`luxury-gold-line block mb-3 ${centered ? "mx-auto" : ""}`} />
      {subtitle && (
        <p className={`luxury-subtitle ${centered ? "max-w-2xl mx-auto" : "max-w-xl"}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
