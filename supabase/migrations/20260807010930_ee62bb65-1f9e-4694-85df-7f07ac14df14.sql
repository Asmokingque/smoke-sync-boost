CREATE TABLE public.admin_access_denials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reason text NOT NULL CHECK (reason IN ('unauthorized','inactive')),
  attempted_email text,
  user_id uuid,
  admin_role text,
  user_agent text,
  path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.admin_access_denials TO authenticated;
GRANT SELECT ON public.admin_access_denials TO authenticated;
GRANT ALL ON public.admin_access_denials TO service_role;

ALTER TABLE public.admin_access_denials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log their own denial event"
ON public.admin_access_denials FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins can read denial log"
ON public.admin_access_denials FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE INDEX idx_admin_access_denials_created_at ON public.admin_access_denials (created_at DESC);