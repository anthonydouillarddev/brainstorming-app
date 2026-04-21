-- Migration 022 — Project taxonomy (worlds, types, modules, presets)
-- Phase 1 de la refonte : foundation DB + seed + migration data.
-- Objectif : ZÉRO changement visible. Les projets existants gardent leur comportement
-- (colonne projects.type conservée) et sont rattachés à la nouvelle taxonomie via type_id.
--
-- Idempotente : create table if not exists + on conflict do nothing partout.
-- Peut être rejouée sans effet si déjà appliquée.

-- ═══════════════════════════════════════════════════════════════
-- 1. PROJECT_WORLDS — 4 univers (dev, business-online, business-physique, créatif)
-- ═══════════════════════════════════════════════════════════════
create table if not exists project_worlds (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text not null default '',
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_worlds_display_order_idx
  on project_worlds(display_order);

alter table project_worlds enable row level security;

drop policy if exists "Public read worlds" on project_worlds;
create policy "Public read worlds" on project_worlds
  for select using (true);

-- ═══════════════════════════════════════════════════════════════
-- 2. PROJECT_TYPES — 19 types (15 principaux + 4 "autre-{world}" génériques)
-- ═══════════════════════════════════════════════════════════════
create table if not exists project_types (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references project_worlds(id) on delete cascade,
  slug text unique not null,
  name text not null,
  icon text not null default '',
  description text not null default '',
  keywords text[] not null default '{}',
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_types_world_order_idx
  on project_types(world_id, display_order);
create index if not exists project_types_keywords_gin_idx
  on project_types using gin(keywords);

alter table project_types enable row level security;

drop policy if exists "Public read types" on project_types;
create policy "Public read types" on project_types
  for select using (true);

-- ═══════════════════════════════════════════════════════════════
-- 3. TAB_MODULES — modules (universels + spécifiques)
-- ═══════════════════════════════════════════════════════════════
create table if not exists tab_modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text not null default '',
  is_universal boolean not null default false,
  is_mandatory boolean not null default false,
  component_key text not null,
  created_at timestamptz not null default now()
);

alter table tab_modules enable row level security;

drop policy if exists "Public read modules" on tab_modules;
create policy "Public read modules" on tab_modules
  for select using (true);

-- ═══════════════════════════════════════════════════════════════
-- 4. TYPE_MODULE_PRESETS — recommandations par type
-- ═══════════════════════════════════════════════════════════════
create table if not exists type_module_presets (
  type_id uuid not null references project_types(id) on delete cascade,
  module_id uuid not null references tab_modules(id) on delete cascade,
  display_order int not null default 0,
  is_recommended boolean not null default true,
  primary key (type_id, module_id)
);

create index if not exists type_module_presets_type_order_idx
  on type_module_presets(type_id, display_order);

alter table type_module_presets enable row level security;

drop policy if exists "Public read presets" on type_module_presets;
create policy "Public read presets" on type_module_presets
  for select using (true);

-- ═══════════════════════════════════════════════════════════════
-- 5. PROJECT_MODULES — modules activés par projet (user-scoped via project)
-- ═══════════════════════════════════════════════════════════════
create table if not exists project_modules (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  module_id uuid not null references tab_modules(id) on delete cascade,
  enabled boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, module_id)
);

create index if not exists project_modules_project_order_idx
  on project_modules(project_id, display_order);

alter table project_modules enable row level security;

drop policy if exists "Users view own project modules" on project_modules;
create policy "Users view own project modules" on project_modules
  for select using (
    exists (select 1 from projects where projects.id = project_modules.project_id and projects.user_id = auth.uid())
  );

drop policy if exists "Users insert own project modules" on project_modules;
create policy "Users insert own project modules" on project_modules
  for insert with check (
    exists (select 1 from projects where projects.id = project_modules.project_id and projects.user_id = auth.uid())
  );

drop policy if exists "Users update own project modules" on project_modules;
create policy "Users update own project modules" on project_modules
  for update using (
    exists (select 1 from projects where projects.id = project_modules.project_id and projects.user_id = auth.uid())
  );

drop policy if exists "Users delete own project modules" on project_modules;
create policy "Users delete own project modules" on project_modules
  for delete using (
    exists (select 1 from projects where projects.id = project_modules.project_id and projects.user_id = auth.uid())
  );

-- Trigger : un module mandatory ne peut pas être désactivé
create or replace function enforce_mandatory_module_enabled()
returns trigger as $$
declare
  mandatory boolean;
