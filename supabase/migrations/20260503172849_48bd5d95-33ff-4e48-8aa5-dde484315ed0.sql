-- Orders: new discount tracking columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_id uuid,
  ADD COLUMN IF NOT EXISTS discount_name text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_status text DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS community_group text,
  ADD COLUMN IF NOT EXISTS discount_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS discount_verified_by uuid;

-- special_items
CREATE TABLE IF NOT EXISTS public.special_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  special_id uuid REFERENCES public.specials(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id),
  item_name text NOT NULL,
  description text,
  regular_price numeric,
  special_price numeric NOT NULL,
  selected_options jsonb DEFAULT '[]'::jsonb,
  included_sides int DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.special_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Special items public read"
  ON public.special_items FOR SELECT
  USING (
    is_active = true
    AND EXISTS (SELECT 1 FROM public.specials s WHERE s.id = special_items.special_id AND s.is_active = true)
  );

CREATE POLICY "Admins manage special items"
  ON public.special_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- community_discounts
CREATE TABLE IF NOT EXISTS public.community_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  eligible_groups jsonb NOT NULL DEFAULT '[]'::jsonb,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  discount_value numeric NOT NULL,
  min_subtotal numeric DEFAULT 0,
  max_discount numeric,
  requires_id_verification boolean DEFAULT true,
  allow_online_selection boolean DEFAULT true,
  is_active boolean DEFAULT true,
  terms text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community discounts public read"
  ON public.community_discounts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage community discounts"
  ON public.community_discounts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_community_discounts_updated_at
  BEFORE UPDATE ON public.community_discounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- holiday_events
CREATE TABLE IF NOT EXISTS public.holiday_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_name text NOT NULL,
  holiday_date date NOT NULL,
  holiday_type text NOT NULL DEFAULT 'federal' CHECK (holiday_type IN ('federal','business_observance','local_event','custom')),
  business_status text DEFAULT 'Open' CHECK (business_status IN ('Open','Closed','Special Hours')),
  open_time time,
  close_time time,
  banner_title text,
  banner_message text,
  special_id uuid REFERENCES public.specials(id),
  is_active boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.holiday_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Holiday events public read"
  ON public.holiday_events FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage holiday events"
  ON public.holiday_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_holiday_events_updated_at
  BEFORE UPDATE ON public.holiday_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_holiday_events_date ON public.holiday_events(holiday_date);
CREATE INDEX IF NOT EXISTS idx_community_discounts_active ON public.community_discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_special_items_special ON public.special_items(special_id);