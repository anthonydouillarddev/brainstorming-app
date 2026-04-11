-- Migration 005 — Mise à jour des types des projets existants
-- À exécuter dans Supabase Dashboard > SQL Editor
--
-- ÉTAPE 1 : vérifier les noms actuels (dry-run)
-- Lance d'abord cette requête pour voir tes projets et leur nom exact :
--
-- select id, name, type from projects where deleted_at is null order by name;
--
-- ÉTAPE 2 : adapte les UPDATE ci-dessous si un nom ne matche pas, puis exécute

update projects set type = 'business'  where name ilike '%agence%' or name ilike '%agent ia%';
update projects set type = 'appli'     where name ilike '%motivation%';
update projects set type = 'outil'     where name ilike '%control distance%' or name ilike '%controle distance%';
update projects set type = 'saas'      where name ilike '%tiktok%';
update projects set type = 'saas'      where name ilike '%randomiz%';
update projects set type = 'saas'      where name ilike '%proxy%';
update projects set type = 'saas'      where name ilike '%mail%';
update projects set type = 'logiciel'  where name ilike '%metrage%' or name ilike '%métrage%';

-- Vérification finale
select name, type from projects where deleted_at is null order by name;
