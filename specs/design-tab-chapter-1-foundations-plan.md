# Plan d'implémentation — Chap. 1 Fondations stratégiques

> Plan complet (V1 + V2 + V3) pour le chapitre 1 de l'onglet Design.
> Date : 2026-04-17.
> Contexte : chap. 6 Visuel poussé en prod, on remonte au début du Double Diamond.

---

## 0. Contexte

### Ce qui existe déjà et qu'on réutilise
- **Pattern Mindeck** : `sections.content` JSONB + debounced save 800ms via `scheduleSave`
- **Composants** : `CollapsibleSection`, `useToast`, `ToastProvider`, portal modal (`#modal-root`)
- **Help tooltips** : `src/app/design-spike/help.tsx` avec `HelpKey` typé
- **Mode Simple/Avancé/Pro** : pattern éprouvé (`LS_VIEW_MODE` localStorage) dans `visual/index.tsx`
- **Orchestrator menu vertical 12 chapitres** : `design/index.tsx` route vers le bon chapitre via `activeKey`
- **Libs design** : aucune utile ici (c'est un chap stratégie, pas visuel)

### Ce qu'on va construire
12 composants React, 3 modes progressifs, 8 générateurs/widgets, 9 règles de validation live, 16 contenus pédagogiques, 5 outputs exportables.

### Ce qu'on NE fait PAS
- Pas d'IA générative (reporté v2/v3 global)
- Pas de collaboration multi-user (c'est un outil solo)
- Pas de nouvelle migration SQL (tout rentre dans `sections.content`)
- Pas de lib nouvelle (pas de `react-hook-form`, pas de lib PDF externe — `@react-pdf/renderer` optionnel en V3 si vraiment nécessaire)

---

## 1. Architecture fichiers cible

```
src/app/project/[id]/design/foundations/       ← NOUVEAU
├── index.tsx                                   ← orchestrateur (layout + header + mode toggle)
├── state.ts                                    ← types + defaults + helpers merge/parse
├── validators.ts                               ← 9 règles de validation live
├── templates.ts                                ← bibliothèque proto-personas par type projet
├── blocks/
│   ├── JtbdBlock.tsx                          ← MUST — JTBD statement + jobs émotionnels/sociaux
│   ├── PersonasBlock.tsx                      ← MUST — proto-personas (max 3) avec CRUD
│   ├── JobStoriesBlock.tsx                    ← SHOULD — job stories When/I want/So I can
│   ├── PositioningBlock.tsx                   ← SHOULD — Dunford 5 composantes canvas
│   ├── AhaMomentBlock.tsx                     ← MUST — aha moment mesurable
│   ├── PrinciplesBlock.tsx                    ← MUST — 3-5 principes opposables
│   ├── AntiGoalsBlock.tsx                     ← SHOULD — hors périmètre
│   └── ExportBlock.tsx                        ← MD/JSON + brief Claude + PDF (V3)
├── components/
│   ├── ModeToggle.tsx                         ← toggle beginner/intermediate/expert
│   ├── ProgressBar.tsx                        ← barre de progression globale (complétude)
│   ├── ChatStep.tsx                           ← composant étape conversationnelle (mode beginner)
│   ├── CanvasMode.tsx                         ← layout canvas Miro-like (mode expert)
│   ├── PersonaCard.tsx                        ← card éditable avec emoji/contexte/goals/frustrations
│   ├── JtbdStatementBuilder.tsx               ← générateur JTBD Ulwick format
│   ├── JobStoryBuilder.tsx                    ← générateur job story Intercom format
│   ├── ValidationBadge.tsx                    ← badge vert/orange/rouge + message
│   ├── ExamplePicker.tsx                      ← bouton "Exemple pré-rempli" par type projet
│   └── ConcurrentMapper.tsx                   ← matrice 2×2 V3
└── exports/
    ├── markdown.ts                             ← exportFoundationsMd()
    ├── json.ts                                 ← exportFoundationsJson()
    ├── claude-brief.ts                         ← exportClaudeBrief()
    └── pdf-card.ts                             ← carte A4 imprimable (V3, optionnel)
```

**Fichiers à modifier** :
- `chapters.ts` : `foundations` passe de `bientot` → `ready`
- `design/index.tsx` : ajouter route vers `FoundationsChapter` au lieu de `ChapterPlaceholder`

---

## 2. Modèle de données

### 2.1 Pas de migration SQL
Tout tient dans `sections.content` (JSONB) avec `section_key = "foundations"`. Compatible avec le schéma existant.

### 2.2 Structure du state

```typescript
// state.ts
export interface FoundationsState {
  version: 1;

  // JTBD — MUST
  jtbdCore: string;           // "Aider [who] à [job] quand [situation]"
  jtbdEmotional: string[];    // jobs émotionnels (V2)
  jtbdSocial: string[];       // jobs sociaux (V2)

  // Job stories — SHOULD
  jobStories: Array<{
    id: string;
    when: string;
    iWant: string;
    soICan: string;
  }>;

  // Personas — MUST (1) + SHOULD (2-3) + NICE (autres)
  personas: Array<{
    id: string;
    name: string;
    avatarEmoji: string;
    ageRange: string;
    context: string;
    goals: string[];           // max 3 en V1
    frustrations: string[];    // max 3 en V1
    techLevel: "débutant" | "intermédiaire" | "expert";
  }>;
  primaryPersonaId: string | null;

  // Positioning Dunford — SHOULD
  positioningAlternatives: string[];
  positioningUniqueAttributes: string[];
  positioningValue: string[];
  positioningSegment: string;
  positioningCategory: string;
  positioningStatement: string;    // phrase générée auto

  // Aha moment — MUST
  ahaMomentEvent: string;
  ahaMomentThreshold: string;      // "7 amis / 10 jours"

  // Principes design — MUST (3-5)
  designPrinciples: Array<{
    id: string;
    principle: string;              // format "A > B"
    rationale: string;
    tradeOff: string;
  }>;

  // Anti-goals — SHOULD
  antiGoals: string[];

  // Meta
  modeUsed: "beginner" | "intermediate" | "expert";
  completenessScore: number;       // 0-100 calculé live
  updatedAt: string;
}

export const FOUNDATIONS_SECTION_KEY = "foundations";
export const DEFAULT_FOUNDATIONS_STATE: FoundationsState = { ... };
export function mergeFoundationsState(partial): FoundationsState { ... }
export function parseFoundationsState(content?: string): FoundationsState { ... }
export function computeCompleteness(state: FoundationsState): number { ... }
```

### 2.3 Intégration données projet Mindeck (feature 5 like chap 6)

Le `FoundationsChapter` reçoit le `project` et affiche dans le header :
- Type de projet → suggère les templates de personas adaptés
- Description → hint dans le contexte JTBD
- North Star → rappel pour l'aha moment

Les templates de personas dans `templates.ts` sont filtrés par `project.type` :
```typescript
export const PERSONA_TEMPLATES: Record<ProjectType, PersonaTemplate[]> = {
  saas: [/* "Dirigeant PME", "Dev backend", "Product manager" */],
  appli: [/* "Étudiant 22 ans", "Parent overbooké", "Gamer casual" */],
  outil: [/* "Freelance", "Admin bureau", "Étudiant" */],
  logiciel: [/* "Comptable", "Architecte", "Ingénieur" */],
  business: [/* "Entrepreneur", "Investisseur", "Partenaire" */],
};
```

---

## 3. 3 modes progressifs (cœur UX)

### Mode **Débutant** — Chat conversationnel
- 1 question à l'écran à la fois (ChatStep.tsx)
- 10 étapes, barre de progression
- Chaque question a un exemple cliquable "Adapter cet exemple"
- Zéro jargon ("JTBD" → "Quel problème tu résous ?")
- Boutons `← Retour` / `Suivant →`
- Auto-save à chaque étape terminée

### Mode **Intermédiaire** — Formulaire structuré (DÉFAUT)
- Toutes les sections visibles, collapsibles
- Pattern `CollapsibleSection` existant (hérité chap 6)
- 3-5 options pré-mâchées cliquables + "Autre"
- Tooltips `Help` sous chaque champ
- Sidebar sticky avec résumé live + barre progression

### Mode **Expert** — Canvas libre
- Layout grid type Miro : tous les blocs visibles en même temps
- Champs libres sans exemples
- Validation temps réel (badge par bloc)
- Raccourcis clavier : `Cmd+S` force save, `Cmd+E` export
- Référence framework discrète : "Ulwick format", "Dunford 5"

### Persistance du mode
- `localStorage : mindeck:design:foundations:mode`
- Synchro à `state.modeUsed` (pour analytics futures)

---

## 4. 8 générateurs/widgets détaillés

### 4.1 JTBD Statement Builder (MUST)
**Input** : verbe action + objet + contexte (3 champs)
**Output** : `"Aider [who] à [job] quand [situation]"`
**Validation live** :
- Refus si contient solution ("bouton", "cliquer", "dashboard", "interface", "UI", "bouton export")
- Alerte si < 10 caractères
- Badge vert si format complet
**UI** : 3 inputs horizontaux + preview sous forme de pastille "→ Statement généré"

### 4.2 Job Story Builder (SHOULD)
**Input** : 3 champs (When, I want, So I can)
**Output** : `"When X, I want Y, so I can Z"`
**Validation live** : refus si "When" vide, alerte si < 15 caractères total
**UI** : 3 lignes alignées avec labels cliquables pour voir exemple

### 4.3 Proto-Personas Library (MUST + SHOULD)
**Input** : type projet (hérité)
**Output** : 3-6 proto-personas éditables pré-remplis
**UI** : grille de cards pickable, clic = "Ajouter à mes personas" (ajoute à `state.personas`)

### 4.4 Positioning Canvas Dunford (SHOULD)
**Input** : 5 zones guidées dans l'ordre imposé
1. Competitive alternatives (textarea bullet list)
2. Unique attributes (textarea)
3. Value themes (textarea)
4. Best-fit customer (select + description)
5. Market category (input)

**Output** : `state.positioningStatement` auto-généré en phrase
**UI** : stepper horizontal 1→5, flèches entre étapes, badge "✓ Étape complétée"

### 4.5 Aha Moment Definer (MUST)
**Input** : 2 champs (action user + seuil quantifié)
**Output** : `"User a fait [action] en [seuil]"`
**Validation live** : refus si seuil sans chiffre, alerte si action ne contient pas de verbe d'action
**UI** : 2 inputs + preview

### 4.6 Principles Design Generator (MUST)
**Input** : pour chaque principe : valeur A + valeur B + rationale
**Output** : `"A > B"` format opposable
**Validation live** : refus si pas de `>` explicite, alerte si principe générique ("simple", "beau", "rapide" sans contexte)
**UI** : liste éditable, max 5 items, drag handle pour ordonner

### 4.7 Anti-goals Builder (SHOULD)
**Input** : liste libre
**Output** : bullet list
**Validation live** : alerte si vide (`"Un produit qui veut servir tout le monde ne sert personne"`)
**UI** : input + enter = ajout à la liste

### 4.8 Concurrent Mapper 2×2 (V3 NICE)
**Input** : 4 axes (X/Y) + bullets concurrents
**Output** : grille 2×2 avec points positionnés
**UI** : SVG custom, drag points, axis labels éditables

---

## 5. 9 règles de validation live

Fichier dédié `validators.ts` exportant une fonction par règle. Chaque validateur retourne `{ severity: "ok" | "warn" | "error", message: string }`.

| # | Règle | Sévérité |
|---|---|---|
| 1 | > 3 personas en MVP | warn |
| 2 | Job story sans "quand/when" | error |
| 3 | JTBD contient une solution | error |
| 4 | Aha moment non mesurable | error |
| 5 | Principes design > 5 | warn |
| 6 | Principes non opposables (pas de ">") | warn |
| 7 | Positioning sans alternatives | error |
| 8 | Persona sans frustration OU contexte | warn |
| 9 | Aucune anti-goal | warn |

Agrégation → `state.completenessScore` + bandeau haut de page type `ValidationBanner` (réutilise pattern chap 6).

---

## 6. 16 contenus pédagogiques

Tous les tooltips et mini-leçons du research dans un fichier `pedagogy.ts` :

```typescript
export const FOUNDATIONS_PEDAGOGY = {
  jtbd: { title: "Qu'est-ce qu'un JTBD ?", body: "...", example: "✓ ...", antiExample: "✗ ..." },
  jobStory: { ... },
  persona: { ... },
  ahaMoment: { ... },
  principles: { ... },
  doubleDiamond: { ... },
  positioning: { ... },
  antiGoals: { ... },
};
```

Réutilise le composant `Help` existant (modifier pour accepter un topic `foundations.*` au lieu de juste les topics chap 6).

---

## 7. 5 outputs exportables

### 7.1 `foundations.md` (MUST V1)
Document structuré collable dans Notion/Claude/brief. Format :
```md
# Fondations — [Project Name]

## Job-to-be-Done
[jtbdCore]

## Persona principal
[primaryPersona details]

## Aha moment
[event] en [threshold]

## 3-5 Principes
- A > B (rationale)
- ...
```

### 7.2 `foundations.json` (SHOULD V2)
Même contenu, format structuré pour réinjection dans chapitres suivants.

### 7.3 Brief Claude/ChatGPT (SHOULD V2)
Prompt pré-formaté pour générer user flows/wireframes/copy :
```
Tu dois générer [X] aligné sur ces fondations :

JTBD : ...
Persona : ...
Principes : ...

Respecte strictement ces contraintes :
- [principes]
- [anti-goals]
```

### 7.4 Checklist de décision (SHOULD V2)
10 questions à se poser avant chaque décision design :
- Est-ce que ça aide [persona] à faire [JTBD] ?
- Est-ce que ça respecte [principe 1] ?
- Etc.

### 7.5 Carte d'identité PDF A4 (V3 NICE)
Une page imprimable avec :
- Positioning statement 1 phrase
- Persona principal
- 3 principes
- Aha moment

**Tech** : soit `@react-pdf/renderer` (ajout lib), soit `window.print()` avec CSS `@media print` (zéro lib).
**Reco** : `@media print` — simple, pas de lib.

---

## 8. Bibliothèque de templates (V2)

### 8.1 Personas par type projet
Dans `templates.ts`, ~5 proto-personas par type :

```typescript
export const PERSONA_TEMPLATES: Record<ProjectType, PersonaTemplate[]> = {
  saas: [
    { name: "Paul", emoji: "🧑‍💼", ageRange: "32-45", context: "Dirigeant PME 20-50 employés, veut outils pros mais pas enterprise", goals: [...], frustrations: [...], techLevel: "intermédiaire" },
    // ...
  ],
  appli: [...],
  outil: [...],
  logiciel: [...],
  business: [...],
};
```

### 8.2 Job stories typiques par type
Template exemples par type :
```typescript
export const JOB_STORY_TEMPLATES: Record<ProjectType, JobStory[]> = {
  saas: [
    { when: "Je reçois un ticket support", iWant: "le voir en priorité si c'est un client VIP", soICan: "répondre sous 2h et garder ma NPS" },
  ],
  // ...
};
```

### 8.3 Anti-goals typiques
Liste de "ce qu'on refuse de faire" classique par type (aide l'user à se positionner).

---

## 9. Planning par version

### 🎯 V1 MVP (2 jours)

**Objectif** : les 4 MUST fonctionnels en mode Intermédiaire (structured forms).

Jour 1 :
- `state.ts` + `validators.ts` + types
- `index.tsx` orchestrateur (header + progress bar + blocks)
- `JtbdBlock.tsx` + `JtbdStatementBuilder.tsx`
- `PersonasBlock.tsx` + `PersonaCard.tsx` (1 persona uniquement, V1 simplifié)
- `AhaMomentBlock.tsx`
- `PrinciplesBlock.tsx`
- Debounced save 800ms via `scheduleSave`

Jour 2 :
- `ExportBlock.tsx` avec `exportFoundationsMd()`
- `ValidationBanner` adapté
- Tooltips `Help` pour JTBD, persona, aha, principes
- Activation chapitre dans `chapters.ts` + `design/index.tsx`
- Typecheck/lint/build
- Commit V1

**Livrable V1** : user peut remplir les 4 MUST, les voit validés live, exporte un markdown.

### 🚀 V2 SHOULD (3 jours)

Jour 3 :
- `JobStoriesBlock.tsx` + `JobStoryBuilder.tsx`
- `PositioningBlock.tsx` stepper 5 étapes + génération phrase
- `AntiGoalsBlock.tsx`

Jour 4 :
- `templates.ts` complet (personas + job stories par type)
- `ExamplePicker.tsx` cliquable dans chaque bloc
- Support 2-3 personas avec `primaryPersonaId` picker
- Validations complètes (9/9 règles)

Jour 5 :
- Export JSON + Brief Claude + Checklist décision
- Tooltips pédagogiques étendus (16/16)
- Integration bloc top cockpit (V4 ? — reporté)
- QA + commit V2

**Livrable V2** : tous les blocs SHOULD, templates par type projet, 3 exports enrichis.

### 🎁 V3 NICE (2 jours)

Jour 6 :
- `ModeToggle.tsx` fonctionnel (3 modes)
- `ChatStep.tsx` mode Débutant (10 étapes)
- Persistance mode dans localStorage

Jour 7 :
- `CanvasMode.tsx` mode Expert
- `ConcurrentMapper.tsx` 2×2
- Jobs émotionnels/sociaux
- Carte A4 PDF via `@media print`
- Commit V3 + push

**Livrable V3** : chapitre complet, 3 modes, tous les widgets, tous les exports.

---

## 10. Checklist de test runtime (après V3)

Pattern identique à chap 6. 16 flows à valider :

| # | Flow | Comportement attendu |
|---|------|---|
| 1 | Onglet Design → "Fondations" | Chapitre s'affiche, mode Intermédiaire actif |
| 2 | Toggle mode Débutant | Chat 1 question/écran avec barre progression |
| 3 | Toggle mode Expert | Canvas tous blocs visibles |
| 4 | JTBD : saisir "bouton export pdf" | Validation rouge "solution détectée" |
| 5 | JTBD : saisir JTBD propre | Badge vert + statement formaté |
| 6 | Persona : clic sur template "Paul" (type saas) | Persona pré-rempli éditable |
| 7 | Persona : > 3 personas | Alerte orange "NN/g recommande max 3" |
| 8 | Aha moment : "l'user comprend" | Refus "non mesurable" |
| 9 | Aha moment : "7 amis en 10 jours" | Validé |
| 10 | Principe : "simple et efficace" | Alerte "non opposable" |
| 11 | Principe : "Clarté > Richesse" | Validé |
| 12 | Positioning stepper 1→5 | Chaque étape bloque passage suivant tant que vide |
| 13 | Export Markdown | Toast ✓ + fichier téléchargé structuré |
| 14 | Export Brief Claude | Prompt formaté copié |
| 15 | Rafraîchir page | Tout l'état persiste |
| 16 | Barre progression | `completenessScore` calculé live et mis à jour |

---

## 11. Risques & mitigations

### 11.1 Complexité de 3 modes
Les 3 modes sont gourmands en dev. Mitigation : V1 + V2 en mode Intermédiaire uniquement. Mode Débutant + Expert = V3.

### 11.2 Validations regex fragiles
Détecter "solution" dans un JTBD français est délicat. Mitigation : liste de mots interdits simple (`["bouton", "cliquer", "UI", "dashboard", "interface", "app", "site"]`) avec `warn` plutôt que `error` si doute.

### 11.3 Templates qui datent rapidement
Les proto-personas 2026 peuvent vieillir. Mitigation : les exporter dans un fichier unique `templates.ts` facile à maintenir.

### 11.4 Performance sur grand state
8 blocs qui se re-rendent à chaque frappe = lag potentiel. Mitigation : debounce local par bloc avant de propager au parent (pattern `useDebouncedUpdate`).

### 11.5 Export PDF
`@react-pdf/renderer` = ~250KB gzipped. Mitigation : utiliser `@media print` CSS (zéro lib, rendu navigateur).

---

## 12. Décisions techniques figées

### 12.1 Pas de lib ajoutée
- Pas de `react-hook-form` : state local suffit
- Pas de `zod` pour validations : regex + fonctions custom suffisent
- Pas de `@react-pdf/renderer` : `@media print` CSS
- Pas de `@dnd-kit` : boutons ↑↓ clavier-friendly pour reordering

### 12.2 State persisté Supabase dès V1
Pattern Mindeck strict : `sections.content` avec `section_key = "foundations"`, debounced 800ms.

### 12.3 Mode persistance localStorage
Comme chap 6 : `mindeck:design:foundations:mode` clé localStorage.

### 12.4 Pas de nouvelle migration SQL
Tout rentre dans le JSON de `sections.content`.

### 12.5 TypeScript strict + 0 erreur
Même discipline que chap 6.

---

## 13. Intégration Mindeck

### 13.1 Dans le cockpit (V4 hors scope)
Le cockpit pourrait afficher le "persona principal + JTBD + 3 principes" de façon compacte. Reporté après V3.

### 13.2 Dans le brainstorm
Les sections brainstorm existantes (`target`, `problem`) alimentent des hints du JtbdBlock sans le remplacer.

### 13.3 Dans le chap 6 Visuel
Les principes design (`"Clarté > Richesse"`) peuvent alimenter les validators du chap 6. Reporté après validation V3.

---

## 14. Points de contrôle (comme chap 6)

- **Après V1** : commit + push → tu testes les 4 MUST en runtime → je fix les bugs
- **Après V2** : commit + push → tu testes le SHOULD complet → je fix
- **Après V3** : commit + push → tu fais la checklist de 16 flows → je fix
- **Validation finale** : chapitre 1 = `ready`, on passe au chap 2

---

## 15. Commandes

Rien à installer. Tout se fait avec le stack existant.

Pour démarrer V1 :
1. Créer l'arbo `src/app/project/[id]/design/foundations/`
2. Types + state + validators
3. Orchestrator `index.tsx`
4. 4 blocs MUST
5. Export MD
6. Activer dans `chapters.ts`
7. Commit + push V1

---

**Fin du plan.**
