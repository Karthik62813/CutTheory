-- Run once in the Supabase SQL editor AFTER creating your admin user under Authentication > Users.
-- Replace the email with the one you used.
insert into public.admin_users (user_id)
select id from auth.users where email = 'you@example.com'
on conflict do nothing;
