-- Migration 025 — Atelier notes : éditeur riche BlockNote
-- Ajoute content_blocks (JSON BlockNote) en plus du `content` markdown déjà présent.
-- content reste la source de vérité "plate" (export, fallback, recherche).
-- content_blocks est lu en priorité côté UI si non null.

alter table notes
  add column if not exists content_blocks jsonb;
