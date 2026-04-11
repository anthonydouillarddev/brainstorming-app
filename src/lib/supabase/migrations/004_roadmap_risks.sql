-- Migration 004 — Roadmap trimestrielle + Risk matrix
-- À exécuter dans Supabase Dashboard > SQL Editor

-- ═══════════════════════════════════════════════
-- Table roadmap_items (objectifs par trimestre)
-- ═══════════════════════════════════════════════
create table if not exists roadmap_items (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  quarter text not null check (quarter in ('Q1','Q2','Q3','Q4')),
  year integer not null,
  objective text not null,
  achieved boolean not null default false,
  position integer not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_roadmap_items_project on roadmap_items(project_id, year, quarter, position);

alter table roadmap_items enable row level security;

drop policy if exists "Users can view own roadmap_items" on roadmap_items;
create policy "Users can view own roadmap_items"
  on roadmap_items for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );

drop policy if exists "Users can insert own roadmap_items" on roadmap_items;
create policy "Users can insert own roadmap_items"
  on roadmap_items for insert with check (
    project_id in (select id from projects where user_id = auth.uid())
  );

drop policy if exists "Users can update own roadmap_items" on roadmap_items;
create policy "Users can update own roadmap_items"
  on roadmap_items for update using (
    project_id in (select id from projects where user_id = auth.uid())
  );

drop policy if exists "Users can delete own roadmap_items" on roadmap_items;
create policy "Users can delete own roadmap_items"
  on roadmap_items for delete using (
    project_id in (select id from projects where user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════
-- Table risks (risk matrix légère)
-- ═══════════════════════════════════════════════
create table if not exists risks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  probability text not null check (probability in ('low','medium','high')),
  impact text not null check (impact in ('low','medium','high')),
  mitigation text,
  created_at timestamptz default now()
);

create index if not exists idx_risks_project on risks(project_id);

alter table risks enable row level security;

drop policy if exists "Users can view own risks" on risks;
create policy "Users can view own risks"
  on risks for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );

drop policy if exists "Users can insert own risks" on risks;
create policy "Users can insert own risks"
  on risks for insert with check (
    project_id in (select id from projects where user_id = auth.uid())
  );

drop policy if exists "Users can update own risks" on risks;
create policy "Users can update own risks"
  on risks for update using (
    project_id in (select id from projects where user_id = auth.uid())
  );

drop policy if exists "Users can delete own risks" on risks;
create policy "Users can delete own risks"
  on risks for delete using (
    project_id in (select id from projects where user_id = auth.uid())
  );
