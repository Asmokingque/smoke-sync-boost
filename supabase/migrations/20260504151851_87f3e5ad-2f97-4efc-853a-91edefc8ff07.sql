
-- Wipe existing menu data and reseed from spec
DELETE FROM public.menu_item_options;
DELETE FROM public.menu_items;
DELETE FROM public.menu_categories;

-- Categories
INSERT INTO public.menu_categories (id, name, slug, description, display_order) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Pit-Smoked Meats', 'pit-smoked-meats', 'Slow-smoked, sold by the pound.', 1),
  ('11111111-0000-0000-0000-000000000002', 'Sandwich Combos', 'sandwich-combos', 'Sandwich, chips, and a regular drink.', 2),
  ('11111111-0000-0000-0000-000000000003', 'Sandwiches', 'sandwiches', 'Smokehouse sandwiches on a fresh bun.', 3),
  ('11111111-0000-0000-0000-000000000004', 'Sides', 'sides', 'Classic smokehouse sides.', 4);

-- Items
INSERT INTO public.menu_items (id, category_id, name, description, price, price_label, is_available, is_featured, requires_options, allow_notes, display_order) VALUES
  -- Pit-Smoked Meats
  ('22222222-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Sliced Brisket','Slow-smoked brisket sliced fresh and served by the pound.',38.48,'$38.48/lb',true,true,true,true,1),
  ('22222222-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000001','Beef Ribs','Large smoked beef ribs served by weight.',39.48,'$39.48/lb',true,true,true,true,2),
  ('22222222-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000001','Pork Ribs','Tender smoked pork ribs served by the pound.',32.98,'$32.98/lb',true,false,true,true,3),
  ('22222222-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000001','Turkey','Smoked turkey served by the pound.',32.98,'$32.98/lb',true,false,true,true,4),
  ('22222222-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000001','Original Sausage','Smoked sausage served by the pound.',30.00,'$30.00/lb',true,false,true,true,5),
  ('22222222-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000001','Jalapeno Cheese Sausage','Smoked jalapeno cheese sausage served by the pound.',30.00,'$30.00/lb',true,false,true,true,6),
  ('22222222-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000001','Chopped Beef','Chopped smoked beef served by the pound.',32.98,'$32.98/lb',true,false,true,true,7),
  -- Sandwich Combos
  ('22222222-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000002','Turkey Sandwich Combo','Turkey sandwich served with chips and a regular drink.',20.25,'$20.25',true,false,false,true,1),
  ('22222222-0000-0000-0000-000000000011','11111111-0000-0000-0000-000000000002','Sliced Brisket Sandwich Combo','Sliced brisket sandwich served with chips and a regular drink.',21.75,'$21.75',true,true,false,true,2),
  ('22222222-0000-0000-0000-000000000012','11111111-0000-0000-0000-000000000002','Chopped Beef Sandwich Combo','Chopped beef sandwich served with chips and a regular drink.',20.25,'$20.25',true,false,false,true,3),
  ('22222222-0000-0000-0000-000000000013','11111111-0000-0000-0000-000000000002','Sausage Sandwich Combo','Sausage sandwich served with chips and a regular drink.',20.25,'$20.25',true,false,false,true,4),
  -- Sandwiches
  ('22222222-0000-0000-0000-000000000020','11111111-0000-0000-0000-000000000003','Turkey Sandwich','Smoked turkey served on a sandwich bun.',16.00,'$16.00',true,false,false,true,1),
  ('22222222-0000-0000-0000-000000000021','11111111-0000-0000-0000-000000000003','Sliced Brisket Sandwich','Sliced brisket served on a sandwich bun.',17.50,'$17.50',true,true,false,true,2),
  ('22222222-0000-0000-0000-000000000022','11111111-0000-0000-0000-000000000003','Chopped Beef Sandwich','Chopped beef served on a sandwich bun.',16.00,'$16.00',true,false,false,true,3),
  ('22222222-0000-0000-0000-000000000023','11111111-0000-0000-0000-000000000003','Sausage Sandwich','Smoked sausage served on a sandwich bun.',16.00,'$16.00',true,false,false,true,4),
  -- Sides
  ('22222222-0000-0000-0000-000000000030','11111111-0000-0000-0000-000000000004','Mac and Cheese','Classic smokehouse side.',4.50,'From $4.50',true,true,true,true,1),
  ('22222222-0000-0000-0000-000000000031','11111111-0000-0000-0000-000000000004','Pinto Beans','Classic smokehouse side.',4.50,'From $4.50',true,false,true,true,2),
  ('22222222-0000-0000-0000-000000000032','11111111-0000-0000-0000-000000000004','Green Beans','Classic smokehouse side.',4.50,'From $4.50',true,false,true,true,3),
  ('22222222-0000-0000-0000-000000000033','11111111-0000-0000-0000-000000000004','Mexican Rice','Classic smokehouse side.',4.50,'From $4.50',true,false,true,true,4),
  ('22222222-0000-0000-0000-000000000034','11111111-0000-0000-0000-000000000004','Cream Corn','Classic smokehouse side.',4.50,'From $4.50',true,false,true,true,5),
  ('22222222-0000-0000-0000-000000000035','11111111-0000-0000-0000-000000000004','Potato Salad','Classic smokehouse side.',4.50,'From $4.50',true,false,true,true,6),
  ('22222222-0000-0000-0000-000000000036','11111111-0000-0000-0000-000000000004','Cole Slaw','Classic smokehouse side.',4.50,'From $4.50',true,false,true,true,7);

