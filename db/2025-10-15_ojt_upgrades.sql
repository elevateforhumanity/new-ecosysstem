-- Supabase migration: OJT upgrades (tokens expiry, audit, views, policies)
-- Run in Supabase SQL editor or via migration tool.

-- mentors table (if not present)
create table if not exists public.mentors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  license_number text,
  active boolean default true
);

-- timesheets (if not present)
create table if not exists public.ojt_timesheets (
  id uuid primary key default gen_random_uuid(),
  apprentice_id uuid references public.apprentices(id) on delete cascade,
  mentor_id uuid references public.mentors(id),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  minutes int generated always as (greatest(0, extract(epoch from (ended_at - started_at))/60)::int) stored,
  activity text,
  signed_by_mentor boolean default false,
  created_at timestamptz default now()
);

-- one-time sign token with expiry
create table if not exists public.ojt_sign_tokens (
  timesheet_id uuid primary key references public.ojt_timesheets(id) on delete cascade,
  token text not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);
create index if not exists idx_ojt_sign_tokens_exp on public.ojt_sign_tokens (expires_at);

-- mentor sign audit
create table if not exists public.ojt_sign_audit (
  id uuid primary key default gen_random_uuid(),
  timesheet_id uuid references public.ojt_timesheets(id) on delete cascade,
  mentor_email text,
  ip text,
  user_agent text,
  signed_at timestamptz default now()
);

-- OJT totals view
create or replace view public.v_ojt_totals as
select apprentice_id, round(sum(minutes)/60.0, 2) as ojt_hours
from public.ojt_timesheets
group by apprentice_id;

-- optional maintenance proc (cron calls)
create or replace function public.purge_expired_sign_tokens()
returns void language plpgsql security definer as $$
begin
  delete from public.ojt_sign_tokens where expires_at < now();
end $$;

-- (Optional) RLS examples (enable only if using direct REST from client)
-- alter table public.ojt_timesheets enable row level security;
-- create policy "students see own timesheets" on public.ojt_timesheets
-- for select using (auth.jwt()->>'email' = (select email from public.apprentices where id = apprentice_id));
-- create policy "students insert own timesheets" on public.ojt_timesheets
-- for insert with check (auth.jwt()->>'email' = (select email from public.apprentices where id = apprentice_id));
