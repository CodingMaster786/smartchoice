-- User-uploaded visual-search images.
-- The bucket is private: visitors may upload, but only admins may read/delete.
create table if not exists public.user_uploaded_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  image_url text not null,
  file_type text not null,
  file_size_bytes bigint not null,
  uploaded_at timestamptz not null default now(),
  constraint user_uploaded_images_path_check
    check (storage_path like 'anonymous/%'),
  constraint user_uploaded_images_type_check
    check (file_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  constraint user_uploaded_images_size_check
    check (file_size_bytes > 0 and file_size_bytes <= 5242880)
);

alter table public.user_uploaded_images enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_uploaded_images'
      and policyname = 'Anyone can record an uploaded image'
  ) then
    create policy "Anyone can record an uploaded image"
      on public.user_uploaded_images
      for insert
      to anon, authenticated
      with check (storage_path like 'anonymous/%');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_uploaded_images'
      and policyname = 'Admins can view uploaded images'
  ) then
    create policy "Admins can view uploaded images"
      on public.user_uploaded_images
      for select
      to authenticated
      using (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_uploaded_images'
      and policyname = 'Admins can delete uploaded images'
  ) then
    create policy "Admins can delete uploaded images"
      on public.user_uploaded_images
      for delete
      to authenticated
      using (public.is_admin());
  end if;
end
$$;

create index if not exists user_uploaded_images_uploaded_at_idx
  on public.user_uploaded_images (uploaded_at desc);

insert into storage.buckets (id, name, public)
values ('user-uploaded-images', 'user-uploaded-images', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Visitors can upload visual search images'
  ) then
    create policy "Visitors can upload visual search images"
      on storage.objects
      for insert
      to anon, authenticated
      with check (
        bucket_id = 'user-uploaded-images'
        and (storage.foldername(name))[1] = 'anonymous'
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can view visual search images'
  ) then
    create policy "Admins can view visual search images"
      on storage.objects
      for select
      to authenticated
      using (bucket_id = 'user-uploaded-images' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can delete visual search images'
  ) then
    create policy "Admins can delete visual search images"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'user-uploaded-images' and public.is_admin());
  end if;
end
$$;
