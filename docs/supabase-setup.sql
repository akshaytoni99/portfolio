-- Portfolio CMS — Supabase setup.
-- Run this in the Supabase dashboard → SQL Editor → New query → Run.

-- 1) Key/value table that holds all CMS content, activity log, and auth.
--    The server connects with the service_role key, which bypasses RLS.
create table if not exists public.cms_kv (
  key   text primary key,
  value jsonb not null default '{}'::jsonb
);

-- RLS on with no policies = locked to service_role only (the server).
-- The public site does NOT read this table directly; it reads published
-- content through the CMS API, so no anon policy is needed.
alter table public.cms_kv enable row level security;

-- 2) Storage bucket for uploaded media (images, video, PDFs). Public read so
--    <img>/<video>/resume links work on the live site.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Done. Next: copy your Project URL and the service_role key
-- (Settings → API) into the Render env vars per docs/DEPLOY.md.
