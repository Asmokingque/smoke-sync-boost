
DROP POLICY IF EXISTS "Menu images public read by name" ON storage.objects;

CREATE POLICY "Menu images public read referenced"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM public.menu_items mi
    WHERE mi.image_url LIKE '%/menu-images/' || storage.objects.name
  )
);
