/**
 * RequireSuperAdmin.tsx
 * Route guard: blocks non-super-admins from super-admin-only admin sections
 * (Admin Users, Payment Settings, Site Content) and sends them back to /admin.
 */
import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthProvider";

export const NO_PERMISSION_MESSAGE = "You do not have permission to access this section.";

export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, loading } = useAdminAuth();
  const warned = useRef(false);

  useEffect(() => {
    if (!loading && !isSuperAdmin && !warned.current) {
      warned.current = true;
      toast.error(NO_PERMISSION_MESSAGE);
    }
  }, [loading, isSuperAdmin]);

  if (loading) return null;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
