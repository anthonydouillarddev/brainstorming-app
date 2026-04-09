-- Exécuter ce SQL dans Supabase Dashboard > SQL Editor

-- Table des projets
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  status text default 'idea' check (status in ('idea', 'validating', 'building', 'launched')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table des sections de brainstorming
create table sections (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  section_key text not null,
  content text default '',
  updated_at timestamptz default now(),
  unique(project_id, section_key)
);

-- Row Level Security
alter table projects enable row level security;
alter table sections enable row level security;

-- Policies : chaque user ne voit que SES projets
create policy "Users can view own projects"
  on projects for select using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

-- Policies sections : via project ownership
create policy "Users can view own sections"
  on sections for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );

create policy "Users can insert own sections"
  on sections for insert with check (
    project_id in (select id from projects where user_id = auth.uid())
  );

create policy "Users can update own sections"
  on sections for update using (
    project_id in (select id from projects where user_id = auth.uid())
  );

create policy "Users can delete own sections"
  on sections for delete using (
    project_id in (select id from projects where user_id = auth.uid())
  );

-- Table todolist générale
create table todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  done boolean default false,
  priority text default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz default now()
);

alter table todos enable row level security;

create policy "Users can view own todos"
  on todos for select using (auth.uid() = user_id);

create policy "Users can insert own todos"
  on todos for insert with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on todos for update using (auth.uid() = user_id);

create policy "Users can delete own todos"
  on todos for delete using (auth.uid() = user_id);

-- Trigger pour updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

create trigger sections_updated_at
  before update on sections
  for each row execute function update_updated_at();
