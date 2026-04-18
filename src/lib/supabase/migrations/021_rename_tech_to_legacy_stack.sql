-- Migration 021 — rename section_key 'tech' → 'legacy-stack' (décision Q4)
-- L'ancienne section `tech` (single brainstorm section dans DEDICATED_TAB_SECTION_KEYS)
-- est conservée en lecture seule (décision Q2) pour transition douce, mais renommée
-- pour éviter le conflit UX avec les nouvelles clés `tech-*` (tech-strategy, tech-frontend…).
--
-- À exécuter UNE FOIS dans Supabase Dashboard > SQL Editor après déploiement du nouvel onglet.
-- Idempotente : si la clé a déjà été renommée, n'affecte aucune ligne.

update sections
  set section_key = 'legacy-stack'
  where section_key = 'tech';

-- Vérification (à lancer manuellement pour contrôle post-migration) :
-- select section_key, count(*) from sections where section_key in ('tech', 'legacy-stack') group by section_key;
