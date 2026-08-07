CREATE POLICY "Admins can list menu images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'::app_role));