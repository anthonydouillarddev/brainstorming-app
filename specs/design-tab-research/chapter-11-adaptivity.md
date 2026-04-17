# Chapitre 11 — Adaptativité : responsive, dark mode, densité

> Livrable brut de l'Expert 11 (general-purpose).
> Couvre : mobile-first (Wroblewski), breakpoints, fluid typography (Utopia), container queries, dark mode OKLCH perceptuel, tonal surfaces (Material 3), densité, PWA.

## 1. Objectif du chapitre

Ton app doit être belle et utilisable **partout** : sur un petit téléphone dans le métro, sur un écran 4K au bureau, en pleine nuit avec le mode sombre, ou par ton grand-père qui veut du texte plus gros. Ce chapitre t'apprend à construire une interface **qui s'adapte toute seule** au lieu de casser. L'idée-clé : une seule app, mille contextes.

## 2. Questions clés à poser à l'user

1. **Sur quel écran ton user passera-t-il le plus de temps ?** / *Téléphone, tablette, laptop, grand écran, ou mix ?*
2. **Est-ce que l'usage mobile est secondaire ou central ?** / *Si tu enlèves le desktop demain, ton produit fonctionne encore ?*
3. **Dark mode : stratégique ou cosmétique ?** / *Tes users travaillent-ils souvent le soir/la nuit ?*
4. **Veux-tu laisser l'user choisir son thème ou suivre l'OS ?** / *Respect strict de `prefers-color-scheme` ou override explicite possible ?*
5. **Ton audience est-elle plutôt power user (dense) ou grand public (aéré) ?** / *Linear/Notion dense, ou Apple/Stripe aéré ?*
6. **Quelles densités veux-tu proposer ?** / *Une seule, ou 3 modes compact/normal/confortable ?*
7. **Ton app sera-t-elle installable (PWA) ou uniquement web ?** / *Icône home-screen, offline, safe-area iPhone ?*
8. **Les composants doivent-ils s'adapter au conteneur ou à la fenêtre ?** / *Besoin de container queries (une card qui change selon sa largeur, pas celle de l'écran) ?*
9. **Fluid typography ou tailles fixes par breakpoint ?** / *Texte qui grandit en continu avec `clamp()` ou qui saute par paliers ?*
10. **Accessibilité motion : respecter `prefers-reduced-motion` ?** / *Animations désactivables pour users vestibulaires ?*
11. **Thème personnalisable par l'user (accent color picker) ?** / *Un seul thème de marque, ou l'user choisit son accent ?*
12. **Tu vises des touch targets de combien ?** / *44px Apple HIG, 48dp Material, ou plus généreux ?*

## 3. UX du chapitre — 3 modes progressifs

