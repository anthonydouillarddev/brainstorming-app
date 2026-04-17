# Plan d'implémentation — Migration Design spike → vraie structure

> Document de planification pour la migration du spike `/design-spike` vers la vraie structure `src/app/project/[id]/design/` de Mindeck.
> Date : 2026-04-17.
> Contexte : suite à l'audit code (note C+) + analyse concurrentielle 2026 qui identifie 5 features stratégiques à ajouter pendant la migration.

---

## 0. Contexte

### Ce qui existe
- **Spike `/design-spike`** (dev-only, 404 en prod) : 4300 lignes de React, fonctionnel mais god-component, duplications, 8 `eslint-disable`.
- **Libs pures** (`src/lib/design/*`) : `oklch.ts`, `tokens.ts`, `fonts.ts`, `export.ts`, `validator.ts`, `colors-api.ts`, `combos.ts`. **Production-grade, réutilisables sans modif**.
- **Migration SQL 014** déjà appliquée : `user_preferences.saved_colors` + table `custom_color_combos`.
- **Décisions Phase 4** validées : Mode Simple/Avancé/Pro, langue FR-only en MVP, icônes emoji, SaaS public monétisé.

### Ce qu'on doit faire
1. **Migrer** les libs pures telles quelles (zéro travail)
2. **Réécrire proprement** la couche UI en respectant les règles Mindeck (composants découpés, pas de god-component)
3. **Intégrer dans le dashboard projet** existant (`src/app/project/[id]/dashboard.tsx` onglet Design)
4. **Ajouter 5 features stratégiques** identifiées par l'analyse concurrentielle 2026
5. **Persister via Supabase** (pas de localStorage côté prod)

### Ce qu'on NE fait PAS
- Le spike **reste en place** comme playground dev (utilisé pour tester vite)
- Les 5 autres sous-onglets Design (foundations, identity, info-nav, flows, etc.) = **placeholders "Bientôt"**
- **Pas de Mode AI** (reporté v2/v3, décision validée)
- **Pas de mockup multi-pages** style Realtime Colors (nice-to-have, après)

---

## 1. Architecture fichiers cible

```
src/app/project/[id]/
├── dashboard.tsx                               ← modifier 1 import (design → nouveau DesignPanel)
└── design/                                     ← NOUVEAU
    ├── index.tsx                               ← orchestrateur : mini-menu vertical + mode global
    ├── visual/                                 ← chap. 6 Visuel (prioritaire)
    │   ├── index.tsx                           ← layout + routing sous-blocs
    │   ├── state.ts                            ← types + defaults + helpers merge/resolve
    │   ├── blocks/                             ← 1 fichier par bloc
    │   │   ├── PaletteBlock.tsx
    │   │   ├── CombosBlock.tsx
    │   │   ├── NeutralsSemanticsBlock.tsx
    │   │   ├── GradientBlock.tsx
    │   │   ├── TokensBlock.tsx
    │   │   ├── MarriageBlock.tsx
    │   │   └── ExportBlock.tsx
    │   ├── components/                         ← composants réutilisables
    │   │   ├── CollapsibleSection.tsx          ← élimine 7 duplications
    │   │   ├── Slider.tsx
    │   │   ├── PaletteRow.tsx
    │   │   ├── ShadeCard.tsx
    │   │   ├── ContrastMatrix.tsx
    │   │   ├── ComboCard.tsx
    │   │   ├── MarriageChip.tsx
    │   │   ├── ComponentPreview.tsx            ← vrais composants shadcn-like
    │   │   └── Help.tsx                        ← tooltips pédagogiques
    │   └── tabs/
    │       ├── TypoTab.tsx
    │       ├── FontsTab.tsx
    │       ├── SpacingTab.tsx
    │       ├── RadiusTab.tsx
    │       ├── ShadowTab.tsx
    │       └── ComponentsTab.tsx
    ├── foundations/                            ← placeholder (bloc "Bientôt")
    ├── identity/                               ← placeholder
    ├── info-nav/                               ← placeholder
    ├── flows/                                  ← placeholder
    ├── principles/                             ← placeholder
    ├── states/                                 ← placeholder
    ├── microcopy/                              ← placeholder
    ├── a11y/                                   ← placeholder
    ├── adaptivity/                             ← placeholder
    └── validation/                             ← placeholder

src/lib/design/                                 ← existe déjà (libs pures) — aucune modif
├── oklch.ts
├── tokens.ts
├── fonts.ts
├── export.ts
├── validator.ts
├── colors-api.ts
├── combos.ts
└── presets-api.ts                              ← NOUVEAU : CRUD design system presets
```

