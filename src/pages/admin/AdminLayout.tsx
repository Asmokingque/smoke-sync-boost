import { useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthProvider";
import { logAdminDenial } from "@/lib/adminAccessLog";
import {
  Loader2, ShoppingBag, MessageSquareText, UtensilsCrossed, Mail, LogOut, Home,
  Sparkles, BookOpen, FileText, Users, Settings, CreditCard, LayoutDashboard,
  CalendarDays, Sandwich, Menu as MenuIcon, X, PanelsTopLeft, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/admin/RoleBadge";
import logo from "@/assets/logo.png";

type AdminNavItem = { to: string; label: string; icon: typeof ShoppingBag; end?: boolean; superOnly?: boolean };

const navItems: AdminNavItem[] = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/menu", label: "Menu Manager", icon: UtensilsCrossed },
  { to: "/admin/specials", label: "Specials", icon: Sparkles },
  { to: "/admin/lunch-specials", label: "Lunch Specials", icon: Sandwich },
  { to: "/admin/holiday-calendar", label: "Holiday Calendar", icon: CalendarDays },
  { to: "/admin/catering", label: "Catering Requests", icon: Mail },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { to: "/admin/contact", label: "Contact", icon: MessageSquareText },
  { to: "/admin/homepage", label: "Homepage Editor", icon: PanelsTopLeft },
  { to: "/admin/service-area", label: "Service Area", icon: MapPin },
  { to: "/admin/settings", label: "Business Settings", icon: Settings },

  { to: "/admin/payments", label: "Payment Settings", icon: CreditCard, superOnly: true },
  { to: "/admin/content", label: "Site Content", icon: FileText, superOnly: true },
  { to: "/admin/users", label: "Admin Users", icon: Users, superOnly: true },
  { to: "/admin/sop", label: "Website SOP", icon: BookOpen },
];

const AdminLayout = () => {
  const { user, adminProfile, isAdmin, isSuperAdmin, mustChangePassword, loading, signOut } = useAdminAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Signed in but not an active admin → log the denial, force sign-out, then
  // show the reason (and event ID) on the login page.
  const inactive = !!adminProfile && !adminProfile.is_active;
  const [denialEventId, setDenialEventId] = useState<string | null>(null);
  const denialLogged = useRef(false);
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      if (denialLogged.current) return;
      denialLogged.current = true;
      const wasInactive = !!adminProfile && !adminProfile.is_active;
      logAdminDenial({
        reason: wasInactive ? "inactive" : "unauthorized",
        email: user.email,
        userId: user.id,
        role: adminProfile?.role ?? null,
        path: location.pathname,
      }).then((id) => {
        setDenialEventId(id);
        signOut({ silent: true });
      });
    }
  }, [loading, user, isAdmin, adminProfile, location.pathname, signOut]);

  if (!loading && user && isAdmin && mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="font-stencil text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Verifying admin access
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ denied: true, inactive, eventId: denialEventId }}
      />
    );
  }

  const links = navItems.filter((n) => !n.superOnly || isSuperAdmin);

  const navList = (
    <nav className="flex flex-col gap-1 p-2">
      {links.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-md font-stencil text-sm whitespace-nowrap transition-colors ${
              isActive ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`
          }
        >
          <n.icon className="h-4 w-4" />
          {n.label}
        </NavLink>
      ))}
    </nav>
  );

  const footerActions = (
    <div className="p-2 border-t border-sidebar-border bg-sidebar">
      <Button asChild variant="ghost" className="w-full justify-start font-stencil text-sm">
        <Link to="/"><Home className="h-4 w-4" /> Back to site</Link>
      </Button>
      <Button onClick={() => signOut()} variant="ghost" className="w-full justify-start font-stencil text-sm">
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:min-h-screen flex-col border-r border-gold/20 bg-sidebar relative">
        <span aria-hidden className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
        <div className="p-6 flex items-center gap-3 border-b border-sidebar-border">
          <img src={logo} alt="" className="h-10 w-10 object-contain" width={40} height={40} />
          <div className="leading-tight">
            <div className="font-serif text-2xl tracking-tight">Admin</div>
            <RoleBadge isSuperAdmin={isSuperAdmin} className="mt-1" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{navList}</div>
        {footerActions}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-gold/20 bg-sidebar px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <img src={logo} alt="" className="h-8 w-8 object-contain" width={32} height={32} />
            <span className="font-serif text-xl truncate">Admin</span>
            <RoleBadge isSuperAdmin={isSuperAdmin} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        </header>

        {mobileOpen && (
          <div className="md:hidden border-b border-sidebar-border bg-sidebar">
            {navList}
            {footerActions}
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 overflow-auto pb-32 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
