import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShoppingBag, MessageSquareText, UtensilsCrossed, Mail, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/admin", end: true, label: "Orders", icon: ShoppingBag },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { to: "/admin/catering", label: "Catering", icon: Mail },
];

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) setChecked(true);
  }, [loading]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-border bg-sidebar">
        <div className="p-4 md:p-6 flex items-center gap-2 border-b border-sidebar-border">
          <img src={logo} alt="" className="h-10 w-10 object-contain" width={40} height={40} />
          <div className="leading-tight">
            <div className="font-display text-lg">Admin</div>
            <div className="font-stencil text-[10px] text-primary">Anderson's Smoking Que</div>
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
