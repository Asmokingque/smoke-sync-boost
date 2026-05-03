import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

export function TopAlertBar() {
  return (
    <div className="bg-primary text-primary-foreground text-xs">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-2 font-stencil tracking-wider">
          <Flame className="h-3.5 w-3.5" />
          <span>Now serving pickup, delivery, and catering orders.</span>
        </div>
        <nav className="flex items-center gap-4 font-stencil tracking-wider">
          <Link to="/menu" className="hover:underline underline-offset-4">Order Online</Link>
          <span className="opacity-50">|</span>
          <Link to="/catering" className="hover:underline underline-offset-4">Catering</Link>
          <span className="opacity-50">|</span>
          <Link to="/order-status" className="hover:underline underline-offset-4">Order Status</Link>
        </nav>
      </div>
    </div>
  );
}
