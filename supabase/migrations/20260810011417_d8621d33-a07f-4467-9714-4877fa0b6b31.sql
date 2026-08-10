WITH m(nm, img) AS (VALUES
 ('One-Meat Plate','one-meat-plate.jpg'),
 ('Sliced Brisket','sliced-brisket.jpg'),
 ('Pork Ribs','pork-ribs.jpg'),
 ('Pork Ribs by the Slab','pork-ribs.jpg'),
 ('Turkey','smoked-turkey-sliced.jpg'),
 ('Smoked Turkey Leg','turkey-leg.jpg'),
 ('Chopped Beef Sandwich','chopped-beef-sandwich.jpg'),
 ('Chopped Beef Sandwich Combo','chopped-beef-sandwich.jpg'),
 ('Sliced Brisket Sandwich Combo','brisket-sandwich.jpg'),
 ('Whole Smoked Chicken','whole-chicken.jpg'),
 ('Half Smoked Chicken','half-chicken.jpg'),
 ('Loaded Smoked Mac','loaded-mac.jpg'),
 ('Smoked Brisket Beans','brisket-beans.jpg'),
 ('Spicy BBQ Sauce','spicy-sauce.jpg'),
 ('Carolina Mustard Sauce','mustard-sauce.jpg'),
 ('Smokehouse Family Pack','family-pack.jpg'),
 ('Backyard Feast Pack','backyard-pack.jpg'),
 ('Lunch Plate','lunch-plate.jpg'),
 ('Sandwich Lunch Combo','sandwich-combo.jpg'),
 ('Turkey Sandwich Combo','turkey-combo.jpg')
)
UPDATE menu_items i
SET image_url = 'https://rqlefpspupxniwtlcdqp.supabase.co/storage/v1/object/public/menu-images/curated/' || m.img,
    updated_at = now()
FROM m WHERE i.name = m.nm;