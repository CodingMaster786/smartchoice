-- Repair partner-product image Storage policies.
-- Rerunnable and limited to the partner-product-images bucket.

insert into storage.buckets (id, name, public)
values ('partner-product-images', 'partner-product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "partner product image read" on storage.objects;
drop policy if exists "partner product image upload" on storage.objects;
drop policy if exists "partner product image update" on storage.objects;
drop policy if exists "partner product image delete" on storage.objects;
drop policy if exists "admins manage partner product images" on storage.objects;

create policy "partner product image read"
  on storage.objects
  for select
  using (bucket_id = 'partner-product-images');

create policy "partner product image upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'partner-product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and array_length(storage.foldername(name), 1) >= 3
  );

create policy "partner product image update"
  on storage.objects
  for update
  to authenticated
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
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'partner-product-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'partner-product-images'
    and public.is_admin()
  );