begin
  select is_mandatory into mandatory from tab_modules where id = new.module_id;
  if mandatory is true and new.enabled is false then
    raise exception 'Cannot disable mandatory module (module_id=%)', new.module_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_project_modules_mandatory on project_modules;
create trigger trg_project_modules_mandatory
  before insert or update on project_modules
  for each row execute function enforce_mandatory_module_enabled();

-- Trigger updated_at auto
create or replace function update_project_modules_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_project_modules_updated_at on project_modules;
create trigger trg_project_modules_updated_at
  before update on project_modules
  for each row execute function update_project_modules_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 6. PROJECTS.TYPE_ID — colonne FK nullable, projects.type conservé (rollback safe)
-- ═══════════════════════════════════════════════════════════════
alter table projects
  add column if not exists type_id uuid references project_types(id) on delete set null;

create index if not exists projects_type_id_idx on projects(type_id);

-- ═══════════════════════════════════════════════════════════════
-- 7. SEED — worlds
-- ═══════════════════════════════════════════════════════════════
insert into project_worlds (slug, name, icon, display_order) values
  ('dev',                '👨‍💻 Dev / Tech',           '🧑‍💻', 1),
  ('business-online',    '🛒 Business en ligne',       '🛒', 2),
  ('business-physique',  '🏪 Business physique',       '🏪', 3),
  ('creatif',            '🎨 Créatif',                 '🎨', 4)
on conflict (slug) do nothing;

-- ═══════════════════════════════════════════════════════════════
-- 8. SEED — types (19 : 15 principaux + 4 "autre-{world}")
-- ═══════════════════════════════════════════════════════════════
insert into project_types (world_id, slug, name, icon, description, keywords, display_order)
select w.id, t.slug, t.name, t.icon, t.description, t.keywords, t.display_order
from project_worlds w
join (values
  -- DEV (4 principaux + 1 autre)
  ('dev', 'saas',                 'SaaS',                    '☁️',  'Produit SaaS à abonnement, multi-utilisateur',
    array['saas','subscription','abonnement','plateforme','software as a service','logiciel as a service']::text[], 1),
  ('dev', 'app-mobile',           'App mobile',              '📱',  'Application iOS / Android / cross-platform',
    array['app','application','mobile','ios','android','react native','flutter']::text[], 2),
  ('dev', 'outil-autre',          'Outil perso / interne',   '🛠️',  'Outil de productivité perso, script, mini-utilitaire, no-code',
    array['outil','productivité','script','mini-outil','no-code','utilitaire','interne']::text[], 3),
  ('dev', 'logiciel-metier',      'Logiciel métier',         '💼',  'Logiciel métier / desktop / B2B spécialisé',
    array['logiciel','métier','desktop','b2b','windows','mac','erp','industrie']::text[], 4),
  ('dev', 'autre-tech',           'Autre projet tech',       '🧩',  'Projet tech qui ne rentre dans aucune catégorie',
    array['tech','autre','dev','code','programmation']::text[], 99),

  -- BUSINESS-ONLINE (4 principaux + 1 autre)
  ('business-online', 'marque-ecommerce',      'Marque / e-commerce',   '🛍️',  'DNVB, boutique en ligne, marque de produits',
    array['boutique','shop','e-commerce','ecommerce','dnvb','marque','vêtement','t-shirt','produits','shopify']::text[], 1),
  ('business-online', 'infopreneur',           'Infopreneur',           '🎓',  'Formations, cours, coaching, ebooks, newsletters payantes',
    array['cours','formation','coaching','ebook','newsletter','infoproduit','info produit','info-produit','contenu payant','knowledge']::text[], 2),
  ('business-online', 'agence-digitale',       'Agence digitale',       '🕸️',  'Agence, freelance, consulting en ligne (SEO, marketing, dev)',
    array['agence','freelance','consulting','service digital','marketing','seo','webmarketing','growth']::text[], 3),
  ('business-online', 'marketplace',           'Marketplace',           '🔄',  'Plateforme de mise en relation multi-sided (buyers / sellers)',
    array['marketplace','plateforme','mise en relation','multi-sided','place de marché']::text[], 4),
  ('business-online', 'autre-business-online', 'Autre business en ligne', '🌐',  'Business en ligne qui ne rentre dans aucune catégorie',
    array['business','en ligne','web','autre','online']::text[], 99),

  -- BUSINESS-PHYSIQUE (3 principaux + 1 autre)
  ('business-physique', 'commerce-local',         'Commerce local',       '🏬',  'Boutique physique, magasin de proximité',
    array['boutique physique','magasin','commerce','local','retail','shop']::text[], 1),
  ('business-physique', 'restauration',           'Restauration',         '🍽️',  'Restaurant, café, bar, food-truck, cuisine',
    array['restaurant','café','bar','food-truck','food truck','cuisine','bistrot','brasserie','pizzeria']::text[], 2),
  ('business-physique', 'service-physique',       'Service physique',     '💈',  'Salon, coiffeur, spa, beauté, auto-école, garage, artisan à domicile',
    array['salon','coiffeur','spa','beauté','massage','auto-école','garage','artisan','service','atelier','menuiserie','ferronnerie']::text[], 3),
  ('business-physique', 'autre-business-physique', 'Autre business physique', '🏗️',  'Activité physique qui ne rentre dans aucune catégorie',
    array['physique','local','autre','offline']::text[], 99),

  -- CREATIF (3 principaux + 1 autre)
  ('creatif', 'artiste',          'Artiste',           '🎭',  'Musicien, peintre, sculpteur, projet artistique',
    array['artiste','musicien','peintre','sculpteur','art','galerie','spectacle','exposition','musique','peinture']::text[], 1),
  ('creatif', 'createur-contenu', 'Créateur de contenu', '🎥',  'YouTube, TikTok, Instagram, Twitch, influenceur, podcast vidéo',
    array['créateur','createur','youtube','tiktok','instagram','twitch','stream','influenceur','vlog','podcast vidéo','influence']::text[], 2),
  ('creatif', 'projet-edition',   'Projet éditorial',  '📖',  'Livre, magazine, podcast audio, blog, média écrit',
    array['livre','édition','edition','podcast','magazine','blog','roman','média','journalisme','écriture','ecriture']::text[], 3),
  ('creatif', 'autre-creatif',    'Autre projet créatif', '✨',  'Projet créatif qui ne rentre dans aucune catégorie',
    array['créatif','creatif','art','autre']::text[], 99)
) as t(world_slug, slug, name, icon, description, keywords, display_order)
  on t.world_slug = w.slug
