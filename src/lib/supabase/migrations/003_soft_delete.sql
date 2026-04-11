-- Migration 003 — Soft delete projets (corbeille)
-- À exécuter dans Supabase Dashboard > SQL Editor

alter table projects add column if not exists deleted_at timestamptz;
create index if not exists idx_projects_deleted_at on projects(deleted_at);
