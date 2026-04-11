-- Migration 006 — Simplification scoring : RICE → none
-- À exécuter dans Supabase Dashboard > SQL Editor
--
-- On garde uniquement ICE (plus simple pour solo founder).
-- Les tâches existantes en RICE basculent en "none" (scoring désactivé).
-- Les colonnes rice_* restent en DB (pas de suppression destructive)
-- mais ne sont plus lues/écrites par l'app.

update todos set score_method = 'none' where score_method = 'rice';
