# Refonte onglet Design — Archives de recherche

> Livrables bruts du workflow de recherche multi-agents mené le 2026-04-17.
> Ces documents sont la **source de vérité non-synthétisée** pour la refonte de l'onglet Design.
> La synthèse finale + décisions validées se trouve dans `../design-tab-research.md` (dossier parent).

## Structure

```
specs/
├── design-tab-research.md              ← synthèse Phase 3 + décisions Phase 4 (à lire en premier)
└── design-tab-research/                ← ce dossier (archives)
    ├── README.md                       ← ce fichier
    ├── phase-1-cartographie-macro.md   ← Phase 1 : cartographie des 12 chapitres
    ├── chapter-01-foundations.md       ← Expert 1 : fondations stratégiques (JTBD, personas, positioning)
    ├── chapter-02-brand-identity.md    ← Expert 2 : identité de marque & ton (archétypes, voice)
    ├── chapter-03-information-architecture.md  ← Expert 3 : IA, sitemap, nav
    ├── chapter-04-user-flows.md        ← Expert 4 : parcours, onboarding, aha moment
    ├── chapter-05-interaction-principles.md    ← Expert 5 : Nielsen, Norman, Yablonski, Gestalt
    ├── chapter-06-visual-design.md     ← Expert 6 : couleur, typo, spacing, OKLCH (LE chapitre)
    ├── chapter-07-design-system.md     ← Expert 7 : tokens, composants, patterns
    ├── chapter-08-states-microinteractions.md  ← Expert 8 : loading, empty, error, Saffer
    ├── chapter-09-ux-writing.md        ← Expert 9 : microcopy, boutons, erreurs
    ├── chapter-10-accessibility.md     ← Expert 10 : WCAG 2.2, EAA, a11y
    ├── chapter-11-adaptivity.md        ← Expert 11 : responsive, dark mode, densité
    ├── chapter-12-validation.md        ← Expert 12 : tests users, SUS, PMF, NSM
    └── competitive-analysis.md         ← Veille : 40+ outils analysés (v0, Figma AI, Radix, etc.)
```

## Méthode suivie

1. **Phase 1** (1 agent `general-purpose`) — cartographie macro, identification des 12 chapitres canoniques.
2. **Checkpoint validation Anthony** (chapitres validés, ordre confirmé).
3. **Phase 2** (13 sous-agents en parallèle) — 12 experts par chapitre + 1 veille concurrentielle. Chacun avec template canonique strict.
4. **Phase 3** — synthèse dans `../design-tab-research.md`.
5. **Phase 4** — 10 décisions validées avec Anthony (voir §0 du doc synthèse).

## Template canonique (appliqué par tous les experts)

Chaque chapitre suit 12 sections :
1. Objectif du chapitre (3 lignes, compréhensible enfant 12 ans)
2. Questions clés à poser à l'user (5-10, formulations Simple + Expert)
3. UX du chapitre — 3 modes progressifs (Débutant/Intermédiaire/Expert)
4. Widgets / générateurs à implémenter
5. Règles de validation automatique
6. Contenus pédagogiques (tooltips, mini-leçons, ✓/✗)
7. Outputs générés (markdown, JSON, CSS, PDF…)
8. Modèle de données conceptuel
9. Pièges classiques à éviter
10. Références autoritatives (5+ sources)
11. Priorité MVP (must/should/nice)
12. Estimation complexité (S/M/L/XL)

## Décisions validées (résumé)

Voir `../design-tab-research.md` §0 pour la liste complète. Points clés :
- **Scope** : SaaS public monétisé (pivot)
- **Ordre** : chap. 6 Visuel en priorité (killer feature), puis MUST étendu des 11 autres
- **MVP chap. 6** : 6 semaines, 10+ widgets
- **Modes** : Simple / Avancé / Pro
- **Langue** : FR-only en MVP
- **Icônes** : emoji
- **Total MVP vendable** : ~20 semaines (5 mois)

## Comment utiliser ces archives

- **Si tu codes un chapitre** : lire le `chapter-XX-*.md` correspondant pour détails widgets/validations/outputs, puis revenir au doc synthèse pour voir ce qui a été retenu en MUST.
- **Si tu veux comprendre un choix** : chaque décision §0 du doc synthèse découle d'une analyse présente dans ces archives.
- **Si tu veux défier une décision** : les chapitres bruts contiennent les contre-arguments, notamment les sections "Pièges classiques" et "sans sycophantie".
- **Pour l'onboarding d'un nouveau contributeur** : lire README → synthèse → chapitre concerné.
