-- Migration 011 — Todos : effort + problem + tags
-- À exécuter dans Supabase Dashboard > SQL Editor
--
-- - `effort` : T-shirt sizing (S/M/L/XL) pour estimer la taille,
--   pratique surtout pour les idées de fonctions.
-- - `problem` : 1 ligne qui décrit le problème résolu (contexte).
-- - `tags` : tableau de strings pour thématiques libres (UX, Data,
--   Automation, Perf, etc.).
-- - Tous nullables / défaut vide pour ne rien casser sur les todos existants.
-- - Idempotent.

alter table public.todos
  add column if not exists effort text
  check (effort is null or effort in ('S','M','L','XL'));

alter table public.todos
  add column if not exists problem text;

alter table public.todos
  add column if not exists tags text[] not null default '{}';
