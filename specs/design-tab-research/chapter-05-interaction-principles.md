# Chapitre 5 — Principes d'interaction & lois UX

> Livrable brut de l'Expert 5 (general-purpose).
> Couvre : 10 heuristiques Nielsen, Laws of UX (Yablonski), principes Norman (affordances/signifiers/gulfs), Gestalt, cognitive load (Sweller), mental models.

## 1. Objectif du chapitre

Les lois UX sont **les règles du cerveau humain** traduites en règles de design. Ton app ne choisit pas comment le cerveau fonctionne — elle peut seulement s'aligner dessus ou se battre contre. Ce chapitre transforme ces règles invisibles en checklist concrète pour que ton interface soit **naturelle**, pas devinable.

Enfant 12 ans : "Le cerveau humain a des raccourcis de pensée vieux de 50 000 ans. Ton app doit parler cette langue-là, pas l'inverse." Expert : le chapitre couvre les heuristiques de Nielsen, les lois UX triées (Yablonski), les principes de Norman (affordances/signifiers/gulfs), Gestalt, cognitive load theory (Sweller) et les feedback loops.

---

## 2. Questions clés à poser à l'user

| # | Simple (enfant 12 ans) | Expert |
|---|-----------------------|--------|
| 1 | Quand on clique sur un truc, est-ce qu'on voit tout de suite qu'il s'est passé quelque chose ? | Implémentes-tu du perceptible feedback < 100ms (visuel/tactile/sonore) sur chaque action, alignement avec Nielsen H1 (system status) ? |
| 2 | Est-ce que tes boutons **ressemblent** à des boutons ? | Tes éléments interactifs exposent-ils des signifiers non ambigus (ombre, bordure, hover state) — ou comptes-tu sur des conventions tacites ? |
| 3 | Est-ce qu'un user qui a déjà utilisé Gmail/Notion/Linear se sent chez lui chez toi ? | Jakob's Law — inventaire des patterns déviants vs conventions établies : justifiables ou gratuits ? |
| 4 | Quand l'user fait une erreur, est-ce qu'il comprend quoi faire pour la réparer ? | Quel est ton taux de messages d'erreur actionnables vs techniques (Nielsen H9) ? |
| 5 | Combien d'options affiches-tu en même temps à l'écran ? | Chunking & Hick's Law : quelle est la cardinalité max des menus/listes/CTA visibles simultanément ? |
| 6 | Si l'user clique par accident, peut-il revenir facilement ? | Undo/redo natif (Nielsen H3), escape routes, destructive actions confirmées ? |
| 7 | Est-ce que le plus important est le plus grand et le plus près ? | Application de Fitts's Law aux CTA critiques : taille, distance au curseur/pouce, zones de confort mobile ? |
| 8 | Après combien de temps d'attente l'user décroche ? | Mesures-tu tes temps de réponse vs Doherty threshold (<400ms) avec skeleton/spinner au-delà ? |
| 9 | Est-ce que ton app a un "modèle mental" clair ? Si oui, explique-le en une phrase. | Le conceptual model exposé (system image) correspond-il au user model ? Gulfs of execution/evaluation identifiés ? |
| 10 | Qu'est-ce que l'user va retenir 5 minutes après avoir fermé l'app ? | Peak-End rule — pics émotionnels identifiés, fin de parcours soignée (confirmations, empty states de succès) ? |

---

## 3. UX du chapitre — 3 modes progressifs

### Mode Débutant — "Les 10 règles de base"
Checklist linéaire des 10 heuristiques de Nielsen. Chaque heuristique = 1 carte. 3 boutons : oui / non / je sais pas. Tooltip avec exemple concret tiré du produit de l'user. Progress bar en haut.

