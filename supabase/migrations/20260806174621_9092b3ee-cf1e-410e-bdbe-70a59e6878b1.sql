
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX admin_users_email_lower_idx ON public.admin_users (lower(email));
CREATE UNIQUE INDEX admin_users_user_id_idx ON public.admin_users (user_id) WHERE user_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.admin_level(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.admin_users
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_active_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = _user_id AND is_active = true
      AND role IN ('admin','super_admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = _user_id AND is_active = true AND role = 'super_admin'
  )
$$;

CREATE POLICY "Admins view admin registry" ON public.admin_users
FOR SELECT TO authenticated
USING (public.is_active_admin(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Super admins add admins" ON public.admin_users
FOR INSERT TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins update admins" ON public.admin_users
FOR UPDATE TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins delete non super admins" ON public.admin_users
FOR DELETE TO authenticated
USING (public.is_super_admin(auth.uid()) AND role <> 'super_admin');

CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Protect super admins from being demoted/deactivated by anyone but themselves via service role
CREATE OR REPLACE FUNCTION public.protect_super_admin()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.role = 'super_admin' AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only a Super Admin can modify a Super Admin account';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_super_admin_trg
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin();

-- Link accounts to the admin registry on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  admin_row public.admin_users%ROWTYPE;
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  SELECT * INTO admin_row FROM public.admin_users
  WHERE lower(email) = lower(NEW.email) AND is_active = true
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.admin_users SET user_id = NEW.id WHERE id = admin_row.id;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, admin_row.role) ON CONFLICT DO NOTHING;
    IF admin_row.role = 'super_admin' THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
    END IF;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
