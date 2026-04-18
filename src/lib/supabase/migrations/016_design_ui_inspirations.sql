-- 016: Banque d'inspirations UI (chap 7 Design System V4).
-- Screenshots de sites aimés, composants à copier, effets UI à reproduire.
-- project_id nullable = inspirations réutilisables cross-projet.

create table if not exists design_ui_inspirations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  category text not null check (
    category in (
      'landing-hero',
      'pricing-table',
      'onboarding-flow',
      'dashboard-layout',
      'form-login',
      'micro-interaction',
      'navigation-pattern',
      'empty-state'
    )
  ),
  source_url text default '',
  screenshot_url text default '',
  note text default '',
  tags text[] default '{}',
  tools text[] default '{}',
  rating int default 3 check (rating between 1 and 5),
  status text default 'collected' check (
    status in ('collected', 'analyzed', 'implemented', 'archived')
  ),
  position int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists design_ui_inspirations_user_category_idx
  on design_ui_inspirations(user_id, category, position);
create index if not exists design_ui_inspirations_user_project_idx
  on design_ui_inspirations(user_id, project_id);

alter table design_ui_inspirations enable row level security;

drop policy if exists "Users manage own UI inspirations" on design_ui_inspirations;
create policy "Users manage own UI inspirations" on design_ui_inspirations
  for all using (auth.uid() = user_id);

-- ─── Storage bucket « inspirations » ──────────────────────────────────────
-- À créer manuellement dans Supabase Dashboard > Storage :
--   Name: inspirations
--   Public: false (signed URLs uniquement)
--   File size limit: 5 MB
--   Allowed MIME types: image/png, image/jpeg, image/webp, image/gif
--
-- Policies à créer sur storage.objects pour ce bucket :
--   SELECT/INSERT/UPDATE/DELETE where bucket_id = 'inspirations'
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- (dossier par user_id pour isolation)
