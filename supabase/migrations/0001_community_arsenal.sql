-- Shared arsenal entries published by any signed-in user
create table if not exists public.community_arsenal (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  author_username text not null,
  kind text not null check (kind in ('gotcha','trick','tip')),
  text text not null check (length(text) between 3 and 800),
  topic_id text,
  upvotes int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists community_arsenal_kind_idx on public.community_arsenal (kind);
create index if not exists community_arsenal_topic_idx on public.community_arsenal (topic_id);
create index if not exists community_arsenal_created_idx on public.community_arsenal (created_at desc);

-- One upvote per user per entry
create table if not exists public.community_arsenal_upvotes (
  entry_id uuid references public.community_arsenal(id) on delete cascade not null,
  voter_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (entry_id, voter_id)
);

-- RLS: anyone (even unauthenticated) can SELECT; only authenticated users can INSERT their own row; only authors can DELETE their own row
alter table public.community_arsenal enable row level security;
alter table public.community_arsenal_upvotes enable row level security;

create policy "community read" on public.community_arsenal
  for select using (true);

create policy "community insert own" on public.community_arsenal
  for insert with check (auth.uid() = author_id);

create policy "community delete own" on public.community_arsenal
  for delete using (auth.uid() = author_id);

create policy "upvotes read" on public.community_arsenal_upvotes
  for select using (true);

create policy "upvotes insert own" on public.community_arsenal_upvotes
  for insert with check (auth.uid() = voter_id);

create policy "upvotes delete own" on public.community_arsenal_upvotes
  for delete using (auth.uid() = voter_id);

-- Trigger: keep upvotes count in sync
create or replace function public.community_arsenal_recount() returns trigger
  language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update public.community_arsenal set upvotes = upvotes + 1 where id = new.entry_id;
  elsif tg_op = 'DELETE' then
    update public.community_arsenal set upvotes = greatest(0, upvotes - 1) where id = old.entry_id;
  end if;
  return null;
end$$;

drop trigger if exists trg_community_arsenal_upvotes on public.community_arsenal_upvotes;
create trigger trg_community_arsenal_upvotes
  after insert or delete on public.community_arsenal_upvotes
  for each row execute function public.community_arsenal_recount();
