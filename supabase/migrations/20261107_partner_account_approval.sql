-- Partner account approval controls.
-- Additive and rerunnable. Existing non-admin Auth users are preserved as approved.

create table if not exists public.partner_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'revoked')),
  rejection_reason text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.partner_accounts enable row level security;

insert into public.partner_accounts (user_id, email, status)
select u.id, u.email, 'approved'
from auth.users u
where u.email is not null
  and not exists (
    select 1 from public.admin_users a
    where lower(a.email) = lower(u.email)
  )
on conflict (user_id) do nothing;

create or replace function public.is_partner_approved()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.partner_accounts pa
    where pa.user_id = auth.uid()
      and pa.status = 'approved'
  );
$$;

create or replace function public.touch_partner_account()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_partner_account on public.partner_accounts;
create trigger touch_partner_account
before update on public.partner_accounts
for each row execute function public.touch_partner_account();

create or replace function public.create_partner_account_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.email is not null
     and not exists (
       select 1 from public.admin_users a
       where lower(a.email) = lower(new.email)
     ) then
    insert into public.partner_accounts (user_id, email, status)
    values (new.id, new.email, 'pending')
    on conflict (user_id) do update
      set email = excluded.email;
  end if;
  return new;
end;
$$;

drop trigger if exists create_partner_account_for_auth_user on auth.users;
create trigger create_partner_account_for_auth_user
after insert on auth.users
for each row execute function public.create_partner_account_for_auth_user();

drop policy if exists "Partners can view own account" on public.partner_accounts;
drop policy if exists "Admins manage partner accounts" on public.partner_accounts;

create policy "Partners can view own account"
  on public.partner_accounts
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins manage partner accounts"
  on public.partner_accounts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.partner_accounts to authenticated;

drop policy if exists "partners create own products" on public.partner_products;
drop policy if exists "partners update own products" on public.partner_products;

create policy "partners create own products"
  on public.partner_products for insert
  to authenticated
  with check (
    partner_id = auth.uid()
    and public.is_partner_approved()
  );

create policy "partners update own products"
  on public.partner_products for update
  to authenticated
  using (
    partner_id = auth.uid()
    and public.is_partner_approved()
  )
  with check (
    partner_id = auth.uid()
    and public.is_partner_approved()
  );

drop policy if exists "partners read own shares" on public.partner_product_shares;
drop policy if exists "partners create own shares" on public.partner_product_shares;
drop policy if exists "partners update own shares" on public.partner_product_shares;

create policy "partners read own shares"
  on public.partner_product_shares for select
  to authenticated
  using (
    partner_user_id = auth.uid()
    and public.is_partner_approved()
  );

create policy "partners create own shares"
  on public.partner_product_shares for insert
  to authenticated
  with check (
    partner_user_id = auth.uid()
    and public.is_partner_approved()
    and exists (
      select 1 from public.partner_products
      where id = product_id and partner_id = auth.uid()
    )
  );

create policy "partners update own shares"
  on public.partner_product_shares for update
  to authenticated
  using (
    partner_user_id = auth.uid()
    and public.is_partner_approved()
  )
  with check (
    partner_user_id = auth.uid()
    and public.is_partner_approved()
  );

drop policy if exists "partner product image upload" on storage.objects;
drop policy if exists "partner product image update" on storage.objects;

create policy "partner product image upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'partner-product-images'
    and public.is_partner_approved()
    and (storage.foldername(name))[1] = auth.uid()::text
    and array_length(storage.foldername(name), 1) >= 3
  );

create policy "partner product image update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'partner-product-images'
    and public.is_partner_approved()
    and (storage.foldername(name))[1] = auth.uid()::text
    and array_length(storage.foldername(name), 1) >= 2
  )
  with check (
    bucket_id = 'partner-product-images'
    and public.is_partner_approved()
    and (storage.foldername(name))[1] = auth.uid()::text
    and array_length(storage.foldername(name), 1) >= 2
  );

create index if not exists partner_accounts_status_idx
  on public.partner_accounts(status);

create index if not exists partner_accounts_email_idx
  on public.partner_accounts(lower(email));

notify pgrst, 'reload schema';
