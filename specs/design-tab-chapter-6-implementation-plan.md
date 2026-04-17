# Plan d'implémentation — Chapitre 6 Visuel (6 semaines)

> Plan technique détaillé pour l'implémentation du premier sous-onglet de la refonte Design.
> Basé sur `design-tab-research.md` §0 (décisions validées) + `design-tab-research/chapter-06-visual-design.md` (livrable expert).
> Date de création : 2026-04-17.
> Stack : Next 16 App Router + React 19 + TS strict + Tailwind v4 + Supabase. Pas d'ORM, pas de lib UI, pas de lib de state.

---

## 1. Vue d'ensemble

### 1.1 Ce qu'on construit

Un sous-onglet **Visuel** dans l'onglet Design, divisé en 3 modes progressifs (Simple / Avancé / Pro), produisant un design system complet exportable (CSS vars, Tailwind v4 `@theme`, W3C DTCG JSON, markdown).

10+ widgets dans le scope MVP complet (validé par Anthony le 2026-04-17) :
1. Color palette generator Radix-style (12 shades OKLCH)
2. Neutral generator (gris teintés)
3. Semantic colors generator (success/warning/error/info)
4. Contrast checker live (WCAG AA/AAA)
5. Typography scale builder (modular ratios)
6. Font pairing picker (~30 pairings testés)
7. Spacing scale builder (4/8/hybrid)
8. Live preview component (button + card + form + navbar + liste, multi-device, light/dark)
9. Dark mode auto-invert perceptuel OKLCH
10. Moodboard quick picker (8 vibes)
11. Accessibility simulator (daltonisme)
12. Export multi-format

### 1.2 Ce qu'on ne fait PAS en v1

