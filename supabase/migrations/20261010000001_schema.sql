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
