create table if not exists public.articles (
  slug text primary key,
  position integer not null default 0,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.issues (
  number text primary key,
  position integer not null default 0,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_snapshots (
  id text primary key default 'published' check (id = 'published'),
  data jsonb not null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_revisions (
  id bigserial primary key,
  snapshot_id text not null default 'published',
  data jsonb not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists set_issues_updated_at on public.issues;
create trigger set_issues_updated_at
before update on public.issues
for each row execute function public.set_updated_at();

drop trigger if exists set_content_snapshots_updated_at on public.content_snapshots;
create trigger set_content_snapshots_updated_at
before update on public.content_snapshots
for each row execute function public.set_updated_at();

alter table public.articles enable row level security;
alter table public.issues enable row level security;
alter table public.content_snapshots enable row level security;
alter table public.content_revisions enable row level security;

drop policy if exists "Public read articles" on public.articles;
create policy "Public read articles"
on public.articles for select
using (true);

drop policy if exists "Public read issues" on public.issues;
create policy "Public read issues"
on public.issues for select
using (true);

drop policy if exists "Public read content snapshots" on public.content_snapshots;
create policy "Public read content snapshots"
on public.content_snapshots for select
using (true);

grant select on public.articles to anon, authenticated;
grant select on public.issues to anon, authenticated;
grant select on public.content_snapshots to anon, authenticated;
