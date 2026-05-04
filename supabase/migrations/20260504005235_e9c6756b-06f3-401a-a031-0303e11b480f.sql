
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Allow users to update this flag on their own profile (RLS already restricts to own row via existing policies; ensure update policy exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can update own profile must_change_password'
  ) THEN
    -- no-op; rely on existing update policy
    NULL;
  END IF;
END $$;

UPDATE public.profiles p
SET must_change_password = true
FROM auth.users u
WHERE p.user_id = u.id
  AND LOWER(u.email) IN ('support@asmokingque.com','willie@asmokingque.com');
