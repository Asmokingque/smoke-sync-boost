CREATE OR REPLACE FUNCTION public.protect_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.role = 'super_admin'
     AND auth.uid() IS NOT NULL
     AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only a Super Admin can modify a Super Admin account';
  END IF;
  RETURN NEW;
END;
$function$;