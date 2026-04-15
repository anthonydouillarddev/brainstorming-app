-- Migration 009 — Todos : kind + description
-- À exécuter dans Supabase Dashboard > SQL Editor
--
-- - `kind` discrimine les tâches ('task') des idées de fonctions ('idea').
--   Par défaut 'task' pour ne rien casser sur les lignes existantes.
-- - `description` pour du texte long (lu/édité dans un modal détail).
-- - Index composite user_id + kind pour filtrer rapidement.
-- - Idempotent.

alter table public.todos
  add column if not exists kind text not null default 'task'
  check (kind in ('task','idea'));

alter table public.todos
  add column if not exists description text;

create index if not exists todos_user_kind_idx
  on public.todos (user_id, kind);
