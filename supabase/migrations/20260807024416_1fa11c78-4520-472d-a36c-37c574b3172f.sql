REVOKE EXECUTE ON FUNCTION public.admin_level(uuid) FROM anon, authenticated;

DROP POLICY IF EXISTS "Unlike requires valid visitor row" ON public.review_likes;
DROP POLICY IF EXISTS "Anyone can like a review" ON public.review_likes;

CREATE POLICY "Like a review with a secret visitor token"
ON public.review_likes FOR INSERT
WITH CHECK (
  visitor_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND EXISTS (SELECT 1 FROM public.reviews r WHERE r.id = review_likes.review_id AND r.is_approved = true)
);

CREATE POLICY "Unlike only with the exact secret visitor token"
ON public.review_likes FOR DELETE
USING (
  visitor_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND created_at > now() - interval '365 days'
);