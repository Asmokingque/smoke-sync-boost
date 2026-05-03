
DO $$
DECLARE
  base text := 'https://rqlefpspupxniwtlcdqp.supabase.co/storage/v1/object/public/menu-images/';
BEGIN
  UPDATE public.menu_items SET image_url = base || 'chicken-lb.jpg'              WHERE id = '7b259861-1773-4537-a424-5a90d7f76f19';
  UPDATE public.menu_items SET image_url = base || 'potato-salad.jpg'            WHERE id = 'a68ef0b6-4c2f-44c6-841a-c7e3ec702cfa';
  UPDATE public.menu_items SET image_url = base || 'cake.jpg'                    WHERE id = '0d0d82c9-c7c9-4b1e-94ca-3a826c6b7f67';
  UPDATE public.menu_items SET image_url = base || 'neckbones-rice-v2.jpg'       WHERE id = 'e8c7d22e-d81e-483c-bb87-9b73ee4311ff';
  UPDATE public.menu_items SET image_url = base || 'ribs-spare-baby-back.jpg'    WHERE id = '9c95daaa-01df-4a3e-985a-8fcd53fac31d';
  UPDATE public.menu_items SET image_url = base || 'slab-ribs-lb.jpg'            WHERE id = 'be49f88a-eb48-4463-af10-dc029aa87c31';
  UPDATE public.menu_items SET image_url = base || 'pork-loin-v2.jpg'            WHERE id = '3f8b6c20-f4cc-4057-bc0e-330ce854231a';
  UPDATE public.menu_items SET image_url = base || 'baked-beans.jpg'             WHERE id = '3ad0e66e-ea8a-45a6-a4ae-38b1ca3627c1';
  UPDATE public.menu_items SET image_url = base || 'cobbler.jpg'                 WHERE id = 'aef1183d-3fc3-4409-9733-c9c633371953';
  UPDATE public.menu_items SET image_url = base || 'turkey-wings-rice-v2.jpg'    WHERE id = '61590c44-3540-4f5f-b42d-d8e8c8d9c2cc';
  UPDATE public.menu_items SET image_url = base || 'turkey-necks-veggies.jpg'    WHERE id = 'dcfa8bfe-5919-4db9-9145-d4e9e8703027';
  UPDATE public.menu_items SET image_url = base || 'chicken-leg-quarters-v2.jpg' WHERE id = '9f55ca3c-77cc-4fe3-b7ed-762fa66c6dbd';
  UPDATE public.menu_items SET image_url = base || 'mac-cheese.jpg'              WHERE id = '9c832a4f-3a66-4c88-bd3d-7161a33c81ac';
  UPDATE public.menu_items SET image_url = base || 'banana-pudding.jpg'          WHERE id = '14dd738f-7e6a-4104-89d9-6da7fc881247';
  UPDATE public.menu_items SET image_url = base || 'pork-loin-lb.jpg'            WHERE id = '2b5e0e86-1adf-49d2-b555-b39410f4ecd5';
  UPDATE public.menu_items SET image_url = base || 'cheesecake-pie.jpg'          WHERE id = '0d05bfab-36f8-474a-ab17-54eb30523889';
  UPDATE public.menu_items SET image_url = base || 'chicken-wings-v2.jpg'        WHERE id = '38aa837d-b0dc-466b-a77f-3ee09a310133';
  UPDATE public.menu_items SET image_url = base || 'meat-plate.jpg'              WHERE id = 'aff151bf-4212-4f97-a51c-db7ca4b4f672';
  UPDATE public.menu_items SET image_url = base || 'pulled-pork-lb.jpg'          WHERE id = '14e6616c-7935-400b-8f3a-1533fc22e732';
  UPDATE public.menu_items SET image_url = base || 'cowboy-beans.jpg'            WHERE id = '512face5-beb1-4a94-ac30-d58505e5cb4f';
  UPDATE public.menu_items SET image_url = base || 'pork-chops-v2.jpg'           WHERE id = 'ba03d013-e1e3-4892-8dca-7bd627dcbfe1';
  UPDATE public.menu_items SET image_url = base || 'mashed-potatoes.jpg'         WHERE id = '4b16f6c0-d304-4bd9-91e3-0bd756abbac7';
  UPDATE public.menu_items SET image_url = base || 'brisket-lb.jpg'              WHERE id = '5120f234-b606-485b-b4ea-a7c8b3579b33';
  UPDATE public.menu_items SET image_url = base || 'brunswick-stew-v2.jpg'       WHERE id = 'e602612c-821a-449d-a543-cdb5e6fbb79a';
  UPDATE public.menu_items SET image_url = base || 'boston-butts-v2.jpg'         WHERE id = 'be618217-61a1-4ae3-b977-a67b301f1573';
  UPDATE public.menu_items SET image_url = base || 'green-beans.jpg'             WHERE id = '763484fc-ee8d-420f-b54f-7d6dca836080';
  UPDATE public.menu_items SET image_url = base || 'deer-beef-lb.jpg'            WHERE id = '37e11921-3f25-41b5-a005-98ffce36204d';
  UPDATE public.menu_items SET image_url = base || 'side-salad.jpg'              WHERE id = '8196b9fb-2021-4cef-8a71-3bc3fc0ba9dc';
  UPDATE public.menu_items SET image_url = base || 'fish-fried-blackened.jpg'    WHERE id = '7eab86a1-3402-45aa-9752-e562050cd996';
  UPDATE public.menu_items SET image_url = base || 'smoked-turkey-v2.jpg'        WHERE id = '8b81a6a3-4696-4c08-854b-1390d931f419';
  UPDATE public.menu_items SET image_url = base || 'chicken-pork-lb.jpg'         WHERE id = 'eea3991c-6f7c-4638-b71d-f975f090a0d5';
  UPDATE public.menu_items SET image_url = base || 'cole-slaw.jpg'               WHERE id = '252a3bee-47ac-4713-8e78-2bc72e3ca0dc';
  UPDATE public.menu_items SET image_url = base || 'smoked-meatloaf-v2.jpg'      WHERE id = '3b164a23-32af-4bc2-a2a3-72ddac1149fe';
  UPDATE public.menu_items SET image_url = base || 'yellow-rice.jpg'             WHERE id = '2ca51637-fcab-4258-826d-cb4783949ce7';
  UPDATE public.menu_items SET image_url = base || 'white-rice.jpg'              WHERE id = '40a315af-0c19-48bc-bdf2-34f5182e6836';
  UPDATE public.menu_items SET image_url = base || 'collard-greens.jpg'          WHERE id = '109ee0ca-cef4-49a7-849f-924c04ae18a4';
  UPDATE public.menu_items SET image_url = base || 'candied-yams.jpg'            WHERE id = 'cd0c2c18-1dd1-422e-aa10-e171d26c857b';
  UPDATE public.menu_items SET image_url = base || 'bbq-dirty-rice.jpg'          WHERE id = 'e05e69dd-7fb6-4eb3-8036-b2e05688aaf8';
  UPDATE public.menu_items SET image_url = base || 'salmon-mac-cheese.jpg'       WHERE id = '5a30a73e-3c6f-41d0-b5ed-5c8492b62adf';
  UPDATE public.menu_items SET image_url = base || 'smoked-cornbread.jpg'        WHERE id = '7de7870a-17c0-4682-9919-0ce96a617cf4';
END $$;
