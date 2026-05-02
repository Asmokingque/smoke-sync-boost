INSERT INTO storage.buckets (id, name, public) VALUES ('experience-photos', 'experience-photos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Experience photos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'experience-photos');

CREATE POLICY "Anyone can upload experience photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'experience-photos');

CREATE POLICY "Admins can update experience photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'experience-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete experience photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'experience-photos' AND has_role(auth.uid(), 'admin'::app_role));