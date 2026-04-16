-- 012: User preferences (theme, density, task view, role)
create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  display_density text default 'normal' check (display_density in ('compact', 'normal', 'comfortable')),
  default_task_view text default 'list' check (default_task_view in ('list', 'kanban')),
  role text default 'admin' check (role in ('admin', 'free', 'demo', 'pro', 'vip')),
  locale text default 'fr',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table user_preferences enable row level security;

drop policy if exists "Users see own preferences" on user_preferences;
create policy "Users see own preferences" on user_preferences
  for all using (auth.uid() = user_id);