on conflict (slug) do nothing;

-- ═══════════════════════════════════════════════════════════════
-- 9. SEED — modules (4 universels + 16 spécifiques)
-- ═══════════════════════════════════════════════════════════════
insert into tab_modules (slug, name, icon, is_universal, is_mandatory, component_key) values
  -- Universels (mandatory)
  ('cockpit',              'Cockpit',                '📊', true,  true,  'cockpit'),
  ('tasks',                'Tâches',                 '✅', true,  true,  'tasks'),
  ('decisions',            'Décisions',              '🧭', true,  true,  'decisions'),
  ('resources',            'Ressources',             '🔗', true,  true,  'resources'),

  -- Spécifiques
  ('brainstorm',           'Brainstorm',             '💡', false, false, 'brainstorm'),
  ('technique',            'Technique',              '⚙️', false, false, 'technique'),
  ('design',               'Design',                 '🎨', false, false, 'design'),
  ('collection',           'Collection',             '👗', false, false, 'collection'),
  ('fournisseurs',         'Fournisseurs',           '🏭', false, false, 'fournisseurs'),
  ('stock',                'Stock',                  '📦', false, false, 'stock'),
  ('menu',                 'Menu',                   '🍽️', false, false, 'menu'),
  ('clients',              'Clients',                '👥', false, false, 'clients'),
  ('offres',               'Offres',                 '💼', false, false, 'offres'),
  ('moodboard',            'Moodboard',              '🎭', false, false, 'moodboard'),
  ('calendrier-editorial', 'Calendrier éditorial',   '📅', false, false, 'calendrier-editorial'),
  ('production',           'Production',             '🎬', false, false, 'production'),
  ('licences',             'Licences & droits',      '📜', false, false, 'licences'),
  ('emplacement',          'Emplacement',            '📍', false, false, 'emplacement'),
  ('equipe',               'Équipe',                 '🧑‍🤝‍🧑', false, false, 'equipe'),
  ('catalogue-produits',   'Catalogue produits',     '📚', false, false, 'catalogue-produits')
on conflict (slug) do nothing;

-- ═══════════════════════════════════════════════════════════════
-- 10. SEED — type_module_presets (universels + recommandés par type)
-- ═══════════════════════════════════════════════════════════════

-- 10a. Tous les types reçoivent les 4 universels (display_order 1..4)
insert into type_module_presets (type_id, module_id, display_order, is_recommended)
select pt.id, tm.id,
       case tm.slug
         when 'cockpit' then 1
         when 'tasks' then 2
         when 'decisions' then 3
         when 'resources' then 4
       end as display_order,
       true
