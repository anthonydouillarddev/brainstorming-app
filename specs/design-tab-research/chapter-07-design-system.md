# Chapitre 7 — Système de design : tokens, composants, patterns

> Livrable brut de l'Expert 7 (general-purpose).
> Couvre : tokens 3-tier (primitive/semantic/component), W3C Design Tokens Format 2025.10, Atomic Design (avec limites reconnues par Frost), composants, patterns.

## 1. Objectif du chapitre

Un design system, c'est ta boîte de **briques Lego** personnelle. Tu définis une fois les formes (briques 2x2 rouges, 4x1 bleues), puis tu assembles tout avec : une maison, un avion, une fusée. Tu ne redessines jamais une brique pour chaque projet — tu la réutilises. Les tokens sont les couleurs/tailles des briques, les composants sont les briques elles-mêmes, les patterns sont les assemblages récurrents (un mur, un toit). Tout produit sérieux en a un, même minuscule.

## 2. Questions clés à poser à l'user

Deux formulations : **Simple** (enfant 12 ans) / **Expert** (designer/dev).

| # | Simple | Expert |
|---|--------|--------|
| 1 | "Tu réutilises les mêmes couleurs et tailles partout dans ton app ?" | "Tokens globaux définis et référencés, ou valeurs hardcodées dans les composants ?" |
| 2 | "Si tu changes la couleur principale, ça se met à jour tout seul partout ?" | "Pipeline de propagation des tokens (primitives → semantic → component) en place ?" |
| 3 | "T'as un bouton unique ou plein de boutons différents qui se ressemblent ?" | "Combien de variants sur ton composant Button ? Y a-t-il du 'variant creep' ?" |
| 4 | "Quand ton app charge ou bug, qu'est-ce qu'on voit ?" | "Tes 4 états (idle / loading / empty / error / success) sont-ils designés comme une famille ?" |
| 5 | "T'as un mode clair ET un mode sombre ?" | "Theming multi-modes via alias tokens (light/dark/high-contrast) ou fork CSS ?" |
| 6 | "Tu fais tes boutons en code à chaque fois ?" | "Les composants sont-ils centralisés (lib unique) ou dupliqués par feature ?" |
| 7 | "Un écran vide (0 résultat), ça ressemble à quoi chez toi ?" | "Empty state avec headline + description + CTA, ou écran mort ?" |
| 8 | "Est-ce qu'un enfant comprendrait tes messages d'erreur ?" | "Messages d'erreur : actionnables, localisés sous le champ, `aria-describedby` mis ?" |
| 9 | "T'as pensé aux handicapés (aveugles, clavier seul) ?" | "Focus visible, contrastes AA/AAA, ARIA roles, keyboard nav sur chaque composant ?" |
| 10 | "Tu veux pouvoir exporter tes couleurs/tailles vers Figma ou un autre outil ?" | "Export W3C Design Tokens JSON (format 2025.10) pour interop Figma/Style Dictionary ?" |
| 11 | "T'as combien de polices différentes ?" | "Type scale définie (step ratio) ou tailles arbitraires ? Font stack tokenisée ?" |
| 12 | "Tes espacements (marges) sont sur une grille ?" | "Spacing scale multiple de 4 ou 8 px, tokenisée, référencée dans les composants ?" |

## 3. UX du chapitre — 3 modes progressifs

**Mode Débutant — "Coche les briques dont t'as besoin"**

```
┌────────────────────────────────────────────────┐
│  Quels composants te faut-il pour Mindeck ?    │
│                                                 │
│  ESSENTIELS (recommandés MVP)                  │
│  [x] Button     [x] Input     [x] Card         │
│  [x] Modal      [x] Toast     [x] Empty state  │
│                                                 │
│  SOUHAITABLES                                   │
│  [ ] Tabs       [x] Dropdown  [x] Badge        │
│  [ ] Avatar     [ ] Tooltip   [ ] Checkbox     │
│                                                 │
│  AVANCÉS                                        │
│  [ ] Table      [ ] Popover   [ ] Skeleton     │
│  [ ] Drawer     [ ] Combobox  [ ] Slider       │
│                                                 │
│  Couleurs principales (max 3)                  │
│  Principale : [🎨 #7C6A4F]                     │
│  Fond :       [🎨 #E8E0D8]                     │
│  Texte :      [🎨 #2a2a2a]                     │
│                                                 │
│  [ Générer spec basique ]                      │
└────────────────────────────────────────────────┘
```
Sortie : un markdown listant les composants cochés + les 3 couleurs + spacing par défaut (4/8/16/24).

