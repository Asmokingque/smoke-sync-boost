-- 1. Extend catering_inquiries with extra event details
ALTER TABLE public.catering_inquiries
  ADD COLUMN IF NOT EXISTS event_time text,
  ADD COLUMN IF NOT EXISTS event_location text,
  ADD COLUMN IF NOT EXISTS food_requested text;

-- 2. Add likes_count to reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

-- 3. contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  email text,
  phone text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact message"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (
    length(customer_name) BETWEEN 1 AND 100
    AND length(message) BETWEEN 1 AND 2000
    AND (email IS NULL OR length(email) BETWEEN 3 AND 255)
    AND (phone IS NULL OR length(phone) BETWEEN 5 AND 30)
  );

CREATE POLICY "Admins view contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update contact messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete contact messages"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 4. review_likes table
CREATE TABLE IF NOT EXISTS public.review_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_review_likes_review ON public.review_likes(review_id);

ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes public read"
  ON public.review_likes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can like a review"
  ON public.review_likes
  FOR INSERT
  TO public
  WITH CHECK (
    length(visitor_id) BETWEEN 4 AND 100
    AND EXISTS (SELECT 1 FROM public.reviews r WHERE r.id = review_id AND r.is_approved = true)
  );

CREATE POLICY "Anyone can unlike own visitor like"
  ON public.review_likes
  FOR DELETE
  TO public
  USING (true);

-- 5. Trigger to keep reviews.likes_count in sync
CREATE OR REPLACE FUNCTION public.sync_review_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews SET likes_count = likes_count + 1 WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_review_likes_count_ins ON public.review_likes;
CREATE TRIGGER trg_review_likes_count_ins
AFTER INSERT ON public.review_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_review_likes_count();

DROP TRIGGER IF EXISTS trg_review_likes_count_del ON public.review_likes;
CREATE TRIGGER trg_review_likes_count_del
AFTER DELETE ON public.review_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_review_likes_count();