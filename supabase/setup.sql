-- PORTFOLIO DATABASE SETUP: paste this whole file into Supabase > SQL Editor and click Run, once.
-- It creates the tables, security rules, helper functions and default categories.

-- Tables for the portfolio. Videos live in R2; the database stores only URLs, object keys and sizes.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  color text not null default '#7c4ddb' check (color ~ '^#[0-9a-fA-F]{6}$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid references public.categories(id) on delete set null,
  description text not null default '',
  client text,
  year integer check (year between 1990 and 2100),
  thumbnail_url text check (thumbnail_url ~ '^https://'),
  thumbnail_key text,
  thumbnail_size bigint not null default 0 check (thumbnail_size >= 0),
  preview_url text check (preview_url ~ '^https://'),
  preview_key text,
  preview_size bigint not null default 0 check (preview_size >= 0),
  video_url text check (video_url ~ '^https://'),
  video_key text,
  video_size bigint not null default 0 check (video_size >= 0),
  video_provider text not null default 'r2' check (video_provider ~ '^[a-z0-9_-]{2,20}$'),
  duration text check (duration ~ '^[0-9]{1,2}:[0-9]{2}(:[0-9]{2})?$'),
  featured boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_needs_video check (not published or video_url is not null)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  logo_url text check (logo_url ~ '^https://'),
  logo_key text,
  logo_size bigint not null default 0 check (logo_size >= 0),
  website_url text check (website_url ~ '^https://'),
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row only (id = 1): About lists, contact details, message templates, clients toggle, storage cap.
create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  name text not null default 'Karthik',
  email text check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  instagram_url text check (instagram_url ~ '^https://'),
  linkedin_url text check (linkedin_url ~ '^https://'),
  whatsapp_number text check (whatsapp_number ~ '^[0-9]{8,15}$'),
  about text not null default 'I love the moment a rough timeline clicks into a story. I work closely with creators and brands, keep feedback rounds quick, and deliver in every format you need.',
  tools text[] not null default array['Premiere Pro','After Effects','DaVinci Resolve','Final Cut Pro'],
  delivery text[] not null default array['Vertical, square and widescreen cuts from one project'],
  show_clients boolean not null default false,
  email_subject text not null default 'Video editing enquiry',
  email_body text not null default E'Hi Karthik,\n\nI found your portfolio and would like to talk about a video project.\n\nProject type:\nDeadline:\nReferences:\n\nThanks!',
  whatsapp_message text not null default 'Hi Karthik, I found your portfolio and would like to talk about a video project.',
  social_message text not null default 'Hi Karthik, I found your portfolio and would like to talk about a video project.',
  storage_cap_bytes bigint not null default 10737418240 check (storage_cap_bytes > 0),
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create trigger clients_updated before update on public.clients for each row execute function public.set_updated_at();
create trigger settings_updated before update on public.site_settings for each row execute function public.set_updated_at();

create index projects_published_order_idx on public.projects (published, sort_order);
create index projects_category_idx on public.projects (category_id);
create index clients_order_idx on public.clients (sort_order);

-- Who is an admin: a row in admin_users (see supabase/create-admin.sql).
create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
create function public.clients_enabled() returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select show_clients from public.site_settings where id = 1), false);
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.clients_enabled() from public;
grant execute on function public.clients_enabled() to anon, authenticated;

alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.clients enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security; -- no policies: nobody can read it through the API

create policy "categories are public" on public.categories for select to anon, authenticated using (true);
create policy "admins manage categories" on public.categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "published projects are public" on public.projects for select to anon, authenticated using (published);
create policy "admins manage projects" on public.projects for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "published clients are public when the section is on" on public.clients for select to anon, authenticated using (published and public.clients_enabled());
create policy "admins manage clients" on public.clients for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "settings are public" on public.site_settings for select to anon, authenticated using (true);
create policy "admins update settings" on public.site_settings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Table privileges (Supabase grants broadly by default, so start from zero).
revoke all on public.categories, public.projects, public.clients, public.site_settings, public.admin_users from anon, authenticated;
grant select on public.categories, public.projects, public.clients to anon, authenticated;
grant insert, update, delete on public.categories, public.projects, public.clients to authenticated;
-- Visitors can read every settings column except storage_cap_bytes. They must list columns; select * is refused.
grant select (id, name, email, instagram_url, linkedin_url, whatsapp_number, about, tools, delivery, show_clients, email_subject, email_body, whatsapp_message, social_message, updated_at) on public.site_settings to anon;
grant select, update on public.site_settings to authenticated;

create function public.storage_used_bytes() returns bigint language sql stable set search_path = '' as $$
  select coalesce((select sum(video_size + preview_size + thumbnail_size) from public.projects), 0)::bigint
       + coalesce((select sum(logo_size) from public.clients), 0)::bigint;
$$;
create function public.reorder_projects(ids uuid[]) returns void language plpgsql set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  update public.projects p set sort_order = o.ord::integer from unnest(ids) with ordinality as o(id, ord) where p.id = o.id;
end $$;
revoke all on function public.storage_used_bytes() from public, anon;
revoke all on function public.reorder_projects(uuid[]) from public, anon;
grant execute on function public.storage_used_bytes() to authenticated;
grant execute on function public.reorder_projects(uuid[]) to authenticated;

insert into public.site_settings (id) values (1) on conflict (id) do nothing;
insert into public.categories (name, slug, color, sort_order) values
  ('Reels', 'reels', '#7c4ddb', 1), ('Brand films', 'brand-films', '#2f6fe0', 2),
  ('Music videos', 'music-videos', '#d6338a', 3), ('Documentary', 'documentary', '#0b7a6e', 4)
on conflict (slug) do nothing;
