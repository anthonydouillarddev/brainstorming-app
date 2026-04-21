-- Migration 024 — Atelier notes : tags
-- Ajout des tags aux notes pour filtrage sidebar.

alter table notes
  add column if not exists tags text[] not null default '{}';

create index if not exists notes_tags_gin_idx on notes using gin(tags);
