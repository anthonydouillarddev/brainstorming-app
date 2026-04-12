-- Migration 007 — Nom officiel du produit
-- À exécuter dans Supabase Dashboard > SQL Editor
--
-- Ajoute une colonne `official_name` à `projects` pour stocker le nom de marque
-- définitif (différent du nom de travail). Synchronisé depuis le brainstorm
-- (section Branding) via le bouton "Synchroniser avec le cockpit".
--
-- - Nullable : les projets existants restent sans nom officiel.
-- - Idempotent : `add column if not exists`.

alter table projects add column if not exists official_name text;
