import { Navigate, NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShoppingBag, MessageSquareText, UtensilsCrossed, Mail, LogOut, Home, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/admin", end: true, label: "Orders", icon: ShoppingBag },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/specials", label: "Specials & Calendar", icon: Sparkles },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { to: "/admin/catering", label: "Catering", icon: Mail },
  { to: "/admin/contact", label: "Contact", icon: MessageSquareText },
];

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center retina-menu-card ring-gold-soft p-8">
          <ShieldAlert className="h-12 w-12 text-gold mx-auto mb-4" />
          <h1 className="font-serif text-4xl mb-2">Access Denied</h1>
          <span className="gold-rule-short mx-auto block mb-4" />
          <p className="text-muted-foreground mb-6 text-sm">
            This area is restricted to Anderson's Smoking Que admins. If you believe this is a mistake, sign in with the admin account.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button asChild variant="outline" className="font-stencil"><Link to="/">Back to site</Link></Button>
            <Button onClick={() => supabase.auth.signOut()} className="bg-primary hover:bg-primary/90 font-stencil">
              Switch account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-gold/20 bg-sidebar relative">
        <span aria-hidden className="hidden md:block absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
        <div className="p-4 md:p-6 flex items-center gap-2 border-b border-sidebar-border">
          <img src={logo} alt="" className="h-10 w-10 object-contain" width={40} height={40} />
          <div className="leading-tight">
            <div className="font-serif text-2xl tracking-tight">Admin</div>
            <div className="font-stencil text-[10px] text-gold tracking-[0.32em] mt-0.5">Anderson's Smoking Que</div>
          </div>
        </div>
        <nav className="flex md:flex-col gap-1 p-2 overflow-x-auto">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md font-stencil text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 mt-auto md:absolute md:bottom-0 md:w-64 border-t border-sidebar-border bg-sidebar">
          <Button asChild variant="ghost" className="w-full justify-start font-stencil text-sm">
            <Link to="/"><Home className="h-4 w-4" /> Back to site</Link>
          </Button>
          <Button onClick={() => supabase.auth.signOut()} variant="ghost" className="w-full justify-start font-stencil text-sm">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-auto pb-32 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