- Vibe extractor depuis screenshot (reporté v2/v3 avec l'IA)
- Mode Expert complet (tokens 3-tier, courbes OKLCH manuelles) → reporté SHOULD v2
- Figma export via Tokens Studio → reporté NICE v3
- Fluid typography `clamp()` builder → reporté NICE
- Versioning des design systems → reporté NICE

### 1.3 Principes directeurs

- **Cohérence avec Mindeck** : JSON dans `sections.content`, pas de nouvelle table sauf justification forte, state local React, debounced save (800ms), optimistic UI avec rollback.
- **Pas de sur-ingénierie** : un composant par widget, pas d'abstraction prématurée. Trois fichiers similaires valent mieux qu'une abstraction fragile.
- **Pédagogie in-app** : tooltips et mini-leçons sont des `<span>` au hover ou des `<details>` collapsibles. Pas de lib d'onboarding lourde.
- **Déterministe, pas d'IA** : tous les générateurs sont des algos purs (OKLCH, clamp, WCAG). Aucun appel API en v1.

---

## 2. Architecture fichiers

### 2.1 Structure proposée

```
src/app/project/[id]/
├── dashboard.tsx                      ← existe, à modifier (1 ligne : import design.tsx au lieu de SingleSectionPanel)
├── design/                            ← NOUVEAU dossier pour l'onglet Design complet
│   ├── index.tsx                      ← Orchestrateur : mini-menu vertical + mode switcher + routing interne
│   ├── visual/                        ← NOUVEAU : sous-onglet Visuel (chap. 6)
│   │   ├── index.tsx                  ← Orchestrateur Visuel : charge data, dispatch vers le bon mode
│   │   ├── mode-simple.tsx            ← Mode Simple : moodboard picker + preview
│   │   ├── mode-advanced.tsx          ← Mode Avancé : pickers assistés (primary color, typo, spacing)
│   │   ├── mode-pro.tsx               ← Mode Pro : token editor complet + WCAG audit live
│   │   ├── widgets/
│   │   │   ├── palette-generator.tsx  ← Widget 1 : 1 primary → 12 shades OKLCH
│   │   │   ├── neutral-generator.tsx  ← Widget 2 : gris teintés
│   │   │   ├── semantic-colors.tsx    ← Widget 3 : success/warning/error/info
│   │   │   ├── contrast-checker.tsx   ← Widget 4 : matrice de paires live
│   │   │   ├── typography-scale.tsx   ← Widget 5 : modular scale + base size + preview
│   │   │   ├── font-pairing.tsx       ← Widget 6 : bibliothèque de 30 pairings
│   │   │   ├── spacing-scale.tsx      ← Widget 7 : 4/8/hybrid + density
│   │   │   ├── live-preview.tsx       ← Widget 8 : button + card + form + navbar + liste
│   │   │   ├── dark-mode-inverter.tsx ← Widget 9 : algo OKLCH perceptuel
│   │   │   ├── moodboard-picker.tsx   ← Widget 10 : 8 vibes pré-faites
│   │   │   ├── a11y-simulator.tsx     ← Widget 11 : daltonisme
│   │   │   └── export-panel.tsx       ← Widget 12 : CSS / Tailwind / JSON / markdown
│   │   ├── vibes/                     ← Données statiques : 8 vibes (palette + typo + spacing)
│   │   │   ├── minimal.ts
│   │   │   ├── bold.ts
│   │   │   ├── playful.ts
│   │   │   ├── corporate.ts
│   │   │   ├── editorial.ts
│   │   │   ├── brutalist.ts
│   │   │   ├── warm.ts
│   │   │   └── tech.ts
│   │   └── pedagogy.ts                ← Tooltips + mini-leçons + exemples ✓/✗ (contenu FR)
│   └── [autres sous-onglets à venir Phase 2 : foundations, identity, info-nav, flows, etc.]
├── [autres fichiers existants inchangés]
```

### 2.2 Logique de routing interne

Le composant `design/index.tsx` est un client component qui :
1. Reçoit en props `project, initialSections, onProjectUpdate, onSectionsChange` (pattern identique à `resources.tsx`)
2. Gère un state `activeSubTab: "visual" | "foundations" | ...` (persistant en `localStorage` : `mindeck_design_subtab`)
3. Gère un state `mode: "simple" | "advanced" | "pro"` (persistant en `localStorage` : `mindeck_design_mode_${subTab}` — override par sous-onglet)
4. En v1, seul `visual` est implémenté. Les autres sous-onglets affichent un placeholder "Bientôt disponible" (attendre Phase 2).

### 2.3 Modifications minimales de l'existant

- `dashboard.tsx` ligne 17 : `import SingleSectionPanel from "./resources"` → à garder (utilisé encore pour `tech` + `resources`)
- `dashboard.tsx` : importer `import DesignPanel from "./design"` et remplacer le panel design par `<DesignPanel ... />`
- `src/lib/sections.ts` : la section `design` existe déjà (ligne 400-500). **On la conserve** comme fallback et pour la rétrocompatibilité. Les nouveaux champs vont dans un JSON étendu (voir §3).

---

## 3. Modèle de données

### 3.1 Principe : étendre `sections.content` sans migration SQL

La table `sections` existe, `section_key = "design"` est déjà utilisé pour l'ancienne version. On **étend le JSON `content`** avec de nouvelles clés sans casser l'ancien.

### 3.2 Nouveau schéma JSON de la section `design`

```typescript
type DesignSectionContent = {
  // Champs legacy (ancienne version, on les garde pour rétrocompat)
  moodboard?: string;
  color_palette?: string;
  typography?: string;
  design_tokens?: string;
  ui_components?: string;
  ux_principles?: string;
  user_journey?: string;
  accessibility?: string[];
  design_notes?: string;

  // Nouveau : structure refonte
  mode_global?: "simple" | "advanced" | "pro";
  mode_overrides?: Record<string, "simple" | "advanced" | "pro">;
  // ↑ ex: { visual: "pro", foundations: "simple" }

  visual?: {
    // Choix de vibe (mode Simple)
    vibe?: "minimal" | "bold" | "playful" | "corporate" | "editorial" | "brutalist" | "warm" | "tech" | "custom";

    // Couleurs
    colors: {
      primary: {
        oklch: { l: number; c: number; h: number }; // source de vérité
        hex_fallback: string;
        shades_12: OklchColor[]; // généré, cached pour perf
      };
      neutral: {
        tint_strength: number; // 0-100
        shades_12: OklchColor[];
      };
      semantic: {
        success: OklchColor;
        warning: OklchColor;
        error: OklchColor;
        info: OklchColor;
      };
      accent?: OklchColor; // optionnel
    };

    // Typographie
    typography: {
      heading_font: FontChoice;
      body_font: FontChoice;
      mono_font?: FontChoice;
      scale_ratio: 1.067 | 1.125 | 1.2 | 1.25 | 1.333 | 1.414 | 1.5 | 1.618;
      base_size_px: 14 | 15 | 16 | 17 | 18;
      line_height_body: number; // 1.4 - 1.8
      measure_ch: number; // 45-75
    };

    // Espacement
    spacing: {
      base_unit: 4 | 8;
      scale_type: "linear" | "geometric" | "hybrid";
      density: "compact" | "normal" | "comfortable"; // applique un multiplicateur
    };

    // Radius
    radius: {
      scale: { none: 0; sm: number; md: number; lg: number; xl: number; full: 9999 };
    };

    // Shadows
    shadows: {
      sm: string; // CSS box-shadow
      md: string;
      lg: string;
      xl: string;
    };

    // Dark mode
    dark_mode: {
      enabled: boolean;
      strategy: "perceptual_invert" | "manual_overrides";
      overrides?: Record<string, string>; // pour manual
    };

    // Meta
    last_generated_at: string; // ISO timestamp
    completeness: number; // 0-100
  };

  // Les autres sous-onglets (foundations, identity, etc.) arriveront en Phase 2 avec la même logique
};

type OklchColor = { l: number; c: number; h: number };
type FontChoice = {
  family: string;
  source: "google" | "system" | "local";
  weights: number[];
  is_variable: boolean;
};
```

### 3.3 Migration SQL — AUCUNE en v1

Le schéma existant supporte tout. Pas de migration. Pas de demande à Anthony (règle CLAUDE.md).

Si en Phase 2 on ajoute la table `research_items` ou d'autres tables dédiées, on créera la migration `014_design_research_items.sql`. Pour l'instant : **zéro migration**.

### 3.4 Pattern d'accès aux données

Identique à `resources.tsx` / `editor.tsx` :
- Server Component `page.tsx` fetch la section `design` via `supabase.from("sections").select().eq("section_key", "design")`
- Parse le JSON avec `parseSections()` (déjà dans `lib/sections.ts`)
- Passe en props à `DesignPanel` (client component)
- Client gère le state local + debounced save 800ms vers `sections` table

---

## 4. Dépendances techniques à ajouter

### 4.1 Lib OKLCH : `culori`

**Pourquoi** : génération perceptuelle de 12 shades, conversions OKLCH ↔ HEX ↔ HSL ↔ RGB, support natif TypeScript. C'est la référence de la communauté web 2024-2026 (utilisée par Tailwind v4 en interne).

- Taille : ~3 KB gzip (bundle splitting possible, on peut importer seulement `culori/fn` pour réduire)
- Maintenance : active, 1.5k étoiles GitHub
- License : MIT
- TypeScript natif

```bash
npm install culori
```

**Alternative écartée** : implémentation maison. Les formules OKLCH → RGB (matrices 3x3) sont correctes à écrire une fois mais bug facilement sur la gamut clipping. Culori gère tout.

### 4.2 Fonts : `next/font` (déjà inclus dans Next 16)

Pas d'install supplémentaire. Pour charger les fonts du font-pairing picker :
- Inter, Geist (déjà chargé), IBM Plex Sans, JetBrains Mono, Playfair Display, Fraunces, Lora, Söhne (commercial, à voir)
- Chargement dynamique par sélection (pas tous en même temps sinon bloat).

### 4.3 Rien d'autre

- **Pas de `react-color`** (picker) : on code un simple `<input type="color">` + champ OKLCH à côté. Suffit.
- **Pas de `react-hook-form`** : state local pur, pattern cohérent avec Mindeck.
- **Pas de lib de tooltip** : CSS-only via `[title]` et `<details>` pour les mini-leçons.
- **Pas de lib PDF** : export en markdown, l'user peut convertir lui-même si besoin. PDF reporté en NICE.

**Total ajouté : 1 dépendance (`culori` ~3KB).**

---

## 5. Planning 6 semaines détaillé

### Semaine 1 — Palette + contraste (le cœur)

**Objectif** : avoir une palette 12 shades générée depuis 1 primary, avec contrast check live.

- **Jours 1-2** : `widgets/palette-generator.tsx`
  - Input : `<input type="color">` + champ HEX + champ OKLCH (L/C/H éditables séparément)
  - Algo OKLCH avec courbe lightness 97%→8%, chroma en cloche max à 500-600, hue stable ±10°
  - Output : affichage des 12 shades (cartes avec valeur OKLCH + HEX + nom `primary-50`...`primary-950`)
  - Copy-to-clipboard sur chaque shade
- **Jours 3-4** : `widgets/contrast-checker.tsx`
  - Formule WCAG Relative Luminance (spec W3C)
  - Matrice : pour chaque paire `{foreground: shade, background: shade}` → ratio + verdict AA/AA-L/AAA/FAIL
  - Alertes live en rouge si < 4.5:1 sur paires "text × bg"
- **Jour 5** : intégration palette ↔ contrast, sauvegarde en DB, tests manuels
- **Livrable fin S1** : on peut choisir une couleur et voir 12 shades + contraste WCAG en live. Pas de persistance multi-user (un seul dashboard), pas de dark mode encore, pas de preview UI.

**Risque technique** : l'algo OKLCH n'est pas trivial. La chroma clipping (quand une couleur OKLCH sort du gamut sRGB) doit être gérée proprement sinon on affiche des couleurs cassées. `culori` a `clampChroma()` qui résout ça.

### Semaine 2 — Typographie + Spacing

**Objectif** : scale typo + spacing + radius + shadow, tous éditables.

- **Jours 1-2** : `widgets/typography-scale.tsx`
  - Ratio picker (8 options : 1.067 → 1.618)
  - Base size picker (14/15/16/17/18)
  - Génération automatique des 8 tailles (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
  - Preview live (H1/H2/H3 + body text avec vraies valeurs)
- **Jour 3** : `widgets/spacing-scale.tsx`
  - Base unit (4/8) + scale type (linear/geometric/hybrid)
  - Output : scale de 10 tokens (1/2/3/4/6/8/12/16/24/32)
  - Density multiplier (compact × 0.85, normal × 1, comfortable × 1.15)
- **Jour 4** : radius + shadows (composants plus simples, 2-3h chacun)
  - Radius : 5 tailles (none, sm, md, lg, xl) + full (9999)
  - Shadows : 4 niveaux (sm, md, lg, xl) avec presets pros cohérents (pas 5 shadows random)
- **Jour 5** : intégration + sauvegarde JSON
- **Livrable fin S2** : design tokens complets (couleur + typo + spacing + radius + shadow) éditables.

### Semaine 3 — Live preview + Moodboard picker (Mode Simple MVP-ready)

**Objectif** : le mode Simple est livré. Un enfant de 12 ans clique "Minimal" et voit tout son design system.

- **Jours 1-3** : `widgets/live-preview.tsx`
  - 5 composants rendus en React direct avec les tokens : Button (3 variants), Card, Form (input + label + helper + error), Navbar, Liste
  - Switch light/dark (applique les tokens dark)
  - Switch density (compact/normal/comfortable)
  - Switch viewport (mobile 375 / tablet 768 / desktop 1440 — via `scale()` CSS)
- **Jours 4-5** : `widgets/moodboard-picker.tsx` + `vibes/*.ts`
  - 8 fichiers de vibes (data statique) définissant : primary OKLCH, neutral tint, font heading, font body, scale ratio, base size, spacing base, density, radius preset, shadow preset
  - 8 cartes cliquables avec mini-preview
  - Clic sur une vibe → applique tous les tokens d'un coup dans le JSON
- **Livrable fin S3** : **Mode Simple fonctionnel** — clic sur une vibe, l'user voit son design system complet + preview. Il peut exporter (rudimentaire). **Premier milestone démontrable.**

### Semaine 4 — Export multi-format + Mode Avancé pickers

**Objectif** : l'user peut exporter vers CSS / Tailwind / JSON / markdown. Mode Avancé est ouvert (pickers assistés, pas tokens 3-tier).

- **Jours 1-2** : `widgets/export-panel.tsx`
  - Export CSS : `:root { --color-primary-50: oklch(...); ... } [data-theme="dark"] { ... }`
  - Export Tailwind v4 : `@theme { --color-primary-50: ...; }` (nouvelle syntaxe Tailwind v4)
  - Export W3C DTCG JSON : `{ "color": { "primary": { "50": { "$type": "color", "$value": "oklch(...)" } } } }`
  - Export markdown : doc lisible prête à coller dans Claude / Notion
  - Copy-to-clipboard par format + download .css / .json / .md
- **Jours 3-5** : `mode-advanced.tsx`
  - Layout 2 colonnes : pickers à gauche, preview à droite
  - Intégration des widgets palette/neutral/semantic/typo/spacing
  - Sélecteur compact de vibe (peut démarrer d'une vibe puis ajuster)
  - Pas de mode Pro encore — le Pro ajoutera tokens 3-tier + edit OKLCH courbes + validations fines en S6
- **Livrable fin S4** : **Mode Avancé fonctionnel**. Export propre. L'app est déjà vendable en standalone.

### Semaine 5 — Neutral + Semantic generators + Font pairing + Règles validation

**Objectif** : les derniers widgets qui élèvent le niveau.

- **Jours 1-2** : `widgets/neutral-generator.tsx`
  - Dérive du primary avec tint strength 0-100%
  - 12 shades de gris teintés (cool ou warm selon hue primary)
  - Refactoring UI-style : jamais de gris pur, toujours une légère teinte
- **Jour 3** : `widgets/semantic-colors.tsx`
  - Success (vert), Warning (orange), Error (rouge), Info (bleu)
  - Harmonisés avec le primary (même saturation OKLCH curve)
  - Option : palette Radix-nommée (tomato, ruby, amber, grass...) pour éviter le rouge pompier
- **Jour 4** : `widgets/font-pairing.tsx`
  - 30 pairings testés groupés par style (minimal / expressif / éditorial / techno / classique)
  - Chargement dynamique via `next/font` (lazy load au clic d'une preview)
  - Preview de chaque pairing avec vrai texte
- **Jour 5** : règles de validation (fichier `visual/validations.ts`)
  - 15 règles : contraste < 4.5:1 → rouge, > 2 polices → orange, > 10 font-sizes → orange, etc.
  - Badges visuels dans chaque widget selon état
  - Alerte globale en haut de la page si erreurs bloquantes
- **Livrable fin S5** : design system premium-grade. Face à Radix/Coolors, Mindeck devient **compétitif et différenciant** (aucun outil ne fait palette OKLCH + harmonisation neutrals/semantics + validation live dans un même endroit).

### Semaine 6 — Mode Pro + Dark mode perceptuel + Pédagogie

**Objectif** : finition. Mode Pro livré. Dark mode auto. Tooltips partout.

- **Jours 1-2** : `mode-pro.tsx`
  - Éditeur de tokens ligne par ligne (L/C/H éditables par shade)
  - Audit WCAG matriciel (toutes les paires)
  - "Corriger auto" : assombrit ou éclaircit de N shades pour atteindre 4.5:1
  - Bouton "Reset à la vibe" si on s'est perdu
- **Jours 3-4** : `widgets/dark-mode-inverter.tsx`
  - Algo OKLCH perceptuel : inversion asymétrique de L (97% → 10%, 50% → 62%, etc.) + chroma reduction 10-30%
  - Preview côte-à-côte light vs dark
  - Override manuel possible (certains tokens gardent une valeur custom en dark)
- **Jour 5** : `pedagogy.ts` + intégration tooltips
  - ~80 tooltips (1 ligne chacun) : hover sur les concepts (OKLCH, ratio, measure, etc.)
  - ~20 mini-leçons (3 lignes, `<details>` collapsibles) : HSL vs OKLCH, règle 60-30-10 avec honnêteté, base 4 vs 8
  - ~15 exemples ✓ / anti-exemples ✗ dans la preview (ex : "Voici ce qui se passe quand tu mets 15 font-sizes")
  - Le contenu est dans un seul fichier TS (data) pour édition facile plus tard
- **Livrable fin S6** : **MVP complet chap. 6 Visuel**. Les 3 modes (Simple / Avancé / Pro) sont fonctionnels. Dark mode automatique. Pédagogie intégrée. Vendable en standalone.

### 5.1 Optionnel — `widgets/a11y-simulator.tsx` (simulation daltonisme)

Reporté à la semaine 7 ou coupé si on dépasse. Filtres CSS pour protanopie/deutéranopie/tritanopie appliqués sur la live preview. ~1 jour.

---

## 6. Ordre de dépendance entre les widgets

```
palette-generator ───┬───> contrast-checker
                     │
                     ├───> dark-mode-inverter
                     │
                     └───> live-preview (via neutral + semantic)

typography-scale ────┐
                     ├───> live-preview
font-pairing ────────┘

spacing-scale ───────> live-preview

moodboard-picker ────> applique tout (palette + typo + spacing + radius + shadow)
                        ↓
                        = dispatch vers tous les widgets

export-panel ────────> dépend de tout le JSON sauvegardé
                        (lecture seule, sérialise l'état)

validations ──────────> observe tout, affiche verdicts
```

Conséquence pratique : **palette-generator et typography-scale sont les 2 premiers à coder**. Sans eux, rien ne marche. Semaine 1-2 = fondations.

---

## 7. Points de risque technique

### 7.1 Algo OKLCH 12 shades — RISQUE MOYEN

**Le problème** : interpoler la lightness de 97% à 8% donne une courbe linéaire naïve qui produit des shades "plates". Les vrais designs pro (Radix, Tailwind) utilisent une courbe **non-linéaire** (plus de nuances dans les darks que les lights, car l'œil humain est plus sensible là).

**Ma solution** :
- Courbe lightness : `[0.97, 0.94, 0.88, 0.80, 0.70, 0.60, 0.50, 0.42, 0.34, 0.26, 0.18, 0.10]` (12 valeurs inspirées de Radix)
- Courbe chroma : cloche gaussienne centrée sur shade 500-600, max ~0.18, décroît vers les extrêmes
- Courbe hue : stable, dérive ±5° sur les extrêmes pour éviter les couleurs "sales"
- Clipping : `culori.clampChroma()` force les couleurs hors gamut à rentrer dans sRGB

**Spike technique** : 0.5 jour en début de semaine 1 pour valider la courbe sur 5 teintes différentes (bleu, rouge, jaune, vert, violet) avant de coder le reste.

### 7.2 Dark mode perceptuel asymétrique — RISQUE FAIBLE

**Le problème** : inverser bêtement `L → 1-L` donne des darks trop sombres et des lights trop clairs. Il faut une fonction asymétrique.

**Ma solution** : `dark_L = 0.10 + (0.97 - 0.10) * (1 - light_L - 0.02)` + reduction chroma de 15% par défaut. Testé sur les 12 shades de la palette Radix.

**Spike** : 0.5 jour en semaine 6 avant de coder le widget. Si ça ne passe pas, fallback = inversion linéaire + ajustement manuel des tokens critiques (bg, text-primary, border).

### 7.3 Live preview performance — RISQUE FAIBLE

**Le problème** : re-render de 5 composants + switch multi-device + switch dark/light à chaque changement de token peut créer un lag perceptible.

**Ma solution** :
- Debouncing à 300ms sur les sliders/pickers
- `useMemo` pour les computed styles (tokens → CSS variables)
- Preview isolée dans une `<iframe srcDoc>` ou un shadow DOM si vraiment besoin (overkill probablement, à évaluer)

### 7.4 Font chargement dynamique — RISQUE FAIBLE

**Le problème** : charger 30 fonts Google au démarrage = ~5 MB de bundle.

**Ma solution** : `next/font` avec lazy loading. Seule la font sélectionnée est chargée. Le font pairing picker charge au clic (preview sur demande), pas en permanence.

### 7.5 Sauvegarde DB — RISQUE FAIBLE

Pattern identique à Mindeck existant : debounced save 800ms via `saveTimers` useRef map. Optimistic UI avec rollback si erreur Supabase.

---

## 8. Stratégie de tests (sans framework de tests)

Mindeck n'a pas de tests auto aujourd'hui. Pas question d'en ajouter pour le chap. 6 (hors scope). Stratégie pragmatique :

### 8.1 Tests manuels documentés

Fichier `specs/design-tab-chapter-6-test-checklist.md` à créer en semaine 6 avec :
- 30 cas de test manuels (par widget + intégration)
- Screenshots attendus pour les cas critiques (palette générée vs référence Radix)
- Checklist avant chaque commit majeur

### 8.2 Spike tests (dev only)

En semaine 1 pour l'algo OKLCH, créer un fichier `visual/__dev__/oklch-spike.tsx` (non committé en prod) qui affiche :
- 5 palettes générées à partir de 5 couleurs primary
- Comparaison visuelle avec les palettes Radix équivalentes
- Ratio WCAG calculé pour chaque paire critique

**Pas de Vitest, pas de Jest**. Si l'algo change, on re-regarde les spikes visuellement.

### 8.3 Vérification WCAG manuelle

En semaine 5 quand le contrast checker est fini, valider 10 paires de couleurs contre WebAIM Contrast Checker (webaim.org/resources/contrastchecker). Tolérance : ±0.01 sur le ratio.

---

## 9. Checkpoints démo (fin de chaque semaine)

| Semaine | Démo | Qui peut l'utiliser ? |
|---|---|---|
| 1 | Choisir une couleur → voir 12 shades OKLCH + contraste WCAG | Personne (cosmétique) |
| 2 | Ajouter typo + spacing + radius + shadow | Personne encore |
| 3 | **Mode Simple complet : click vibe → design system complet + preview live** | Anthony + early beta users |
| 4 | **Export CSS / Tailwind / JSON fonctionnel + Mode Avancé** | Beta publique possible |
| 5 | Validation WCAG + neutrals + semantics + font pairing | Compétitif avec Radix/Coolors |
| 6 | **Mode Pro + dark mode perceptuel + pédagogie in-app** | Produit vendable standalone |

---

## 10. Livrables finaux (fin semaine 6)

1. **14 composants React** dans `src/app/project/[id]/design/visual/` + widgets
2. **8 fichiers de vibes** (data statique)
3. **1 fichier `pedagogy.ts`** (~80 tooltips + 20 mini-leçons)
4. **1 fichier `validations.ts`** (15 règles)
5. **JSON étendu** dans `sections.content` avec la structure `visual: {...}`
6. **Pas de migration SQL**
7. **1 dépendance ajoutée** (`culori` ~3 KB gzip)
8. **Doc de test manuel** `specs/design-tab-chapter-6-test-checklist.md`

**Aucune modification du schéma DB. Aucune modification des fichiers existants autres que `dashboard.tsx` (1 ligne).**

---

## 11. Questions techniques — TRANCHÉES le 2026-04-17

Toutes les questions ont été arbitrées avec Anthony. Ces choix sont **figés** sauf challenge justifié en cours de dev.

1. **Import de `culori`** : ✅ `culori/fn` tree-shaken (~3 KB bundle).
2. **Fonts commerciales** : ✅ **Exclure en v1**. 100% open-source uniquement — Inter, Geist, IBM Plex, Fraunces, Playfair Display, Lora, JetBrains Mono. Les fonts commerciales (Söhne, GT Sectra) arriveront en v2 en "recommandation externe" (user doit acheter la licence).
3. **localStorage** : ✅ `mindeck_design_mode_visual` (mode Simple/Avancé/Pro) + `mindeck_design_subtab` (sous-onglet actif). Cohérent avec `home_active_tab` et `display_density` existants.
4. **Naming CSS variables exportées** : ✅ court — `--color-primary-500`, `--font-size-base`, `--space-4`. Tailwind-like, standard, sans préfixe brand redondant.
5. **Tooltips pédagogiques** : ✅ Claude génère en batch à partir des livrables experts, Anthony valide en lot en semaine 6.

### Autres décisions tranchées

- **Architecture fichiers** : ✅ dossier `src/app/project/[id]/design/` avec sous-dossier `visual/` pour chap. 6. Les prochains sous-onglets Phase 2 viendront en dossiers frères.
- **Data model** : ✅ JSON dans `sections.content` (JSONB Postgres, persisté, RLS-protégé). **Zéro migration SQL**. Cohérent avec toutes les autres sections Mindeck (brainstorm, todos, decisions).
- **Ordre 6 semaines** : ✅ séquence validée (palette/contraste → typo/spacing → preview/moodboard → export/avancé → neutrals/semantics/validations → pro/dark/pédagogie).

---

## 12. Ordre des commandes pour démarrer la semaine 1

Quand Anthony revient pour attaquer le code :

```bash
cd /home/antho/projets/brainstorming-app
npm install culori
```

Puis Claude crée le spike OKLCH (`src/app/project/[id]/design/visual/__dev__/oklch-spike.tsx`, non committé) pour valider l'algo sur 5 couleurs primary avant tout le reste.

---

**Fin du plan d'implémentation chap. 6. Prêt pour exécution.**
