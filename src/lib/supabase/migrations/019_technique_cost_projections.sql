-- Migration 019 — technique_cost_projections
-- Onglet Technique / Chap 11 Coûts & Compliance bloc V2 "Snapshots coûts @ N users".
-- Stocke des snapshots de projection de coûts pour visualiser l'évolution dans le temps.
--
-- breakdown JSON exemple :
-- {
--   "vercel": 20, "supabase": 25, "stripe_fees": 30, "resend": 0,
--   "llm_anthropic": 15, "domain": 1, "total_usd": 91
-- }

create table if not exists technique_cost_projections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  projection_month date not null,
  users_projected int not null default 0,
  breakdown jsonb not null default '{}'::jsonb,
  total_usd numeric(12, 2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_technique_cost_projections_user
  on technique_cost_projections(user_id, created_at desc);

create index if not exists idx_technique_cost_projections_project
  on technique_cost_projections(project_id, projection_month desc);

alter table technique_cost_projections enable row level security;

drop policy if exists "Users can view own cost projections" on technique_cost_projections;
create policy "Users can view own cost projections" on technique_cost_projections
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own cost projections" on technique_cost_projections;
create policy "Users can insert own cost projections" on technique_cost_projections
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own cost projections" on technique_cost_projections;
create policy "Users can update own cost projections" on technique_cost_projections
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own cost projections" on technique_cost_projections;
create policy "Users can delete own cost projections" on technique_cost_projections
  for delete using (auth.uid() = user_id);
