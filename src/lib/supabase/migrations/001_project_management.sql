-- Migration 001 — Project management core
-- À exécuter dans Supabase Dashboard > SQL Editor

-- ═══════════════════════════════════════════════
-- 1. projects : nouveaux statuts + type + cockpit
-- ═══════════════════════════════════════════════
alter table projects drop constraint if exists projects_status_check;
alter table projects add constraint projects_status_check
  check (status in (
    'idea','validating','building','mvp','testing',
    'launched','continuous_improvement','final'
  ));

alter table projects add column if not exists type text not null default 'saas'
  check (type in ('outil','saas','appli','logiciel','business'));

alter table projects add column if not exists north_star text;
alter table projects add column if not exists next_action text;
alter table projects add column if not exists deadline date;
alter table projects add column if not exists disabled_sections text[] not null default '{}';
alter table projects add column if not exists metric_users integer;
alter table projects add column if not exists metric_mrr integer;

-- ═══════════════════════════════════════════════
-- 2. todos : lien projet, statut enrichi, RICE/ICE
-- ═══════════════════════════════════════════════
alter table todos add column if not exists project_id uuid references projects(id) on delete set null;
alter table todos add column if not exists status text not null default 'todo'
  check (status in ('todo','in_progress','blocked','done'));
alter table todos add column if not exists deadline date;
alter table todos add column if not exists phase text
  check (phase is null or phase in ('discovery','build','test','launch'));

alter table todos add column if not exists score_method text not null default 'none'
  check (score_method in ('none','rice','ice'));
alter table todos add column if not exists rice_reach integer;
alter table todos add column if not exists rice_impact numeric;
alter table todos add column if not exists rice_confidence integer;
alter table todos add column if not exists rice_effort numeric;
alter table todos add column if not exists ice_impact integer;
alter table todos add column if not exists ice_confidence integer;
alter table todos add column if not exists ice_ease integer;

update todos set status = 'done' where done = true and status <> 'done';

-- ═══════════════════════════════════════════════
-- 3. decisions (ADR) : nouvelle table + RLS
-- ═══════════════════════════════════════════════
create table if not exists decisions (
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

alter table decisions enable row level security;

drop policy if exists "Users can view own decisions" on decisions;
create policy "Users can view own decisions"
  on decisions for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );

drop policy if exists "Users can insert own decisions" on decisions;
create policy "Users can insert own decisions"
  on decisions for insert with check (
    project_id in (select id from projects where user_id = auth.uid())
  );

drop policy if exists "Users can update own decisions" on decisions;
create policy "Users can update own decisions"
  on decisions for update using (
    project_id in (select id from projects where user_id = auth.uid())
  );

drop policy if exists "Users can delete own decisions" on decisions;
create policy "Users can delete own decisions"
  on decisions for delete using (
    project_id in (select id from projects where user_id = auth.uid())
  );
