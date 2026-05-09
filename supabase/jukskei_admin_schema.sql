-- Jukskei Tournament Admin Portal Schema
-- Run this in Supabase SQL Editor.
-- It is safe to rerun. It creates/repairs the tables used by the admin portal.

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('viewer', 'super_admin');
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------
-- Auth/profile support
-- ---------------------------------------------------------

create table if not exists public.admin_allowlist (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role public.app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    inner join public.admin_allowlist a
      on lower(a.email) = lower(p.email)
    where p.id = auth.uid()
      and p.role = 'super_admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role public.app_role;
begin
  if exists (
    select 1
    from public.admin_allowlist
    where lower(email) = lower(new.email)
  ) then
    assigned_role := 'super_admin';
  else
    assigned_role := 'viewer';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'user_name',
      ''
    ),
    assigned_role
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------
-- Content tables
-- ---------------------------------------------------------

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  division text,
  logo_url text,
  banner_logo_url text,
  total_score numeric not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teams add column if not exists slug text unique;
alter table public.teams add column if not exists banner_logo_url text;
alter table public.teams add column if not exists logo_url text;
alter table public.teams add column if not exists is_active boolean not null default true;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  title text,
  team_a_id uuid references public.teams(id) on delete set null,
  team_b_id uuid references public.teams(id) on delete set null,
  team_a_name text,
  team_b_name text,
  team_a_score numeric not null default 0,
  team_b_score numeric not null default 0,
  match_date timestamptz,
  venue text,
  status text not null default 'Upcoming',
  round_label text,
  is_featured boolean not null default false,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.matches drop constraint if exists matches_status_check;
alter table public.matches
  add constraint matches_status_check
  check (status in ('Live', 'Past', 'Upcoming', 'Completed', 'Cancelled'));

alter table public.matches add column if not exists team_a_name text;
alter table public.matches add column if not exists team_b_name text;
alter table public.matches add column if not exists round_label text;
alter table public.matches add column if not exists is_featured boolean not null default false;

create table if not exists public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null,
  title text not null,
  location text,
  color text not null default 'green',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null default 0,
  dow text,
  categories text[] not null default array[]::text[],
  image_url text,
  is_available boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.menu_items add column if not exists dow text;
alter table public.menu_items add column if not exists categories text[] not null default array[]::text[];
alter table public.menu_items add column if not exists image_url text;
alter table public.menu_items add column if not exists is_available boolean not null default true;

create table if not exists public.shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  details text,
  price numeric not null default 0,
  category text,
  image_url text,
  is_available boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  cover_image_url text,
  fallback_image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.gallery_categories(id) on delete cascade,
  title text,
  image_url text not null,
  is_cover boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gallery_images add column if not exists category_id uuid references public.gallery_categories(id) on delete cascade;
alter table public.gallery_images add column if not exists is_cover boolean not null default false;
alter table public.gallery_images add column if not exists is_active boolean not null default true;

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs add column if not exists metadata jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_teams_updated_at on public.teams;
create trigger set_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists set_matches_updated_at on public.matches;
create trigger set_matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists set_schedule_events_updated_at on public.schedule_events;
create trigger set_schedule_events_updated_at
before update on public.schedule_events
for each row execute function public.set_updated_at();

drop trigger if exists set_menu_items_updated_at on public.menu_items;
create trigger set_menu_items_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists set_shop_items_updated_at on public.shop_items;
create trigger set_shop_items_updated_at
before update on public.shop_items
for each row execute function public.set_updated_at();

drop trigger if exists set_gallery_categories_updated_at on public.gallery_categories;
create trigger set_gallery_categories_updated_at
before update on public.gallery_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_gallery_images_updated_at on public.gallery_images;
create trigger set_gallery_images_updated_at
before update on public.gallery_images
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- RLS
-- Public can read active content. Only super_admin can write.
-- ---------------------------------------------------------

alter table public.admin_allowlist enable row level security;
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.schedule_events enable row level security;
alter table public.menu_items enable row level security;
alter table public.shop_items enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_images enable row level security;
alter table public.app_settings enable row level security;
alter table public.audit_logs enable row level security;

-- profiles
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

drop policy if exists "Super admins can read all profiles" on public.profiles;
create policy "Super admins can read all profiles"
on public.profiles for select to authenticated
using (public.is_super_admin());

drop policy if exists "Super admins can update profiles" on public.profiles;
create policy "Super admins can update profiles"
on public.profiles for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- helper macro replacement: repeat policies for content tables
drop policy if exists "Public can read teams" on public.teams;
create policy "Public can read teams" on public.teams
for select to anon, authenticated using (is_active = true or public.is_super_admin());