---

## 2. Modèle de données

### 2.1 Migration SQL 015 (nouveau)

```sql
-- 015: Presets de design systems complets (par user, multi-projets)
create table if not exists design_system_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade, -- nullable : preset global ou projet
  name text not null,
  snapshot jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_design_presets_user_id on design_system_presets(user_id, created_at desc);
create index if not exists idx_design_presets_project_id on design_system_presets(project_id);

alter table design_system_presets enable row level security;

drop policy if exists "Users see own design presets" on design_system_presets;
create policy "Users see own design presets" on design_system_presets
  for all using (auth.uid() = user_id);

-- Storage du DS actif par projet (dans sections.content JSON)
-- Pas de migration nécessaire : on étend le JSON existant de la section design
```

### 2.2 Structure du snapshot JSON

```typescript
interface DesignSystemSnapshot {
  version: 1;
  primaryHex: string;
  tuning: { contrast: number; chromaPeakIndex: number; chromaAmount: number };
  selected: Array<{ hex: string; source?: string }>;
  tokens: TokensState;
  neutralTintStrength: number;
  semanticHues: Record<SemanticRole, number>;
  updatedAt: string;
}
```

### 2.3 Persistance

- **State actif du projet** : dans `sections.content` avec `section_key = "design_visual"` (JSON)
- **Presets sauvegardés** : table `design_system_presets` (multi-device Supabase)
- **Fin du localStorage** en prod : tout passe par Supabase. Le localStorage reste pour le spike dev uniquement.

### 2.4 Intégration avec les données projet existantes

Les presets peuvent être pré-remplis depuis les données projet :
- `project.type` (saas/appli/outil/etc.) → suggère un moodboard adapté
- `project.description` → hint pour la personnalité de marque
- `project.north_star` → peut apparaître dans le Markdown exporté

---

## 3. 5 features stratégiques à intégrer

### Feature 1 — Export tweakcn/shadcn ready
**Objectif** : capter 80% des indie Next.js devs (écosystème shadcn).

- Ajouter un **5e format d'export** : "shadcn/ui globals.css"
- Format exact attendu par shadcn : `@layer base { :root { --background: ...; --foreground: ...; ... } }`
- Mapping automatique : palette primary → `--primary`, neutral → `--background/--foreground/--border`, semantics → `--destructive/--success/etc.`
- **Bonus** : bouton "Copier pour tweakcn" qui formate exactement leur payload

**Complexité** : S (1 jour) — juste une nouvelle fonction `exportShadcn()` dans `export.ts`.

### Feature 2 — Format DESIGN.md (standard Google Stitch)
**Objectif** : s'aligner sur standard émergent agent-friendly, au-delà du Markdown Claude-ready.

- Nouveau format `exportDesignMd()` qui suit la spec Google Stitch 2025
- Sections : Brand (couleurs primaires), Typography, Spacing, Components (tokens par composant), Accessibility
- **Bonus** : parser inverse `importDesignMd()` pour charger un DS d'un autre projet (v2)

**Complexité** : S (1 jour) — nouvelle fonction dans `export.ts`.

### Feature 3 — Previews composants shadcn-like
**Objectif** : fermer le gap visuel vs tweakcn.

