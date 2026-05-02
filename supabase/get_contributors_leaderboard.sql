-- Run in Supabase SQL Editor. Public leaderboard: aggregates approved entries × profiles.
-- Uses SECURITY DEFINER so anon can read aggregated contributor stats without fighting
-- per-row profiles RLS on bulk .in() queries from the browser.

create or replace function public.get_contributors_leaderboard()
returns table (
  id uuid,
  full_name text,
  email text,
  avatar_url text,
  contribution_count bigint,
  last_contribution_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.email,
    p.avatar_url,
    count(le.id)::bigint as contribution_count,
    max(le.created_at) as last_contribution_at
  from public.lexicon_entries le
  inner join public.profiles p on p.id = le.contributor_id
  where le.status = 'approved'
    and le.contributor_id is not null
  group by p.id, p.full_name, p.email, p.avatar_url
  order by contribution_count desc;
$$;

revoke all on function public.get_contributors_leaderboard() from public;
grant execute on function public.get_contributors_leaderboard() to anon, authenticated;
