# Refonte onglet Design — Recherche & Workflow

> Document de synthèse Phase 3. Agrège les 12 analyses expertes + la veille concurrentielle.
> Décisions validées avec Anthony le 2026-04-17 (voir §0 ci-dessous).
> Dernière mise à jour : 2026-04-17.

---

## 0. Décisions validées — 2026-04-17

Après discussion Phase 4 entre Anthony et l'assistant, les 10 décisions suivantes sont prises et servent de base à l'implémentation.

### Architecture produit
1. **Scope** : SaaS public monétisé (pivot depuis "outil perso"). IA (vibe extractor ML, microcopy LLM, reformulations) en **v2/v3**, pas en MVP. Prévoir dans le modèle de données un emplacement `ai_suggestion` sur chaque widget clé + bouton "Suggérer avec l'IA" désactivé en v1.
2. **Modes progressifs** : mode global persistant (stocké dans `user_preferences`) + override par sous-onglet (stocké dans le JSON `sections.content`).
3. **Stratégie de construction** : **hybride** — chap. 6 Visuel livré à fond d'abord (killer feature vendable en standalone), puis MUST étendu des 11 autres chapitres (coquille complète), puis profondeur selon usage réel observé.
4. **Scope chap. 6** : MVP complet 6 semaines avec 10+ widgets (palette OKLCH generator, contrast checker live, typography scale builder, spacing scale builder, live preview, moodboard 8 vibes, font pairing picker, dark mode perceptuel, export CSS/Tailwind v4/W3C JSON/markdown, neutral generator, semantic colors generator).

### Naming & UI
5. **Nom de l'onglet** : `Design` (court, universel, compris par tous).
6. **Naming des 3 modes** : `Simple` / `Avancé` / `Pro` (valorisant, évite "Débutant").
7. **Langue du contenu pédagogique** : français uniquement en MVP. Sélecteur de langue global sera ajouté à toute l'application Mindeck après le MVP (architecture pas i18n-ready en v1).
8. **Icônes du mini-menu vertical** : emoji (cohérent avec Mindeck actuel, pas de nouvelle dépendance Lucide).

### Process de rédaction & scope
9. **Rédaction des tooltips / mini-leçons / exemples** : Claude génère les premiers jets en batch à partir des livrables des agents experts, Anthony valide en lot.
10. **Scope Phase 2 (11 autres chapitres)** : **MUST étendu** — MUST recommandé par chaque agent + quelques SHOULD forts par chapitre (ex : Preview live du chap. 2, Accessibility statement EAA generator du chap. 10, SUS calculator du chap. 12). ~13-14 semaines au total pour la Phase 2.

### Décisions automatiques (non posées en Phase 4, dérivées du choix "MUST étendu")
- Chap. 2 Identité : 8 archétypes simplifiés (pas 12 Jung classiques). Reco agent expert.
- Chap. 3 Info & Nav : Tree Test simulator reporté en NICE (trop cher).
- Chap. 5 Principes UX : Gestalt screenshot review reporté en NICE.
- Chap. 7 Design system : tokens 2-tier en MUST, 3-tier en SHOULD reporté.
- Chap. 10 A11y : accessibility statement EAA generator **inclus** en SHOULD fort.
- Chap. 12 Validation : SUS calculator **inclus** en SHOULD fort.

### Ordre d'implémentation validé

```
Phase 1 — "Killer feature vendable" (~6 semaines)
  └─ Chap. 6 Visuel (MVP complet)

Phase 2 — "Coquille complète" (~13-14 semaines)
  ├─ Mini-menu vertical + mode global/override + barre complétude  (~1 sem)
  ├─ Chap. 7 Design system (MUST étendu)                            (~2 sem)
  ├─ Chap. 10 Accessibilité (MUST étendu avec EAA statement)        (~2 sem)
  ├─ Chap. 11 Adaptativité (MUST)                                   (~1 sem)
  ├─ Chap. 1 Fondations (MUST)                                      (~1 sem)
  ├─ Chap. 2 Identité (MUST étendu avec Preview live)               (~2 sem)
  ├─ Chap. 8 États (MUST étendu)                                    (~2 sem)
  ├─ Chap. 9 Microcopy (MUST)                                       (~1 sem)
  ├─ Chap. 3 Info & Nav (MUST, sans Tree Test)                      (~1 sem)
  ├─ Chap. 4 Parcours (MUST)                                        (~1 sem)
  ├─ Chap. 5 Principes UX (MUST, sans Gestalt screenshot)           (~1 sem)
  └─ Chap. 12 Validation (MUST étendu avec SUS calculator)          (~1 sem)

Phase 3 — "Profondeur selon usage" (post-MVP)
  └─ SHOULD + NICE des chapitres à forte valeur mesurée
```

**Total MVP vendable** : ~20 semaines (5 mois solo dev senior).

---

---

## 1. Résumé exécutif

L'onglet Design actuel de Mindeck est un simple formulaire plat à 9 champs, sans valeur ajoutée au-delà du brainstorm. La refonte vise à en faire **LE meilleur assistant de réflexion design pour un projet numérique**, utilisable par un enfant de 12 ans ET un designer expert grâce à **3 modes progressifs** (Débutant / Intermédiaire / Expert), des **générateurs intelligents**, des **garde-fous automatiques** et de la **pédagogie in-app**. 12 chapitres identifiés couvrent de la stratégie (fondations, marque) à la validation (tests, métriques), en passant par la structure (IA, flows), le comportemental (principes UX, états), le visuel (couleur/typo/spacing, tokens, a11y, adaptativité) et l'écriture UX. La veille concurrentielle révèle **un gap de marché** : aucun outil ne couple la stratégie produit aux design tokens avec pédagogie intégrée. Mindeck peut être le premier.

---

## 2. Cartographie des 12 chapitres

```
STRATÉGIQUE ──┬── 1. Fondations stratégiques       (JTBD, personas, principes)
              └── 2. Identité de marque & ton      (archétype, voice & tone)

STRUCTUREL ───┬── 3. Architecture de l'information (IA, sitemap, nav)
              └── 4. Parcours & flows              (journey, onboarding, aha)

COMPORTEMENTAL ─── 5. Principes & lois UX          (Nielsen, Norman, Yablonski)

VISUEL ───────┬── 6. Design visuel                 (couleur/typo/spacing)
              ├── 7. Système de design             (tokens, composants)
              └── 8. États & micro-interactions    (loading/empty/error)

ÉDITORIAL ──────── 9. Écriture UX & microcopy      (boutons, erreurs, messages)

CONTRAINTES ──┬── 10. Accessibilité & inclusion    (WCAG AA, EAA)
              └── 11. Adaptativité                 (responsive, dark, densité)

BOUCLE ─────────── 12. Validation & itération      (5-user tests, SUS, PMF)
```

**Ordre logique** : double diamant compressé (Discover → Define → Develop → Deliver → Measure). Compatible avec la maturité d'un projet Mindeck (chap. 1 tôt, chap. 6-7 en build, chap. 12 post-lancement).

---

## 3. Workflow utilisateur proposé

### 3.1 Navigation (mini-menu vertical)

```
┌─ ONGLET DESIGN ───────────────────────────────────────┐
│ ┌─────────────────┐  ┌────────────────────────────┐  │
│ │ 📐 Fondations   │  │                            │  │
│ │ 🎨 Identité     │  │  Contenu du sous-onglet    │  │
│ │ 🧭 Info & Nav   │  │  actif (générateurs +      │  │
│ │ 🛣️  Parcours     │  │   pédagogie + preview)    │  │
│ │ 🧠 Principes UX │  │                            │  │
│ │ 🎨 Visuel       │  │                            │  │
│ │ 🧱 Système      │  │                            │  │
│ │ ⚡ États        │  │                            │  │
│ │ ✍️  Microcopy    │  │                            │  │
│ │ ♿ Accessibilité │  │                            │  │
│ │ 📱 Adaptativité │  │                            │  │
│ │ 🧪 Validation   │  │                            │  │
│ └─────────────────┘  └────────────────────────────┘  │
│                                                       │
│ Mode global : [ Débutant ] [ Intermédiaire ] [ Expert ]│
│ Complétude globale : ████████░░ 62%                   │
└───────────────────────────────────────────────────────┘
```

### 3.2 Logique de progression