**Mode Débutant (l'enfant de 12 ans)**
- 5 breakpoints pré-cochés (Tailwind standard : `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`)
- **Toggle "Mobile-first ?"** → par défaut ON avec explication "on dessine d'abord pour le petit écran, puis on ajoute des choses pour les grands"
- **Preview dark mode en 1 clic** : bouton soleil/lune qui inverse instantanément la preview
- **Slider densité** : 3 positions (Compact / Normal / Confortable) avec live preview sur une card exemple
- **Checklist mobile** : "Mes boutons font ≥ 44px ?", "Le texte est lisible à 1 bras de distance ?", "L'app marche en mode portrait ?"

**Mode Intermédiaire**
- Breakpoints custom (ajout/retrait), avec warning si on s'écarte des standards sans raison
- **Dark tokens auto-générés** depuis les light tokens (inversion perceptuelle en OKLCH, pas bêtement `255 - r`)
- **Container queries picker** : marque un composant comme "adaptatif au conteneur" → génère `@container` au lieu de `@media`
- **Safe area tester** : preview avec notch iPhone, home indicator, barre de status Android
- Densité : possibilité de définir les 3 échelles précisément (compact = ×0.85, normal = ×1, confortable = ×1.15)

**Mode Expert**
- **Fluid type clamp() builder** style Utopia.fyi : min-viewport / max-viewport / min-size / max-size → sort un `clamp()` en `rem` avec fallback
- **Tonal surfaces editor** (Material 3) : 6 niveaux d'élévation en dark mode (`surface`, `surface-container-lowest/low/normal/high/highest`) avec overlay d'opacité calculé
- **Multi-device preview side-by-side** : iPhone SE 375 / iPad 768 / MacBook 1440 / Ultrawide 2560 simultanés
- **Container query designer** : paramètre (composant, conteneur-cible, seuil) → règles `@container` générées
- **Motion override editor** : define quelles animations s'arrêtent avec `prefers-reduced-motion: reduce`
- **Accent picker avancé** : color wheel OKLCH avec aperçu contraste sur light + dark simultanément

## 4. Widgets / générateurs à implémenter

1. **Breakpoint picker** — radio "Tailwind standard" vs "custom", éditeur tabulaire si custom, warning si > 6 breakpoints ("trop de breakpoints = chaos").
2. **Dark mode auto-generator** — prend tes light tokens en OKLCH, inverse la lightness (`L` → `1 − L` approximatif, puis ajustements perceptuels : backgrounds ne vont jamais à L=0, textes ne vont jamais à L=1), préserve chroma et hue. Preview côte-à-côte.
3. **Multi-device preview** — frames réelles (iPhone 15 Pro 393×852, iPad Air 820×1180, MacBook 1440×900). Scroll synchronisé optionnel.
4. **Fluid type builder (Utopia-style)** — 2 sliders (viewport min/max en px, taille min/max en rem), sortie `clamp(1rem, 0.5rem + 1.5vw, 1.5rem)` avec courbe visuelle.
5. **Touch target audit** — scan automatique du design : tout clickable < 44×44 px sur mobile est surligné rouge.
6. **Safe area tester** — applique `env(safe-area-inset-*)` en preview, montre où passe le notch et le home indicator.
7. **Density slider** — 3 positions, impacte `--space-*`, `--font-size-base`, `--control-height`. Live preview sur un panneau de 5-6 composants représentatifs (input, button, card, list item, menu).
8. **Container query designer** — sélectionne un composant, définit ses breakpoints internes (narrow / wide), génère les règles `@container`.
9. **Elevation editor (dark mode)** — 6 surfaces tonales Material 3, ajuste l'opacité du white-overlay par niveau.
10. **Accent color picker avec contrast guard** — l'user choisit un accent, le widget vérifie AA/AAA sur light ET dark, suggère un ajustement si KO.
11. **Motion settings** — liste des animations de l'app, case "respecter reduced-motion" par animation.
12. **Responsive image helper** — génère le markup `picture/srcset/sizes` + formats AVIF > WebP > JPEG fallback.

## 5. Règles de validation automatique

- **Texte `#FFFFFF` sur `#000000` en dark** → alerte "contraste excessif, fatigue oculaire, utilise `oklch(0.96 0 0)` sur `oklch(0.12 0.02 260)`" (source : Evil Martians, Material 3).
- **Touch target < 44×44 px sur breakpoint mobile** → BLOQUANT (Apple HIG) ou < 48×48 dp (Material).
- **Breakpoints non-standards sans justification écrite** → alerte (pas bloquant).
- **Dark mode = inversion naïve RGB** → BLOQUANT, force le passage en OKLCH.
- **Ombres `box-shadow` en dark mode sans tonal surface** → alerte "les ombres ne se voient pas sur fond sombre, utilise l'élévation par teinte de surface".
- **Font-size < 16 px sur inputs mobile** → alerte (iOS zoom automatique si < 16px).
- **Aucune container query alors que le composant apparaît dans plusieurs contextes** → suggestion.
- **Pas de `prefers-reduced-motion` respecté alors que > 2 animations définies** → alerte accessibilité.
- **Densité unique "compact" forcée sans override user** → alerte (power users oui, mais à imposer à tous = exclusion).
- **Pas de `viewport-fit=cover` + safe-area sur app installable** → alerte.
- **Images sans `srcset` pesant > 200 KB** → alerte perf mobile.

## 6. Contenus pédagogiques

- **Tooltip "Mobile-first"** : "Tu commences par la version téléphone (petite, simple) puis tu ajoutes pour grand écran. C'est plus facile que l'inverse, promis." (Luke Wroblewski, 2011, toujours d'actualité en 2026.)
- **Mini-leçon "Pourquoi OKLCH ?"** : "HSL ment sur la luminosité. Un jaune HSL 50% et un bleu HSL 50% ne font pas la même brillance pour tes yeux. OKLCH corrige ça → inversions dark mode propres."
- **Tooltip "Container queries"** : "Media queries = la fenêtre du navigateur. Container queries = le conteneur du composant. Si ta card vit dans une sidebar ET en grande largeur, container queries gagnent."
- **Mini-leçon "Tonal surfaces"** : "En dark mode, les ombres disparaissent. Pour montrer qu'un élément est 'au-dessus', on l'éclaircit légèrement au lieu d'ajouter une ombre." (Material 3)
- **✓** : `clamp(1rem, 0.5rem + 1.5vw, 1.5rem)` — texte fluide entre 16px et 24px.
- **✗** : `font-size: 14px; @media (min-width: 768px) { font-size: 18px; }` — saute d'un coup, pas fluide.
- **✓** : accent OKLCH 0.55 0.15 45 → même perception en light et dark.
- **✗** : `#FFFFFF` sur `#000000` → contraste brut 21:1, ça brûle les yeux la nuit.
- **Tooltip "Safe area"** : "iPhone a une encoche et un trait en bas. `env(safe-area-inset-*)` dit au browser de pas mettre ton bouton dessous."

## 7. Outputs générés

- **Tailwind v4 config** : breakpoints (via `@theme { --breakpoint-*: }`), container queries activées, dark mode `class` ou `media`, density variants custom.
- **CSS variables light + dark** : set complet en OKLCH, définies sur `:root` et `.dark` (ou `@media (prefers-color-scheme: dark)`).
- **Density classes CSS** : `html.density-compact`, `html.density-comfortable` overridant `--space-*` et `--font-size-base` (déjà le pattern utilisé dans Mindeck).
- **Responsive spec Markdown** : table des breakpoints, comportement de chaque composant par breakpoint, container queries utilisées.
- **Preview HTML autonome** : multi-device côte-à-côte pour partager avec le client/équipe.
- **Design tokens JSON** (format Style Dictionary / W3C Design Tokens) : light + dark + densités.
- **Checklist QA** : touch targets, contrastes, safe areas, reduced-motion vérifiés.

## 8. Modèle de données conceptuel

Champs à stocker (dans une section `adaptativity` du brainstorm ou table dédiée si on veut la persistance fine) :

- `strategy` : `mobile_first | desktop_first | fluid`
- `breakpoints` : `{ name, min_width }[]` (défaut Tailwind)
- `fluid_typography` : `{ enabled, viewport_min, viewport_max, size_min, size_max }`
- `dark_mode` : `{ strategy: 'auto'|'class'|'manual', elevation_levels: number, tonal_overlay_opacity: number[] }`
- `densities` : `{ compact: number, normal: number, comfortable: number }` (multiplicateurs)
- `default_density` : `compact | normal | comfortable`
- `touch_target_min` : number (px, défaut 44)
- `safe_area_enabled` : boolean
- `container_queries` : `{ component, thresholds: number[] }[]`
- `motion_respect_reduced` : boolean
- `accent_customizable` : boolean
- `accent_default_oklch` : `{ l, c, h }`
- `devices_targeted` : `('mobile'|'tablet'|'desktop'|'tv'|'watch')[]`
- `pwa_installable` : boolean

## 9. Pièges classiques à éviter

1. **Pure black `#000` sur pure white `#FFF` en dark** — contraste 21:1, fatigue oculaire, halation. Utiliser `oklch(0.12-0.18 …)` pour bg sombre et `oklch(0.92-0.96 …)` pour texte clair (Evil Martians, Material 3).
2. **Media queries uniquement, pas de container queries** — en 2026, si ton composant apparaît dans plusieurs conteneurs (sidebar + main), container queries sont quasi obligatoires (Tailwind v4, Chrome/Safari/FF support depuis 2023).
3. **Desktop-first en 2026** — ~60% du trafic web est mobile (StatCounter 2025). Designer desktop d'abord = réduire/casser ensuite. Mobile-first = progressive enhancement.
4. **Dark mode = inversion RGB naïve** — un rouge vif sur fond blanc devient un rouge sombre sur fond noir = moche et illisible. Inverser la lightness en OKLCH, garder chroma et hue.
5. **Densité forcée sans choix user** — imposer "compact" à tous exclut seniors et users tactiles. Toujours offrir un switch (comme Linear, Gmail, Mindeck).
6. **Font-size `< 16px` sur inputs mobile** — iOS zoom automatiquement, UX cassée.
7. **Ombres `box-shadow` en dark mode** — invisibles. Utiliser tonal surfaces (Material 3) : chaque niveau d'élévation = +X% de blanc en overlay.
8. **Breakpoints basés sur des devices nommés** ("iPhone breakpoint") — les devices changent tous les ans. Baser sur le contenu : à quel moment ta mise en page casse ? Là tu mets un breakpoint.
9. **Oublier `prefers-reduced-motion`** — ~35% des users ont la préférence activée (Apple 2024). Animations non-désactivables = problème accessibilité vestibulaire.
10. **Safe area ignorée sur PWA installée** — boutons sous le home indicator iPhone = inatteignables.
11. **Testing uniquement Chrome DevTools** — Safari iOS a des comportements uniques (`100vh` bug, safe-area, scroll bounce). Tester sur vrai device.
12. **Fluid typography sans garde-fous** — un `clamp()` mal calibré peut donner du 80px sur ultrawide. Toujours un max raisonnable.

## 10. Références autoritatives

1. **Luke Wroblewski — "Mobile First" (2011, A Book Apart) + blog lukew.com** — référence fondatrice mobile-first, toujours valide.
2. **Utopia.fyi — Fluid design calculators** (James Gilyead & Trys Mudford) — méthode canonique pour fluid typography et spacing avec `clamp()`.
3. **Material Design 3 — Adaptive design + Dark theme + Tonal surfaces** (m3.material.io) — référence Google, tonal elevation, color system HCT proche de OKLCH.
4. **Apple Human Interface Guidelines — Dark Mode, Size Classes, Safe Areas** (developer.apple.com/design/human-interface-guidelines) — 44pt touch target, layout adaptatif.
5. **Evil Martians — "OKLCH in CSS: why we moved from RGB and HSL"** (2023, evilmartians.com) — pourquoi OKLCH bat HSL pour dark mode et design tokens.
6. **Tailwind CSS v4 docs — Container queries, `@theme`, dark mode** (tailwindcss.com) — référence d'implémentation actuelle.
7. **Smashing Magazine — "Responsive Design in 2025"** (articles Ahmad Shadeed, Adam Argyle) — state of the art container queries, fluid, subgrid.
8. **Adam Argyle (Google Chrome DevRel) — web.dev articles sur adaptive design, color, dark mode** — tonal surfaces implémentation web.
9. **Ahmad Shadeed — "Defensive CSS" + blog ishadeed.com** — pièges responsive concrets, container queries.
10. **Figma — Auto layout + Variables + Modes** (help.figma.com) — référence outil pour design tokens light/dark/density en modes.
11. **MDN — `prefers-color-scheme`, `prefers-reduced-motion`, `@container`, `env()`** — spec officielle.
12. **WCAG 2.2 — Target Size (2.5.8 AA = 24×24 CSS px, 2.5.5 AAA = 44×44)** — normes officielles touch/click target.

## 11. Priorité MVP

**Must (V1)**
- Breakpoints Tailwind standard pré-cochés + toggle mobile-first
- Dark mode avec inversion OKLCH (pas RGB)
- Slider densité 3 modes avec live preview
- Touch target audit automatique (≥ 44px)
- Preview light ↔ dark 1-clic
- CSS variables générées light + dark
- Respect `prefers-color-scheme` par défaut + override user

**Should (V2)**
- Fluid type builder `clamp()` (style Utopia)
- Container queries picker
- Multi-device preview (mobile/tablet/desktop)
- Safe area tester (notch iPhone)
- Tonal surfaces editor dark mode
- Accent color picker avec contrast guard
- Export design tokens JSON (W3C)

**Nice (V3)**
- Breakpoints custom avec warnings
- Motion override editor par animation
- Ultrawide & TV preview
- PWA manifest generator
- Dark mode auto-adjust chroma (désaturation douce)
- Accessibility score global du design (touch + contrast + motion + densité)

## 12. Estimation complexité d'implémentation

- **S** : Breakpoints picker standard, toggle mobile-first, preview dark 1-clic, slider densité (patterns déjà présents dans Mindeck via `html.density-*`).
- **M** : Dark mode auto-generator OKLCH (besoin d'une lib OKLCH ou conversion maison + preview), container queries picker, safe area tester, touch target audit.
- **L** : Fluid type builder style Utopia (maths + preview courbe), multi-device preview side-by-side synchronisé, tonal surfaces editor Material 3, export design tokens W3C.
- **XL** : Accessibility score global multi-critères, PWA generator complet (manifest + service worker + icônes multi-résolutions), motion editor par animation avec preview timeline, design system preview cross-platform (web + iOS/Android simulated).

**Recommandation d'ordre** : V1 (S+M light) → dark OKLCH + densité + touch audit → V2 fluid + container + tonal surfaces → V3 score global + PWA.

---

**Note honnête sur les "best practices" datées** : 
- "Mobile-first" (2011, Wroblewski) est toujours valide en 2026, mais on parle maintenant plus de **fluid/adaptive design** que de breakpoints mobile vs desktop.
- Les **breakpoints fixes "iPhone/iPad"** (Bootstrap 2014) sont **obsolètes** : on base sur le contenu, pas les devices.
- HSL pour les design tokens (standard 2015-2022) est **dépassé** : OKLCH est la norme en 2026 (Chrome/Safari/FF supportent depuis 2023).
- Dark mode "inversion" des années 2019 (iOS 13 early) = naïf, les vrais systèmes (Material 3, Apple 2023+) utilisent des tokens sémantiques + tonal surfaces.
- Les media queries **seules** (sans container queries) sont **datées 2023** : aujourd'hui on mixe les deux.
