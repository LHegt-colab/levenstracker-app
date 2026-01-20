-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create table for Settings
create table public.settings (
  user_id uuid references auth.users not null primary key,
  notifications_enabled boolean default false,
  target_kcal integer default 2000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.settings enable row level security;
create policy "Users can view own settings" on public.settings for select using (auth.uid() = user_id);
create policy "Users can update own settings" on public.settings for update using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.settings for insert with check (auth.uid() = user_id);

-- Create table for Dagboek (Journal)
create table public.dagboek_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  content text,
  mood text,
  tags text[],
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.dagboek_entries enable row level security;
create policy "Users can crud own dagboek entries" on public.dagboek_entries for all using (auth.uid() = user_id);

-- Create table for Dagboek Summaries
create table public.dagboek_summaries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  summary text,
  unique(user_id, date)
);
alter table public.dagboek_summaries enable row level security;
create policy "Users can crud own dagboek summaries" on public.dagboek_summaries for all using (auth.uid() = user_id);

-- Create table for Verzameling (Collection)
create table public.verzameling_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text,
  category text,
  url text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.verzameling_items enable row level security;
create policy "Users can crud own verzameling items" on public.verzameling_items for all using (auth.uid() = user_id);

-- Create table for Verzameling Categories
create table public.verzameling_categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.verzameling_categories enable row level security;
create policy "Users can crud own verzameling categories" on public.verzameling_categories for all using (auth.uid() = user_id);

-- Create table for Ideeen (Ideas)
create table public.ideeen (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text default 'new', -- new, in_progress, done, archived
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.ideeen enable row level security;
create policy "Users can crud own ideeen" on public.ideeen for all using (auth.uid() = user_id);

-- Create table for Kalender (Calendar Events)
create table public.kalender_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  all_day boolean default false,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.kalender_events enable row level security;
create policy "Users can crud own kalender events" on public.kalender_events for all using (auth.uid() = user_id);

-- Create table for Gewoontes (Habits)
create table public.gewoontes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  frequency text, -- daily, weekly, etc.
  target_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.gewoontes enable row level security;
create policy "Users can crud own gewoontes" on public.gewoontes for all using (auth.uid() = user_id);

-- Create table for Gewoonte Logs (Habit Logs)
create table public.gewoonte_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  habit_id uuid references public.gewoontes(id) on delete cascade,
  date date not null,
  completed boolean default true,
  count integer default 1,
  unique(user_id, habit_id, date)
);
alter table public.gewoonte_logs enable row level security;
create policy "Users can crud own gewoonte logs" on public.gewoonte_logs for all using (auth.uid() = user_id);

-- Create table for Doelen (Goals)
create table public.doelen (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  deadline date,
  status text default 'planned',
  tags text[],
  milestones jsonb, -- Storing milestones as JSONB for simplicity given the structure
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.doelen enable row level security;
create policy "Users can crud own doelen" on public.doelen for all using (auth.uid() = user_id);

-- Create table for Reflecties
create table public.reflecties (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text not null, -- daily, weekly, monthly
  date date not null,
  answers jsonb, -- Storing Q&A pairs as JSONB
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.reflecties enable row level security;
create policy "Users can crud own reflecties" on public.reflecties for all using (auth.uid() = user_id);

-- Create table for Voeding (Meals)
create table public.voeding_meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  calories integer not null,
  protein integer,
  carbs integer,
  fat integer,
  date date not null,
  type text, -- breakfast, lunch, dinner, snack
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.voeding_meals enable row level security;
create policy "Users can crud own voeding meals" on public.voeding_meals for all using (auth.uid() = user_id);
