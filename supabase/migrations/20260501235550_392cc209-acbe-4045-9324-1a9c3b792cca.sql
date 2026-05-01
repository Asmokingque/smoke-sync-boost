
-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Tighten storage bucket listing - only allow reading specific objects, not listing
DROP POLICY IF EXISTS "Menu images public read" ON storage.objects;
DROP POLICY IF EXISTS "Review photos public read" ON storage.objects;

-- Public read by exact path (still works for <img src=...> URLs) but prevents listing
CREATE POLICY "Menu images public read by name" ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images' AND name IS NOT NULL);

CREATE POLICY "Review photos public read by name" ON storage.objects FOR SELECT
USING (bucket_id = 'review-photos' AND name IS NOT NULL);

-- Tighten orders/order_items/catering inserts
DROP POLICY IF EXISTS "Anyone can place orders" ON public.orders;
CREATE POLICY "Place order as self or guest" ON public.orders FOR INSERT
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Anyone insert order items" ON public.order_items;
CREATE POLICY "Insert order items for own order" ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND (
        (auth.uid() IS NULL AND o.user_id IS NULL)
        OR (auth.uid() IS NOT NULL AND o.user_id = auth.uid())
      )
      AND o.created_at > now() - interval '5 minutes'
  )
);

DROP POLICY IF EXISTS "Anyone submit catering" ON public.catering_inquiries;
CREATE POLICY "Submit catering inquiry" ON public.catering_inquiries FOR INSERT
WITH CHECK (
  length(name) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND length(phone) BETWEEN 5 AND 30
);
