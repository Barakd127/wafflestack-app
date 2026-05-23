-- 0002_user_progress.sql
-- Multi-user progress backing for WaffleStack (v1: progressStore only).
-- learningStore (Zustand XP/cards/buildings) stays per-device in v1; v2 migration adds it.

-- ── 1. profiles ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  username       text unique not null,
  display_name   text,
  role           text not null default 'student' check (role in ('student','teacher')),
  created_at     timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- ── 2. progress ──────────────────────────────────────────────────────────────
-- Mirrors src/stores/progressStore.ts UserProgress shape.
-- Typed columns for query-ability (XP, streak). Opaque JSONB for the nested objects.
create table if not exists public.progress (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  xp_total             int  not null default 0,
  xp_this_week         int  not null default 0,
  xp_this_month        int  not null default 0,
  xp_breakdown         jsonb not null default '{"quizzes":0,"masteries":0,"streaks":0}'::jsonb,
  current_streak       int  not null default 0,
  longest_streak       int  not null default 0,
  last_active_day      date,
  total_days_active    int  not null default 0,
  topics               jsonb not null default '{}'::jsonb,   -- Record<topic, TopicProgress>
  quiz_sessions        jsonb not null default '[]'::jsonb,   -- QuizSession[] (capped at 100 client-side)
  canvas_notes         jsonb not null default '{}'::jsonb,   -- Record<topic, string>
  preferences          jsonb not null default '{"theme":"light","language":"hebrew"}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── 3. canvas_scenes ─────────────────────────────────────────────────────────
-- Per-question whiteboard scene (separate table — written more often, larger blobs).
create table if not exists public.canvas_scenes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  scene_key  text not null,           -- 'q-<questionId>' or 'global'
  scene_data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, scene_key)
);

-- ── 4. RLS ───────────────────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.progress      enable row level security;
alter table public.canvas_scenes enable row level security;

drop policy if exists "profiles_self" on public.profiles;
drop policy if exists "progress_self" on public.progress;
drop policy if exists "canvas_self"   on public.canvas_scenes;

create policy "profiles_self" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "progress_self" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "canvas_self" on public.canvas_scenes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 5. Auto-provision profile + progress on signup ───────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, username, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (user_id) do nothing;

  insert into public.progress (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
