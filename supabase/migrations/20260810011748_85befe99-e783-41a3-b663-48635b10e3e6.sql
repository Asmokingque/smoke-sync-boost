WITH m(item_name, f) AS (VALUES
 ('Two-Meat Plate','two-meat-plate.jpg'),
 ('Three-Meat Plate','three-meat-plate.jpg'),
 ('Beef Ribs','beef-ribs.jpg'),
 ('Beef Ribs (Each)','beef-ribs.jpg'),
 ('Chopped Beef','chopped-beef.jpg'),
 ('Original Sausage','sausage-links.jpg'),
 ('Original Smoked Link','sausage-links.jpg'),
 ('Jalapeno Cheese Sausage','jalapeno-link.jpg'),
 ('Jalapeño Cheese Link','jalapeno-link.jpg'),
 ('Hot Link','hot-link.jpg'),
 ('Smoked Chicken Wings','wings.jpg'),
 ('Turkey Sandwich','turkey-sandwich.jpg'),
 ('Sausage Sandwich','sausage-sandwich.jpg'),
 ('Sausage Sandwich Combo','sausage-sandwich.jpg'),
 ('Brisket Street Tacos (3)','brisket-tacos.jpg'),
 ('Original BBQ Sauce','original-sauce.jpg'),
 ('Mac and Cheese','mac-cheese.jpg'),
 ('Pinto Beans','pinto-beans.jpg'),
 ('Green Beans','green-beans.jpg'),
 ('Mexican Rice','mexican-rice.jpg'),
 ('Cream Corn','cream-corn.jpg'),
 ('Potato Salad','potato-salad.jpg'),
 ('Cole Slaw','cole-slaw.jpg'),
 ('Banana Pudding','banana-pudding.jpg'),
 ('Peach Cobbler','peach-cobbler.jpg'),
 ('Sweet Potato Pie (Slice)','sweet-potato-pie.jpg')
)
UPDATE public.menu_items i
SET image_url = 'https://rqlefpspupxniwtlcdqp.supabase.co/storage/v1/object/public/menu-images/curated/' || m.f,
    updated_at = now()
FROM m WHERE i.name = m.item_name;