```
┌──────────────────────────────────────────────┐
│ Heuristique 1/10                  [40%] ████░│
├──────────────────────────────────────────────┤
│ 1. Visibilité du status système              │
│                                              │
│ Quand quelque chose se passe dans ton app,   │
│ est-ce que l'user le voit ?                  │
│                                              │
│ Exemple ✓ : spinner pendant un chargement   │
│ Exemple ✗ : bouton qui "freeze" sans signe  │
│                                              │
│    [✓ Oui]   [✗ Non]   [? J'sais pas]       │
└──────────────────────────────────────────────┘
```

### Mode Intermédiaire — "Audit par écran-type"
Sélecteur : landing / auth / dashboard / form / liste / detail / settings / empty state / error state. Pour chaque type d'écran, règles prioritaires pré-filtrées :

- **Landing** : Aesthetic-Usability, Peak-End (hero), Jakob's Law
- **Dashboard** : Miller (chunking), Serial Position, Hick (actions primaires)
- **Form** : Postel's Law (tolérance), Error prevention (Nielsen H5), Goal-Gradient
- **Liste** : Fitts (targets tactiles), Proximity/Similarity (Gestalt), Zeigarnik (tasks inachevées)
- **Empty state** : Von Restorff (CTA qui ressort), Paradox of the Active User (onboarding minimal)
- **Error state** : Nielsen H9 (recovery), Peak-End (ne pas clore sur négatif)

### Mode Expert — "Laws pickable + Gestalt audit + Mental model mapping"

1. **Laws library** : 50+ lois filtrables (perception / mémoire / décision / motivation / temps). Coche les 5-10 applicables au produit → génère une "charte d'interaction".
2. **Gestalt audit** : upload d'un screenshot → checklist des 5 principes (proximity, similarity, continuity, closure, figure/ground). Annotation manuelle ou assistée.
3. **Mental model mapping** : 3 colonnes à remplir — **Design model** (ce que tu as en tête), **System image** (ce que l'UI montre), **User model** (ce que l'user en déduit). Les écarts = bugs UX potentiels (gulfs).
4. **Bridges worksheet** : pour chaque parcours critique, documenter comment on comble gulf of execution (signifiers + affordances) et gulf of evaluation (feedback).

---

## 4. Widgets / générateurs à implémenter