**Mode Intermédiaire — "Token editor 2 niveaux + composants pré-remplis"**

```
┌─── PRIMITIVES ──────────────┐ ┌─── SEMANTIC ────────────┐
│ color-moka-500  #7C6A4F 🎨 │→│ bg-primary → moka-500   │
│ color-moka-700  #65543C 🎨 │→│ bg-primary-hover → 700  │
│ color-beige-100 #E8E0D8 🎨 │→│ bg-surface → beige-100  │
│ space-1 4px                │ │ text-muted → gray-600   │
│ space-2 8px                │ │ border-danger → red-500 │
│ space-3 12px               │ │ radius-card → radius-lg │
└────────────────────────────┘ └─────────────────────────┘

┌─── COMPONENTS (pré-remplis) ───────────────────────────┐
│ Button                                                  │
│   Variants : primary · secondary · ghost · danger      │
│   Sizes    : sm · md · lg                              │
│   States   : default · hover · active · focus · disab. │
│  [Preview matrix] [Edit] [Export spec]                 │
│                                                         │
│ Input  · Card · Modal · Toast ...                      │
└────────────────────────────────────────────────────────┘
```

**Mode Expert — "3-tier tokens + playground + pattern library"**

```
PRIMITIVES → SEMANTIC → COMPONENT
color.red.500   bg.danger       button.danger.bg
                                button.danger.bg.hover

┌─── COMPONENT PLAYGROUND : Button ────────────────────┐
│            | default | hover  | active | disabled   │
│  primary   |   ▣     |   ▣    |   ▣    |    ▣      │
│  secondary |   ▢     |   ▢    |   ▢    |    ▢      │
│  ghost     |   ○     |   ○    |   ○    |    ○      │
│  danger    |   ▣     |   ▣    |   ▣    |    ▣      │
│                                                       │
│  sm · md · lg   |  + icon  |  full-width  |  loading │
│                                                       │
│  Contrast AA ✓  |  Focus visible ✓  |  A11y notes    │
│  [Export W3C JSON] [Export Tailwind] [Copy Markdown] │
└──────────────────────────────────────────────────────┘

┌─── PATTERN LIBRARY ──────────────────────────────────┐
│ Empty state · Loading · Error · Success · Skeleton   │
│ Form+validation · List+filter · Search+autocomplete  │
└──────────────────────────────────────────────────────┘
```

## 4. Widgets / générateurs à implémenter

