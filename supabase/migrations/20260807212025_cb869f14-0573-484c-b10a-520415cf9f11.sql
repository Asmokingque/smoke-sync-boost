ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS is_sold_out boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_popular boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS online_ordering_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.menu_categories
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_menu_categories_updated_at ON public.menu_categories;
CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'pending_payment' BEFORE 'confirmed';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'out_for_delivery' AFTER 'ready';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'refunded' AFTER 'cancelled';