- **Mode global persistant** (localStorage + `user_preferences`) qui s'applique par défaut à tous les sous-onglets.
- **Override par sous-onglet** possible (ex : Débutant partout mais Expert sur Visuel).
- **Auto-complétion intelligente** : les réponses du chap. 1 (cible, type) pré-remplissent les presets des chap. 6-7 (palette, composants).
- **Barre de complétude par chapitre + globale** (% champs remplis, inspirée de l'auto-collapse brainstorm existant).
- **Navigation libre** (pas imposée) mais avec badges "Prérequis manquant" si un chapitre dépend d'un autre.

### 3.3 Pédagogie transverse

Chaque sous-onglet expose trois couches :
1. **Questions guidées** (mode Débutant) — langue simple, une question à la fois
2. **Générateurs actifs** (mode Intermédiaire) — l'outil fait le travail lourd, l'utilisateur décide
3. **Éditeurs experts** (mode Expert) — liberté totale + validation automatique WCAG/cohérence

**Exports par chapitre** : markdown (pour Claude/Notion), JSON (pour Figma/dev), CSS variables, Tailwind v4 config selon pertinence.

---

## 4. Détail par sous-onglet

### 4.1 Chapitre 1 — Fondations stratégiques

- **Objectif** : avant de dessiner un bouton, savoir pour qui, pourquoi, quel résultat désiré. Sans ça, toutes les décisions design tournent dans le vide.
- **Questions clés** : JTBD (Ulwick), 1-3 personas, job stories (Intercom), positionnement Dunford, aha moment mesurable, 3-5 principes design opposables, anti-goals.
- **Inputs UI** :
  - Débutant : conversation guidée 10 étapes, exemples pré-remplis
  - Intermédiaire : formulaire structuré + sliders d'attributs + sidebar résumé live
  - Expert : canvas Miro-like (JTBD, personas, positionnement, aha, principes, anti-goals)
- **Widgets** : générateur JTBD statement (format Ulwick), générateur Job Story, bibliothèque proto-personas par type de projet, Positioning Canvas Dunford 5 composantes, Aha Moment Definer (événement mesurable), Principes Design Generator (opposables), Anti-goals builder, Concurrent Mapper 2×2.
- **Validations auto** : > 3 personas MVP → alerte ; Job story sans "quand" → refus ; JTBD contenant une solution → refus ; aha moment non mesurable → alerte rouge ; principes non opposables → alerte ; > 5 principes → alerte.
- **Outputs** : `foundations.md`, `foundations.json` (réutilisé par chap. suivants), carte d'identité PDF 1 page, brief Claude/ChatGPT, checklist de décision 10 questions.
- **Modèle de données** : JSON dans `sections.content` avec `section_key = "foundations"` — `jtbd_core`, `job_stories[]`, `personas[]` (max 3), `positioning_*` (5 champs Dunford), `aha_moment_{event, threshold}`, `design_principles[]` (max 5), `anti_goals[]`.
- **Priorité MVP** : **MUST** — JTBD statement, 1 persona principal, aha moment mesurable, 3 principes opposables. Sans ça, aucune décision tranchable dans les chapitres suivants.
- **Complexité** : L (~4-6 jours solo). Principalement éditorial (templates + validations).
- **Sources clés** : Strategyn/Ulwick, Intercom (Job Stories), NN/g Personas, April Dunford, Design Council (Double Diamond), Amplitude (North Star), Shopify Polaris Experience Values.

---

### 4.2 Chapitre 2 — Identité de marque & ton

- **Objectif** : répondre à "si mon produit parlait, il ressemblerait à qui ?" et "qu'est-ce qu'il dit / ne dit jamais ?". Différenciation claire avec la section Brainstorm→Branding (brainstorm = intuition floue ; Design = système opérationnel).
- **Questions clés** : 3-5 brand attributes, position sur 4 axes NN/g (formel↔casual, sérieux↔drôle, respectueux↔irrévérencieux, enthousiaste↔factuel), vocabulaire banni, 3 brand references + 2 anti-references, voice & tone matrix par contexte, brand promise.
- **Inputs UI** :
  - Débutant : 8 cartes d'archétypes simplifiés et renommés en français (Sage, Créatif, Compagnon, Rebelle, Expert, Magicien, Héros, Ami)
  - Intermédiaire : 7 sliders (4 NN/g + 3 complémentaires) + glossaire DO/DON'T
  - Expert : Brand Identity Prism (Kapferer) + voice & tone matrix 5 contextes
- **Widgets** : Persona Picker, Voice Sliders, Voice & Tone Matrix (onboarding/erreur/succès/empty state/billing), Glossaire DO/DON'T, Brand Promise Generator (Dunford template), References/Anti-references, Preview live 4 micro-mockups (bouton, toast erreur, empty state, email bienvenue), Mood strip, Export markdown brand card.
- **Validations auto** : incohérence archétype × ton ; glossaire contradictoire (même mot DO + DON'T) → bloquant ; buzzwords dans promise ("leader", "innovant") → warning ; anti-ref = ref → erreur ; sliders tous extrêmes → suggestion ; verbal ↔ visuel décalés → alerte.
- **Outputs** : Brand Card markdown, Voice & Tone Guide (mode expert), `brand.json` réutilisé par chap. 9 (microcopy), Claude/ChatGPT prompt, snippets micro-copy pré-générés, PDF one-pager.
- **Modèle de données** : `brand_identity` (1 ligne par projet) — `archetype_key`, `attributes[]`, `voice_sliders{7 axes}`, `brand_promise`, `do_words[]`, `dont_words[]`, `references[]`, `anti_references[]`, `tone_matrix[]`, `prism{}` (expert).
- **Priorité MVP** : **MUST** — 8 archétypes + 7 sliders + glossaire DO/DON'T + Brand Promise + tone matrix 3 contextes min + export markdown + disclaimer honnête sur archétypes (pseudoscience, utile comme point de départ).
- **Complexité** : L (~10-15 jours solo). Code simple, contenu pédagogique lourd (8 archétypes × 30-40 DO/DON'T).
- **Sources clés** : Mailchimp Content Style Guide, Shopify Polaris Voice & Tone, Atlassian, IBM Carbon, NN/g 4 dimensions of tone, Jennifer Aaker (brand personality), Kapferer Prism, Marty Neumeier.

---

### 4.3 Chapitre 3 — Architecture de l'information & navigation

- **Objectif** : "qu'est-ce qu'il y a dans ton app, comment c'est rangé, comment on passe d'un endroit à l'autre". La carte du trésor — si elle est claire, l'utilisateur se sent chez lui.
- **Questions clés** : entités métier, profondeur du sitemap, primary job-to-be-done accessible en ≤1 clic, device cible, stratégie wayfinding, nav pattern (sidebar / top tabs / bottom nav), command palette, vocabulaire user vs dev.
- **Inputs UI** :
  - Débutant : "5 choses que ton user doit pouvoir faire" → mapping auto vers écrans + nav suggérée
  - Intermédiaire : sitemap builder drag & drop + nav pattern picker avec live preview
  - Expert : entity-relation mini-editor, tree test simulator, card sort, URL structure validator
- **Widgets** : Screen Picker "5 choses", Sitemap Builder DnD, Nav Pattern Selector (6 patterns avec mockups adaptés au type de projet), Entity-Relation Editor, Label Suggester (jargon → user), URL Map Generator, Breadcrumb Auto-generator, Command Palette Planner, Tree Test Light, Device Context Switcher.
- **Validations auto** : > 7 items nav principale → alerte Miller/Hick ; > 3 niveaux de profondeur → alerte ; labels contradictoires (Settings + Préférences) → erreur ; labels génériques (Divers, Autres, More) → warning ; orphan pages → alerte ; duplicate labels → erreur ; bottom nav mobile > 5 items → warning ; URL avec majuscules/espaces → erreur.
- **Outputs** : `sitemap.md`, `information-model.json`, `nav-spec.json`, `url-map.csv`, `labels-dictionary.json`, `command-palette.json`, `breadcrumbs-map.json`.
- **Modèle de données** : tables dédiées possibles — `ia_entities`, `ia_relations`, `ia_screens`, `ia_nav`, `ia_labels`, `ia_url_map`, `ia_tree_tests`. OU JSON unique dans `sections.content` pour MVP.
- **Priorité MVP** : **MUST** — Screen Picker, Sitemap Builder, Nav Pattern Selector (3 patterns min), validations Miller + profondeur + labels, export sitemap.md + url-map.csv.
- **Complexité** : L à XL (2-3 semaines MVP, 6-8 semaines version complète avec Tree Test).
- **Sources clés** : NN/g (IA Study Guide, Card Sorting, Tree Testing), Abby Covert, Optimal Workshop, Baymard, Material 3 Navigation, Apple HIG, Shopify Polaris, Linear method.

---

### 4.4 Chapitre 4 — Parcours utilisateurs & flows

- **Objectif** : dessiner les chemins que les gens empruntent, étape par étape, pour repérer les pièges avant que les utilisateurs tombent dedans.
- **Questions clés** : aha moment + position dans le funnel, critical path de l'onboarding, nombre de clicks/fields/steps, reverse trial vs gated signup, North Star Action, edge cases, courbe émotionnelle, recovery flows, referral trigger AARRR.
- **Inputs UI** :
  - Débutant : entonnoir 5 cases "raconte-moi en 5 étapes" + bouton "marquer comme aha moment"
  - Intermédiaire : flow builder (étapes chaînées + branches) + template d'onboarding pré-rempli par type de projet
  - Expert : journey map complet 5 colonnes × 6 dimensions (phases × actions/touchpoints/pensées/émotions/frictions/scores), critical path analyzer, friction score
- **Widgets** : Flow builder (export mermaid), Onboarding pattern picker (6 patterns : self-service, guided tour, empty state teaching, checklist, progressive disclosure, sample data), Friction counter, Aha moment finder, Journey map canvas, Critical path analyzer, North Star Action picker, Empty state generator.
- **Validations auto** : onboarding > 5 étapes → alerte ; signup avant value delivery → alerte anti-pattern SaaS moderne ; aucun aha moment marqué → bloquant ; signup form > 3 champs → alerte ; aucune émotion négative mappée → alerte (suspect) ; permissions demandées avant value → alerte.
- **Outputs** : User flow diagram (mermaid), journey map markdown, spec onboarding complète, friction report, critical path summary, AARRR dashboard template.
- **Modèle de données** : JSON dans section `design` — `user_flows[]`, `journey_map{phases[]}`, `onboarding_spec{pattern, step_count, aha_step_id, nsa, activation_metric}`, `friction_score{total, breakdown}`, `north_star_action{verb, segment, timeframe, value}`. Référençable depuis `todos` et `decisions`.
- **Priorité MVP** : **MUST** — mode Débutant (entonnoir 5 étapes + aha), North Star Action picker, onboarding pattern picker, friction counter simple. Le reste en SHOULD/NICE.
- **Complexité** : MUST en M (3-4 jours) ; version complète en L-XL (2-3 semaines).
- **Sources clés** : NN/g Journey Mapping, Baymard Checkout UX, Samuel Hulick (UserOnboard), Reforge (activation), Appcues, Chameleon, Google Ventures Sprint, Andrew Chen.

---

### 4.5 Chapitre 5 — Principes d'interaction & lois UX

- **Objectif** : les lois UX sont les règles du cerveau humain traduites en règles de design. Ton app s'aligne dessus ou se bat contre. Alignement = naturel.
- **Questions clés** : feedback <100ms sur chaque action, signifiers non ambigus, conventions Jakob's Law, messages d'erreur actionnables, cardinalité max visible, undo/escape routes, application de Fitts sur CTA critiques, Doherty threshold (<400ms), mental model alignment, Peak-End rule.
- **Inputs UI** :
  - Débutant : checklist linéaire des 10 heuristiques Nielsen, carte par carte, oui/non/je sais pas
  - Intermédiaire : audit par type d'écran (landing/auth/dashboard/form/list/detail/settings/empty/error) avec règles pré-filtrées
  - Expert : laws pickable (50+ lois filtrables avec reliability tag), Gestalt audit (upload screenshot + annotation), mental model mapping (3 colonnes : design model / system image / user model), bridges worksheet
- **Widgets** : Nielsen 10 audit, Laws of UX library (top 15 reliability=strong en MVP), Cognitive Load Meter (intrinsic/extraneous/germane), Affordance Checker, Feedback Inventory (visuel/sonore/tactile/délai), Fitts Target Calculator (44×44 iOS / 48×48 Android), Hick Menu Analyzer, Mental Model Canvas, Gestalt Screenshot Review, Peak-End Journey Mapper, Doherty Latency Log.
- **Validations auto** : > 7 items menu plat → flag Miller/Hick ; action destructive sans feedback → erreur critique ; latence > 1s sans skeleton → flag Doherty ; > 3 CTA primaires même poids → flag Von Restorff inversé ; pas d'undo sur réversible → flag H3 ; dark pattern confirmshaming détecté → flag éthique ; target tactile < 44px → flag Fitts ; > 5 couleurs sémantiques → flag extraneous load.
- **Outputs** : Design Principles Card (3-5 principes non négociables extraits des lois choisies), Heuristics Report (score /10 + top 3 fixes), Cognitive Load Summary, Mental Model Canvas PNG, Interaction Charter (doc final).
- **Modèle de données** : `interaction_audit` — `mode`, `nielsen_checklist{}`, `selected_laws[]` avec priorité, `cognitive_load_entries[]`, `affordance_checks[]`, `feedback_inventory[]`, `mental_model{}`, `gulfs{}`, `peak_end_map[]`, `violations[]`. Table seed `law_library` avec `reliability` (strong|medium|folklore) pour trier le sérieux du marketing.
- **Priorité MVP** : **MUST** — Nielsen 10 audit, Laws library (top 15), Affordance Checker, Feedback Inventory, Mental Model Canvas, Design Principles Card export.
- **Complexité** : MUST en S+M (~1 semaine) ; version complète en XL (avec Gestalt review, Figma lint plugin).
- **Sources clés** : Don Norman (Design of Everyday Things), Nielsen 10 heuristics, Jon Yablonski (Laws of UX), Sweller (Cognitive Load Theory), IxDF, NN/g Two UX Gulfs, Apple HIG, Material 3, UX Myths (vaccins anti-folklore).

---

### 4.6 Chapitre 6 — Design visuel : hiérarchie, typo, couleur, espacement

> **LE chapitre le plus dense et le plus différenciant**. C'est ici que l'utilisateur passe de "j'aime le bleu" à "design system OKLCH exportable vers Tailwind v4 + W3C JSON".

- **Objectif** : hiérarchiser ce qu'on regarde, choisir des polices qui respirent, fabriquer une palette qui tient la route (y compris dark mode + daltoniens), doser le vide entre les éléments.
- **Questions clés (15)** : focal point primaire/secondaire, pattern de lecture (F/Z/Gutenberg), densité d'info visée, contrast strategy, classification typo, mono vs duo-typeface, line-height/letter-spacing/measure, primary hue en OKLCH, stratégie dark mode, palette strategy, WCAG AA vs AAA, semantic colors strategy, base unit 4 vs 8, grille 12-col vs 8pt vs fluid.
- **Inputs UI** :
  - Débutant : "Choisis une vibe" (8 presets : Minimal/Bold/Playful/Corporate/Editorial/Brutalist/Warm/Tech) → palette 12 shades + neutrals + semantics + typo duo + spacing + radius + shadow générés automatiquement
  - Intermédiaire : pickers assistés (1 primary color → palette auto, typo pairing avec preview, base spacing + ratio)
  - Expert : design tokens editor complet (OKLCH curves, scale typo custom, spacing custom), WCAG audit live, export CSS/Tailwind/JSON/Figma
- **Widgets (10+)** :
  - **Color palette generator Radix-style** (1 primary → 12 shades OKLCH perceptuelles + alpha scales)
  - **Neutral generator** (gris avec teinte dérivée de primary — Refactoring UI)
  - **Semantic colors generator** (success/warning/error/info harmonisés)
  - **Contrast checker live WCAG + APCA** (toutes paires testées, seuils AA/AAA)
  - **Typography scale builder** (ratios 1.067 → 1.618, base 15-18px, fluid clamp optionnel)
  - **Font pairing picker** (~30 pairings testés, système + variable fonts)
  - **Spacing scale builder** (linéaire 4/géométrique/hybride Tailwind, density tokens)
  - **Live preview component** (button + card + form + navbar + liste, switch light/dark/density/viewport)
  - **Dark mode auto-invert perceptuel OKLCH** (pas inversion RGB naïve)
  - **Moodboard quick picker** (8 vibes) + **vibe extractor** optionnel (screenshot → tokens via k-means OKLCH)
  - **Accessibility simulator** (deuteranopia/protanopia/tritanopia)
  - **Export multi-format** (CSS vars, Tailwind v4 `@theme`, W3C DTCG JSON, Figma via Tokens Studio, markdown)
- **Validations auto (15)** : contraste body < 4.5:1 → bloquant rouge ; large text < 3:1 → bloquant ; UI < 3:1 → orange ; > 2 polices hors mono → orange ; > 10 font-sizes → orange ; > 4 font-weights → info ; line-height body hors 1.4-1.8 → orange ; measure hors 45-75 char → info ; spacing hors grille → info ; gris pur (sat=0) → info (Refactoring UI) ; saturation excessive dark mode → orange ; info only en couleur → rouge (daltoniens) ; 3+ radius différents → info ; 5+ shadows → info.
- **Outputs** : `design-tokens.css` (CSS vars `:root` + `[data-theme="dark"]`), `tailwind.theme.css` (v4 `@theme`), `tokens.w3c.json` (DTCG 2025.10), `brand.guidelines.md` (markdown Claude-ready), Figma export (Tokens Studio format), accessibility report.
- **Modèle de données** : `design_tokens` table ou JSON riche — `mode`, `vibe`, `colors{primary, neutral, semantic[], accent, alpha_scales}`, `typography{heading_font, body_font, mono, scale_ratio, base_size, fluid, line_heights, letter_spacings}`, `spacing{base_unit, scale_type, density_variants}`, `radius{}`, `shadows[0..5]`, `grid{}`, `accessibility{target_wcag, audit_result}`, `dark_mode{enabled, strategy, overrides}`, `exported_formats[]`. Liaison avec `user_preferences.display_density` existant.
- **Priorité MVP** : **MUST** — Color palette generator OKLCH, Contrast checker live, Typography scale builder, Spacing scale builder, Live preview, Moodboard 8 vibes (killer feature débutant), Export CSS + Tailwind + JSON, règles validation 1-7, modes Débutant + Intermédiaire complets.
- **Complexité** : **XL** — 5-7 semaines MVP solo dev senior (palette OKLCH est L, preview live est L, chaque widget additionnel M-L).
- **Sources clés** : Refactoring UI (Wathan/Schoger — référence #1), Radix Colors, Evil Martians (OKLCH in CSS), Material 3 (HCT color space), Apple HIG, Bringhurst (Elements of Typographic Style), Butterick's Practical Typography, Utopia.fyi (fluid type), Type Scale, Modern Font Stacks, WebAIM + APCA, Nathan Curtis (design tokens), W3C DTCG, Tailwind v4.

> **Mot de fin de l'expert** : ce chapitre seul pourrait être **un produit vendable en standalone**. Aucun concurrent ne fait palette OKLCH + typo scale + spacing + preview + export W3C dans un même outil. Ne pas sur-investir en vibe extractor ML avant d'avoir le MUST solide.

---

### 4.7 Chapitre 7 — Système de design : tokens, composants, patterns

- **Objectif** : la boîte de Lego. Définir une fois les briques (tokens + composants + patterns), les réutiliser partout. Sans tokens, changer une couleur = 87 fichiers à éditer.
- **Questions clés** : tokens réutilisés vs hardcodés, pipeline primitives→semantic→component, nombre de variants Button (éviter variant creep), 5 états par composant, dark mode via alias tokens, composants centralisés vs dupliqués, empty states, messages d'erreur enfant-compréhensibles, a11y (focus, contrasts, ARIA), export Figma/W3C, polices, spacing multiples de 4/8.
- **Inputs UI** :
  - Débutant : coche les composants nécessaires (30+ typiques pondérés par type de projet) + 3 couleurs principales → spec basique générée
  - Intermédiaire : token editor 2-tier (primitives + semantic) + composants pré-remplis (variants × states)
  - Expert : tokens 3-tier (primitives/semantic/component), component playground (variants × states × sizes matrix), pattern library
- **Widgets** : Token editor 3-tier, Component matrix builder (max 6 variants avec alerte), Component checklist (30+ composants), Pattern picker (empty/loading/error/success/form+validation/list+filter/search+autocomplete), Contrast checker inline par paire semantic, Token export multi-format (W3C DTCG, CSS, Tailwind v4 `@theme`, Figma), Component spec generator (markdown par composant), Density switcher, Mermaid diagram, Variant explosion alarm (> 60 combinaisons).
- **Validations auto** : token semantic non mappé → orphelin ; valeur hardcodée dans composant → alerte ; contraste AA < 4.5:1 → rouge ; composant sans état disabled → warning ; composant sans focus visible → warning critique a11y ; > 6 variants → alerte over-engineering ; Table/List sans empty state → alerte ; Form sans Toast/Alert → alerte ; spacing hors échelle (7px) → alerte ; > 2 polices → warning ; pas de mode sombre promis → alerte ; bouton primary dupliqué par vue → alerte hiérarchie.
- **Outputs** : `tokens.w3c.json` (DTCG 2025.10), `tokens.css`, `tailwind.theme.css` (v4), `components/[name].md` (spec par composant : purpose/variants/states/sizes/props/a11y/do-don't), `patterns.md`, `design-system.mermaid`, `checklist-a11y.md`, export Figma-ready.
- **Modèle de données** : `design_systems` (1 par projet) + sous-tables `design_tokens` (tier/category/reference), `design_components` (a11y_notes, mvp_priority), `component_variants`, `design_patterns`. **Alternative MVP Mindeck** : tout stocker en JSON unique dans `sections.content` (section `design`). Promouvoir en tables dédiées si multi-user un jour.
- **Priorité MVP** : **MUST** — Token editor 2-tier, Component checklist 10 composants core (Button, Input, Textarea, Select, Card, Modal, Toast, Badge, Tabs, EmptyState), Pattern picker 4 états, Export Tailwind v4 `@theme` (stack Mindeck actuelle), Contrast checker inline. ~1 semaine dev.
- **Complexité** : MUST M+S (~1 semaine) ; 3-tier + playground = L supplémentaire.
- **Sources clés** : W3C Design Tokens Format Module 2025.10 (stable), Nathan Curtis (Naming Tokens), Brad Frost (Atomic Design, avec ses limites reconnues par Frost lui-même), Material 3 (reference/system/component tokens), Radix Primitives, Shopify Polaris, Carbon, Primer GitHub, shadcn/ui, Jina Anne, Style Dictionary.

---

### 4.8 Chapitre 8 — États d'interface & micro-interactions

> **Chapitre systématiquement sous-traité dans les tutos UI — gros potentiel de valeur ajoutée**. C'est ici qu'un projet amateur devient un projet pro.

- **Objectif** : l'app doit toujours dire ce qu'elle fait. Click → feedback. Chargement → visible. Vide → explique. Planté → indique la solution.
- **Questions clés** : feedback synchrone <100ms, strategy loading (spinner vs skeleton vs optimistic), 4 sous-types empty states (first-use/user-cleared/no-results/error), hiérarchie errors (validation inline/toast réseau/page 500/modal permission), seuils RAIL, focus visible, undo 5-10s vs confirmation modale, animations purposeful vs decorative, `prefers-reduced-motion`, template error (what + why + how), haptic mobile, duration tokens + easing system.
- **Inputs UI** :
  - Débutant : audit checklist "pour chaque écran : empty ? loading ? error ? success ? partial ?"
  - Intermédiaire : state matrix par composant (Button × 7 states : default/hover/focus/active/disabled/loading/error) avec preview CSS live
  - Expert : micro-interactions spec éditeur (framework Dan Saffer : Trigger → Rules → Feedback → Loops & Modes), animation timing editor avec courbe cubic-bezier manipulable
- **Widgets (12)** : State matrix auditor, Screen states checklist, Empty state builder (icon + headline + description + CTA primary/secondary), Loading strategy picker (arbre décision RAIL), Error message template generator (4-parts what/why/how/help link), Animation timing picker (duration slider + easing presets + spring custom), Reduced motion audit, Focus ring designer (outline + offset + width + contraste 3:1), Haptic mapper (mobile futur), Toast orchestrator (position, stack, auto-dismiss, swipe), Undo pattern generator (confirmation modale vs optimistic + undo toast selon criticité), Skeleton shape builder.
- **Validations auto (20)** : composant sans focus visible → erreur a11y bloquante ; focus outline contraste < 3:1 → erreur (WCAG 2.2 SC 1.4.11) ; loading sans indicateur > 1s → alerte ; > 10s sans progress → erreur UX ; spinner pour < 300ms → alerte ; empty state sans CTA → alerte ; empty "Aucune donnée" générique → alerte ; error sans action → erreur UX ; "Something went wrong" → erreur UX ; animation > 500ms sans justification → alerte ; animation sans `prefers-reduced-motion` fallback → erreur a11y ; toast auto-dismiss < 5s → alerte ; toast sans pause hover → alerte a11y ; destructive sans confirmation ni undo → erreur UX ; hit target < 44×44 mobile → alerte ; < 24×24 desktop → alerte (WCAG 2.5.5) ; disabled sans explication → alerte ; hover-only sans équivalent touch/clavier → erreur a11y ; easing linear sur UI → info ; même animation > 3× par écran → alerte fatigue.
- **Outputs** : state spec markdown (composant × 7 états + tokens CSS), empty states library JSON (screen/type/icon/headline/description/CTA), error messages library (4-parts par type d'erreur), animation timing tokens (duration-fast/base/slow/emphatic + ease-out/in/inout/spring), motion principles doc, micro-interactions catalog, loading strategy matrix, a11y state audit report, reduced motion CSS snippet.
- **Modèle de données** : tables dédiées — `component_states`, `screen_states`, `empty_states` (avec subtype), `loading_strategies`, `error_messages`, `microinteractions` (framework Saffer), `animation_tokens`, `motion_audit`.
- **Priorité MVP** : **MUST** — Screen states checklist, State matrix auditor, Empty state builder, Error message generator (4-parts), Loading strategy picker, Focus ring designer, 5 règles critiques (focus manquant/error sans action/spinner sans timeout/empty générique/reduced-motion absent).
- **Complexité** : XL (2-3 sprints). Le plus dense en logique de validation automatique (20 règles).
- **Sources clés** : NN/g (Empty States, Response Times, Error Guidelines), Dan Saffer (Microinteractions book 2013), Material 3 Motion, Apple HIG Motion/Feedback/Haptics, GitHub Primer Empty States, Carbon Interaction States, Refactoring UI, Growth.Design case studies, WCAG 2.2, Luke Wroblewski (skeletons), MDN (`prefers-reduced-motion`, `:focus-visible`).

---

### 4.9 Chapitre 9 — Écriture UX & microcopy

- **Objectif** : tous les petits textes (boutons, erreurs, vides, tooltips) clairs, courts, utiles, cohérents. Un bon microcopy guide sans faire réfléchir.
- **Questions clés** : personas de lecture, matrice voice & tone par contexte, high-anxiety touchpoints, glossaire verbes d'action + bannis, structure errors (what+why+how), empty states pédagogiques, i18n-readiness, pattern confirmations destructives, copy inclusif.
- **Inputs UI** :
  - Débutant : "Écris-moi ce texte" — choix contexte + description action en 1 phrase → 3-5 formulations ranked par clarté
  - Intermédiaire : templates contextualisés (empty 5 variantes, error 8 patterns par code, onboarding, tooltips, confirmation, 404/500, success toasts)
  - Expert : voice & tone matrix (ton × contexte) + glossaire DO/DON'T avec justifications + reading level checker (Flesch-Kincaid) + checklist i18n complète
- **Widgets** : Button copy generator (3-5 suggestions ranked + longueur), Error message builder (4-parts), Empty state copy generator, Confirmation dialog rewriter (OK/Cancel → verbe explicite), Placeholder vs label checker, Glossary DO/DON'T (seed 30 entrées), Tone check contextuel (détecte humour sur écran grave), Reading level checker (Hemingway-like), Copy deck export CSV, Microcopy linter.
- **Validations auto (13)** : bouton "OK"/"Submit"/"Valider" seul → error ; error sans how-to-fix → warning ; "Something went wrong" → warning ; label MAJUSCULES → warning (lisibilité -15%) ; placeholder > 40 chars → error ; phrase > 25 mots → warning ; voix passive > 20% → suggestion ; "please kindly" → warning ; > 1 exclamation par écran → warning ; jargon tech user-facing → error ; non-inclusif détecté → warning ; ton incohérent avec contexte → error ; CTA dupliqué avec libellés différents → warning.
- **Outputs** : microcopy guide markdown, glossary DO/DON'T (CSV + markdown), error messages library JSON par code HTTP/contexte, copy deck CSV (clé/contexte/FR/EN/notes/longueur), voice & tone matrix, onboarding scripts, i18n-readiness checklist.
- **Modèle de données** : `microcopy_entries` (identifiant, contexte, ton, libellé FR/EN, longueur max, variables dynamiques, notes, alternatives rejetées, statut) ; `glossary` (terme banni, préféré, raison, catégorie) ; `linter_rules` (id, pattern, sévérité, message, suggestion).
- **Priorité MVP** : **MUST** — Button copy generator, Error message builder, Empty state generator, Glossary DO/DON'T (30 entrées seed), Microcopy linter 8 règles critiques, Copy deck export CSV.
- **Complexité** : L globalement. Bloc LLM optionnel pourrait passer à XL (coût API).
- **Sources clés** : Kinneret Yifrah (Microcopy book), Mailchimp Content Style Guide, Shopify Polaris Content, Atlassian Voice & Tone, Microsoft Writing Style Guide, NN/g (UX writing), GOV.UK Content Design (plain language), Material 3 Writing, Apple HIG, UX Writing Hub.

---

### 4.10 Chapitre 10 — Accessibilité & inclusion

- **Objectif** : utilisable par tout le monde — y compris aveugles, malvoyants, sourds, moteurs, fatigués. A11y = base, pas option. Obligatoire en UE (EAA juin 2025) et US (ADA).
- **Questions clés** : cible EAA/RGAA/ADA, niveau AA (légal) ou AAA, microentreprise exemptée (< 10 employés ET < 2M€ CA), contrastes audités, cibles tactiles 44×44, `prefers-reduced-motion`, reflow 400%, labels explicites, alt text strategy, lecteurs d'écran testés, niveau de lecture cible, `lang` déclaré.
- **Inputs UI** :
  - Débutant : "Top 10 WCAG AA" checklist avec exemple visuel OK vs KO et explications "ça aide qui ?"
  - Intermédiaire : audit par écran (scan sémantique + contrastes + targets tactiles + fixes suggérés avec priorité)
  - Expert : matrice WCAG 2.2 complète (50 AA + 28 AAA optionnels), ARIA pattern picker (15 patterns APG), legal compliance report (EAA/ADA/RGAA/AODA/EN 301 549), accessibility statement generator (conforme Annexe V EAA)
- **Widgets** : Contrast checker (réutilise chap. 6), Focus indicator designer (SC 2.4.11 + 2.4.13), Keyboard nav simulator, Touch target measurer, Colorblindness simulator (protanopie/deutéranopie/tritanopie/achromatopsie), ARIA pattern picker, Screen reader test plan (NVDA/Firefox, VoiceOver/Safari, TalkBack/Chrome), Motion & reduced-motion checker, Alt text assistant, Form labeling validator, Legal compliance report, Accessibility statement generator.
- **Validations auto (20)** : contraste texte < 4.5:1 → bloquant ; contraste large text < 3:1 → bloquant ; contraste UI/focus < 3:1 → bloquant ; info only couleur → alerte ; `outline:none` sans `:focus-visible` → bloquant ; bouton icon-only sans aria-label → bloquant ; touch target < 24×24 sans spacing → bloquant AA 2.5.8 ; < 44×44 → alerte AAA ; flash > 3 Hz → bloquant (épilepsie) ; animation sans reduced-motion fallback → alerte ; image informative avec `alt=""` → bloquant ; input sans label → bloquant ; placeholder seul label → bloquant ; page sans h1 → alerte ; hiérarchie headings cassée → alerte ; `<html lang>` absent → bloquant ; zoom 200% casse layout → bloquant (1.4.4) ; focus trap → bloquant ; ARIA cargo-cult → alerte ; cible EAA sans statement → bloquant légal.
- **Outputs** : a11y audit report markdown, WCAG 2.2 AA compliance score /100, legal compliance checklist EAA/ADA/RGAA, ARIA spec par composant, accessibility statement draft (Annexe V EAA), test plan (NVDA/VoiceOver/TalkBack), inclusive content guidelines.
- **Modèle de données** : `a11y_targets`, `contrast_pairs`, `components[]` avec `aria_pattern`, `motion_prefs`, `forms_inventory`, `images_inventory`, `languages`, `audit_results`, `accessibility_statement`, `testing_plan`.
- **Priorité MVP** : **MUST** — top 10 critères WCAG AA (contraste, keyboard, focus, semantic, labels, alt, lang, targets 24×24, pas info only couleur, zoom 200%). Pour Mindeck outil perso (< 10 employés, exempt EAA techniquement), viser MUST à fond + SHOULD formulaires critiques, ignorer NICE (AAA overkill).
- **Complexité** : MVP M (1-2 semaines) ; version complète avec axe-core intégré en XL (4-6 semaines).
- **Sources clés** : W3C WCAG 2.2 Quick Ref, W3C ARIA APG, WebAIM Million Report 2025, A11Y Project Checklist, Deque University + axe-core, Heydon Pickering (Inclusive Components), Sara Soueidan, GOV.UK Design System, RGAA 4.1 DINUM, European Accessibility Act, EN 301 549, MDN, Apple HIG Accessibility.

---

### 4.11 Chapitre 11 — Adaptativité : responsive, dark mode, densité

- **Objectif** : ton app doit être belle et utilisable partout (mobile métro, 4K bureau, dark mode nuit, grand-père avec texte plus gros). Une seule app, mille contextes.
- **Questions clés** : écran cible (phone/tablet/laptop/desktop), mobile first ou secondaire, dark mode stratégique ou cosmétique, choix user vs OS auto, power user (dense) vs grand public (aéré), PWA installable, container queries vs media queries, fluid vs fixed typography, `prefers-reduced-motion`, thème personnalisable user, touch targets.
- **Inputs UI** :
  - Débutant : 5 breakpoints Tailwind pré-cochés, toggle mobile-first ON par défaut, preview dark 1-clic, slider densité 3 positions avec live preview, checklist mobile (buttons ≥ 44px, texte lisible, portrait, etc.)
  - Intermédiaire : breakpoints custom (avec warning > standards), dark tokens auto-générés OKLCH, container queries picker, safe area tester (notch iPhone)
  - Expert : fluid type `clamp()` builder (style Utopia.fyi), tonal surfaces editor Material 3 (6 niveaux), multi-device preview side-by-side (iPhone SE 375 / iPad 768 / MacBook 1440 / Ultrawide 2560), motion override editor, accent picker avancé OKLCH avec contrast guard
- **Widgets (12)** : Breakpoint picker (Tailwind standard vs custom, warning > 6), Dark mode auto-generator (OKLCH perceptuel avec courbes asymétriques, chroma reduction -10-30%), Multi-device preview, Fluid type builder (Utopia-style `clamp(min, preferred, max)`), Touch target audit (scan < 44×44 mobile surligné rouge), Safe area tester (`env(safe-area-inset-*)`), Density slider (impact `--space-*` + `--font-size-base` + `--control-height`), Container query designer, Elevation editor dark mode (6 surfaces tonales Material 3), Accent color picker avec contrast guard, Motion settings (respecter reduced-motion par animation), Responsive image helper (`srcset/sizes` + AVIF/WebP/JPEG).
- **Validations auto (10)** : `#FFFFFF` sur `#000000` dark → alerte contraste excessif 21:1 ; touch target < 44×44 mobile → bloquant ; breakpoints non-standards sans justif → alerte ; dark mode = inversion RGB naïve → bloquant ; ombres `box-shadow` dark sans tonal surface → alerte ; font-size < 16px inputs mobile → alerte (iOS zoom auto) ; aucune container query alors composant multi-contextes → suggestion ; `prefers-reduced-motion` pas respecté > 2 animations → alerte a11y ; densité compact imposée sans override user → alerte ; pas de `viewport-fit=cover` + safe-area PWA → alerte ; images sans `srcset` > 200 KB → alerte perf.
- **Outputs** : Tailwind v4 config (`@theme { --breakpoint-*: }`, container queries, dark mode class/media, density variants), CSS variables light + dark OKLCH, density classes (`html.density-compact/comfortable` — déjà pattern Mindeck), responsive spec markdown, multi-device preview HTML autonome, design tokens JSON W3C, checklist QA.
- **Modèle de données** : `strategy`, `breakpoints[]`, `fluid_typography{}`, `dark_mode{strategy, elevation_levels, tonal_overlay_opacity}`, `densities{compact, normal, comfortable}`, `default_density`, `touch_target_min`, `safe_area_enabled`, `container_queries[]`, `motion_respect_reduced`, `accent_customizable`, `accent_default_oklch`, `devices_targeted[]`, `pwa_installable`.
- **Priorité MVP** : **MUST** — Breakpoints Tailwind standard + toggle mobile-first, dark mode OKLCH (pas RGB naïf), slider densité 3 modes, touch target audit auto, preview light↔dark 1-clic, CSS vars light+dark, `prefers-color-scheme` respecté + override user.
- **Complexité** : MVP S+M (quelques jours) ; version complète L-XL avec Utopia fluid + tonal surfaces + PWA.
- **Sources clés** : Luke Wroblewski (Mobile First, toujours valide 2026), Utopia.fyi, Material 3 Adaptive/Tonal, Apple HIG Dark Mode/Size Classes/Safe Areas, Evil Martians (OKLCH in CSS), Tailwind v4, Smashing Magazine (Responsive 2025), Adam Argyle (web.dev), Ahmad Shadeed (Defensive CSS), MDN, WCAG 2.2 Target Size.

---

### 4.12 Chapitre 12 — Validation & itération

- **Objectif** : construire sans montrer = écrire une lettre sans l'envoyer. Tester avec 5 vrais users et mesurer avec chiffres simples. Adapté au scope Anthony (solo, pas de budget UX agency).
- **Questions clés** : combien d'users extérieurs testés, produit décrit en 1 phrase, tâche principale + aha moment, analytics en place, North Star Metric, PMF score (Sean Ellis), feedback widget/session recording, research repository, A/B tests vs feeling, testeurs froids (pas amis/famille), script interview, compréhension limites NPS.
- **Inputs UI** :
  - Débutant : "5 amis testent ton app" — checklist 3 phases (prépa 4 items / pendant 5 items / après 3 items) + Think-Aloud Protocol + SEQ après chaque tâche
  - Intermédiaire : usability test plan builder, heuristic evaluation auto-guide (Nielsen 10), SUS calculator (10 questions → score /100 + benchmark), first-click test planner, interview script generator (Mom Test de Rob Fitzpatrick)
  - Expert : North Star + input metrics builder, PMF score tracker (Sean Ellis survey avec seuil 40%), event tracking plan (convention noun_verb), research repository (Atomic Research Tomer Sharon), funnel analyzer spec, A/B test plan builder avec calcul sample size
- **Widgets (12)** : Usability test plan generator, Nielsen 10 heuristics audit (severity 0-4), Cognitive walkthrough wizard, SUS calculator, SEQ widget, PMF score tracker, North Star + input metrics builder, Event tracking plan generator (PostHog/Amplitude convention), Interview script generator (Mom Test), Research repository (quotes + insights + tags + actions), A/B test plan avec sample size (Evan Miller), Heatmap/session recording setup guide (Microsoft Clarity gratuit).
- **Validations auto (9)** : 0 user test depuis 90 jours → alerte "no-design-in-vacuum" ; PMF < 40% → alerte "pas encore PMF, itère produit avant d'accélérer acquisition" ; NSM = vanity metric (pageviews/signups) → alerte ; < 5 users testés → rappel "Nielsen 85% insights" ; A/B sans sample size → bloquer "tu conclus sur bruit statistique" ; interviews amis/famille → alerte (biais mom test) ; session recording sans consentement RGPD → bloquer ; research repo vide depuis 6 mois → alerte ; SUS < 68 → rappel "sous moyenne industrie".
- **Outputs** : usability test plan markdown, SUS score report + benchmark, NSM + metrics dashboard spec, interview notes template (Atomic Research), A/B test plan, heuristic evaluation report, PMF score report, event tracking plan (noun_verb + properties), research insights digest.
- **Modèle de données** : `research_items` (type : usability_test/interview/heuristic_eval/survey/ab_test/insight, findings jsonb avec quote/insight/severity/tag), `metrics` (kind : nsm/input_metric/pmf/sus/seq), `events_plan`. Liaisons : research_item → todos (si severity 3-4 → P1), research_item → decisions (insights structurants → ADR), research_item → risks (risques identifiés).
- **Priorité MVP** : **MUST** — Usability test plan generator (mode débutant), checklist "5 users", Interview script (Mom Test), SUS calculator, Research repository simple, NSM field dans cockpit (déjà existant à enrichir), règle "0 test depuis 90j → alerte".
- **Complexité** : L. Ordre recommandé : semaine 1 (checklist + SUS + interview), semaine 2 (research repo), semaine 3 (validations + tooltips).
- **Sources clés** : Nielsen (5-user rule, 10 heuristics), Brooke 1996 (SUS), Jeff Sauro/MeasuringU, Steve Krug (Rocket Surgery Made Easy), Rob Fitzpatrick (Mom Test), Sean Ellis (PMF 40% rule), Reforge/Amplitude (North Star), Tomer Sharon (Atomic Research), PostHog, Microsoft Clarity, Reichheld (NPS — à connaître pour ses limites).

> **Note sans sycophantie** : NPS **surfait pour early-stage solo**. Pour Mindeck : PMF + SUS + rétention W4 donnent 10× plus d'info actionnable. NPS utile seulement > 1000 users actifs comme tendance.

---

## 5. Modèle de données global (vue conceptuelle)

### 5.1 Principe

Respect de la convention Mindeck actuelle : **section unique `design` dans la table `sections`** avec un JSON riche dans `content`, indexé par `project_id`. Éviter les 20+ tables dédiées pour rester simple. Promouvoir en tables dédiées **seulement** si un usage spécifique le demande (ex : `design_tokens` comme table dédiée si export W3C haute fréquence).

### 5.2 Structure JSON proposée (section_key = "design")

```json
{
  "mode_global": "beginner | intermediate | expert",
  "completeness": { "foundations": 72, "identity": 45, ... },

  "foundations": {
    "jtbd_core": "...",
    "job_stories": [...],
    "personas": [...],
    "positioning_*": "...",
    "aha_moment": { "event": "...", "threshold": "..." },
    "design_principles": [...],
    "anti_goals": [...]
  },

  "identity": {
    "archetype_key": "sage",
    "voice_sliders": { "formal_casual": 60, ... },
    "brand_promise": "...",
    "do_words": [...], "dont_words": [...],
    "tone_matrix": [...],
    "references": [...], "anti_references": [...]
  },

  "ia_nav": {
    "screens_picker": [...],
    "sitemap": { ... },
    "nav_pattern": "sidebar",
    "labels_dictionary": { ... }
  },

  "flows": {
    "user_flows": [...],
    "onboarding_spec": { ... },
    "north_star_action": { ... },
    "friction_score": { ... }
  },

  "interaction": {
    "nielsen_audit": { ... },
    "selected_laws": [...],
    "affordance_checks": [...],
    "design_principles_card": [...]
  },

  "visual": {
    "vibe": "minimal",
    "colors": {
      "primary": { "oklch": "...", "shades_12": [...] },
      "neutral": { ... },
      "semantic": { "success": ..., "warning": ..., "error": ..., "info": ... },
      "alpha_scales": true
    },
    "typography": {
      "heading_font": { ... },
      "body_font": { ... },
      "scale_ratio": 1.25,
      "base_size": 16,
      "fluid": false
    },
    "spacing": { "base_unit": 4, "scale_type": "hybrid", "density_variants": {...} },
    "radius": { ... },
    "shadows": [...],
    "grid": { ... }
  },

  "design_system": {
    "tokens_tier": 2,
    "components_selected": [...],
    "component_variants": { ... },
    "patterns_picked": [...]
  },

  "states": {
    "screen_states": { ... },
    "component_states_matrix": { ... },
    "empty_states_library": [...],
    "error_messages_library": [...],
    "animation_tokens": { ... },
    "microinteractions": [...]
  },

  "microcopy": {
    "glossary": [...],
    "copy_deck": [...],
    "linter_results": [...]
  },

  "accessibility": {
    "target_wcag": "AA",
    "juridictions": ["EAA", "RGAA"],
    "contrast_pairs": [...],
    "top_10_checklist": { ... },
    "audit_results": [...],
    "statement": { ... }
  },

  "adaptivity": {
    "strategy": "mobile_first",
    "breakpoints": [...],
    "dark_mode": { "strategy": "auto", "tokens_inverted": true },
    "densities": { ... },
    "fluid_typography": { ... }
  },

  "validation": {
    "research_items": [...],
    "metrics": { "nsm": "...", "sus_score": ..., "pmf_score": ... },
    "events_plan": [...]
  }
}
```

### 5.3 Tables dédiées recommandées (seulement si vraie valeur)

- **`design_tokens`** : si export W3C fréquent, useful pour sync Figma/CI. Sinon JSON suffit.
- **`a11y_audit_results`** : si audits récurrents avec historique. Sinon intégré au JSON.
- **`research_items`** : **oui, table dédiée recommandée**. Permet de lier vers `todos`, `decisions`, `risks` via foreign key (`source_research_id` nullable). C'est le seul modèle qui a un vrai besoin relationnel.

### 5.4 Migrations SQL nécessaires

- **Migration 014 (optionnelle)** : enrichir les colonnes existantes de `sections` si besoin d'un `completeness_score` calculé.
- **Migration 015 (optionnelle)** : créer `research_items` si chap. 12 validé en MUST.
- **Pas de modification de schéma sans validation d'Anthony** (règle CLAUDE.md).

---

## 6. Matrice d'arbitrage — 3 approches globales

### 6.1 Approche A : "Formulaire guidé étape par étape" (style TurboTax)

- **UX** : 12 étapes linéaires obligatoires, l'user avance pas à pas, impossible de sauter.
- **Avantages** : simplicité, complétude garantie, débutant-friendly absolu.
- **Inconvénients** : rigidité insupportable pour expert, sensation de corvée administrative.
- **Exemples marché** : Looka (brand kit), TurboTax, Typeform long.
- **Coût dev** : M.

### 6.2 Approche B : "Canvas libre avec suggestions IA"

- **UX** : toutes les sections visibles simultanément (Miro/FigJam-like), l'user remplit dans l'ordre qu'il veut, IA suggère.
- **Avantages** : liberté maximale, plaît aux experts, exploration non-linéaire.
- **Inconvénients** : débutant noyé (trop d'options), paralyse si pas guidé, dépendance IA externe (coût API).
- **Exemples marché** : Miro, FigJam, Whimsical.
- **Coût dev** : L.

### 6.3 Approche C : "Hybride modes progressifs par sous-onglet" ✅ (recommandée)

- **UX** : mini-menu vertical à 12 sous-onglets, mode global Débutant/Intermédiaire/Expert, override par sous-onglet, navigation libre entre sous-onglets, pré-remplissage intelligent (chap. 1 alimente chap. 6), barre de complétude visible.
- **Avantages** :
  - Un enfant de 12 ans commence en Débutant partout, clique, voit des résultats immédiats
  - Un expert bascule en Expert sur les sous-onglets qui l'intéressent
  - Les experts ne sont pas obligés de remplir chap. 1 s'ils savent déjà (mais validation les signale)
  - Progression mesurable (score 0-100%), motivation via gamification douce
- **Inconvénients** : plus complexe à designer que A ou B.
- **Exemples marché** : aucun outil ne fait ça — c'est l'unfair advantage de Mindeck.
- **Coût dev** : L-XL mais distribuable en 12 micro-features livrables progressivement.

### 6.4 Tableau comparatif

| Critère | A. Formulaire linéaire | B. Canvas libre IA | C. Hybride modes ✅ |
|---|---|---|---|
| Débutant-friendly | ★★★★★ | ★ | ★★★★★ |
| Expert-friendly | ★ | ★★★★★ | ★★★★★ |
| Liberté de navigation | ★ | ★★★★★ | ★★★★ |
| Complétude garantie | ★★★★★ | ★★ | ★★★★ |
| Pédagogie possible | ★★★★ | ★★ | ★★★★★ |
| Générateurs intelligents | ★★★ | ★★★★ | ★★★★★ |
| Garde-fous auto | ★★★★ | ★★ | ★★★★★ |
| Coût dev | M | L | L-XL |
| Différenciation marché | faible | moyenne | **forte** |

---

## 7. Recommandation finale

### 7.1 Approche C — hybride modes progressifs

Retenir **l'approche C** avec les ajustements suivants :

1. **Mini-menu vertical à 12 sous-onglets** (pas 10, pas 15). Ordre du plus stratégique au plus opérationnel.
2. **Mode global persistant** (`user_preferences.design_mode`) + **override par sous-onglet** (stocké dans le JSON section `design`).
3. **Pas d'IA externe en MVP** — tous les générateurs sont des algorithmes déterministes (OKLCH palette, fluid type calc, contrast checker). Économie massive de coûts API + indépendance.
4. **Pédagogie Refactoring UI in-app** : c'est le plus gros gisement de valeur non exploité par la concurrence. Budgétiser du temps de rédaction de tooltips et mini-leçons.
5. **Pré-remplissage intelligent** : les réponses du chap. 1 (type de projet, cible, principes) alimentent les presets des chap. 6-7 (palette, composants, typo).

### 7.2 Roadmap MVP proposée (4 phases)

**Phase MVP v1 — "Assistant de base" (~6-8 semaines solo)**
- Chap. 6 Visuel (MUST complet) — **killer feature**, 2-3 semaines
- Chap. 7 Design system (MUST) — 1 semaine
- Chap. 10 Accessibilité (MUST top 10) — 1-2 semaines
- Chap. 11 Adaptativité (MUST) — 3-5 jours
- Chap. 1 Fondations (MUST) — 4-6 jours
- Mini-menu vertical + mode global + barre complétude — 3-5 jours
- Total : **~6-8 semaines**

**Phase MVP v1.1 — "Assistant étendu" (~4-6 semaines)**
- Chap. 2 Identité (MUST) — 2 semaines (gros contenu pédagogique)
- Chap. 8 États (MUST) — 1-2 semaines (dense en validations)
- Chap. 9 Microcopy (MUST) — 1 semaine

**Phase MVP v1.2 — "Assistant complet" (~6-8 semaines)**
- Chap. 3 Info & Nav (MUST) — 2-3 semaines
- Chap. 4 Parcours (MUST) — 3-4 jours
- Chap. 5 Principes UX (MUST) — 1 semaine
- Chap. 12 Validation (MUST) — 1-2 semaines

**Phase v2 et au-delà** : SHOULD puis NICE de chaque chapitre, selon usage réel par Anthony.

### 7.3 Ordre alternatif "go-to-market maximum" si on vise un produit vendable

Si à terme Mindeck vise à sortir du "outil perso" pour devenir un produit public/SaaS, l'ordre de construction devrait privilégier le **chapitre 6 seul en MVP pur**, parce qu'il est intrinsèquement vendable en standalone. Ensuite empiler les autres chapitres comme différenciateurs. Demander à Anthony si cette option l'intéresse (voir questions ouvertes §8).

---

## 8. Questions ouvertes pour Anthony

Ces décisions nécessitent ton arbitrage avant que l'implémentation commence. Je te les présenterai **une par une en Phase 4**, après ta validation globale de ce document.

### 8.1 Questions d'architecture produit

1. **Scope Mindeck** : tu vises toujours un outil perso, ou tu envisages qu'il devienne public/vendable un jour ? (Impacte la priorité d'implémentation — si public, commencer par chap. 6 standalone.)
2. **Mode global vs mode par sous-onglet** : tu préfères un mode global unique ou la possibilité d'override par sous-onglet ?
3. **Ordre des phases MVP** : tu valides la roadmap §7.2 (6 → 7 → 10 → 11 → 1 en phase 1) ou tu veux commencer autrement ?

### 8.2 Questions de fonctionnalités

4. **IA externe en MVP** : on reste sur générateurs déterministes (OKLCH, clamp, etc.) sans appel API, ou tu veux prévoir dès le départ un budget pour suggestions LLM (microcopy, reformulations) ?
5. **Vibe extractor depuis screenshot** (chap. 6) : feature XL qui différencie fort, ou reporté en v2 ?
6. **Research repository** (chap. 12) : table dédiée avec liaisons vers `todos`/`decisions`/`risks`, ou JSON simple ?

### 8.3 Questions de scope chapitre par chapitre

7. **Chap. 1 Fondations** : inclure positionnement Dunford (5 composantes) en MUST, ou juste JTBD + persona + aha + principes ?
8. **Chap. 2 Identité** : 8 archétypes simplifiés (recommandé) ou les 12 archétypes Jung classiques ?
9. **Chap. 3 Info & Nav** : Tree Test simulator en MUST ou en NICE (gros coût dev) ?
10. **Chap. 5 Principes UX** : Gestalt screenshot review avec upload — MUST ou NICE ?
11. **Chap. 6 Visuel** : Vibe extractor ML (upload image → tokens) MUST ou NICE ?
12. **Chap. 7 Design system** : tokens 2-tier (primitives + semantic) MUST suffisant ou 3-tier obligatoire ?
13. **Chap. 10 A11y** : accessibility statement generator EAA obligatoire en MUST (même si tu es exempté) ?
14. **Chap. 12 Validation** : SUS calculator MUST ou le fait qu'Anthony teste seul rend tout ça NICE ?

### 8.4 Questions de naming / UI

15. **Nom du menu** : "Design", "Design System", "UI/UX", "Direction artistique" ?
16. **Icônes sous-onglets** : emoji (cohérent avec Mindeck actuel) ou icônes SVG (Lucide) ?
17. **Mode naming** : "Débutant / Intermédiaire / Expert" ou "Guidé / Assisté / Libre" ou autre ?

### 8.5 Questions de contenu

18. **Langue contenu pédagogique** : français uniquement (cohérent Mindeck) ou bilingue FR/EN pour réutilisabilité future ?
19. **Rédaction tooltips** : tu écris toi-même les mini-leçons (1-2 semaines de contenu) ou on génère des premiers jets que tu amendes ?

---

## 9. Sources consultées (bibliographie)

### 9.1 Livres de référence

- Wathan, A. & Schoger, S. (2018). *Refactoring UI*. — **Référence #1 toute catégorie**.
- Norman, D. (2013). *The Design of Everyday Things*, revised ed.
- Krug, S. (2014). *Don't Make Me Think*. + *Rocket Surgery Made Easy* (2009).
- Frost, B. (2016). *Atomic Design*.
- Yablonski, J. (2020). *Laws of UX*. O'Reilly.
- Saffer, D. (2013). *Microinteractions: Designing with Details*. O'Reilly.
- Bringhurst, R. (2013). *The Elements of Typographic Style*, 4e éd.
- Fitzpatrick, R. (2013). *The Mom Test*.
- Dunford, A. (2019). *Obviously Awesome*.
- Wroblewski, L. (2011). *Mobile First*. A Book Apart.
- Pickering, H. (ongoing). *Inclusive Components*.
- Yifrah, K. (2017). *Microcopy: The Complete Guide*.
- Neumeier, M. *The Brand Gap*.
- Garrett, J.J. *The Elements of User Experience*.

### 9.2 Références web autoritatives

**Design systems & guidelines**
- Nielsen Norman Group — nngroup.com
- Material Design 3 — m3.material.io
- Apple Human Interface Guidelines — developer.apple.com/design/human-interface-guidelines
- Shopify Polaris — polaris.shopify.com
- IBM Carbon — carbondesignsystem.com
- GitHub Primer — primer.style
- Atlassian Design System — atlassian.design
- Radix Primitives + Radix Colors — radix-ui.com

**Design tokens**
- W3C Design Tokens Format Module (2025.10 stable) — designtokens.org
- Nathan Curtis (EightShapes) — Medium articles
- Jina Anne — CSS-Tricks
- Style Dictionary — styledictionary.com

**Couleur & a11y**
- WebAIM — webaim.org
- WCAG 2.2 Quick Reference — w3.org/WAI/WCAG22/quickref
- A11Y Project — a11yproject.com
- Deque University — dequeuniversity.com
- Evil Martians (OKLCH in CSS) — evilmartians.com
- APCA — git.apcacontrast.com
- DaltonLens Colorblindness Simulator — daltonlens.org

**Typographie**
- Type Scale — typescale.com
- Modular Scale — modularscale.com
- Utopia.fyi (fluid design) — utopia.fyi
- Modern Font Stacks — modernfontstacks.com
- Butterick's Practical Typography — practicaltypography.com

**UX Writing / Content**
- Mailchimp Content Style Guide — styleguide.mailchimp.com
- Microsoft Writing Style Guide — learn.microsoft.com/style-guide
- GOV.UK Content Design — gov.uk/guidance/content-design
- UX Writing Hub — uxwritinghub.com

**Research & metrics**
- MeasuringU (Jeff Sauro) — measuringu.com
- Reforge — reforge.com/blog
- Amplitude (North Star framework) — amplitude.com/north-star
- PostHog Handbook — posthog.com/docs
- Microsoft Clarity — clarity.microsoft.com

**Inspiration & catalogues**
- Mobbin — mobbin.com
- Land-book — land-book.com
- Page Flows — pageflows.com
- UI Sources — uisources.com

**Légal a11y**
- European Accessibility Act — commission.europa.eu (EAA 2025)
- RGAA 4.1 (DINUM France) — accessibilite.numerique.gouv.fr
- ADA Title III — adatitleiii.com
- EN 301 549 harmonisé UE

**Outils concurrents analysés**
- v0.dev, Lovable, Bolt.new, Galileo AI/Google Stitch, UXPilot, Uizard, Figma Make, Relume, Framer AI
- Tokens Studio, Supernova, Zeroheight, Specify, Style Dictionary
- Looka, Brandmark, LogoAI, Khroma, Huemint, Coolors, Realtime Colors
- Stark, Whimsical, FigJam, Miro, Excalidraw

### 9.3 Frameworks cités

- Double Diamond (Design Council)
- Jobs-to-be-Done (Clayton Christensen / Tony Ulwick / Intercom)
- April Dunford Positioning (5 composantes)
- AARRR (Dave McClure)
- Atomic Research (Tomer Sharon)
- Nielsen 10 Heuristics
- WCAG 2.2 POUR (Perceivable/Operable/Understandable/Robust)
- Material Design 3 tonal surfaces
- 5 Planes (Jesse James Garrett)

---

**Fin du document de recherche.**

Prochaine étape : discussion section par section avec Anthony, à partir des questions ouvertes §8, avant toute ligne de code.
