CREATE TABLE public.content_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key text NOT NULL UNIQUE,
  content_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.content_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_overrides TO authenticated;
GRANT ALL ON public.content_overrides TO service_role;

ALTER TABLE public.content_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content overrides are publicly readable"
  ON public.content_overrides FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert content overrides"
  ON public.content_overrides FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content overrides"
  ON public.content_overrides FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content overrides"
  ON public.content_overrides FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_content_overrides_updated_at
  BEFORE UPDATE ON public.content_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();