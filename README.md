# SmartChoice – Affiliate Shopping Site (Next.js 14 + Tailwind + Supabase)

## 1. Run locally
1. Install Node.js 18+.  2. `npm install`
3. Create a free project at supabase.com → SQL Editor → paste & run `supabase/schema.sql`.
4. Supabase → Project Settings → API: copy *Project URL* and *anon public* key into `.env.local` (copy `.env.local.example`). **Never use the service_role key.**
5. Supabase → Authentication → Users → Add user (your email + password, tick auto-confirm).
6. SQL Editor: `insert into admin_users values ('your@email.com');`
7. `npm run dev` → http://localhost:3000 , admin at /admin

## 2. Security
Only the public anon key is in the browser. All writes (products, images, banners, categories) are blocked by Row Level Security unless the logged-in email exists in `admin_users`.

## 3. Deploy (Vercel, free)
Push to GitHub → vercel.com → Import → add the two env vars → Deploy. Optionally add your domain.

## 4. Manage products
/admin → Products: fill name, brand, prices, category, subcategory, paste your own Flipkart affiliate link, upload image → Add. Edit/Delete from the list on the right. Categories tab: add/remove categories & subcategories. Banners tab: homepage banners.
Sample products have no affiliate link: their Buy Now opens a plain Flipkart search until you add your real link (marked red in admin). Delete the samples when ready.
