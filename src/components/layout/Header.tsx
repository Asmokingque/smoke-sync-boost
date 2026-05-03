import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, User as UserIcon, X, Flame } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";
import { TopAlertBar } from "./TopAlertBar";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/specials", label: "Specials" },
  { to: "/holiday-calendar", label: "Holiday Calendar" },
  { to: "/catering", label: "Catering" },
  { to: "/reviews", label: "Experience" },
  { to: "/order-status", label: "Order Status" },
  { to: "/contact", label: "Contact" },
];

export function Header({ onCartClick }: { onCartClick: () => void }) {
  const itemCount = useCart((s) => s.itemCount());
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="luxury-nav sticky top-0 z-40">
      <TopAlertBar />
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="flex items-center gap-3" aria-label="Anderson's Smoking Que home">
          <img src={logo} alt="Anderson's Smoking Que logo" className="h-12 w-12 md:h-14 md:w-14 object-contain" width={56} height={56} />
          <div className="hidden sm:block leading-none">
            <div className="font-serif text-2xl md:text-3xl tracking-tight">Anderson's</div>
            <div className="font-stencil text-[10px] md:text-xs text-gold tracking-[0.32em] mt-0.5">Smoking Que</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((n, idx) => (
            <NavLink
              key={`${n.to}-${idx}`}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `font-stencil text-sm transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-foreground/80"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/menu" className="hidden md:inline-flex">
            <button className="luxury-primary-btn h-10 px-5 font-stencil text-xs tracking-widest inline-flex items-center gap-2">
              <Flame className="h-3.5 w-3.5" /> Order Now
            </button>
          </Link>
          <Button
            onClick={onCartClick}
            variant="ghost"
            size="icon"
            className="relative h-11 w-11"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>

          <Link to={user ? (isAdmin ? "/admin" : "/account") : "/auth"} className="hidden sm:block">
            <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Account">
              <UserIcon className="h-5 w-5" />
            </Button>
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-charcoal-light border-border">
              <div className="flex flex-col gap-1 mt-8">
                {navItems.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `font-stencil text-lg py-3 px-4 rounded-md transition-colors ${
                        isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
                      }`
                    }
                  >
                    {n.label}
                  </NavLink>
                ))}
                <div className="menu-divider my-3" />
                <NavLink
                  to={user ? (isAdmin ? "/admin" : "/account") : "/auth"}
                  onClick={() => setMobileOpen(false)}
                  className="font-stencil text-lg py-3 px-4 rounded-md text-foreground hover:bg-secondary"
                >
                  {user ? (isAdmin ? "Admin Dashboard" : "My Account") : "Sign In"}
                </NavLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
