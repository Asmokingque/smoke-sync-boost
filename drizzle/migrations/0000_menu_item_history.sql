CREATE TABLE public.menu_item_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL,
  item_name text NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid,
  changed_by_email text,
  undone_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX menu_item_history_created_idx ON public.menu_item_history (created_at DESC);
GRANT SELECT, UPDATE ON public.menu_item_history TO authenticated;
GRANT ALL ON public.menu_item_history TO service_role;
ALTER TABLE public.menu_item_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read menu history" ON public.menu_item_history FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins mark menu history undone" ON public.menu_item_history FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION private.log_menu_item_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email text;
BEGIN
  SELECT email INTO _email FROM public.admin_users WHERE user_id = auth.uid() LIMIT 1;
  IF TG_OP = 'UPDATE' THEN
    IF (to_jsonb(OLD) - 'updated_at') = (to_jsonb(NEW) - 'updated_at') THEN RETURN NEW; END IF;
    INSERT INTO public.menu_item_history(menu_item_id,item_name,action,old_data,new_data,changed_by,changed_by_email)
    VALUES (NEW.id, NEW.name, 'update', to_jsonb(OLD), to_jsonb(NEW), auth.uid(), _email);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.menu_item_history(menu_item_id,item_name,action,new_data,changed_by,changed_by_email)
    VALUES (NEW.id, NEW.name, 'create', to_jsonb(NEW), auth.uid(), _email);
    RETURN NEW;
  ELSE
    INSERT INTO public.menu_item_history(menu_item_id,item_name,action,old_data,changed_by,changed_by_email)
    VALUES (OLD.id, OLD.name, 'delete', to_jsonb(OLD), auth.uid(), _email);
    RETURN OLD;
  END IF;
END $$;
REVOKE ALL ON FUNCTION private.log_menu_item_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER menu_items_history_trg
AFTER INSERT OR UPDATE OR DELETE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION private.log_menu_item_change();