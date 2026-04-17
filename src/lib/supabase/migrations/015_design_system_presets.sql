-- 015: Design system presets — snapshots complets réutilisables par user (+ par projet)

create table if not exists design_system_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  snapshot jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_design_presets_user_id on design_system_presets(user_id, created_at desc);
create index if not exists idx_design_presets_project_id on design_system_presets(project_id);

alter table design_system_presets enable row level security;

drop policy if exists "Users see own design presets" on design_system_presets;
create policy "Users see own design presets" on design_system_presets
  for all using (auth.uid() = user_id);

-- Trigger updated_at (réutilise la fonction update_updated_at déjà créée en schema.sql)
drop trigger if exists design_system_presets_updated_at on design_system_presets;
create trigger design_system_presets_updated_at
  before update on design_system_presets
  for each row execute function update_updated_at();
