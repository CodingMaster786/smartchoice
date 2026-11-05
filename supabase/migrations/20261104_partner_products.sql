-- SmartChoice two-dashboard partner products.
-- Partner products are public immediately. There is no approval workflow.
-- Legacy status/rejection/approved_product_id columns are retained for data
-- compatibility, but are not used for visibility or authorization.

do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'Required function public.is_admin() is missing';
  end if;
end;
$$;

create or replace function public.normalize_affiliate_url(value text)
returns text
language sql
immutable
strict
as $$
  select nullif(regexp_replace(lower(btrim(value)), '/+$', ''), '');
$$;

create table if not exists public.partner_products (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  description text,
  original_price numeric not null check (original_price >= 0),
  price numeric not null check (price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  image_url text,
  affiliate_url text not null,
  status text not null default 'approved'
    check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  approved_product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.partner_products add column if not exists partner_id uuid;
alter table public.partner_products add column if not exists owner_user_id uuid;
alter table public.partner_products add column if not exists name text;
alter table public.partner_products add column if not exists brand text;
alter table public.partner_products add column if not exists description text;
alter table public.partner_products add column if not exists original_price numeric;
alter table public.partner_products add column if not exists price numeric;
alter table public.partner_products add column if not exists category_id uuid;
alter table public.partner_products add column if not exists subcategory_id uuid;
alter table public.partner_products add column if not exists image_url text;
alter table public.partner_products add column if not exists affiliate_url text;
alter table public.partner_products add column if not exists status text default 'approved';
alter table public.partner_products add column if not exists rejection_reason text;
alter table public.partner_products add column if not exists approved_product_id uuid;
alter table public.partner_products add column if not exists created_at timestamptz default now();
alter table public.partner_products add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (select 1 from public.partner_products where partner_id is null) then
    raise exception 'partner_products contains NULL partner_id values';
  end if;
  if exists (select 1 from public.partner_products where name is null or btrim(name) = '') then
    raise exception 'partner_products contains empty name values';
  end if;
  if exists (select 1 from public.partner_products where original_price is null or original_price < 0) then
    raise exception 'partner_products contains invalid original_price values';
  end if;
  if exists (select 1 from public.partner_products where price is null or price < 0) then
    raise exception 'partner_products contains invalid price values';
  end if;
  if exists (
    select 1 from public.partner_products
    where affiliate_url is null
       or public.normalize_affiliate_url(affiliate_url) is null
  ) then
    raise exception 'partner_products contains NULL or blank affiliate_url values';
  end if;
  if exists (
    select 1
    from public.partner_products
    group by public.normalize_affiliate_url(affiliate_url)
    having count(*) > 1
  ) then
    raise exception 'partner_products contains duplicate normalized affiliate URLs';
  end if;
  if exists (
    select 1 from public.partner_products
    left join public.categories on categories.id = partner_products.category_id
    where partner_products.category_id is not null and categories.id is null
  ) then
    raise exception 'partner_products contains invalid category_id values';
  end if;
  if exists (
    select 1 from public.partner_products
    left join public.subcategories on subcategories.id = partner_products.subcategory_id
    where partner_products.subcategory_id is not null and subcategories.id is null
  ) then
    raise exception 'partner_products contains invalid subcategory_id values';
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from public.products
    where public.normalize_affiliate_url(affiliate_url) is not null
    group by public.normalize_affiliate_url(affiliate_url)
    having count(*) > 1
  ) then
    raise exception 'products contains duplicate normalized affiliate URLs';
  end if;
end;
$$;

alter table public.partner_products
  alter column partner_id set not null,
  alter column name set not null,
  alter column original_price set not null,
  alter column price set not null,
  alter column affiliate_url set not null,
  alter column status set default 'approved',
  alter column status set not null,
  alter column created_at set default now(),
  alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.partner_products'::regclass
      and conname = 'partner_products_partner_id_fkey'
  ) then
    alter table public.partner_products add constraint partner_products_partner_id_fkey
      foreign key (partner_id) references auth.users(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.partner_products'::regclass
      and conname = 'partner_products_category_id_fkey'
  ) then
    alter table public.partner_products add constraint partner_products_category_id_fkey
      foreign key (category_id) references public.categories(id) on delete set null;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.partner_products'::regclass
      and conname = 'partner_products_subcategory_id_fkey'
  ) then
    alter table public.partner_products add constraint partner_products_subcategory_id_fkey
      foreign key (subcategory_id) references public.subcategories(id) on delete set null;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.partner_products'::regclass
      and conname = 'partner_products_approved_product_id_fkey'
  ) then
    alter table public.partner_products add constraint partner_products_approved_product_id_fkey
      foreign key (approved_product_id) references public.products(id) on delete set null;
  end if;
end;
$$;

create unique index if not exists products_affiliate_url_normalized_uidx
  on public.products (public.normalize_affiliate_url(affiliate_url))
  where public.normalize_affiliate_url(affiliate_url) is not null;

create unique index if not exists partner_products_affiliate_url_normalized_uidx
  on public.partner_products (public.normalize_affiliate_url(affiliate_url));

create index if not exists partner_products_partner_idx
  on public.partner_products(partner_id);
create index if not exists partner_products_status_idx
  on public.partner_products(status);
create index if not exists partner_products_category_idx
  on public.partner_products(category_id);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'partner_products'
      and column_name = 'owner_user_id'
  ) then
    execute 'create index if not exists partner_products_owner_idx on public.partner_products(owner_user_id)';
  end if;
end;
$$;

create table if not exists public.partner_product_shares (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.partner_products(id) on delete cascade,
  partner_user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null,
  created_at timestamptz not null default now()
);

