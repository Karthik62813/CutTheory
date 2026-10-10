insert into public.site_settings (id) values (1) on conflict (id) do nothing;
insert into public.categories (name, slug, color, sort_order) values
  ('Reels', 'reels', '#7c4ddb', 1), ('Brand films', 'brand-films', '#2f6fe0', 2),
  ('Music videos', 'music-videos', '#d6338a', 3), ('Documentary', 'documentary', '#0b7a6e', 4)
on conflict (slug) do nothing;
