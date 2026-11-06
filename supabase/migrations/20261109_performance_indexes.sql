-- Additive indexes for the existing product-list queries.
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_subcategory_id_idx on public.products(subcategory_id);
create index if not exists subcategories_category_id_idx on public.subcategories(category_id);
