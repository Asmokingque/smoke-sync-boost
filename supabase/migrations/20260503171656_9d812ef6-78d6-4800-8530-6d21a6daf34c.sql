-- =========================================================
-- Specials
-- =========================================================
CREATE TYPE public.special_type AS ENUM ('daily', 'lunch', 'holiday', 'featured', 'catering');

CREATE TABLE public.specials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type public.special_type NOT NULL,
  title text NOT NULL,
  description text,
  special_price numeric NOT NULL,
  regular_price numeric,
  image_url text,
  -- availability window (date range)
  available_from date,
  available_until date,
  -- daily time window (e.g., 11:00-14:00 for lunch)
  start_time time,
  end_time time,
  -- weekday bitmap: 0=Sun ... 6=Sat. NULL = all days
  weekdays smallint[] DEFAULT ARRAY[0,1,2,3,4,5,6],
  -- optional link to a federal/holiday key (hardcoded list in code)
  holiday_key text,
  is_active boolean NOT NULL DEFAULT true,
  sold_out boolean NOT NULL DEFAULT false,
  all_day_orderable boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.specials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Specials public read"
  ON public.specials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage specials"
  ON public.specials FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_specials_updated_at
  BEFORE UPDATE ON public.specials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_specials_type_active ON public.specials(type, is_active);
CREATE INDEX idx_specials_dates ON public.specials(available_from, available_until);

-- =========================================================
-- Business hours overrides (Holiday Calendar)
-- =========================================================
CREATE TYPE public.hours_override_status AS ENUM ('open', 'closed', 'special_hours');

CREATE TABLE public.business_hours_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  override_date date NOT NULL UNIQUE,
  status public.hours_override_status NOT NULL DEFAULT 'open',
  open_time time,
  close_time time,
  holiday_key text,
  label text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_hours_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hours overrides public read"
  ON public.business_hours_overrides FOR SELECT
  USING (true);

CREATE POLICY "Admins manage hours overrides"
  ON public.business_hours_overrides FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_business_hours_overrides_updated_at
  BEFORE UPDATE ON public.business_hours_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Orders: Community Heroes discount fields
-- =========================================================
CREATE TYPE public.heroes_status AS ENUM ('pending_verification', 'verified', 'removed');

ALTER TABLE public.orders
  ADD COLUMN heroes_group text,
  ADD COLUMN heroes_discount_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN heroes_discount_status public.heroes_status,
  ADD COLUMN heroes_acknowledged boolean NOT NULL DEFAULT false;

-- =========================================================
-- Seed: default Community Heroes deal settings
-- =========================================================
INSERT INTO public.business_settings (setting_key, setting_value)
VALUES (
  'community_heroes',
  jsonb_build_object(
    'enabled', true,
    'discount_percent', 10,
    'eligible_groups', jsonb_build_array('Law Enforcement', 'Firefighter', 'Teacher', 'Veteran'),
    'terms', 'Valid ID required at pickup or delivery. Discount may be adjusted if eligibility cannot be verified. One discount per order. Cannot be combined with other promotions.'
  )
)
ON CONFLICT (setting_key) DO NOTHING;

-- =========================================================
-- Seed: default lunch specials
-- =========================================================
INSERT INTO public.specials
  (type, title, description, special_price, start_time, end_time, weekdays, display_order)
VALUES
  ('lunch', 'Lunch Rib Plate',           'Smoked ribs with one classic side.',                                         12, '11:00', '14:00', ARRAY[1,2,3,4,5]::smallint[], 1),
  ('lunch', 'Pulled Pork Lunch Plate',   'Pulled pork with one classic side.',                                          11, '11:00', '14:00', ARRAY[1,2,3,4,5]::smallint[], 2),
  ('lunch', 'Chicken Quarter Lunch Plate','Smoked chicken quarter with one classic side.',                              10, '11:00', '14:00', ARRAY[1,2,3,4,5]::smallint[], 3),
  ('lunch', 'BBQ Sandwich Lunch Combo',  'BBQ sandwich with one side.',                                                 10, '11:00', '14:00', ARRAY[1,2,3,4,5]::smallint[], 4),
  ('lunch', 'Lunch Dessert Add-On',      'Add banana pudding, cobbler, cake, or cheesecake/pie.',                        5, '11:00', '14:00', ARRAY[1,2,3,4,5]::smallint[], 5);
