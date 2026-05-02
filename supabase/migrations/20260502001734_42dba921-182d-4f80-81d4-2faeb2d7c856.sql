DROP POLICY IF EXISTS "Anyone can unlike own visitor like" ON public.review_likes;

CREATE POLICY "Unlike requires valid visitor row"
  ON public.review_likes
  FOR DELETE
  TO public
  USING (length(visitor_id) BETWEEN 4 AND 100);