Remplacer les placeholders actuels par des vrais composants rendus avec le design system actif :
- Button (default, destructive, outline, secondary, ghost, link) × 3 tailles
- Card (avec header, content, footer)
- Input + Label + Helper text
- Modal/Dialog avec actions
- Toast/Alert (info, success, warning, error)
- Badge (3 variants)
- Tabs (3 items)

**Pas besoin d'embarquer shadcn**, on copie le visuel shadcn/Radix avec nos propres composants stylés.

**Complexité** : M (2-3 jours).

### Feature 4 — Presets de design systems complets (Supabase)
**Objectif** : l'user sauvegarde son DS entier par projet ou en bibliothèque globale.

- Nouveau fichier `src/lib/design/presets-api.ts` avec CRUD
- UI dans `ExportBlock` : section "💾 Mes design systems" avec liste des presets sauvegardés
- Bouton "Sauver ce DS" → input nom → insert dans `design_system_presets`
- Clic sur un preset dans la liste → charge le snapshot dans tous les blocs
- Option : "Utiliser comme DS pour ce projet" → écrit dans `sections.content` (section `design_visual`)

**Complexité** : M (2 jours) — migration SQL + API + UI.

### Feature 5 — Intégration données projet Mindeck
**Objectif** : le DS n'est plus en vase clos, il utilise le contexte du projet.

- `project.type` dans PaletteBlock → preset de vibe suggéré ("Corporate" pour logiciel, "Playful" pour appli, etc.)
- `project.description` affiché en header du bloc (rappel contexte)
- `project.north_star` dans l'export Markdown (section contexte projet)
- Si `section_key = "branding"` existe (section brainstorm) → suggère sa couleur principale comme primary

**Complexité** : S (1 jour).

---

## 4. Refactorings obligatoires (hérités de l'audit)

### 4.1 Composant CollapsibleSection
Remplace les 7 duplications actuelles. API propre :

```tsx
<CollapsibleSection
  title="4. Neutrals & Semantics"
  subtitle="gris teintés + 4 rôles"
  helpTopic="neutral"
  defaultCollapsed
  mode={mode}
  visibleIn={["advance", "pro"]}
>
  {/* contenu */}
</CollapsibleSection>
```

- Gère le toggle, l'aria-expanded, l'escape key, la persistance (optionnelle) du collapse state
- Intègre le Help? inline
- Intègre la logique mode (simple/avance/pro) pour cacher certains blocs

### 4.2 Découpage page.tsx → 1 fichier par bloc
Le spike a 1766 lignes dans page.tsx. La vraie structure doit avoir :
- `design/visual/index.tsx` < 200 lignes (juste composition + state)
- Chaque `blocks/XxxBlock.tsx` < 300 lignes
- Chaque `components/Xxx.tsx` < 150 lignes

### 4.3 State management propre
- `useMemo` pour `tuning` (pas de recréation à chaque render)
- `useState(lazy init)` pour l'hydratation depuis localStorage (pas de `setState` dans `useEffect([])`)
- Custom hook `useDesignSystemState()` qui encapsule tout le state visual + la persistance Supabase (debouncée 800ms, pattern Mindeck existant)

### 4.4 Fix colors-api.ts
Les erreurs Supabase sont silencieuses (Supabase ne rejette pas, on ne lit pas `error`). À fixer :

```typescript
const { data, error } = await supabase.from(...).upsert(...);
if (error) throw error;
```

### 4.5 Supprimer dead code
- `GradientsPicker` dans tokens-block.tsx (185 lignes non utilisées)
- `findGlobalFix`, `findBestAlternative`, `suggestBestPairs` non utilisés dans le spike final
- Imports morts (plusieurs fichiers)

### 4.6 Toast système
Pattern Mindeck existant pour feedback utilisateur. À réutiliser dans :
- Save/delete combo perso
- Save design preset
- Export (copy success / download success)
- Erreurs Supabase

---

## 5. Planning 4 semaines

