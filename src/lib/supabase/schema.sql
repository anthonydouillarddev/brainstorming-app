-- Exécuter ce SQL dans Supabase Dashboard > SQL Editor
-- Pour les DB existantes, utiliser plutôt les fichiers de migrations/

-- ═══════════════════════════════════════════════
-- PROJECTS
-- ═══════════════════════════════════════════════
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  official_name text,
  type text not null default 'saas' check (type in ('outil','saas','appli','logiciel','business')),
  description text,
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
  priority text not null default 'none' check (priority in ('none','urgent','high','normal','low')),
  position integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_projects_deleted_at on projects(deleted_at);
create index if not exists projects_priority_position_idx on projects(user_id, priority, position);

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
  kind text not null default 'task' check (kind in ('task','idea')),
  text text not null,
  description text,
  problem text,
  effort text check (effort is null or effort in ('S','M','L','XL')),
  tags text[] not null default '{}',
  done boolean default false,
  status text not null default 'todo' check (status in ('todo','in_progress','blocked','done')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
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

create index if not exists todos_user_kind_idx on todos(user_id, kind);

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
-- ROADMAP_ITEMS (objectifs par trimestre)
-- ═══════════════════════════════════════════════
create table roadmap_items (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  quarter text not null check (quarter in ('Q1','Q2','Q3','Q4')),
  year integer not null,
  objective text not null,
  achieved boolean not null default false,
  position integer not null default 0,
  created_at timestamptz default now()
);

create index idx_roadmap_items_project on roadmap_items(project_id, year, quarter, position);

-- ═══════════════════════════════════════════════
-- RISKS (risk matrix)
-- ═══════════════════════════════════════════════
create table risks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  probability text not null check (probability in ('low','medium','high')),
  impact text not null check (impact in ('low','medium','high')),
  mitigation text,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create index idx_risks_project on risks(project_id);
create index if not exists risks_project_resolved_idx on risks(project_id, resolved_at);

-- ═══════════════════════════════════════════════
-- DEV_ITEMS (workspace Dev perso : idées, liens, docs, infos, prefs)
-- ═══════════════════════════════════════════════
create table dev_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  kind text not null check (kind in ('idea','link','doc','info','pref')),
  title text not null,
  content text,
  url text,
  tags text[] not null default '{}',
  status text check (status is null or status in ('not_opened','in_progress','done')),
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_dev_items_user_kind on dev_items(user_id, kind, position);

-- ═══════════════════════════════════════════════
-- USER_PREFERENCES (theme, density, task view, role, saved colors)
-- ═══════════════════════════════════════════════
create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  display_density text default 'normal' check (display_density in ('compact', 'normal', 'comfortable')),
  default_task_view text default 'list' check (default_task_view in ('list', 'kanban')),
  role text default 'admin' check (role in ('admin', 'free', 'demo', 'pro', 'vip')),
  locale text default 'fr',
  saved_colors jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- ═══════════════════════════════════════════════
-- CUSTOM_COLOR_COMBOS (combos de couleurs personnels)
-- ═══════════════════════════════════════════════
create table custom_color_combos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  style text default 'custom' check (style in (
    'vintage','modern','natural','pastel','corporate',
    'playful','tech','ancient','brand','custom'
  )),
  colors text[] not null,
  note text,
  created_at timestamptz default now()
);

create index idx_custom_color_combos_user_id on custom_color_combos(user_id, created_at desc);

-- ═══════════════════════════════════════════════
-- DESIGN_SYSTEM_PRESETS (snapshots complets de DS réutilisables par user)
-- ═══════════════════════════════════════════════
create table design_system_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  snapshot jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_design_presets_user_id on design_system_presets(user_id, created_at desc);
create index idx_design_presets_project_id on design_system_presets(project_id);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════
alter table projects enable row level security;
alter table sections enable row level security;
alter table todos enable row level security;
alter table decisions enable row level security;
alter table roadmap_items enable row level security;
alter table risks enable row level security;
alter table dev_items enable row level security;
alter table user_preferences enable row level security;
alter table custom_color_combos enable row level security;
alter table design_system_presets enable row level security;

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

-- Roadmap items : via project ownership
create policy "Users can view own roadmap_items"
  on roadmap_items for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can insert own roadmap_items"
  on roadmap_items for insert with check (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can update own roadmap_items"
  on roadmap_items for update using (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can delete own roadmap_items"
  on roadmap_items for delete using (
    project_id in (select id from projects where user_id = auth.uid())
  );

-- Risks : via project ownership
create policy "Users can view own risks"
  on risks for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can insert own risks"
  on risks for insert with check (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can update own risks"
  on risks for update using (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can delete own risks"
  on risks for delete using (
    project_id in (select id from projects where user_id = auth.uid())
  );

-- Dev items : par user_id
create policy "Users can view own dev_items"
  on dev_items for select using (auth.uid() = user_id);
create policy "Users can insert own dev_items"
  on dev_items for insert with check (auth.uid() = user_id);
create policy "Users can update own dev_items"
  on dev_items for update using (auth.uid() = user_id);
create policy "Users can delete own dev_items"
  on dev_items for delete using (auth.uid() = user_id);

-- User preferences : par user_id
create policy "Users see own preferences" on user_preferences
  for all using (auth.uid() = user_id);

-- Custom color combos : par user_id
create policy "Users see own color combos" on custom_color_combos
  for all using (auth.uid() = user_id);

-- Design system presets : par user_id
create policy "Users see own design presets" on design_system_presets
  for all using (auth.uid() = user_id);

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

create trigger dev_items_updated_at
  before update on dev_items
  for each row execute function update_updated_at();

create trigger design_system_presets_updated_at
  before update on design_system_presets
  for each row execute function update_updated_at();
