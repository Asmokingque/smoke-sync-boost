/**
 * PremiumCard.tsx
 * Controls: the standard dark "luxury card" surface used for menu items,
 * specials, packages and info tiles. Use this instead of repeating classes.
 */
import type { ReactNode } from "react";
import { useTheme } from "@/hooks/useEditableContent";

type Props = {
  children: ReactNode;
  /** "base" = roomy padding, "compact" = tighter padding */
  size?: "base" | "compact";
  /** Lift the card slightly on hover */
  hover?: boolean;
  className?: string;
};

export function PremiumCard({ children, size = "base", hover = false, className = "" }: Props) {
  const theme = useTheme();
  const sizeClass = size === "compact" ? theme.cards.compact : theme.cards.base;
  return (
    <div className={`${sizeClass} ${hover ? theme.cards.hoverLift : ""} ${className}`}>
      {children}
    </div>
  );
}