- **Token editor 3-tier** : 3 colonnes (primitives / semantic / component), lignes = tokens, drag pour mapper un primitive vers un semantic. Preview live.
- **Component matrix builder** : génère automatiquement la grille `variants × states × sizes` en cochant les cases voulues. Bloque à 6 variants max avec alerte.
- **Component checklist** : 30+ composants pondérés par type de projet (une app SaaS a besoin de Table + Filter, un outil perso pas forcément).
- **Pattern picker** : bibliothèque visuelle d'états (empty/loading/error/success) avec templates markdown à coller.
- **Contrast checker inline** : calcule le ratio AA/AAA entre chaque paire `bg` + `text` des tokens semantic. Affiche ✓/✗.
- **Token export multi-format** : W3C Design Tokens JSON (format 2025.10), CSS custom properties, Tailwind v4 `@theme`, Figma Tokens (plugin).
- **Component spec generator** : pour chaque composant sélectionné, génère un markdown (purpose, variants, states, sizes, a11y notes, exemples d'usage).
- **Density switcher** : 3 presets (compact / normal / comfortable) qui multiplient tous les `space-*` et `font-size-*` par un facteur.
- **Mermaid diagram generator** : visualise le flux primitives → semantic → components sous forme de graphe.
- **Variant explosion alarm** : compte les combinaisons totales (variants × sizes × states) et alerte dès que ça dépasse ~60 (ex. 4×3×5 = 60, raisonnable ; 1600 comme le cas cité par Alice Packard, non).

## 5. Règles de validation automatique

- **Token semantic non mappé** à un primitive → alerte "token orphelin : `bg.primary` n'a pas de source".
- **Valeur hardcodée dans un composant** (ex. `#FF0000`) au lieu d'un token → alerte.
- **Contraste AA < 4.5:1** entre `bg` et `text` d'un semantic → alerte rouge.
- **Composant sans état `disabled` défini** → warning.
- **Composant sans état `focus` visible** → warning a11y critique.
- **Plus de 6 variants sur un même composant** → alerte over-engineering (réf. Nathan Curtis, Josh Cusick).
- **Pas d'`empty state`** défini alors que `Table` ou `List` est coché → alerte.
- **Pas de Toast/Alert** défini alors que `Form` est coché → alerte (pas de feedback utilisateur).
- **Spacing hors échelle** (ex. `7px` au lieu de `8`) → alerte "échelle brisée".
- **Plus de 2 polices distinctes** → warning (typographic chaos).
- **Pas de mode sombre** défini alors que l'user a dit en vouloir un → alerte.
- **Bouton primary dupliqué** sur la même vue → alerte hiérarchie (un seul primary par écran, réf. Carbon).

## 6. Contenus pédagogiques

**Tooltips progressifs :**
- *Token vs variable CSS* : "Une variable CSS est un vaisseau, un token est la **décision** qu'on y met. `--ac: #7C6A4F` est une variable ; `color.accent.primary = moka-500` est un token."
- *Primitive vs Semantic* : "Primitive = le mot `rouge`. Semantic = le rôle `danger`. Tu changes le rouge, tous les dangers suivent."
- *Atomic Design en 30 sec* : "Atoms (Button) → Molecules (SearchBar = Input+Button) → Organisms (Header) → Templates (page vide) → Pages (page remplie)."
- *Contrast AA* : "Ratio ≥ 4.5:1 pour du texte normal. Sinon, un daltonien ne lit pas ton bouton."
- *Loading state* : "Skeleton > Spinner. Un skeleton montre la structure, un spinner montre juste que ça travaille."

**Mini-leçons (4 cartes pédagogiques) :**

1. **Pourquoi tokeniser ?** "Sans tokens, tu changes une couleur = 87 fichiers à éditer. Avec tokens = 1 ligne."
2. **Les 3 niveaux de tokens** (Nathan Curtis) : primitives = options, semantic = choix, component = exception.
3. **Atomic Design : les limites** (Brad Frost himself) : ne couvre pas motion, flows, business logic, responsive. Ça reste un bon squelette mental, pas un dogme.
4. **La règle du "one primary per view"** (Carbon) : un seul bouton primary visible. Sinon l'utilisateur hésite.

**Exemples ✓ / ✗ :**

| ✓ | ✗ |
|---|---|
| `bg: var(--bg-surface)` | `bg: #F2EDE8` |
| `color-red-500` puis `color.danger = red-500` | `color.error-button-bg: #FF0000` |
| Button avec 4 variants × 3 sizes = 12 combinaisons | Button avec 1 600 variants (cas réel cité) |
| "Email invalide. Exemple : nom@domaine.fr" | "Erreur 422" |
| Empty state : illustration + headline + CTA | Écran blanc "Aucune donnée" |

## 7. Outputs générés

1. **`tokens.w3c.json`** — format DTCG 2025.10 (stable). Groupes `$type: "color"`, `$value`, `$description`, aliases via `{color.primitive.moka.500}`.
2. **`tokens.css`** — CSS custom properties (`:root { --bg: ...; } .dark { --bg: ...; }`).
3. **`tailwind.theme.css`** — syntaxe Tailwind v4 (`@theme { --color-accent: ...; }`).
4. **`components/[name].md`** — spec par composant : purpose, anatomy, variants, states, sizes, props API, a11y (ARIA role, keyboard nav, focus), do/don't, exemples.
5. **`patterns.md`** — catalogue des états (empty/loading/error/success) + templates prêts à copier.
6. **`design-system.mermaid`** — diagramme flux tokens → components.
7. **`checklist-a11y.md`** — checklist WCAG 2.2 AA auto-générée à partir des composants choisis.
8. **Export Figma-ready** : JSON compatible plugin Tokens Studio / Design Tokens (via `$type` DTCG).

## 8. Modèle de données conceptuel

Table principale `design_systems` (1 par projet) + sous-tables. Alternative : tout stocker en `content` JSON dans la section existante `design` pour rester simple en MVP.

```
design_systems
  id, project_id (FK), name, version, created_at, updated_at

design_tokens
  id, design_system_id, tier (primitive|semantic|component),
  category (color|space|typography|radius|shadow|motion),
  name, value, reference (FK self, nullable = alias),
  description, deprecated (bool)

design_components
  id, design_system_id, name, category (atom|molecule|organism),
  purpose, mvp_priority (must|should|nice), a11y_notes

component_variants
  id, component_id, variant_name, size, state, token_refs (jsonb)

design_patterns
  id, design_system_id, pattern_type (empty|loading|error|success|form|list|search),
  template_md, last_used_at
```

**Recommandation MVP Mindeck** : ne pas créer 4 nouvelles tables tout de suite. Stocker un JSON unique dans `sections.content` (section `design`) avec la structure ci-dessus. Promouvoir en tables dédiées seulement si Anthony ouvre Mindeck à d'autres users ou veut versionner.

## 9. Pièges classiques à éviter

1. **Tokeniser sans sémantique** — avoir `color-blue-500` partout mais jamais `bg-primary`. Changement de marque = refonte totale. (Nathan Curtis, 2017 : "primitives are options, semantic are choices").
2. **Variant explosion** — 1 600 variants pour un bouton. Signal que le composant fait trop de choses ; découpe-le.
3. **Composants sans état `focus` visible** — tu casses l'accessibilité clavier. WCAG 2.4.7.
4. **Atomic Design pris comme dogme** — Brad Frost lui-même dit que ça ne couvre ni le motion, ni les flows, ni les business rules. C'est un squelette, pas une bible.
5. **Pas de versioning des tokens** — tu renommes `color.primary` en `color.accent`, 3 apps cassent. Toujours `deprecate` avant `delete`.
6. **Designer les composants avant les tokens** — tu figes des pixels, puis tu dois les extraire à la main. Sens inverse : tokens d'abord, composants ensuite.
7. **Empty state oublié** — ton écran vide est la première impression du produit (onboarding, 0 résultat). Ne pas le designer = amateur.

## 10. Références autoritatives

- **W3C Design Tokens Format Module 2025.10** (spec stable) — [designtokens.org](https://www.designtokens.org/tr/drafts/format/) et [annonce version stable](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/).
- **Nathan Curtis — "Naming Tokens in Design Systems"** (EightShapes, Medium) — fondateur du modèle 3-tier.
- **Nathan Curtis — "Buttons in Design Systems"** (EightShapes) — 12 règles canoniques.
- **Brad Frost — Atomic Design** ([atomicdesign.bradfrost.com](https://atomicdesign.bradfrost.com/)) + son évolution subatomique (Design Systems Collective, 2025).
- **Material Design 3 — Design Tokens Overview** ([m3.material.io/foundations/design-tokens](https://m3.material.io/foundations/design-tokens/overview)) — modèle reference/system/component tokens.
- **Jina Anne — Design Tokens** (origine Salesforce Lightning, CSS-Tricks "What Are Design Tokens?", Smashing Podcast #3).
- **Radix Primitives** ([radix-ui.com/primitives](https://www.radix-ui.com/primitives)) — référence a11y WAI-ARIA.
- **Shopify Polaris** ([polaris.shopify.com](https://polaris-react.shopify.com/)) — architecture moderne web components.
- **Carbon Design System (IBM)** ([carbondesignsystem.com](https://carbondesignsystem.com/)) — patterns empty state + hiérarchie boutons.
- **Primer (GitHub)** ([primer.style](https://primer.style/)) — color system functional + multi-thèmes.
- **shadcn/ui** ([ui.shadcn.com](https://ui.shadcn.com/docs/components)) — liste composants de facto 2026.
- **Apple HIG** ([developer.apple.com/design/human-interface-guidelines](https://developer.apple.com/design/human-interface-guidelines)) — Liquid Glass 2026, principes Clarity/Deference/Depth.
- **Style Dictionary** ([styledictionary.com](https://styledictionary.com/info/dtcg/)) — pipeline tokens → multi-plateforme.
- **Smashing Magazine — Accessible Form Validation** (Schmitz, 2023) et **WebAIM — Form Validation** — patterns `aria-invalid` + `aria-describedby`.

## 11. Priorité MVP (Mindeck — outil perso)

**MUST (onglet Design v1) :**
- **Token editor 2-tier** (primitives + semantic) — le 3ème tier (component) est bonus.
- **Component checklist** avec 10 composants core : `Button`, `Input`, `Textarea`, `Select`, `Card`, `Modal`, `Toast`, `Badge`, `Tabs`, `EmptyState`.
- **Pattern picker** : 4 états (empty/loading/error/success) avec templates markdown.
- **Export Tailwind v4 `@theme`** (c'est ta stack actuelle, donc pragmatique).
- **Contrast checker inline** (ratio AA auto sur chaque paire).

Justification : Anthony construit Mindeck pour lui, en solo. Il a déjà une palette (beige/moka/navy/caramel) et des composants existants. Le besoin réel c'est **formaliser l'existant + combler les trous** (empty states, a11y), pas tout reconstruire.

**SHOULD (v2) :**
- 3ème tier component tokens.
- Component matrix builder (variants × states × sizes).
- Export W3C JSON (utile si Anthony veut syncer Figma un jour).
- Mermaid diagram du design system.
- Variant explosion alarm.

**NICE (v3+) :**
- Token versioning + deprecation workflow.
- Export Figma Tokens plugin.
- Density switcher intégré au token editor.
- Motion tokens (durations, easings).
- Dark/light automatique via alias tokens (déjà fait en CSS, intégrer dans l'UI token editor).

## 12. Estimation complexité d'implémentation

| Bloc | Taille | Justification |
|------|:------:|---------------|
| Component checklist + export markdown basique | **S** | UI statique, 30 checkboxes, template md. 1-2 jours. |
| Pattern picker (4 états) + templates | **S** | Bibliothèque statique, copy-paste. 1 jour. |
| Contrast checker inline | **S** | Formule WCAG (luminance ratio), fonction pure. 0.5 jour. |
| Export Tailwind v4 `@theme` | **S** | Concaténation string à partir des tokens semantic. 0.5 jour. |
| **Token editor 2-tier (MUST)** | **M** | CRUD tokens + preview live + validation alias + drag mapping primitive→semantic. 3-5 jours. |
| Export W3C JSON (format 2025.10) | **M** | Sérialisation conforme spec (`$type`, `$value`, aliases `{…}`). 1-2 jours. |
| **Token editor 3-tier** | **L** | Ajoute component tokens + validation cross-niveau + cycle detection. 1 semaine. |
| **Component matrix builder + playground** | **L** | Grille dynamique variants × states × sizes avec preview réel. State management lourd. 1-2 semaines. |
| Mermaid diagram auto-généré | **M** | Génération string à partir du graphe de dépendances des tokens. 1-2 jours. |
| **Design system versioning + deprecation** | **XL** | Schéma DB dédié, migration, diff viewer, changelog auto. 3+ semaines. Non-MVP. |

**Verdict pragmatique pour Mindeck** : commence par le bloc **S + M MUST** (token editor 2-tier + checklist + patterns + export Tailwind) = **~1 semaine de dev**. Tout le reste attend un vrai besoin.

---

**Critique honnête pour finir :** Atomic Design a 10 ans et Brad Frost lui-même a publiquement reconnu ses limites. La hiérarchie atoms → molecules → organisms est un modèle mental utile pour découper, pas une architecture. Le vrai moteur d'un design system en 2026, c'est le **token pipeline** (primitives → semantic → component, format W3C) et la **rigueur sur les états** (focus, disabled, empty, loading, error). Le reste est de la cosmétique.

Sources principales citées :
- [W3C DTCG — Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/)
- [Nathan Curtis — Naming Tokens](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676)
- [Brad Frost — Atomic Design](https://atomicdesign.bradfrost.com/)
- [Material 3 — Design Tokens](https://m3.material.io/foundations/design-tokens/overview)
- [Radix Primitives](https://www.radix-ui.com/primitives)
- [Carbon Design System — Empty States](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- [Primer (GitHub)](https://primer.style/)
- [Shopify Polaris](https://polaris-react.shopify.com/)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Style Dictionary + DTCG](https://styledictionary.com/info/dtcg/)
- [Smashing — Accessible Form Validation](https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/)
- [CSS-Tricks — What Are Design Tokens? (Jina Anne)](https://css-tricks.com/what-are-design-tokens/)
- [Design Systems Collective — From Atomic to Subatomic (Brad Frost interview)](https://www.designsystemscollective.com/from-atomic-to-subatomic-brad-frost-on-design-systems-tokens-and-the-human-side-of-ui-189609dd9ac8)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines)
