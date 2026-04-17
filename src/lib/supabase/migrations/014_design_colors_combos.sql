-- 014: Design — couleurs favorites + combos personnels

-- Étendre user_preferences avec une colonne pour les couleurs favorites
alter table user_preferences
  add column if not exists saved_colors jsonb not null default '[]'::jsonb;

-- Table des combos de couleurs personnels
create table if not exists custom_color_combos (
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

create index if not exists idx_custom_color_combos_user_id on custom_color_combos(user_id, created_at desc);

alter table custom_color_combos enable row level security;

drop policy if exists "Users see own color combos" on custom_color_combos;
create policy "Users see own color combos" on custom_color_combos
  for all using (auth.uid() = user_id);
