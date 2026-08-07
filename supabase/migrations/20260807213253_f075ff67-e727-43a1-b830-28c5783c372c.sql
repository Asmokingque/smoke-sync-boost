
DO $$
DECLARE b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['site-images','specials-images','catering-uploads'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'admins_manage_'||b);
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR ALL TO authenticated USING (bucket_id = %L AND public.is_active_admin(auth.uid())) WITH CHECK (bucket_id = %L AND public.is_active_admin(auth.uid()))',
      'admins_manage_'||b, b, b);
  END LOOP;
END $$;
