
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-documents', 'admin-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can read admin-documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'admin-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload admin-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'admin-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update admin-documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'admin-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete admin-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'admin-documents' AND public.has_role(auth.uid(), 'admin'));
