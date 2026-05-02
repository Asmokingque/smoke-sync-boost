
-- 1. menu_item_options
CREATE TABLE IF NOT EXISTS public.menu_item_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  option_group text NOT NULL,
  option_name text NOT NULL,
  price_adjustment numeric NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_item_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu options public read"
ON public.menu_item_options FOR SELECT
USING (true);

CREATE POLICY "Admins manage menu options"
ON public.menu_item_options FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_menu_item_options_item ON public.menu_item_options(menu_item_id);

-- 2. business_settings
CREATE TABLE IF NOT EXISTS public.business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings public read"
ON public.business_settings FOR SELECT
USING (true);

CREATE POLICY "Admins manage settings"
ON public.business_settings FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_business_settings_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. menu_items extensions
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS requires_options boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_notes boolean NOT NULL DEFAULT true;

-- 4. orders extensions
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text UNIQUE,
  ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'Pickup',
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS tip numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Auto-generate human-friendly order numbers (e.g. ASQ-26050200001)
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ASQ-' || to_char(now(), 'YYMMDD') || '-' ||
                        lpad(nextval('public.order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_number_trigger ON public.orders;
CREATE TRIGGER set_order_number_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

-- 5. catering_inquiries extension
ALTER TABLE public.catering_inquiries
  ADD COLUMN IF NOT EXISTS budget_range text;