from project_types pt
cross join tab_modules tm
where tm.is_universal = true
on conflict do nothing;

-- 10b. Modules spécifiques recommandés par type
-- Helper CTE pour éviter la répétition
with recommended(type_slug, module_slug, display_order) as (values
  -- DEV
  ('saas',            'brainstorm', 10),
  ('saas',            'technique',  11),
  ('saas',            'design',     12),
  ('app-mobile',      'brainstorm', 10),
  ('app-mobile',      'technique',  11),
  ('app-mobile',      'design',     12),
  ('outil-autre',     'brainstorm', 10),
  ('outil-autre',     'technique',  11),
  ('logiciel-metier', 'brainstorm', 10),
  ('logiciel-metier', 'technique',  11),
  ('logiciel-metier', 'design',     12),
  ('autre-tech',      'brainstorm', 10),
  ('autre-tech',      'technique',  11),
  ('autre-tech',      'design',     12),

  -- BUSINESS-ONLINE
  ('marque-ecommerce',      'design',             10),
  ('marque-ecommerce',      'moodboard',          11),
  ('marque-ecommerce',      'collection',         12),
  ('marque-ecommerce',      'catalogue-produits', 13),
  ('marque-ecommerce',      'fournisseurs',       14),
  ('marque-ecommerce',      'stock',              15),
  ('infopreneur',           'design',                10),
  ('infopreneur',           'moodboard',             11),
  ('infopreneur',           'calendrier-editorial',  12),
  ('infopreneur',           'offres',                13),
  ('infopreneur',           'clients',               14),
  ('agence-digitale',       'design',   10),
  ('agence-digitale',       'offres',   11),
  ('agence-digitale',       'clients',  12),
  ('agence-digitale',       'equipe',   13),
  ('marketplace',           'brainstorm', 10),
  ('marketplace',           'technique',  11),
  ('marketplace',           'design',     12),
  ('autre-business-online', 'design',     10),

  -- BUSINESS-PHYSIQUE
  ('commerce-local',   'emplacement',        10),
  ('commerce-local',   'equipe',             11),
  ('commerce-local',   'catalogue-produits', 12),
  ('commerce-local',   'stock',              13),
  ('commerce-local',   'fournisseurs',       14),
  ('restauration',     'emplacement',  10),
  ('restauration',     'equipe',       11),
  ('restauration',     'menu',         12),
  ('restauration',     'fournisseurs', 13),
  ('service-physique', 'emplacement',  10),
  ('service-physique', 'equipe',       11),
  ('service-physique', 'clients',      12),
  ('service-physique', 'offres',       13),
  ('autre-business-physique', 'emplacement', 10),

  -- CREATIF
  ('artiste',          'moodboard',             10),
  ('artiste',          'production',            11),
  ('artiste',          'licences',              12),
  ('artiste',          'calendrier-editorial',  13),
  ('createur-contenu', 'moodboard',             10),
  ('createur-contenu', 'production',            11),
  ('createur-contenu', 'calendrier-editorial',  12),
  ('createur-contenu', 'licences',              13),
  ('projet-edition',   'moodboard',             10),
  ('projet-edition',   'calendrier-editorial',  11),
  ('projet-edition',   'production',            12),
  ('autre-creatif',    'moodboard',             10)
)
insert into type_module_presets (type_id, module_id, display_order, is_recommended)
select pt.id, tm.id, r.display_order, true
from recommended r
join project_types pt on pt.slug = r.type_slug
join tab_modules tm on tm.slug = r.module_slug
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════
-- 11. MIGRATION DATA — mapper projects.type → projects.type_id + peupler project_modules
-- ═══════════════════════════════════════════════════════════════
do $$
declare
  proj record;
  mapped_type_id uuid;
begin
  for proj in
    select id, type from projects where type_id is null
  loop
    select pt.id into mapped_type_id
    from project_types pt
    where pt.slug = case proj.type
      when 'outil'    then 'outil-autre'
      when 'saas'     then 'saas'
      when 'appli'    then 'app-mobile'
      when 'logiciel' then 'autre-tech'
      when 'business' then 'autre-business-online'
      else null
    end;

    if mapped_type_id is null then
      continue;
    end if;

    update projects set type_id = mapped_type_id where id = proj.id;

    insert into project_modules (project_id, module_id, enabled, display_order)
    select proj.id, tmp.module_id, true, tmp.display_order
    from type_module_presets tmp
    where tmp.type_id = mapped_type_id
    on conflict (project_id, module_id) do nothing;
  end loop;
end $$;