### Semaine 1 — Fondations UI
- `CollapsibleSection` + `Help` + `Slider` + `ShadeCard` composants réutilisables
- `design/index.tsx` orchestrateur (mini-menu vertical + mode global persistant dans `user_preferences`)
- Migration du toggle mode Simple/Avancé/Pro vers Supabase (colonne `design_mode` dans user_preferences via migration 016 OU JSON dans existant)
- Custom hook `useDesignSystemState()` avec persistance Supabase debouncée
- Placeholders pour les 10 sous-onglets Design (dont 9 "Bientôt" + visual actif)

**Livrable** : l'onglet Design apparaît dans le dashboard, affiche le mini-menu, le sous-onglet visual est accessible mais vide.

### Semaine 2 — Blocs couleurs (1-4)
- `PaletteBlock.tsx` : palette + tuning + matrice WCAG + dark mode preview
- `PalettesRefBlock.tsx` : 7 palettes de référence (mode Pro)
- `CombosBlock.tsx` : 20 combos curés + création perso + favoris Supabase
- `NeutralsSemanticsBlock.tsx` : neutrals + semantics avec variantes

**Livrable** : tout l'amont couleurs fonctionne, persisté Supabase.

### Semaine 3 — Blocs design system (5-7)
- `GradientBlock.tsx` : avec stops du design system (memoized correctement)
- `TokensBlock.tsx` : 6 sous-onglets (typo, fonts, spacing, radius, shadow, components)
- Previews composants shadcn-like dans ComponentsTab (feature 3)
- `MarriageBlock.tsx` : chips + rôles + WCAG live + mockup avec tokens + color picker popover + light/dark toggle

**Livrable** : tout le chap. 6 fonctionne dans la vraie structure.

### Semaine 4 — Export + presets + polish
- `ExportBlock.tsx` avec 5 formats (CSS, Tailwind v4, DTCG JSON, Markdown Claude, shadcn/ui globals.css) — features 1 + 2
- Presets complets Supabase (feature 4) : migration 015 + `presets-api.ts` + UI bibliothèque
- Intégration données projet (feature 5)
- Validation auto : bandeau top de page avec score progression + 15 règles
- Pédagogie : 12 tooltips Help? placés aux bons endroits
- QA manuel + fix bugs

**Livrable** : chap. 6 Visual complet dans Mindeck, production-ready.

---

## 6. Décisions techniques figées

### 6.1 Pas de lib ajoutée
- **Pas de `framer-motion`** pour les animations (CSS transitions suffisent)
- **Pas de `@dnd-kit`** (on garde ◀▶ boutons clavier-friendly)
- **Pas de lib toast externe** (pattern Mindeck existant réutilisé)
- **Culori déjà installé** pour OKLCH

### 6.2 State persisté Supabase dès le MVP
- State visual du projet : dans `sections.content` (JSONB) avec `section_key = "design_visual"`
- Presets globaux user : table `design_system_presets` (migration 015)
- Mode Simple/Avancé/Pro : colonne dans `user_preferences` (migration 016 ou ajout à user_preferences.design_prefs JSONB)

### 6.3 Debounced save 800ms
Pattern existant dans Mindeck (editor.tsx, resources.tsx). À réutiliser pour tous les changements visual.

### 6.4 Pas de localStorage en prod
- Le spike garde localStorage (dev uniquement)
- La vraie structure utilise exclusivement Supabase
- Pas de fallback hybride (simpler)

### 6.5 TypeScript strict partout
- `noUnusedLocals: true` à activer dans `tsconfig.json`
- Pas de `any`, pas de `eslint-disable`
- Les 6-10h de fix code de l'audit s'appliquent durant la réécriture (pas après coup)

---

## 7. Migration SQL nécessaires

| Migration | Description | Obligatoire |
|---|---|---|
| 014 | ✅ Déjà appliquée (saved_colors + custom_color_combos) | — |
| 015 | `design_system_presets` (presets user globaux) | Semaine 4 |
| 016 | `user_preferences.design_mode` (Simple/Avancé/Pro persistant) | Semaine 1 (optionnel, peut passer par localStorage en attendant) |

