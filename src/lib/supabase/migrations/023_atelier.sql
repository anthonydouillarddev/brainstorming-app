-- Migration 023 — Atelier (notes + schémas)
-- Onglet projet combinant notes markdown et schémas drag&drop (React Flow).
-- Module universel, is_mandatory=true (comme cockpit), display_order=4 (avant resources).
-- Auto-provision sur tous les projets existants.
--
-- Idempotente : create table if not exists + on conflict do nothing partout.

-- ═══════════════════════════════════════════════════════════════
-- 1. NOTES — notes markdown par projet
-- ═══════════════════════════════════════════════════════════════
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  title text not null default 'Sans titre',
  content text not null default '',
  pinned boolean not null default false,
  linked_todo_id uuid references todos(id) on delete set null,
  linked_decision_id uuid references decisions(id) on delete set null,
  linked_dev_item_id uuid references dev_items(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_project_idx on notes(project_id);
create index if not exists notes_user_project_idx on notes(user_id, project_id);
create index if not exists notes_project_updated_idx on notes(project_id, pinned desc, updated_at desc);

alter table notes enable row level security;

drop policy if exists "Users manage own notes" on notes;
create policy "Users manage own notes" on notes
  for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 2. SCHEMAS — schémas drag&drop par projet (JSON nodes+edges)
-- ═══════════════════════════════════════════════════════════════
create table if not exists schemas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null default 'Sans titre',
  template text not null default 'blank',
  data jsonb not null default '{"nodes":[],"edges":[]}'::jsonb,
  thumbnail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists schemas_project_idx on schemas(project_id);
create index if not exists schemas_user_project_idx on schemas(user_id, project_id);
create index if not exists schemas_project_updated_idx on schemas(project_id, updated_at desc);

alter table schemas enable row level security;

drop policy if exists "Users manage own schemas" on schemas;
create policy "Users manage own schemas" on schemas
  for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 3. TRIGGERS updated_at auto
-- ═══════════════════════════════════════════════════════════════
-- Fonction update_updated_at() déjà définie dans schema.sql — on la réutilise.
drop trigger if exists notes_updated_at on notes;
create trigger notes_updated_at
  before update on notes
  for each row execute function update_updated_at();

drop trigger if exists schemas_updated_at on schemas;
create trigger schemas_updated_at
  before update on schemas
  for each row execute function update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 4. SEED — tab_modules : atelier (universel, mandatory, component_key=atelier)
-- ═══════════════════════════════════════════════════════════════
insert into tab_modules (slug, name, icon, is_universal, is_mandatory, component_key) values
  ('atelier', 'Atelier', '🧪', true, true, 'atelier')
on conflict (slug) do nothing;

-- ═══════════════════════════════════════════════════════════════
-- 5. DÉCALAGE resources 4 → 5 pour libérer la position 4 à atelier
-- ═══════════════════════════════════════════════════════════════
update type_module_presets
set display_order = 5
where module_id = (select id from tab_modules where slug = 'resources')
  and display_order = 4;

update project_modules
set display_order = 5
where module_id = (select id from tab_modules where slug = 'resources')
  and display_order = 4;

-- ═══════════════════════════════════════════════════════════════
-- 6. SEED type_module_presets — atelier pour TOUS les types (universel)
-- ═══════════════════════════════════════════════════════════════
insert into type_module_presets (type_id, module_id, display_order, is_recommended)
select pt.id, tm.id, 4, true
from project_types pt
cross join tab_modules tm
where tm.slug = 'atelier'
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════
-- 7. AUTO-PROVISION atelier sur projets existants (enabled=true comme cockpit)
-- ═══════════════════════════════════════════════════════════════
insert into project_modules (project_id, module_id, enabled, display_order)
select p.id, tm.id, true, 4
from projects p
cross join tab_modules tm
where tm.slug = 'atelier'
  and p.deleted_at is null
on conflict (project_id, module_id) do nothing;
