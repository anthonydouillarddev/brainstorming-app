-- Migration 010 — Risks : resolved_at
-- À exécuter dans Supabase Dashboard > SQL Editor
--
-- Colonne `resolved_at` nullable pour marquer un risque comme fixé tout en
-- conservant l'historique. null = actif, timestamp = résolu à cette date.
-- Le cockpit et le bloc "Risques top" de l'accueil filtrent les résolus.
-- Idempotent.

alter table public.risks
  add column if not exists resolved_at timestamptz;

create index if not exists risks_project_resolved_idx
  on public.risks (project_id, resolved_at);
