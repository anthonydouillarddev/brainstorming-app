# Chapitre 6 — Design visuel : hiérarchie, typo, couleur, espacement

> Livrable brut de l'Expert 6 (general-purpose).
> **CHAPITRE LE PLUS DENSE ET LE PLUS DIFFÉRENCIANT.**
> Couvre : hiérarchie visuelle, typographie (échelles, pairings, variable fonts), couleur (OKLCH, Radix-style, WCAG), espacement/grilles, dark mode perceptuel.

## 1. Objectif du chapitre

Apprendre à **hiérarchiser ce qu'on regarde** (ce qui saute aux yeux d'abord), **choisir des polices qui respirent**, **fabriquer une palette de couleurs qui tient la route** (y compris en mode sombre, y compris pour les daltoniens), et **doser le vide entre les éléments**. À la fin, tu ressors avec un système de design tokens exportable — pas juste des couleurs choisies au pif.

C'est le chapitre où un enfant de 12 ans choisit une "vibe" et repart avec une interface de niveau Linear, pendant qu'un designer senior édite des courbes OKLCH et audite ses ratios WCAG en live.

Règle anti-sycophantie qu'on assume dès le départ : **la règle 60-30-10 est une béquille vintage pour décorateurs d'intérieur, pas une loi sacrée pour le digital**. On l'enseigne comme point de départ, mais les systèmes modernes (Radix, Material 3, Tailwind, Apple HIG) raisonnent en **rôles sémantiques** (surface, text, border, accent, semantic) pas en pourcentages. Pareil pour HSL : **OKLCH le surclasse en 2024-2026**, on le défend.

---

## 2. Questions clés à poser à l'user

**Hiérarchie visuelle (3 questions)**

1. **Simple** : Quand un user arrive sur ton écran, quelle est la **première chose** qu'il doit voir ? La deuxième ?
   **Expert** : Définis ton focal point primaire et secondaire. Quel pattern de lecture vises-tu (F-pattern pour du contenu dense, Z-pattern pour landing, Gutenberg pour du long-form) ?

2. **Simple** : Ton interface ressemble plus à un journal (beaucoup de texte) ou à une appli (beaucoup de boutons et de cards) ?
   **Expert** : Ratio signal/noise visé ? Densité d'information (low / medium / high, à la Bloomberg Terminal vs Linear) ?

3. **Simple** : Tu veux que ça ait l'air **calme** ou **punchy** ?
   **Expert** : Contrast strategy — low contrast (Notion, Apple Notes) ou high contrast (Linear, Stripe, Vercel) ? Impact sur lisibilité + fatigue visuelle ?

**Typographie (3 questions)**

4. **Simple** : Tu veux une police qui a l'air **pro et sérieuse**, **moderne et techno**, ou **chaleureuse et humaine** ?
   **Expert** : Classification ciblée (humanist sans, geometric sans, grotesque, transitional serif, slab, display) ? Exemples de référence ?

5. **Simple** : Tu veux **une seule police** ou **deux polices** (une pour les titres, une pour le texte) ?
   **Expert** : Mono-typeface (économie cognitive + cohérence, cf. Linear / Vercel avec Geist) ou duo (contrast pairing serif display + sans text à la Medium / Stripe Press) ?

6. **Simple** : Tu préfères un texte **serré** ou **aéré** ?
   **Expert** : Target line-height (1.2 headings / 1.5-1.7 body), letter-spacing strategy (tighter on display, wider on small caps), measure (45-75 char per line selon Bringhurst) ?

**Couleur (5 questions, le plus dense)**

7. **Simple** : Quelle est **ta couleur préférée** pour les boutons principaux ? (montre-moi 12 swatches)
   **Expert** : Primary hue cible en OKLCH ? Saturation strategy (punchy type Linear 50% / Stripe 60%, ou désaturée type Notion 15%) ?

8. **Simple** : Ton app sera utilisée plutôt **le jour** (mode clair), **le soir** (mode sombre), ou **les deux** ?
   **Expert** : Light-first, dark-first, ou dual-mode en parallèle ? Stratégie d'inversion (naïve inversion HSL = interdit, inversion perceptuelle OKLCH recommandée) ?

9. **Simple** : Tu veux une app qui fait **sérieuse** (banque, pro) ou **fun** (jeux, réseaux sociaux) ?
   **Expert** : Palette strategy — monochromatique (1 hue + variations), analogue (3 hues adjacents), complémentaire (2 hues opposés), triadique, split-complémentaire ?

10. **Simple** : Tu veux que **les daltoniens** puissent utiliser ton app ? (recommandé : oui toujours)
    **Expert** : Simulation deuteranopia / protanopia / tritanopia requise ? Target WCAG AA (4.5:1 text / 3:1 UI) ou AAA (7:1) ? Stratégie pour ne pas reposer sur la couleur seule (icônes + text) ?

11. **Simple** : Tes couleurs **warning / erreur / succès** : tu gardes les classiques rouge/jaune/vert ou tu personnalises ?
    **Expert** : Sémantiques dans la palette (success / warning / error / info / neutral), stratégie de teinte (red-600 Tailwind vs red custom OKLCH vs semantic tokens Radix crimson/ruby/tomato) ?

