ALTER TABLE public.menu_categories REPLICA IDENTITY FULL;
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;