alter table public.partner_product_shares add column if not exists product_id uuid;
alter table public.partner_product_shares add column if not exists partner_user_id uuid;
alter table public.partner_product_shares add column if not exists channel text;
alter table public.partner_product_shares add column if not exists created_at timestamptz default now();

do $$
begin
  if exists (
    select 1
    from public.partner_product_shares shares
    left join public.partner_products products
      on products.id = shares.product_id
     and products.partner_id = shares.partner_user_id
    where shares.product_id is null
       or shares.partner_user_id is null
       or shares.channel is null
       or btrim(shares.channel) = ''
       or products.id is null
  ) then
    raise exception 'partner_product_shares contains invalid ownership or required values';
  end if;
end;
$$;

alter table public.partner_product_shares
  alter column product_id set not null,
  alter column partner_user_id set not null,
  alter column channel set not null,
  alter column created_at set default now();

create index if not exists partner_product_shares_product_idx
  on public.partner_product_shares(product_id);
create index if not exists partner_product_shares_partner_idx
  on public.partner_product_shares(partner_user_id);

drop trigger if exists guard_partner_product_changes on public.partner_products;
drop trigger if exists sync_partner_product_from_public on public.products;
drop trigger if exists prevent_linked_public_product_delete on public.products;
drop trigger if exists guard_partner_product_share_changes on public.partner_product_shares;

create or replace function public.guard_partner_product_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_admin() then
    new.updated_at := now();
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.partner_id is distinct from auth.uid() then
      raise exception 'Partner products must belong to the authenticated partner';
    end if;
    if new.status is distinct from 'approved'
       or new.rejection_reason is not null
       or new.approved_product_id is not null then
      raise exception 'Legacy approval fields cannot be set by a partner';
    end if;
  elsif old.partner_id is distinct from auth.uid()
     or new.partner_id is distinct from old.partner_id then
    raise exception 'Partners can only modify their own products';
  elsif new.approved_product_id is distinct from old.approved_product_id
     and new.approved_product_id is not null then
    raise exception 'Partners cannot set approved_product_id';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger guard_partner_product_changes
before insert or update on public.partner_products
for each row execute function public.guard_partner_product_changes();

create or replace function public.guard_partner_product_share_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.partner_user_id is distinct from auth.uid() then
    raise exception 'Shares must belong to the authenticated partner';
  end if;
  if not exists (
    select 1 from public.partner_products
    where id = new.product_id and partner_id = auth.uid()
  ) then
    raise exception 'Partners can only share their own products';
  end if;
  return new;
end;
$$;

create trigger guard_partner_product_share_changes
before insert or update on public.partner_product_shares
for each row execute function public.guard_partner_product_share_changes();

alter table public.partner_products enable row level security;
alter table public.partner_product_shares enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('partner_products', 'partner_product_shares')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end;
$$;

drop policy if exists "public approved partner products" on public.partner_products;
drop policy if exists "partners read own products" on public.partner_products;
drop policy if exists "partners create own products" on public.partner_products;
drop policy if exists "partners create pending products" on public.partner_products;
drop policy if exists "partners update pending or rejected products" on public.partner_products;
drop policy if exists "partners update own products" on public.partner_products;
drop policy if exists "partners delete own products" on public.partner_products;
drop policy if exists "admins manage partner products" on public.partner_products;

create policy "public read partner products"
  on public.partner_products for select
  using (true);

create policy "partners create own products"
  on public.partner_products for insert to authenticated
  with check (partner_id = auth.uid());

create policy "partners update own products"
  on public.partner_products for update to authenticated
  using (partner_id = auth.uid())
  with check (partner_id = auth.uid());

create policy "admins manage partner products"
  on public.partner_products for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "partners read own shares" on public.partner_product_shares;
drop policy if exists "partners create own shares" on public.partner_product_shares;
drop policy if exists "partners delete own shares" on public.partner_product_shares;
drop policy if exists "admins manage partner shares" on public.partner_product_shares;

create policy "partners read own shares"
  on public.partner_product_shares for select to authenticated
  using (partner_user_id = auth.uid());

create policy "partners create own shares"
  on public.partner_product_shares for insert to authenticated
  with check (
    partner_user_id = auth.uid()
    and exists (
      select 1 from public.partner_products
      where id = product_id and partner_id = auth.uid()
    )
  );

create policy "partners update own shares"
  on public.partner_product_shares for update to authenticated
  using (partner_user_id = auth.uid())
  with check (partner_user_id = auth.uid());

create policy "admins manage partner shares"
  on public.partner_product_shares for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('partner-product-images', 'partner-product-images', true)
on conflict (id) do nothing;

do $$
begin
  if exists (
    select 1 from storage.buckets
    where id = 'partner-product-images' and public is distinct from true
  ) then
    raise exception 'partner-product-images must be public because the frontend uses getPublicUrl';
  end if;
end;
$$;

drop policy if exists "partner product image read" on storage.objects;
drop policy if exists "partner product image upload" on storage.objects;
drop policy if exists "partner product image update" on storage.objects;
drop policy if exists "partner product image delete" on storage.objects;
drop policy if exists "admins manage partner product images" on storage.objects;

create policy "partner product image read"
  on storage.objects for select
  using (bucket_id = 'partner-product-images');

create policy "partner product image upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'partner-product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and array_length(storage.foldername(name), 1) >= 3
  );

create policy "partner product image update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'partner-product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and array_length(storage.foldername(name), 1) >= 2
  )
  with check (
    bucket_id = 'partner-product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and array_length(storage.foldername(name), 1) >= 2
  );

create policy "admins manage partner product images"
  on storage.objects for all to authenticated
  using (bucket_id = 'partner-product-images' and public.is_admin())
  with check (bucket_id = 'partner-product-images' and public.is_admin());

notify pgrst, 'reload schema';
