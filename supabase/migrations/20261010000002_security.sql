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
