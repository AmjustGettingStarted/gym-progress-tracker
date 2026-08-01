create extension if not exists pgcrypto;

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workouts enable row level security;

create policy "Users can view their own workouts" on public.workouts
  for select using (auth.uid() = user_id);

create policy "Users can insert their own workouts" on public.workouts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own workouts" on public.workouts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own workouts" on public.workouts
  for delete using (auth.uid() = user_id);