-- Options for by-the-pound meats
INSERT INTO public.menu_item_options (menu_item_id, option_group, option_name, price_adjustment, is_required, display_order) VALUES
  -- Sliced Brisket
  ('22222222-0000-0000-0000-000000000001','Select Weight','1/2 lb',-19.24,true,1),
  ('22222222-0000-0000-0000-000000000001','Select Weight','1 lb',0,true,2),
  ('22222222-0000-0000-0000-000000000001','Select Weight','2 lbs',38.48,true,3),
  -- Beef Ribs
  ('22222222-0000-0000-0000-000000000002','Select Weight','1 lb',0,true,1),
  ('22222222-0000-0000-0000-000000000002','Select Weight','2 lbs',39.48,true,2),
  ('22222222-0000-0000-0000-000000000002','Select Weight','3 lbs',78.96,true,3),
  -- Pork Ribs
  ('22222222-0000-0000-0000-000000000003','Select Weight','1/2 lb',-16.49,true,1),
  ('22222222-0000-0000-0000-000000000003','Select Weight','1 lb',0,true,2),
  ('22222222-0000-0000-0000-000000000003','Select Weight','2 lbs',32.98,true,3),
  -- Turkey
  ('22222222-0000-0000-0000-000000000004','Select Weight','1/2 lb',-16.49,true,1),
  ('22222222-0000-0000-0000-000000000004','Select Weight','1 lb',0,true,2),
  ('22222222-0000-0000-0000-000000000004','Select Weight','2 lbs',32.98,true,3),
  -- Original Sausage
  ('22222222-0000-0000-0000-000000000005','Select Weight','1/2 lb',-15.00,true,1),
  ('22222222-0000-0000-0000-000000000005','Select Weight','1 lb',0,true,2),
  ('22222222-0000-0000-0000-000000000005','Select Weight','2 lbs',30.00,true,3),
  -- Jalapeno Cheese Sausage
  ('22222222-0000-0000-0000-000000000006','Select Weight','1/2 lb',-15.00,true,1),
  ('22222222-0000-0000-0000-000000000006','Select Weight','1 lb',0,true,2),
  ('22222222-0000-0000-0000-000000000006','Select Weight','2 lbs',30.00,true,3),
  -- Chopped Beef
  ('22222222-0000-0000-0000-000000000007','Select Weight','1/2 lb',-16.49,true,1),
  ('22222222-0000-0000-0000-000000000007','Select Weight','1 lb',0,true,2),
  ('22222222-0000-0000-0000-000000000007','Select Weight','2 lbs',32.98,true,3);

-- Options for sides (size)
DO $$
DECLARE
  side_id uuid;
  side_ids uuid[] := ARRAY[
    '22222222-0000-0000-0000-000000000030'::uuid,
    '22222222-0000-0000-0000-000000000031'::uuid,
    '22222222-0000-0000-0000-000000000032'::uuid,
    '22222222-0000-0000-0000-000000000033'::uuid,
    '22222222-0000-0000-0000-000000000034'::uuid,
    '22222222-0000-0000-0000-000000000035'::uuid,
    '22222222-0000-0000-0000-000000000036'::uuid
  ];
BEGIN
  FOREACH side_id IN ARRAY side_ids LOOP
    INSERT INTO public.menu_item_options (menu_item_id, option_group, option_name, price_adjustment, is_required, display_order) VALUES
      (side_id, 'Select Size', 'Single', 0, true, 1),
      (side_id, 'Select Size', 'Pint', 5.00, true, 2),
      (side_id, 'Select Size', 'Quart', 13.50, true, 3),
      (side_id, 'Select Size', 'Gallon', 42.50, true, 4);
  END LOOP;
END $$;
