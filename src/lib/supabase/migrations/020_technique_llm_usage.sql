-- Migration 020 — technique_llm_usage
-- Onglet Technique / Chap 10 IA & Automation — tracking conso LLM.
-- Obligatoire dès qu'une feature AI est livrée (Brainstorm Coach, Microcopy Gen, etc.)
-- pour prévenir les explosions de facture Anthropic/OpenAI.
--
-- Pattern d'insert côté serveur (API route) : à chaque appel LLM,
-- insérer une ligne avec input/output tokens + cache read/write + coût calculé.

create table if not exists technique_llm_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade, -- nullable = appel hors projet
  feature text not null, -- 'brainstorm_coach' | 'microcopy_gen' | 'risk_analyzer' | ...
  provider text not null, -- 'anthropic' | 'openai' | 'mistral' | ...
  model text not null, -- 'claude-sonnet-4-6' | 'gpt-4o-mini' | ...
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cache_read_tokens int not null default 0,
  cache_write_tokens int not null default 0,
  cost_usd numeric(12, 6) not null default 0,
  latency_ms int,
  error text, -- si l'appel a échoué
  metadata jsonb default '{}'::jsonb, -- extra ex: prompt hash, conversation_id
  created_at timestamptz not null default now()
);

-- Indexes optimisés pour les queries usage mensuel / feature / model
create index if not exists idx_technique_llm_usage_user_created
  on technique_llm_usage(user_id, created_at desc);

create index if not exists idx_technique_llm_usage_feature
  on technique_llm_usage(user_id, feature, created_at desc);

create index if not exists idx_technique_llm_usage_project
  on technique_llm_usage(project_id, created_at desc)
  where project_id is not null;

alter table technique_llm_usage enable row level security;

drop policy if exists "Users can view own llm usage" on technique_llm_usage;
create policy "Users can view own llm usage" on technique_llm_usage
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own llm usage" on technique_llm_usage;
create policy "Users can insert own llm usage" on technique_llm_usage
  for insert with check (auth.uid() = user_id);

-- Pas d'UPDATE ni de DELETE exposés à l'user : audit trail immuable
-- (les nettoyages éventuels passent par service role).
