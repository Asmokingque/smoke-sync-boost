DROP VIEW IF EXISTS public.payment_connectors_public;
DROP POLICY IF EXISTS "Anyone can view enabled connectors" ON public.payment_connectors;
REVOKE ALL ON public.payment_connectors FROM anon;

CREATE TABLE IF NOT EXISTS public.public_payment_connectors (
  id uuid PRIMARY KEY,
  provider text NOT NULL,
  display_name text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  test_mode boolean NOT NULL DEFAULT true,
  supported_methods jsonb NOT NULL DEFAULT '[]'::jsonb,
  public_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0
);

GRANT SELECT ON public.public_payment_connectors TO anon, authenticated;
GRANT ALL ON public.public_payment_connectors TO service_role;
ALTER TABLE public.public_payment_connectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public connector directory is readable" ON public.public_payment_connectors;
CREATE POLICY "Public connector directory is readable"
  ON public.public_payment_connectors FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.sync_public_payment_connectors()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.public_payment_connectors WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  INSERT INTO public.public_payment_connectors
    (id, provider, display_name, enabled, test_mode, supported_methods, public_config, display_order)
  VALUES (NEW.id, NEW.provider, NEW.display_name, NEW.enabled, NEW.test_mode,
          NEW.supported_methods, NEW.public_config, NEW.display_order)
  ON CONFLICT (id) DO UPDATE SET
    provider = EXCLUDED.provider,
    display_name = EXCLUDED.display_name,
    enabled = EXCLUDED.enabled,
    test_mode = EXCLUDED.test_mode,
    supported_methods = EXCLUDED.supported_methods,
    public_config = EXCLUDED.public_config,
    display_order = EXCLUDED.display_order;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_public_payment_connectors() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS sync_public_payment_connectors_trg ON public.payment_connectors;
CREATE TRIGGER sync_public_payment_connectors_trg
AFTER INSERT OR UPDATE OR DELETE ON public.payment_connectors
FOR EACH ROW EXECUTE FUNCTION public.sync_public_payment_connectors();

INSERT INTO public.public_payment_connectors
  (id, provider, display_name, enabled, test_mode, supported_methods, public_config, display_order)
SELECT id, provider, display_name, enabled, test_mode, supported_methods, public_config, display_order
FROM public.payment_connectors
ON CONFLICT (id) DO UPDATE SET
  provider = EXCLUDED.provider,
  display_name = EXCLUDED.display_name,
  enabled = EXCLUDED.enabled,
  test_mode = EXCLUDED.test_mode,
  supported_methods = EXCLUDED.supported_methods,
  public_config = EXCLUDED.public_config,
  display_order = EXCLUDED.display_order;
