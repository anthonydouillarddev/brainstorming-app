-- Migration 018 — technique_stack_presets
-- Onglet Technique / Chap 1 Stratégie bloc V3 "Combos stack curés".
-- Permet de sauvegarder un snapshot complet de la stack (12 chapitres) et de le réutiliser
-- entre projets (presets globaux) ou pour un projet donné (presets projet-spécifiques).
--
-- Usage : user crée un projet → clique "Charger un combo stack" → pré-remplit les 12 chaps.
-- Ou user configure son projet → clique "Sauver comme preset" → réutilise sur projet suivant.
--
-- Note : ne modifie pas schema.sql. Cette migration est incrémentale + idempotente.

create table if not exists technique_stack_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade, -- nullable = preset global
  name text not null,
  description text,
  snapshot jsonb not null default '{}'::jsonb, -- dump JSON des 12 sections technique
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_technique_stack_presets_user
  on technique_stack_presets(user_id, created_at desc);

create index if not exists idx_technique_stack_presets_project
  on technique_stack_presets(project_id, created_at desc)
  where project_id is not null;

alter table technique_stack_presets enable row level security;

drop policy if exists "Users can view own stack presets" on technique_stack_presets;
create policy "Users can view own stack presets" on technique_stack_presets
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own stack presets" on technique_stack_presets;
create policy "Users can insert own stack presets" on technique_stack_presets
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own stack presets" on technique_stack_presets;
create policy "Users can update own stack presets" on technique_stack_presets
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own stack presets" on technique_stack_presets;
create policy "Users can delete own stack presets" on technique_stack_presets
  for delete using (auth.uid() = user_id);

-- Trigger updated_at auto
create or replace function update_technique_stack_presets_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_technique_stack_presets_updated_at on technique_stack_presets;
create trigger trg_technique_stack_presets_updated_at
  before update on technique_stack_presets
  for each row execute function update_technique_stack_presets_updated_at();
