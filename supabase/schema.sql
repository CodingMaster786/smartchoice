create table categories(id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, icon text default '🛍️', sort int default 0);
create table subcategories(id uuid primary key default gen_random_uuid(), category_id uuid references categories on delete cascade, name text not null, slug text not null);
create table products(id uuid primary key default gen_random_uuid(), name text not null, brand text, image_url text, original_price numeric not null, price numeric not null,
 category_id uuid references categories on delete set null, subcategory_id uuid references subcategories on delete set null, affiliate_url text, trending boolean default false, created_at timestamptz default now());
create table banners(id uuid primary key default gen_random_uuid(), title text, subtitle text, image_url text, link text default '/', active boolean default true, sort int default 0);
create table admin_users(email text primary key);

alter table categories enable row level security; alter table subcategories enable row level security;
alter table products enable row level security; alter table banners enable row level security; alter table admin_users enable row level security;
create function is_admin() returns boolean language sql security definer as $$ select exists(select 1 from admin_users where email = auth.jwt()->>'email') $$;
do $$ declare t text; begin foreach t in array array['categories','subcategories','products','banners'] loop
 execute format('create policy "read %1$s" on %1$s for select using (true)', t);
 execute format('create policy "admin write %1$s" on %1$s for all using (is_admin()) with check (is_admin())', t);
end loop; end $$;
create policy "self check" on admin_users for select using (email = auth.jwt()->>'email');

insert into storage.buckets(id,name,public) values('product-images','product-images',true);
create policy "img read" on storage.objects for select using (bucket_id='product-images');
create policy "img admin write" on storage.objects for all using (bucket_id='product-images' and is_admin()) with check (bucket_id='product-images' and is_admin());

insert into categories(name,slug,icon,sort) values ('Mobiles','mobiles','📱',1),('Electronics','electronics','🎧',2),('Fashion','fashion','👗',3),('Home & Kitchen','home-kitchen','🍳',4),('Beauty & Personal Care','beauty','💄',5),('Grocery','grocery','🛒',6),('Sports','sports','🏏',7),('Toys','toys','🧸',8),('Appliances','appliances','🧊',9),('Accessories','accessories','👜',10);
insert into subcategories(category_id,name,slug) select c.id,v.n,lower(replace(v.n,' ','-')) from (values
('mobiles','Smartphones'),('mobiles','Feature Phones'),('mobiles','Mobile Cases'),('mobiles','Power Banks'),
('electronics','Headphones'),('electronics','Smart Watches'),('electronics','Laptops'),('electronics','Speakers'),('electronics','Cameras'),('electronics','Computer Accessories'),
('fashion','Men Clothing'),('fashion','Women Clothing'),('fashion','Footwear'),('fashion','Watches'),
('home-kitchen','Cookware'),('home-kitchen','Furniture'),('home-kitchen','Decor'),('home-kitchen','Storage'),
('beauty','Skincare'),('beauty','Makeup'),('beauty','Haircare'),('beauty','Grooming'),
('grocery','Snacks'),('grocery','Beverages'),('grocery','Staples'),('grocery','Dry Fruits'),
('sports','Cricket'),('sports','Fitness'),('sports','Cycling'),('sports','Badminton'),
('toys','Action Figures'),('toys','Board Games'),('toys','Soft Toys'),('toys','Learning'),
('appliances','Air Conditioners'),('appliances','Refrigerators'),('appliances','Washing Machines'),('appliances','Microwaves'),
('accessories','Bags'),('accessories','Wallets'),('accessories','Sunglasses'),('accessories','Belts')) v(cs,n) join categories c on c.slug=v.cs;

-- SAMPLE products (no affiliate link yet: Buy Now falls back to a Flipkart search until you add your real link in the admin panel)
insert into products(name,brand,original_price,price,category_id,subcategory_id,trending) select v.n,v.b,v.o,v.p,c.id,s.id,v.t from (values
('Wireless Bluetooth Headphones','SoundPeak',2999,1299,'electronics','Headphones',true),
('Fitness Smart Watch 1.8" Display','TimeFit',5999,2499,'electronics','Smart Watches',true),
('Portable Bluetooth Speaker 20W','BoomBox',3499,1799,'electronics','Speakers',false),
('5G Smartphone 8GB/128GB','Nova',24999,17999,'mobiles','Smartphones',true),
('20000mAh Power Bank','ChargeMax',2499,1199,'mobiles','Power Banks',false),
('Men Running Shoes','StrideX',3999,1599,'fashion','Footwear',true),
('Non-Stick Cookware Set 5 pcs','CookEase',3299,1499,'home-kitchen','Cookware',false),
('Cricket Bat Kashmir Willow','HitPro',2199,1099,'sports','Cricket',false)) v(n,b,o,p,cs,sn,t)
join categories c on c.slug=v.cs join subcategories s on s.category_id=c.id and s.name=v.sn;
insert into banners(title,subtitle,link,sort) values ('Mega Savings Week','Up to 70% off on top brands','/search?q=',1),('Mobile Fest','Best smartphone deals today','/c/mobiles',2);
-- After creating your admin user in Supabase Auth, run:  insert into admin_users values ('you@example.com');
