ALTER VIEW public.payment_connectors_public SET (security_invoker = true);

CREATE POLICY "Anyone can view enabled connectors"
  ON public.payment_connectors FOR SELECT TO anon, authenticated
  USING (enabled = true);

REVOKE ALL ON public.payment_connectors FROM anon;
GRANT SELECT (id, provider, display_name, enabled, test_mode, supported_methods, public_config, display_order)
  ON public.payment_connectors TO anon;