drop policy if exists "Super admins can manage teams" on public.teams;
create policy "Super admins can manage teams" on public.teams
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Public can read matches" on public.matches;
create policy "Public can read matches" on public.matches
for select to anon, authenticated using (true);

drop policy if exists "Super admins can manage matches" on public.matches;
create policy "Super admins can manage matches" on public.matches
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Public can read schedule events" on public.schedule_events;
create policy "Public can read schedule events" on public.schedule_events
for select to anon, authenticated using (is_active = true or public.is_super_admin());

drop policy if exists "Super admins can manage schedule events" on public.schedule_events;
create policy "Super admins can manage schedule events" on public.schedule_events
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Public can read menu items" on public.menu_items;
create policy "Public can read menu items" on public.menu_items
for select to anon, authenticated using (is_available = true or public.is_super_admin());

drop policy if exists "Super admins can manage menu items" on public.menu_items;
create policy "Super admins can manage menu items" on public.menu_items
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Public can read shop items" on public.shop_items;
create policy "Public can read shop items" on public.shop_items
for select to anon, authenticated using (is_available = true or public.is_super_admin());

drop policy if exists "Super admins can manage shop items" on public.shop_items;
create policy "Super admins can manage shop items" on public.shop_items
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Public can read gallery categories" on public.gallery_categories;
create policy "Public can read gallery categories" on public.gallery_categories
for select to anon, authenticated using (is_active = true or public.is_super_admin());

drop policy if exists "Super admins can manage gallery categories" on public.gallery_categories;
create policy "Super admins can manage gallery categories" on public.gallery_categories
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Public can read gallery images" on public.gallery_images;
create policy "Public can read gallery images" on public.gallery_images
for select to anon, authenticated using (is_active = true or public.is_super_admin());

drop policy if exists "Super admins can manage gallery images" on public.gallery_images;
create policy "Super admins can manage gallery images" on public.gallery_images
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Public can read app settings" on public.app_settings;
create policy "Public can read app settings" on public.app_settings
for select to anon, authenticated using (true);

drop policy if exists "Super admins can manage app settings" on public.app_settings;
create policy "Super admins can manage app settings" on public.app_settings
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Super admins can read audit logs" on public.audit_logs;
create policy "Super admins can read audit logs" on public.audit_logs
for select to authenticated using (public.is_super_admin());

drop policy if exists "Super admins can create audit logs" on public.audit_logs;
create policy "Super admins can create audit logs" on public.audit_logs
for insert to authenticated with check (public.is_super_admin());

-- ---------------------------------------------------------
-- Storage bucket and policies
-- ---------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jukskei-assets',
  'jukskei-assets',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "Public can view jukskei assets" on storage.objects;
create policy "Public can view jukskei assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'jukskei-assets');

drop policy if exists "Super admins can upload jukskei assets" on storage.objects;
create policy "Super admins can upload jukskei assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'jukskei-assets' and public.is_super_admin());

drop policy if exists "Super admins can update jukskei assets" on storage.objects;
create policy "Super admins can update jukskei assets"
on storage.objects for update
to authenticated
using (bucket_id = 'jukskei-assets' and public.is_super_admin())
with check (bucket_id = 'jukskei-assets' and public.is_super_admin());

drop policy if exists "Super admins can delete jukskei assets" on storage.objects;
create policy "Super admins can delete jukskei assets"
on storage.objects for delete
to authenticated
using (bucket_id = 'jukskei-assets' and public.is_super_admin());

-- ---------------------------------------------------------
-- Grants
-- ---------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on
  public.teams,
  public.matches,
  public.schedule_events,
  public.menu_items,
  public.shop_items,
  public.gallery_categories,
  public.gallery_images,
  public.app_settings
to anon, authenticated;

grant select on public.profiles to authenticated;

grant insert, update, delete on
  public.teams,
  public.matches,
  public.schedule_events,
  public.menu_items,
  public.shop_items,
  public.gallery_categories,
  public.gallery_images,
  public.app_settings,
  public.audit_logs
to authenticated;

grant update on public.profiles to authenticated;

-- ---------------------------------------------------------
-- Optional starter categories
-- ---------------------------------------------------------

insert into public.gallery_categories (title, slug, sort_order)
values
  ('Opening Ceremony', 'opening-ceremony', 1),
  ('Teams', 'teams', 2),
  ('Action Shots', 'action-shots', 3),
  ('Awards', 'awards', 4)
on conflict (slug) do nothing;

-- Verify
select 'jukskei_admin_schema_ready' as status;