**Espacement & grille (2 questions)**

12. **Simple** : Base de **4 pixels** (fin, précis — Apple HIG) ou **8 pixels** (plus aéré — Material, standard web) ?
    **Expert** : Base unit + scale strategy (linéaire 4/8/12/16 vs géométrique 4/8/16/32 vs hybride 4/8/12/16/24/32/48) ? Density tokens (compact/comfortable/spacious) ?

13. **Simple** : Tu veux une mise en page **structurée en colonnes** (comme un journal) ou **fluide** (qui s'adapte à tout) ?
    **Expert** : 12-col grid classique, 8pt grid moderne, fluid grid (clamp + CSS Grid subgrid) ? Baseline grid pour du vertical rhythm (rare en web, utile pour editorial) ?

**Meta (2 questions)**

14. **Simple** : Ton niveau sur le design : **débutant / intermédiaire / expert** ? (détermine le mode du chapitre)

15. **Simple** : Tu as des **refs visuelles** (sites que tu aimes) ? Colle 3-5 URLs ou screenshots.
    **Expert** : Design language cible — extraction de design tokens depuis les refs (FireAlpaca eyedropper sur screenshot → OKLCH conversion) ?

---

## 3. UX du chapitre — 3 modes progressifs

### Mode Débutant — "Choisis une vibe"

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 Design — Mode Débutant                                    │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Choisis l'ambiance de ton app (1 clic, tout se génère) :    │
│                                                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Minimal │  │  Bold   │  │Playful  │  │Corporate│        │
│  │ (Linear)│  │(Stripe) │  │(Duolingo│  │ (IBM)   │        │
│  │ ░░░░░░  │  │ ████░░  │  │ ██▓▓▒▒  │  │ ▓▓▓▓▓▓  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │Editorial│  │Brutalist│  │  Warm   │  │  Tech   │        │
│  │(Medium) │  │(Gumroad)│  │(Notion) │  │(Vercel) │        │
│  │ ▒▒▒▒▒▒  │  │ ██▓▓██  │  │ ▓▒░░▒▓  │  │ ████░░  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                                │
│  → Aperçu live : bouton, card, form rendus avec la vibe      │
│  → Tu peux ajuster 1 curseur : "plus sobre ← → plus punchy"  │
└──────────────────────────────────────────────────────────────┘
```

Chaque vibe pré-génère : **palette 12 shades + neutrals + semantics + typo duo + spacing scale + radius + shadow**. L'enfant de 12 ans clique "Playful" et obtient un système complet. Il peut exporter tel quel.

### Mode Intermédiaire — "Pickers assistés"

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 Design — Mode Intermédiaire                               │
├──────────────────────────────────────────────────────────────┤
│  COULEUR                                                       │
│  Primary : [🟦 #3B82F6 ▼]  ← 1 seule couleur à choisir       │
│  → Palette 12 shades auto-générée (Radix Colors style)       │
│  → Gris avec teinte de la primary auto                        │
│  → Semantics (success/warning/error) auto                     │
│  → Dark mode : toggle [  ●] Oui   [Inversion perceptuelle]   │
│                                                                │
│  TYPO                                                          │
│  Style : [Moderne techno ▼]                                   │
│  → Suggestions : Inter / Geist / Söhne / IBM Plex Sans       │
│  Headings : [Geist ▼]  Body : [Geist ▼]  [Mono pairing auto] │
│  Scale : [1.250 Major Third ▼]  Base : [16px ▼]              │
│                                                                │
│  ESPACEMENT                                                    │
│  Base : [4px ▼]  Density : [Normal ▼]                        │
│                                                                │
│  ┌──────── APERÇU LIVE ────────┐  ┌──── WCAG AUDIT ────┐    │
│  │ Titre H1                     │  │ Body text : 7.2 ✓  │    │
│  │ Sous-titre                   │  │ Button : 4.8 ✓     │    │
│  │ Paragraphe de 2 lignes...    │  │ Muted : 3.1 ⚠      │    │
│  │ [Bouton primary]             │  │ Border : 1.4 ✓     │    │
│  └──────────────────────────────┘  └────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Mode Expert — "Design tokens editor complet"

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 Design — Mode Expert                                      │
├──────────────────────────────────────────────────────────────┤
│  TOKENS COULEUR (OKLCH)                                       │
│  --color-primary-50  : oklch(97% 0.02 260)  [●]              │
│  --color-primary-100 : oklch(94% 0.05 260)  [●]              │
│  --color-primary-500 : oklch(62% 0.21 260)  [●]  ← base      │
│  --color-primary-900 : oklch(22% 0.08 260)  [●]              │
│  [+ Ajouter shade]  [Lock hue]  [Tune chroma curve]          │
│                                                                │
│  TOKENS TYPO                                                   │
│  --font-size-xs   : 0.75rem   (12px)                          │
│  --font-size-base : 1rem      (16px)  [ratio: 1.250]         │
│  --font-size-5xl  : 3.052rem  (48.8px)                        │
│  [Éditer scale]  [Switch fluid (clamp)]  [Vertical rhythm]   │
│                                                                │
│  TOKENS SPACING                                                │
│  --space-1 : 4px    --space-6 : 24px                          │
│  --space-2 : 8px    --space-8 : 32px                          │
│  [Linéaire 4/8/12..] [Géométrique 4/8/16..] [Custom]         │
│                                                                │
│  AUDIT WCAG LIVE (toutes paires)                              │
│  primary-500 × white : 4.51 AA ✓                              │
│  primary-500 × bg    : 3.89 AA-L ⚠                            │
│  muted × bg          : 2.1 ❌ NON CONFORME                    │
│  [Corriger auto]  [Simulate deuteranopia]                     │
│                                                                │
│  [Export CSS vars] [Tailwind config] [JSON tokens] [Figma]   │
└──────────────────────────────────────────────────────────────┘
```

Transition fluide : Débutant peut toujours passer en Intermédiaire sans perdre ses choix. Mode Expert ouvre directement la session sur les tokens générés par les modes précédents.

---

## 4. Widgets / générateurs à implémenter

C'est le cœur du chapitre. **10 widgets**, chacun est utilisable isolément.

### 4.1 Color palette generator (Radix-style)
**Input** : 1 couleur primary (hex, HSL ou OKLCH) + nom.
**Output** : 12 shades (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 975) avec **luminosité perceptuelle progressive en OKLCH** (pas en HSL, qui produit du caca sur les teintes jaune/vert/cyan).

Méthode : interpoler la **lightness OKLCH** sur une courbe quasi-linéaire (ex. 97% → 8%), ajuster la **chroma** avec une courbe en cloche (max sur 500-600), garder **hue** stable (légère dérive autorisée 0-15° pour éviter les couleurs "sales" sur les extrêmes).

Bonus : **2 palettes par couleur** (solid + alpha) à la Radix Colors. Alpha scales sont critiques pour overlays sur fonds colorés. Source : Radix Colors documentation (workos.com/radix).

Complexité : **L**

### 4.2 Neutral generator (gris avec teinte)
**Input** : couleur primary + intensité de la teinte (0% = gris pur, 100% = très teinté).
**Output** : 12 shades de gris **avec une légère teinte** dérivée de la primary.

Pourquoi crucial : **le gris pur (#808080) est mort**. Tous les designs premium (Linear, Stripe, Apple) utilisent des gris teintés (cool gray, warm gray). Refactoring UI l'a popularisé, Tailwind l'a industrialisé (slate, zinc, gray, neutral, stone).

Complexité : **M**

### 4.3 Semantic colors generator
**Input** : primary + contexte (pro / fun / warm / cool).
**Output** : success (vert), warning (orange/jaune), error (rouge), info (bleu) — **harmonisés avec la primary** (même saturation + lightness curve, hue semantic).

Inspiration : Radix Colors propose des palettes sémantiques nommées (tomato, ruby, crimson, pink, plum, etc.) qui évitent le rouge-pompier kitsch.

Complexité : **M**

### 4.4 Contrast checker live (WCAG + APCA)
**Input** : toutes les paires foreground/background du système.
**Output** : ratio WCAG (Relative Luminance, formule officielle W3C) + ratio **APCA** (Accessible Perceptual Contrast Algorithm, futur WCAG 3, plus précis sur les contrastes extrêmes).

Seuils :
- **AA normal text** : 4.5:1
- **AA large text (18pt+ / 14pt+ bold)** : 3:1
- **AA UI components & graphical objects** : 3:1 (WCAG 2.1 §1.4.11)
- **AAA normal** : 7:1
- **AAA large** : 4.5:1

Alertes live + suggestion automatique "assombris de 2 shades pour atteindre 4.5:1". Source : WebAIM Contrast Checker + APCA Readability Criterion (Myndex).

Complexité : **M**

### 4.5 Typography scale builder (modular scale)
**Input** : base size (15/16/17/18px) + ratio.
**Output** : 8-10 font-sizes (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl).

Ratios proposés (source : Type Scale, Tim Brown) :
- **1.067** Minor Second — ultra-tight, éditorial
- **1.125** Major Second — interfaces denses (GitHub, Linear approx)
- **1.200** Minor Third — équilibré (Tailwind default approx)
- **1.250** Major Third — classique Bootstrap/Material
- **1.333** Perfect Fourth — éditorial aéré
- **1.414** Augmented Fourth — √2, design classique
- **1.500** Perfect Fifth — display-heavy
- **1.618** Golden Ratio — landing pages expressives

Option **fluid typography** via `clamp()` (Utopia.fyi, Trys Mudford) pour passer de mobile à desktop sans media queries.

Complexité : **L**

### 4.6 Font pairing picker
**Input** : style cible (moderne techno / éditorial classique / humaniste / expressif / monospace-first).
**Output** : bibliothèque de ~30 pairings testés, chacun avec preview live + licence + hébergement (Google Fonts / local / fontsource).

Pairings gold standard (sources : Google Fonts recommandations, Adobe Fonts pairings, femmebabe.com, fontpair.co) :
- **Mono-typeface** : Inter seul, Geist seul, Söhne seul, IBM Plex Sans seul (Linear / Vercel / Stripe approche)
- **Serif display + Sans body** : Playfair Display + Inter, Fraunces + Inter, GT Sectra + GT America, Söhne + Söhne Mono
- **Sans display + Serif body** : Inter + Source Serif, Geist + Lora (rare, expressif)
- **Humanist + Mono** : Inter + JetBrains Mono, Geist + Geist Mono
- **Classique** : Georgia + Verdana (System safe), Charter + Helvetica Neue

Inclure **system font stacks** (Modern Font Stacks, Dan Klammer — modernfontstacks.com) pour performance : `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"...`

Complexité : **M**

### 4.7 Spacing scale builder
**Input** : base unit (4 / 8 / custom) + progression (linéaire / géométrique / hybride).
**Output** : scale 10-16 tokens.

Presets :
- **Linéaire 4px** : 0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64 (control fin, Apple HIG)
- **Linéaire 8px** : 0, 8, 16, 24, 32, 40, 48, 64, 80, 96 (Material)
- **Géométrique × 2** : 4, 8, 16, 32, 64, 128 (rare, éditorial)
- **Hybride Tailwind** : 0, 1 (4px), 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64

Density tokens : `--density-compact` (× 0.75), `--density-normal` (× 1), `--density-spacious` (× 1.25). Couplé au spacing dans Mindeck (html.density-compact/comfortable).

Complexité : **M**

### 4.8 Live preview component
Affiche un **button + card + form + navbar + liste** rendus en temps réel avec tous les tokens (couleur, typo, spacing, radius, shadow). Switch light/dark. Switch density. Switch viewport (mobile 375 / tablet 768 / desktop 1440).

Bonus : **mode screenshot** — génère une capture de la preview à partager dans des refs/notes.

Complexité : **L**

### 4.9 Dark mode auto-invert (perceptuel)
**Input** : palette claire.
**Output** : palette sombre générée **par inversion perceptuelle en OKLCH**, pas par inversion naïve.

Règles :
- **Inversion naïve interdite** (flip `L` de 100-L en HSL → produit des couleurs sursaturées laides)
- **En OKLCH** : mapper L: 97% → 10%, L: 50% → 62% (la courbe n'est pas symétrique, les sombres doivent remonter en lightness pour rester lisibles)
- **Réduire chroma** de 10-30% en dark mode (les couleurs saturées vibrent trop sur fond sombre)
- **Semantic colors** : garder hue, ajuster L + C séparément

Source : Evil Martians "OKLCH in CSS" + Josh Comeau "Color Formats" + Adam Wathan Refactoring UI chapter "Creating a color palette".

Complexité : **L**

### 4.10 Moodboard quick picker + vibe extractor
**Input** : choix parmi 8 vibes pré-faites OU upload de 3 screenshots de refs.
**Output** : tokens générés automatiquement.

8 vibes :
1. **Minimal** (Linear, Notion) — gris teintés, 1 accent bleu, typo sans grotesque, spacing aéré
2. **Bold** (Stripe, Vercel landing) — contrastes élevés, gradients, display type, shadows
3. **Playful** (Duolingo, Figma) — couleurs saturées, radius élevés (12-24px), illustrations
4. **Corporate** (IBM, Oracle) — bleu classique, typo sérieuse (IBM Plex), peu de radius
5. **Editorial** (Medium, NYT) — serif display + sans body, mesure 65ch, typo-first
6. **Brutalist** (Gumroad new, Hacker News) — high contrast, borders épaisses, typo brute
7. **Warm** (Notion, Substack) — teintes chaudes, moka/terracotta, radius moyens
8. **Tech/Techno** (Vercel, Resend) — noir profond, blanc pur, typo geometric (Geist), accents neon

**Vibe extractor (bonus expert)** : upload d'image → extrait 5 couleurs dominantes (k-means en espace OKLCH) + suggère pairing typo matchant le style détecté.

Complexité : **XL** (extractor) / **M** (picker seul)

### 4.11 Accessibility simulator (bonus)
Simule les vues daltoniens (deuteranopia 6% hommes, protanopia 2%, tritanopia 0.01%) + vision basse + mode high contrast Windows. Live sur la preview. Source : color-blindness.com + Figma Stark plugin référence.

Complexité : **M**

### 4.12 Export multi-format
- **CSS variables** `:root { --color-primary-500: oklch(62% 0.21 260); }`
- **Tailwind v4 config** (`@theme` directive du nouveau Tailwind)
- **JSON design tokens** format W3C Design Tokens Community Group (`{ "color": { "primary": { "500": { "$value": "oklch(...)", "$type": "color" } } } }`)
- **Figma variables** (JSON compatible Tokens Studio plugin)
- **Markdown design guidelines** (pour coller dans Claude / Notion)

Complexité : **M**

---

## 5. Règles de validation automatique

Garde-fous qui s'affichent en live, **avec explication pédagogique** (pas juste un 🚫 sec).

| Règle | Seuil | Niveau | Message pédagogique |
|---|---|---|---|
| Contraste body text | < 4.5:1 | Rouge bloquant | "Texte illisible pour 15% des users. WCAG AA exige 4.5:1." |
| Contraste large text | < 3:1 | Rouge bloquant | "Large text (18pt+) doit être ≥ 3:1." |
| Contraste UI (bordures, icônes) | < 3:1 | Orange | "WCAG 2.1 §1.4.11 exige 3:1 sur les UI components." |
| Contraste AAA | < 7:1 body | Info | "Pour viser AAA (accessibilité max), il faut 7:1." |
| Nombre de polices | > 2 (hors mono) | Orange | "2 polices max. Au-delà, l'interface se fragmente." |
| Nombre de font-sizes | > 10 | Orange | "Tu as 14 tailles. Un design system pro en a 6-9." |
| Nombre de font-weights | > 4 | Info | "400/500/600/700 suffisent. Évite 8 graisses." |
| Line-height body | < 1.4 ou > 1.8 | Orange | "Body text : 1.5-1.7 optimal pour lisibilité." |
| Measure (char/line) | < 45 ou > 75 | Info | "Lisibilité optimale 45-75 caractères (Bringhurst)." |
| Spacing hors grid | Non multiple de 4 | Info | "Base 4px recommandée pour cohérence visuelle." |
| Gris pur (#808080) | Sat = 0 | Info | "Ajoute un peu de teinte (cool/warm) pour un rendu premium." |
| Saturation excessive dark mode | C > 0.25 en OKLCH | Orange | "Trop saturé en dark mode → vibration visuelle." |
| Reliance on color alone | Badge rouge sans icône/texte | Rouge | "Ne repose pas que sur la couleur (daltoniens)." |
| Radius incohérent | 3+ valeurs de radius | Info | "Tu utilises 5 radius différents. Harmonise." |
| Shadow excess | 5+ shadows distincts | Info | "Élévations cohérentes : 0 / sm / md / lg / xl max." |

---

## 6. Contenus pédagogiques

### Mini-leçons (3 lignes chacune, tooltip au hover)

**Hiérarchie visuelle**
> L'œil ne lit pas tout, il **scanne**. Scale (+ grand = + important), weight (+ gras = + fort), color (+ saturé = + attention), space (+ d'air = + isolé). Combine 2-3 de ces leviers, pas les 4.

**F-pattern vs Z-pattern**
> F-pattern : lecture horizontale dense (articles, docs). Z-pattern : landing pages avec logo haut-gauche, CTA bas-droit. Gutenberg pour contenu long. Choisis **une** pattern, pas un mix incohérent.

**Échelle modulaire**
> Au lieu de choisir 8 tailles au pif, multiplie une base par un ratio (ex. 16 × 1.25 = 20 × 1.25 = 25...). Harmonique musicale pour les yeux. Source : Tim Brown "Modular Scale" (2012).

**Measure (largeur de ligne)**
> 45-75 caractères par ligne = lecture confortable (Robert Bringhurst, *The Elements of Typographic Style*). Trop large = œil se perd au retour. Trop étroit = lecture saccadée.

**HSL vs OKLCH**
> HSL ment : HSL(60, 100%, 50%) jaune et HSL(240, 100%, 50%) bleu ont la même "lightness" mais le jaune paraît 5× plus clair. **OKLCH mesure la lightness perceptuelle réelle** (science CIE Lab). Pour les palettes modernes, OKLCH est supérieur. Source : Evil Martians "OKLCH in CSS" (2023).

**Règle 60-30-10 (avec honnêteté)**
> Règle déco d'intérieur recyclée pour le web : 60% neutre, 30% secondaire, 10% accent. **Utile comme ratio mental**, mais les design systems pro (Radix, Material 3) raisonnent en **rôles sémantiques** (surface, text, border, accent). Utilise 60-30-10 comme check final, pas comme loi.

**Base 4 vs base 8**
> 4px = fin, précis, proche de la typographie (Apple HIG). 8px = plus aéré, multiples ronds (Material Design, Spotify). **En pratique, hybride 4/8/12/16/24/32/48** domine (Tailwind). Reste cohérent : pas de 5px ou 13px au milieu.

**Variable fonts**
> 1 fichier = toutes les graisses + italiques + optical size, 30-50% plus léger qu'importer 5 fichiers statiques. Inter, Geist, Söhne, Recursive, Fraunces sont variables. Production = variable fonts par défaut.

**Baseline grid vs 8pt grid**
> Baseline grid = rythme vertical aligné sur le line-height (typographique, journaux). 8pt grid = alignement sur multiples de 8 (interfaces, Material). **8pt domine en web**, baseline utile pour éditorial long-form uniquement.

### Exemples ✓ / Anti-exemples ✗

**✓ Linear (linear.app)** : mono-typeface Inter, gris bleutés, 1 accent indigo, spacing généreux, density compact option, dark-first avec light parfait.

**✓ Stripe (stripe.com)** : gradients expressifs, typo custom (Sohne / Söhne Mono), contrastes maîtrisés, WCAG AA partout, palette sémantique nuancée.

**✓ Vercel (vercel.com)** : Geist partout, noir/blanc contrastés, accents multicolores sur landings, mono-typeface strict en dashboard.

**✓ Radix Colors (radix-ui.com/colors)** : 12 palettes × 12 shades × solid+alpha × light+dark, benchmark référence de palette pro.

**✓ Apple HIG (developer.apple.com/design)** : SF Pro optical sizing automatique, dynamic type pour accessibilité, spacing en 4pt et 8pt selon contexte.

**✗ Comic Sans + Papyrus + Arial** sur un même site (pizzeria 2008 classique).

**✗ Gris pur #808080 partout** → fade, pas de personnalité.

**✗ Texte à #00000066** (40% opacity) sur fond blanc → contraste 2.8:1, NON conforme WCAG, courant dans les sites Bootstrap 2015.

**✗ 15 font-sizes différentes** (sites Wix / Wordpress sans design system) → chaos visuel.

**✗ Dark mode = filter: invert(1)** → horreur visuelle (images invertées, couleurs fausses).

**✗ Badge "erreur" = juste rouge sans icône ni texte** → 8% hommes daltoniens excluus.

**✗ Helvetica Neue à #777 sur #EEE** → 2.8:1, "élégant" en apparence, illisible en réalité.

---

## 7. Outputs générés

### 7.1 CSS variables (token-first)
Fichier `design-tokens.css` avec `:root` + `[data-theme="dark"]`. Convention BEM-like ou semantic (`--color-surface-1`, `--color-text-primary`, `--color-border-subtle`, `--space-4`, `--font-size-base`, `--font-weight-medium`, `--radius-md`, `--shadow-elevation-2`).

### 7.2 Tailwind v4 config
Utilise la nouvelle directive `@theme` (Tailwind v4, 2024) qui remplace `tailwind.config.js`. CSS-first approach cohérente avec l'architecture Mindeck (pas de config file).

### 7.3 JSON design tokens (W3C standard)
Format Design Tokens Community Group (designtokens.org) : `$value`, `$type`, `$description`. Compatible Style Dictionary, Tokens Studio (Figma), Specify, Supernova, et futures générations d'outils.

### 7.4 Markdown design guidelines
Document auto-généré prêt à coller dans Claude/Notion :
```
# Design system — [nom du projet]
## Palette
- Primary : oklch(62% 0.21 260) — Bleu tech, usage : CTA, links, focus ring
- Neutral : gamme grise légèrement bleutée, usage : text, borders, surfaces
...
## Typographie
- Heading : Geist 600, scale 1.25 Major Third
- Body : Geist 400, 16px base, line-height 1.6
...
```

### 7.5 Figma-ready export
JSON compatible Tokens Studio for Figma (tokens.studio). Permet import natif dans Figma.

### 7.6 Accessibility report
Rapport WCAG AA/AAA complet : toutes les paires testées, score global, liste des non-conformités avec suggestion de fix.

---

## 8. Modèle de données conceptuel

Table `design_tokens` (liée au `project_id`) :

```
design_tokens
├── id, project_id, user_id
├── mode : debutant | intermediaire | expert
├── vibe : minimal | bold | playful | corporate | editorial | brutalist | warm | tech | custom
│
├── colors (JSONB)
│   ├── primary : { hue, chroma, lightness_curve, shades[12] }
│   ├── neutral : { hue, tint_strength, shades[12] }
│   ├── semantic : { success, warning, error, info } (chacun = palette 12)
│   ├── accent : optionnel
│   └── alpha_scales : boolean (Radix-style alpha palettes)
│
├── typography (JSONB)
│   ├── heading_font : { family, source, weights[], variable }
│   ├── body_font : { family, source, weights[], variable }
│   ├── mono_font : { family, source, weights[], variable }
│   ├── scale_ratio : 1.067 | 1.125 | 1.2 | 1.25 | 1.333 | 1.414 | 1.5 | 1.618 | custom
│   ├── base_size : 14 | 15 | 16 | 17 | 18
│   ├── fluid : boolean (active clamp())
│   ├── line_heights : { tight, normal, relaxed }
│   └── letter_spacings : { tight, normal, wide }
│
├── spacing (JSONB)
│   ├── base_unit : 4 | 8
│   ├── scale_type : linear | geometric | hybrid | custom
│   └── density_variants : { compact, normal, spacious }
│
├── radius (JSONB)
│   └── scale : { none, sm, md, lg, xl, full }
│
├── shadows (JSONB)
│   └── elevations : [0..5] (avec offset, blur, spread, color)
│
├── grid (JSONB)
│   ├── type : 12col | 8pt | fluid
│   ├── max_width : 1280 | 1440 | custom
│   └── gutter : 16 | 24 | 32
│
├── accessibility (JSONB)
│   ├── target_wcag : AA | AAA
│   ├── audit_result : { pairs_tested, failures, last_audit_at }
│   └── colorblind_tested : boolean
│
├── dark_mode (JSONB)
│   ├── enabled : boolean
│   ├── strategy : mirror | custom | perceptual_invert
│   └── overrides : {} (tokens qui diffèrent du light)
│
├── generated_at : timestamp
└── exported_formats : text[] (css, tailwind, json, figma, markdown)
```

Table existante Mindeck à enrichir : `user_preferences.display_density` déjà présent → à lier au `design_tokens.spacing.density_variants` actif.

---

## 9. Pièges classiques à éviter

1. **Gris pur #808080 / Slate de Bootstrap 2015** → fade. Toujours teinter le gris (cool ou warm selon primary). Refactoring UI chapter "Don't use gray".

2. **Texte à 40% d'opacity pour "secondary"** → contraste ruiné. Préfère une vraie couleur calculée (`--text-muted: oklch(55% 0.02 260)`) qui garde son ratio WCAG.

3. **15 tailles de police** → pas de système, chaos. 8 tailles max (xs, sm, base, lg, xl, 2xl, 3xl, 4xl). Source : Refactoring UI.

4. **Dark mode = CSS filter: invert()** → horreur absolue (images, logos, tout cassé). Dark mode = palette dédiée avec inversion perceptuelle OKLCH.

5. **Inversion HSL naïve pour dark mode** → couleurs sursaturées laides. Oklch perceptual shift obligatoire.

6. **Reliance on color alone** (badge juste rouge) → 8% des hommes exclus (daltonisme). Toujours doubler avec icône + texte.

7. **Utiliser 5 polices "parce que c'est joli"** → fragmentation. 2 polices max (3 si mono inclus).

8. **Spacing aléatoire** (7px, 13px, 22px, 35px) → incohérence visuelle invisible mais sentie. Base 4 ou 8, jamais hors grille.

9. **Ignorer le measure** (lignes à 120 caractères de large) → fatigue oculaire. Max-width 65ch sur body text.

10. **Border radius incohérent** (cards à 12px, buttons à 6px, inputs à 16px) → système cassé. 3-5 valeurs de radius max, cohérentes.

11. **Shadows multiples non-harmonisées** (5 shadows définies au hasard) → système d'élévation cassé. 5 niveaux max (sm, md, lg, xl, 2xl), tous dérivés d'une même source lumineuse virtuelle.

12. **Oublier l'optical sizing** (utiliser la même graisse en 12px et 48px) → à grande taille, tighten le letter-spacing et réduire de -0.01em à -0.03em. Variable fonts (SF Pro, Inter) gèrent ça automatiquement.

13. **WCAG ignoré "parce que c'est joli"** → procès potentiels (European Accessibility Act en vigueur juin 2025, WCAG 2.1 AA obligatoire pour apps SaaS B2C dans l'UE).

---

## 10. Références autoritatives

1. **Refactoring UI** — Adam Wathan & Steve Schoger (2018, refactoringui.com). Bible absolue pour designer hiérarchie, couleur (gris teinté, saturation reduction over distance), typo et spacing. **La référence #1**.

2. **Radix Colors** — WorkOS (radix-ui.com/colors, 2022+). 30 palettes × 12 shades × light/dark × solid/alpha. Benchmark de palette pro moderne, basé sur recherche perceptuelle. Doc : workos.com/blog/radix-colors.

3. **OKLCH in CSS** — Andrey Sitnik / Evil Martians (evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl, 2023). Explique pourquoi OKLCH > HSL pour interfaces modernes.

4. **Material Design 3** — Google (m3.material.io). Système couleur tonal palettes (HCT color space, cousin d'OKLCH), type scale, elevation.

5. **Apple Human Interface Guidelines** — Apple (developer.apple.com/design/human-interface-guidelines). Typography (SF Pro dynamic type, optical sizing), spacing (4pt), couleur sémantique.

6. **The Elements of Typographic Style** — Robert Bringhurst (1992, 4e éd. 2013). Bible typographie (measure 45-75, échelle harmonique, optical alignment). Classique intemporel.

7. **Butterick's Practical Typography** — Matthew Butterick (practicaltypography.com, free online). Règles typo appliquées au web moderne, accessibles et tranchées.

8. **Utopia.fyi** — Trys Mudford & James Gilyead (utopia.fyi). Fluid type & spacing avec `clamp()`. Générateur en ligne + méthode.

9. **Type Scale** — Tim Brown (typescale.com, 2012). Générateur échelle modulaire, article "More Meaningful Typography" (A List Apart).

10. **Modern Font Stacks** — Dan Klammer (modernfontstacks.com). System font stacks optimisés pour performance.

11. **WebAIM Contrast Checker** + **APCA** (webaim.org/resources/contrastchecker, git.apcacontrast.com). Outils de référence WCAG 2.1 + futur WCAG 3.

12. **Nathan Curtis — Design Tokens articles** (medium.com/eightshapes-llc). Référence sur taxonomie de tokens (color, typo, spacing, elevation).

13. **Designing Design Tokens** — W3C Design Tokens Community Group (designtokens.org). Standard format JSON.

14. **Tailwind CSS v4 docs** (tailwindcss.com) — couleur OKLCH native, `@theme` directive, spacing scale.

15. **Inter font** (rsms.me/inter) + **Geist font** (vercel.com/font) — specs des deux polices variables open-source dominantes.

---

## 11. Priorité MVP

### MUST (sans ça, chapitre inutile)
- **Widget 4.1 Color palette generator** (OKLCH, 12 shades)
- **Widget 4.4 Contrast checker live** (WCAG AA minimum)
- **Widget 4.5 Typography scale builder** (modular scale + base size)
- **Widget 4.7 Spacing scale builder** (base 4/8 + scale preset)
- **Widget 4.8 Live preview** (button + card + form minimum)
- **Widget 4.10 Moodboard quick picker** (8 vibes) — **crucial pour Mode Débutant**
- **Widget 4.12 Export CSS variables + Tailwind v4 config + JSON tokens**
- **Règles de validation 1-7** (contraste, polices, sizes, line-height, measure)
- **Mode Débutant** complet
- **Mode Intermédiaire** complet

Justification : sans palette generator + contrast checker + typo scale + spacing + preview + moodboard + export, l'onglet Design n'apporte pas plus qu'un color picker standard. Le moodboard est **le killer feature** pour Anthony (débutant) et les autres débutants.

### SHOULD (forte valeur, pas bloquant)
- **Widget 4.2 Neutral generator** (gris teintés) — premium feel
- **Widget 4.3 Semantic colors generator**
- **Widget 4.6 Font pairing picker** (bibliothèque de 30 pairings)
- **Widget 4.9 Dark mode auto-invert perceptuel** — différenciant vs concurrents
- **Mode Expert** complet
- **Widget 4.11 Accessibility simulator**
- **Règles de validation 8-15**
- **Output Markdown guidelines** (export vers Claude)
- **APCA en plus de WCAG**

### NICE (v2, quand le MVP tourne)
- **Vibe extractor depuis image** (k-means OKLCH)
- **Figma export** via Tokens Studio format
- **Baseline grid / vertical rhythm** visualiseur
- **Mode screenshot** de la preview
- **Fluid typography avec clamp()** auto-généré
- **Presets par industrie** (SaaS B2B, SaaS consumer, fintech, médical, éducatif)
- **A/B preview** (comparer 2 variations côte à côte)
- **History / versioning** des design systems générés

---

## 12. Estimation complexité d'implémentation

| Widget | Complexité | Justification |
|---|---|---|
| 4.1 Color palette generator | **L** | Algo OKLCH + courbes lightness/chroma, 12 shades, validation perceptuelle |
| 4.2 Neutral generator | **M** | Dérivation mathématique simple depuis primary |
| 4.3 Semantic colors | **M** | Templates + ajustement saturation par rapport à primary |
| 4.4 Contrast checker WCAG + APCA | **M** | Formules documentées, matrix de toutes paires |
| 4.5 Typography scale builder | **L** | Ratios + fluid typography + rem conversion + preview |
| 4.6 Font pairing picker | **M** | Bibliothèque statique + live preview + loading Google Fonts dynamique |
| 4.7 Spacing scale builder | **M** | Presets + calcul progression + density tokens |
| 4.8 Live preview component | **L** | Rendu de 5+ composants avec tous les tokens, switch viewport/density/theme |
| 4.9 Dark mode perceptual invert | **L** | Algo OKLCH non-trivial, courbes asymétriques, chroma reduction |
| 4.10 Moodboard picker | **M** | 8 presets statiques bien pensés |
| 4.10 bis Vibe extractor (image) | **XL** | K-means OKLCH + détection style typo, ML-léger |
| 4.11 Accessibility simulator | **M** | Matrices de simulation daltonisme, filtres CSS |
| 4.12 Export multi-format | **M** | 5 formats templates + copy-to-clipboard + download |

**Effort total MVP** (MUST only) : ~**L + L + L + M + L + M + M** ≈ **5-7 semaines solo** dev senior (avec design UX de l'éditeur lui-même inclus).

**Effort total SHOULD** (MUST + SHOULD) : ~**2-3 mois solo**.

**Ordre de développement recommandé** :
1. Semaine 1 : Color palette generator (OKLCH) + Contrast checker (cœur du chapitre)
2. Semaine 2 : Typography scale builder + Spacing scale builder
3. Semaine 3 : Live preview + Moodboard picker (Mode Débutant livrable)
4. Semaine 4 : Export multi-format + Mode Intermédiaire pickers
5. Semaine 5-6 : Neutral + Semantic generators, Font pairings, Règles validation
6. Semaine 7+ : Mode Expert, Dark mode perceptuel, Accessibility simulator

---

**Mot de fin sans sycophantie** : ce chapitre est le plus différenciant de Mindeck. Un outil de gestion de projet qui génère des **design tokens OKLCH exportables vers Tailwind v4 + JSON W3C** n'existe pas sur le marché (Coolors, Colorhunt, Tailwind UI générateurs font une sous-partie chacun). Si Mindeck livre MUST + SHOULD, c'est **un produit vendable en standalone**. La tentation : sur-investir en 4.10 bis (vibe extractor ML) ou 4.11 (simulator) avant d'avoir le MUST solide. À éviter. **Finir MUST avant tout.**