Migration 015 et 016 à présenter à Anthony avant exécution (règle CLAUDE.md).

---

## 8. Intégration dans Mindeck existant

### 8.1 Dashboard projet
Le fichier `src/app/project/[id]/dashboard.tsx` utilise actuellement `SingleSectionPanel` pour l'onglet design (fallback sur l'ancienne section brainstorm). À remplacer :

```tsx
// Avant
{tab === "design" && <SingleSectionPanel sectionKey="design" ... />}

// Après
{tab === "design" && <DesignPanel project={project} ... />}
```

### 8.2 Brainstorm → Branding reste
La section `branding` du brainstorm (nom, domaine, logo status, couleurs brutes) reste. Elle alimente en hint le nouveau DesignPanel sans le remplacer (décision Phase 4).

### 8.3 Cockpit
Peut afficher un mini-preview du DS actif du projet (3 couleurs + font) dans un nouveau bloc "Design" (v2).

---

## 9. Points de risque

### 9.1 Performance re-renders
Les blocs peuvent re-render inutilement avec de gros states. Mitigation :
- `React.memo` sur les composants visuels lourds
- `useMemo` agressif sur les palettes dérivées (primary, neutrals, semantics, dark)
- Debounce sliders (300ms) avant regénération

### 9.2 Persistance Supabase debouncée vs navigation
Si l'user change d'onglet projet alors qu'un save est en attente, risque de perdre les derniers changements. Mitigation :
- `beforeunload` qui force le flush du timer
- Sync immédiat au changement de sous-onglet

### 9.3 Migration des données spike
Le spike stocke en localStorage (`mindeck_spike_design_state`). Quand on passe en prod, les users pourraient perdre leurs tests. Mitigation :
- Au premier load prod, proposer "Importer depuis le spike ?" (lit le localStorage une fois, puis Supabase)
- Fallback : reset propre.

### 9.4 Estimation optimiste
4 semaines est optimiste pour un solo. Réalisme : **5-6 semaines** avec imprévus. Pas un drame pour un SaaS en développement.

---

## 10. Questions ouvertes pour Anthony

### 10.1 Mode global : Supabase dès v1 ou localStorage ?
Recommandation : **localStorage en v1** (Semaine 1), migration Supabase en v1.1 (Semaine 4). Évite la migration SQL 016 au démarrage.

### 10.2 Ordre des features stratégiques
Dans la semaine 4 : 1️⃣ shadcn export (le plus marketing), 2️⃣ DESIGN.md (compat future), 3️⃣ presets, 4️⃣ intégration projet, 5️⃣ previews shadcn-like. OK ?

### 10.3 Le spike reste accessible ?
Recommandation : **oui** (comme playground dev en local). Il ne sera plus modifié, juste conservé pour référence.

### 10.4 Le chap. 6 migré couvre tous les projets existants ?
Oui, mais ils commencent avec un DS vide. Option : extraire automatiquement les couleurs actuelles de la section `branding` du brainstorm pour pré-remplir.

---

## 11. Ordre de commandes à exécuter

Quand Anthony valide ce plan et dit "go" :

```bash
# Rien à installer (culori déjà dans package.json)
# Rien à modifier dans la config (TypeScript strict déjà actif)
```

Étapes de dev (séquentielles) :
1. Créer arborescence `src/app/project/[id]/design/`
2. Créer `CollapsibleSection` + composants de base
3. Modifier `dashboard.tsx` pour utiliser `DesignPanel`
4. Blocs 1-4 (couleurs)
5. Blocs 5-7 (design system)
6. Bloc 8 (export) + migration 015
7. QA + polish

---

**Fin du plan de migration.**

Prochaine étape : validation d'Anthony sur les 4 questions ouvertes §10, puis démarrage Semaine 1.
