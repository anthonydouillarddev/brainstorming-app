-- 017: Niveau d'expertise user (beginner / intermediate / expert).
-- Dicte l'affichage pédagogique des chapitres Design (filtre 6 vs 12 chaps)
-- + défauts mode Débutant/Formulaire. Indépendant du rôle (free/pro/vip).

alter table user_preferences
  add column if not exists experience_level text default 'intermediate'
  check (experience_level in ('beginner', 'intermediate', 'expert'));
