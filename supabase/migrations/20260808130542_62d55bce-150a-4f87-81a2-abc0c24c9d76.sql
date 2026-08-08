-- 1) Private schema for internal role-check helpers (not exposed via the API)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.is_active_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = _user_id AND is_active = true AND role IN ('admin','super_admin')
  )
$$;

CREATE OR REPLACE FUNCTION private.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = _user_id AND is_active = true AND role = 'super_admin'
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_active_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_super_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_active_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_super_admin(uuid) TO authenticated, service_role;

-- 2) Rewrite every policy that references the public helpers to use the private ones
DO $do$
DECLARE
  r record;
  q text; w text; roles text; cmd text; sql text;
BEGIN
  FOR r IN
    SELECT p.oid, p.polname, p.polrelid::regclass::text AS tbl, p.polcmd, p.polpermissive,
           pg_get_expr(p.polqual, p.polrelid) AS qual,
           pg_get_expr(p.polwithcheck, p.polrelid) AS wc,
           (SELECT string_agg(quote_ident(rolname), ', ') FROM pg_roles WHERE oid = ANY(p.polroles)) AS rls
    FROM pg_policy p
    WHERE coalesce(pg_get_expr(p.polqual, p.polrelid), '') ~ '(has_role|is_super_admin|is_active_admin)'
       OR coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') ~ '(has_role|is_super_admin|is_active_admin)'
  LOOP
    q := r.qual; w := r.wc;
    FOREACH cmd IN ARRAY ARRAY['has_role','is_active_admin','is_super_admin'] LOOP
      q := regexp_replace(q, '(public\.)?' || cmd || '\(', 'private.' || cmd || '(', 'g');
      w := regexp_replace(w, '(public\.)?' || cmd || '\(', 'private.' || cmd || '(', 'g');
    END LOOP;

    cmd := CASE r.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE'
                         WHEN 'd' THEN 'DELETE' ELSE 'ALL' END;
    roles := coalesce(r.rls, 'public');

    EXECUTE format('DROP POLICY %I ON %s', r.polname, r.tbl);
    sql := format('CREATE POLICY %I ON %s AS %s FOR %s TO %s',
                  r.polname, r.tbl,
                  CASE WHEN r.polpermissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
                  cmd, roles);
    IF q IS NOT NULL THEN sql := sql || format(' USING (%s)', q); END IF;
    IF w IS NOT NULL THEN sql := sql || format(' WITH CHECK (%s)', w); END IF;
    EXECUTE sql;
  END LOOP;
END
$do$;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_active_admin(uuid);
DROP FUNCTION IF EXISTS public.is_super_admin(uuid);

-- protect_super_admin trigger referenced public.is_super_admin
CREATE OR REPLACE FUNCTION public.protect_super_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.role = 'super_admin'
     AND auth.uid() IS NOT NULL
     AND NOT private.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only a Super Admin can modify a Super Admin account';
  END IF;
  RETURN NEW;
END;
$$;

-- 3) payment_connectors: no more full-row public reads
DROP POLICY IF EXISTS "Anyone can view enabled connectors" ON public.payment_connectors;

CREATE OR REPLACE VIEW public.payment_connectors_public AS
  SELECT id, provider, display_name, enabled, test_mode, supported_methods, public_config, display_order
  FROM public.payment_connectors
  WHERE enabled = true;

GRANT SELECT ON public.payment_connectors_public TO anon, authenticated;
