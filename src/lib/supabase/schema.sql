-- Exécuter ce SQL dans Supabase Dashboard > SQL Editor
-- Pour les DB existantes, utiliser plutôt les fichiers de migrations/

-- ═══════════════════════════════════════════════
-- PROJECTS
-- ═══════════════════════════════════════════════
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null default 'saas' check (type in ('outil','saas','appli','logiciel','business')),
  status text default 'idea' check (status in (
    'idea','validating','building','mvp','testing',
    'launched','continuous_improvement','final'
  )),
  north_star text,
  next_action text,
  deadline date,
  disabled_sections text[] not null default '{}',
  metric_users integer,
  metric_mrr integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- SECTIONS (brainstorming fields)
-- ═══════════════════════════════════════════════
create table sections (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  section_key text not null,
  content text default '',
  updated_at timestamptz default now(),
  unique(project_id, section_key)
);

-- ═══════════════════════════════════════════════
-- TODOS (global + project-scoped)
-- ═══════════════════════════════════════════════
create table todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete set null,
  text text not null,
  done boolean default false,
  status text not null default 'todo' check (status in ('todo','in_progress','blocked','done')),
  priority text default 'normal' check (priority in ('low','normal','high','urgent')),
  deadline date,
  phase text check (phase is null or phase in ('discovery','build','test','launch')),
  score_method text not null default 'none' check (score_method in ('none','rice','ice')),
  rice_reach integer,
  rice_impact numeric,
  rice_confidence integer,
  rice_effort numeric,
  ice_impact integer,
  ice_confidence integer,
  ice_ease integer,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- DECISIONS (ADR - Architecture Decision Records)
-- ═══════════════════════════════════════════════
create table decisions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  context text,
  options text,
  decision text not null,
  rationale text,
  decided_at date default current_date,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════
alter table projects enable row level security;
alter table sections enable row level security;
alter table todos enable row level security;
alter table decisions enable row level security;

-- Projects : chaque user ne voit que SES projets
create policy "Users can view own projects"
  on projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects"
  on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects"
  on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

-- Sections : via project ownership
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

-- Todos : par user_id
create policy "Users can view own todos"
  on todos for select using (auth.uid() = user_id);
create policy "Users can insert own todos"
  on todos for insert with check (auth.uid() = user_id);
create policy "Users can update own todos"
  on todos for update using (auth.uid() = user_id);
create policy "Users can delete own todos"
  on todos for delete using (auth.uid() = user_id);

-- Decisions : via project ownership
create policy "Users can view own decisions"
  on decisions for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can insert own decisions"
  on decisions for insert with check (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can update own decisions"
  on decisions for update using (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can delete own decisions"
  on decisions for delete using (
    project_id in (select id from projects where user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════
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
