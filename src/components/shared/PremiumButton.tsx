/**
 * PremiumButton.tsx
 * Controls: every branded button on the site (primary crimson / secondary
 * outline / small). Pass `to` to render a router link instead of a button.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useEditableContent";

type Props = {
  children: ReactNode;
  /** Visual style */
  variant?: "primary" | "secondary" | "small";
  /** Internal route — renders a <Link> when provided */
  to?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export function PremiumButton({
  children,
  variant = "primary",
  to,
  onClick,
  type = "button",
  disabled,
  fullWidth,
  className = "",
}: Props) {
  const theme = useTheme();
  const classes = `${theme.buttons[variant]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (to) {
    return (
      <Link to={to} className={fullWidth ? "block" : "inline-block"}>
        <span className={classes}>{children}</span>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