| Widget | Fonction |
|--------|----------|
| **Nielsen 10 audit** | Checklist interactive, score /10, export PDF |
| **Laws of UX library** | Base de 50+ lois, filtres, "pin to project" |
| **Cognitive Load Meter** | User décrit un écran (nb d'éléments interactifs, nb de champs, nb de décisions) → score Intrinsic / Extraneous / Germane + alertes |
| **Affordance Checker** | Questionnaire : tes boutons ont-ils hover/focus/pressed ? looks cliquable sans survol ? |
| **Feedback Inventory** | Liste toutes les actions clés du produit → colonnes : feedback visuel / sonore / tactile / délai perçu |
| **Fitts Target Calculator** | Input : taille bouton (px) + distance (px) → output : temps estimé + recommandations mobile (44×44 iOS / 48×48 Android) |
| **Hick Menu Analyzer** | Compte les options par menu, flag > 7, suggère groupement/progressive disclosure |
| **Mental Model Canvas** | Template 3 colonnes (design / system image / user) |
| **Gestalt Screenshot Review** | Upload image + calques annotation pour 5 principes |
| **Peak-End Journey Mapper** | Journey en 5-7 étapes, slider émotionnel, identification peaks + end |
| **Doherty Latency Log** | Saisie manuelle ou import Lighthouse → flag actions > 400ms |

---

## 5. Règles de validation automatique

- **> 7 items dans un menu plat** → flag Miller/Hick, proposer regroupement
- **Aucun feedback déclaré sur une action destructive** → erreur critique
- **Latence > 1s sans skeleton/spinner** → flag Doherty
- **Plus de 3 CTA primaires** (même couleur/poids) sur un écran → flag Von Restorff inversé (rien ne ressort)
- **Pas d'undo prévu** sur une action réversible → flag Nielsen H3
- **Dark pattern type "confirmshaming"** détecté via mot-clés → flag éthique (Yablonski, Laws of UX p. 141)
- **Aucun empty state** pour une liste → flag UX trou noir
- **Terminologie technique** (error codes bruts, jargon) → flag Nielsen H2/H9
- **Target tactile < 44 px** → flag Fitts
- **Plus de 5 couleurs sémantiques** (status, badges) → flag extraneous cognitive load

---

## 6. Contenus pédagogiques

Pour chaque loi / principe, 3 micro-contenus :

**Exemple — Fitts's Law**
- **Tooltip (1 phrase)** : "Plus une cible est grande et proche, plus vite on clique dessus."
- **Exemple ✓** : bouton "Publier" 56px en bas-droite d'un pouce sur mobile.
- **Anti-exemple ✗** : lien "Supprimer le compte" en petit texte gris au milieu d'un bloc de paragraphe.
- **Mini-leçon (3 lignes)** : "Publiée par Paul Fitts en 1954 dans un contexte militaire (combien de temps pour frapper une cible avec un stylet). La loi est logarithmique : doubler la taille ne divise pas le temps par deux, mais réduit significativement l'erreur. En mobile, la contrainte majeure est la zone atteignable au pouce (Thumb Zone)."

**Exemple — Aesthetic-Usability Effect**
- **Tooltip** : "Ce qui est beau paraît plus facile à utiliser. Même si c'est faux."
- **Exemple ✓** : Linear, Stripe — esthétique soignée qui couvre quelques frictions.
- **Anti-exemple ✗** : utiliser ça comme excuse pour ignorer des vrais bugs UX ("c'est joli, ça suffit").
- **Mini-leçon** : "Kurosu & Kashimura (1995) ont montré que les users perçoivent comme plus utilisables les ATM qu'ils trouvent beaux. Effet réel, mais **pas une carte blanche** : la beauté cache les frictions en test utilisateur, pas en usage quotidien."

**Exemple — Miller's Law (avec honnêteté)**
- **Tooltip** : "On retient ~4 à 7 choses en mémoire de court terme — mais pas sur une page."
- **Mini-leçon** : "Miller (1956) parlait de **mémoire immédiate** (retenir une série de sons ou mots), pas de menus sur un écran. Cowan (2001) a ramené le chiffre à 4±1 chunks. **Ne limite pas ton menu à 7** items par principe. Applique la loi au chunking : regroupe visuellement des infos qu'on doit **retenir** (pas qu'on peut **lire**)."

---

## 7. Outputs générés

1. **Design Principles Card** (3-5 principes non négociables) — ex : "Chaque action destructive a un undo de 5s / Aucune action ne dure > 400ms sans feedback / Les 3 CTA primaires du produit suivent Fitts (≥ 48px, thumb zone) / Le ton d'erreur est humain, jamais technique / Chaque parcours a un pic émotionnel prévu."
2. **Heuristics Report** — score /10 sur Nielsen, avec les 3 faiblesses prioritaires et leurs fixes.
3. **Cognitive Load Summary** — cartographie des écrans vs charge (Intrinsic / Extraneous / Germane), zones rouges à alléger.
4. **Mental Model Canvas** — exportable en PNG pour partage équipe.
5. **Interaction Charter** — document final : laws choisies + justification + règles de validation à brancher en CI design (Figma lint, Storybook).

---

## 8. Modèle de données conceptuel

```
interaction_audit
├── id, project_id, created_at, mode (beginner | intermediate | expert)
├── nielsen_checklist : { heuristic_id: "yes"|"no"|"unknown", note }
├── selected_laws [] : { law_slug, priority (must|should|nice), rationale }
├── cognitive_load_entries [] : { screen_name, intrinsic, extraneous, germane, notes }
├── affordance_checks [] : { component, hover, focus, pressed, disabled, accessible_label }
├── feedback_inventory [] : { action, visual, haptic, audio, latency_ms }
├── mental_model : { design_model, system_image, user_model_assumptions [] }
├── gulfs : { execution_bridges [], evaluation_bridges [] }
├── peak_end_map [] : { step_name, emotion (-5..+5), is_peak, is_end }
└── violations [] : { rule_id, severity, screen_ref, suggested_fix }

law_library (seed en DB, pas user-generated)
├── slug, name_fr, name_en, category, summary, example_good, example_bad, source_url, reliability (strong|medium|folklore)
```

Le champ `reliability` permet de trier le sérieux (Nielsen/Fitts/Gestalt = strong) du marketing (certaines "lois" réchauffées sur Twitter = folklore).

---

## 9. Pièges classiques à éviter

1. **Réinventer une interaction standard sans raison** → brise Jakob's Law. Les users arrivent avec les patterns de 10 apps qu'ils utilisent déjà. Inventer un nouveau geste de swipe "original" = 80% de users perdus.
2. **Appliquer Miller's Law à tort** à des menus visibles. Le menu d'Amazon a 30+ liens et fonctionne très bien — parce qu'on **lit**, on ne **mémorise** pas. Le piège : couper arbitrairement une navigation à 7.
3. **Confondre belle UI et bonne UX** (Aesthetic-Usability mal compris). Si une frustration existe en usage quotidien, la beauté ne sauve pas.
4. **Oublier le feedback sur les tâches asynchrones** — au-delà de 1s sans signal, l'user re-clique, duplique une commande, ou part. Les gulfs d'évaluation tuent plus que ceux d'exécution.
5. **Surcharger l'écran de Von Restorff** — si tout "ressort" (rouge, gras, badge, animation), plus rien ne ressort. La hiérarchie émerge du **contraste**, pas de l'emphase.
6. **Ignorer la Paradox of the Active User** — penser que les users vont lire ton onboarding, ton aide, tes release notes. Non. Design pour un user qui n'a rien lu et veut finir sa tâche **maintenant**.
7. **Prendre les "lois UX" comme règles absolues** — ce sont des **heuristiques**. Elles orientent, ne décident pas à ta place. Toujours valider en test utilisateur.

---

## 10. Références autoritatives

1. **Norman, Donald A. — *The Design of Everyday Things*, Revised Ed. (2013)**. La bible : affordances, signifiers, mappings, feedback, gulfs. https://en.wikipedia.org/wiki/The_Design_of_Everyday_Things
2. **Nielsen, Jakob — 10 Usability Heuristics for User Interface Design (NN/g, updated 2024)**. https://www.nngroup.com/articles/ten-usability-heuristics/
3. **Yablonski, Jon — *Laws of UX* (O'Reilly, 2020) + lawsofux.com**. Catalogue curé, solide, non folklorique. https://lawsofux.com/
4. **Sweller, John — Cognitive Load Theory (1988 +)**. Fondation scientifique pour intrinsic/extraneous/germane. Synthèse : https://en.wikipedia.org/wiki/Cognitive_load
5. **Interaction Design Foundation — Gestalt Principles & Affordances (updated 2026)**. https://ixdf.org/literature/topics/gestalt-principles / https://ixdf.org/literature/topics/affordances
6. **NN/g — The Two UX Gulfs: Evaluation and Execution**. https://www.nngroup.com/articles/two-ux-gulfs-evaluation-execution/
7. **Apple Human Interface Guidelines (feedback, clarity, deference, depth, consistency)**. https://developer.apple.com/design/human-interface-guidelines
8. **Material Design 3 — States & Motion**. https://m3.material.io/foundations/interaction/states
9. **Carroll, J.M. & Rosson, M.B. — Paradox of the Active User (1987)**. Résumé NN/g : https://www.nngroup.com/articles/paradox-of-the-active-user/
10. **UX Myths — Myth #23 (Miller's 7±2 mal utilisé)**. https://uxmyths.com/post/931925744/myth-23-choices-should-always-be-limited-to-seven — pour se vacciner contre le folklore.

---

## 11. Priorité MVP

| Priorité | Éléments | Justification |
|----------|---------|---------------|
| **Must** | Mode Débutant (Nielsen 10 audit), Laws library filtrable (top 15 lois reliability=strong), Affordance Checker, Feedback Inventory, Mental Model Canvas, Design Principles Card export | Ces 6 outils couvrent 80% de la valeur. Nielsen + Norman + Yablonski = socle non-négociable. Sans eux, l'onglet Design n'a pas de chapitre 5 crédible. |
| **Should** | Mode Intermédiaire (audit par type d'écran), Cognitive Load Meter, Hick Menu Analyzer, Peak-End Journey Mapper | Apportent la profondeur "Intermédiaire" qui différencie Mindeck des catalogues de lois passifs. |
| **Nice** | Gestalt Screenshot Review (upload + annotation), Doherty Latency Log automatisé, validation CI design (Figma lint plugin), exports PDF stylés | Puissant mais coûteux. À faire après validation des flows "Must". |

---

## 12. Estimation complexité d'implémentation

| Brique | Complexité | Justification |
|--------|-----------|---------------|
| Nielsen 10 audit checklist | **S** | 10 questions + state simple + score. Seed de contenu pédagogique. |
| Laws library + filtres + pin | **M** | ~50 entrées seed avec tooltip/exemples/sources. Filtres multi-critères. Internationalisation FR/EN plus tard. |
| Affordance Checker + Feedback Inventory | **M** | Formulaires structurés + règles de validation. |
| Mental Model Canvas + Peak-End Mapper | **M** | Éditeur visuel léger (colonnes / sliders). Export PNG = lib tierce. |
| Cognitive Load Meter | **M** | Formule empirique (pondérations à calibrer). UI simple. |
| Mode Intermédiaire par type d'écran | **L** | Mapping règles × contextes × seeds de contenu. Beaucoup de contenu à écrire proprement. |
| Gestalt Screenshot Review | **L** | Upload + canvas d'annotation + persistence. Non trivial. |
| Design Principles Card auto-générée (output) | **L** | Synthèse intelligente basée sur choix user. Templating soigné + export. |
| Figma lint / Storybook plugin | **XL** | Intégration externe + maintenance. Hors MVP. |

**Stratégie** : livrer Must (~S+M) en 2 sprints, Should en 1 sprint, Nice en v2. Le cœur pédagogique (contenus loi par loi) doit être rédigé par Anthony ou sourcé d'un contributeur UX — c'est 60% de la valeur perçue.

---

**Sources principales consultées :**
- [NN/g — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Laws of UX — Jon Yablonski](https://lawsofux.com/)
- [IxDF — Affordances](https://ixdf.org/literature/topics/affordances)
- [IxDF — Gestalt Principles](https://ixdf.org/literature/topics/gestalt-principles)
- [NN/g — Two UX Gulfs](https://www.nngroup.com/articles/two-ux-gulfs-evaluation-execution/)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines)
- [Material Design 3 — States](https://m3.material.io/foundations/interaction/states)
- [UX Myths — Miller 7±2](https://uxmyths.com/post/931925744/myth-23-choices-should-always-be-limited-to-seven)
- [Cambridge — Cowan, Magical Number 4](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/magical-number-4-in-shortterm-memory-a-reconsideration-of-mental-storage-capacity/44023F1147D4A1D44BDC0AD226838496)
- [Peak-End Rule — NN/g](https://www.nngroup.com/articles/peak-end-rule/)
- [Paradox of the Active User — NN/g](https://www.nngroup.com/articles/paradox-of-the-active-user/)
- [Doherty Threshold — Laws of UX](https://lawsofux.com/doherty-threshold/)
- [Postel's Law — Laws of UX](https://lawsofux.com/postels-law/)
- [Wikipedia — Cognitive Load](https://en.wikipedia.org/wiki/Cognitive_load)
- [Wikipedia — Design of Everyday Things](https://en.wikipedia.org/wiki/The_Design_of_Everyday_Things)
