-- Migration 008 — Dev Workspace
-- À exécuter dans Supabase Dashboard > SQL Editor
--
-- Nouvelle table `dev_items` pour stocker les notes perso de l'onglet Dev :
-- idées (skills, agents), liens (sites, exemples), docs, infos, prefs (couleurs, styles).
-- Les tâches dev restent dans `todos` avec `project_id IS NULL` (pas de changement).
--
-- - RLS par `user_id`.
-- - `kind` discrimine la catégorie d'item.
-- - `status` utilisé uniquement pour `kind = 'link'` (not_opened / in_progress / done).
-- - `position` pour le drag & drop au sein d'une catégorie.
-- - Idempotent.

create table if not exists public.dev_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('idea','link','doc','info','pref')),
  title text not null,
  content text,
  url text,
  tags text[] not null default '{}',
  status text check (status is null or status in ('not_opened','in_progress','done')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dev_items_user_kind_position_idx
  on public.dev_items (user_id, kind, position);

alter table public.dev_items enable row level security;

drop policy if exists "Users can view own dev_items" on public.dev_items;
create policy "Users can view own dev_items"
  on public.dev_items for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own dev_items" on public.dev_items;
create policy "Users can insert own dev_items"
  on public.dev_items for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own dev_items" on public.dev_items;
create policy "Users can update own dev_items"
  on public.dev_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own dev_items" on public.dev_items;
create policy "Users can delete own dev_items"
  on public.dev_items for delete using (auth.uid() = user_id);

drop trigger if exists dev_items_updated_at on public.dev_items;
create trigger dev_items_updated_at
  before update on public.dev_items
  for each row execute function update_updated_at();
