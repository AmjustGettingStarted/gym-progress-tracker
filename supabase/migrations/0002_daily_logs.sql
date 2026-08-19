create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  log_type text not null default 'rest' check (log_type in ('workout', 'rest')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists daily_logs_user_date_idx on public.daily_logs (user_id, log_date desc);

alter table public.daily_logs enable row level security;

create policy "Users can view their own daily logs" on public.daily_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own daily logs" on public.daily_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own daily logs" on public.daily_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own daily logs" on public.daily_logs
  for delete using (auth.uid() = user_id);
