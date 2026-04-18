# TECHNIQUE-AUDIT-REPORT.md

> Audit complet (2026-04-18) de l'onglet Technique de Mindeck après livraison V1 des 12 chapitres.

## 📋 Résumé exécutif

- **Code review** : 9 issues trouvées (2 BLOCKING, 3 CRITICAL, 4 SUGGESTION)
- **Double-check concurrentiel** : 6 gaps identifiés vs marché 2026 (voir [TECHNIQUE-DOUBLE-CHECK.md](./TECHNIQUE-DOUBLE-CHECK.md))
- **Fixes appliqués** : 5 bugs corrigés (fuite timer, guards unmount, erreurs silencieuses, double-click ADR, code mort)
- **Lint/build/type-check** : 🟢 0 erreur
- **Audit visuel Playwright** : non exécuté (password Supabase requis — à lancer en local)

## 🐛 Bugs corrigés

| # | Fichier | Severity | Problème | Fix appliqué |
|---|---|---|---|---|
| 1 | `_shared/useChapterPersistence.ts` | **BLOCKING** | Cleanup capture la ref initiale (null) au lieu du vrai timer → fuite + warning React 19 sur les 10 chaps | Lecture de `saveTimer.current` dans le cleanup + flag `mountedRef` pour guarder les `setSaving`/`setLastSaved` après unmount |
| 2 | `_shared/useChapterPersistence.ts` | **BLOCKING** | Save async sans guard unmount → crash React + `onSectionsChange` peut écraser modifs parent plus récentes | Guard `if (!mountedRef.current) return;` après chaque `await` |
| 3 | `_shared/useChapterPersistence.ts` | **CRITICAL** | Erreur réseau Supabase silencieuse : user croit c'est sauvé alors que non | Nouveau state `saveError: string \| null` remonté via hook + affiché dans `ChapterShell` ("⚠ Échec sauvegarde") |
| 4 | `strategy/blocks/DecisionBlock.tsx` | **CRITICAL** | Double-click rapide insère 2 ADR dans `decisions` | Guard `if (pushing) return;` en début de `archiveAsAdr` |
| 5 | `strategy/blocks/DecisionBlock.tsx` | SUGGESTION | `createClient()` re-instancié à chaque render → re-fire useEffect | Mémoïsation via `useMemo(() => createClient(), [])` |
| 6 | `lib/technique/completeness.ts` | SUGGESTION | `DEFAULT_COMPUTER` + type `ChapterComputer` = code mort depuis que les 12 computers sont wire | Suppression |
| 7 | 10× `[chap]/index.tsx` | ESLint error | `react-hooks/set-state-in-effect` dans useEffect localStorage hydration → 9 erreurs | Nouveau hook partagé `_shared/useHydratedLocalStorage.ts` + migration des 10 chaps → zéro `eslint-disable` |

## ⚠️ Issues non corrigées (refactors futurs)

| # | Fichier | Problème | Raison |
|---|---|---|---|
| 8 | `strategy/index.tsx` + `architecture/index.tsx` | Dupliquent ~50 lignes chacun (le pattern `useChapterPersistence` + `ChapterShell` + issues panel + ModeToggle custom) vs les 10 autres chaps qui utilisent les shared | **Gros refactor** (~200 lignes à déplacer, touche 2 chaps sur 12). À faire en V5. Les 2 chaps bénéficieront automatiquement des fixes 1-3 quand migrés. |
| 9 | `strategy/blocks/DecisionBlock.tsx` L104 | `decided_at: new Date().toISOString()` côté client (horloge potentiellement fausse) | Non-bloquant. À laisser DB-side en ajoutant `default now()` sur la colonne `decisions.decided_at` dans une migration future. |

## 🎯 Double-check concurrentiel : gaps identifiés vs marché 2026

Voir [TECHNIQUE-DOUBLE-CHECK.md](./TECHNIQUE-DOUBLE-CHECK.md) pour le détail. Résumé des 6 gaps critiques :

1. **Cost calculator live** ⭐⭐⭐ — demande #1 indie hackers 2026, personne ne le fait bien
2. **Auto-import GitHub / package.json** ⭐⭐⭐ — Cortex + GitHub Projects scannent auto, pas Mindeck
3. **Export Terraform / Pulumi** ⭐⭐ — opportunité de différenciation (aucun concurrent ne le fait)
4. **Decision Tree visuel entre ADRs** ⭐⭐ — Linear a des Decisions liées, Mindeck a juste une table
5. **Cmd+K Command Palette** ⭐ — standard 2026, Mindeck ne l'a pas encore
6. **6 nouvelles catégories services tiers** : AI Eval, AI Gateway, AI Observability, Compliance Auto, Feature Flags dédié, DevRel Support

## 📊 Audit visuel (non exécuté — à faire en local)

Le skill `audit` prévoit Playwright pour screenshots automatisés light/dark/mobile. **Non exécuté** car nécessite :
- Dev server actif (`npm run dev`)
- Mot de passe Supabase user (login programmatique)
- Installation `puppeteer-core` + Chromium local

**Recommandation** : lance l'audit visuel plus tard via le skill si tu veux des screenshots automatisés. Pour l'instant, je recommande un audit manuel :

### Checklist audit visuel manuel

```
# Terminal 1
cd /home/antho/projets/brainstorming-app
npm run dev

# Ouvrir http://localhost:3000 → se connecter → ouvrir un projet → onglet ⚙️ Technique
```

**À vérifier** :

| Catégorie | Check |
|---|---|
| **Mode clair** | Chaque chap s'ouvre, blocs collapsible fonctionnent, % affiché, save error visible si offline |
| **Mode sombre** | Toggle via avatar Settings — tout reste lisible, pas de blanc flashant |
| **Mobile 390px** | Menu vertical devient stack, blocs lisibles, scroll OK |
| **Mode Débutant** | 6 chaps visibles (strategy, frontend, backend, data, auth, hosting), 6 masqués |
| **Mode Intermédiaire** | 12 chaps visibles |
| **Auto-collapse** | Remplir un bloc à 100% → il se replie tout seul |
| **Persistence** | Reload page → le dernier chap ouvert est restauré, blocs gardent leur état |
| **ADR integration** | Chap 1 → Décision → bouton "📌 Archiver comme ADR" → nouvelle entrée dans onglet Décisions |
| **Exports** | Chaque chap a un bloc Exports (fermé par défaut), 3-4 formats (MD, JSON, Claude brief) |
| **Save error** | Couper internet → modifier un champ → attendre 800ms → badge "⚠ Échec sauvegarde" dans header |

## ✅ Estimation complétion

| Aspect | % | Commentaire |
|---|---|---|
| **Features** | 85% | 12 chaps V1 MUST complets. V2 SHOULD/V3 NICE à livrer. 6 gaps concurrentiels identifiés. |
| **UI** | 85% | CollapsibleSection + ChapterShell + ExportPanel cohérents. Manque : Cmd+K palette, inline AI chips, side-by-side compare. |
| **Code quality** | 95% | 0 erreur lint/TS/build. 3 CRITICAL bugs corrigés. Reste : refacto strategy+architecture → shared pattern. |
| **Robustesse** | 90% | Guards unmount, error handling, RLS OK. Reste : tests unitaires (aucun pour l'instant). |
| **UX** | 80% | Auto-collapse, mode Débutant/Formulaire, deep linking OK. Manque : onboarding first-time, shortcuts clavier, feedback sparkles. |
| **Différenciation marché** | 75% | Pédagogie débutant→expert unique. Manque : cost calculator, IaC export, AI scan stack pour matcher/dépasser Linear/Cortex. |

## 🚀 Suggestions priorisées

### Quick wins (< 2h chacun)

1. Ajouter **Cmd+K Command Palette** (composant partagé, navigate chaps + toggle mode) — bonus UX énorme
2. Migrer **strategy + architecture** vers `useChapterPersistence` + `ChapterShell` — supprime ~200 lignes dupliquées
3. Ajouter les **6 nouvelles catégories** au `services-catalog.ts` (AI Eval, AI Gateway, AI Observability, Compliance Auto, Feature Flags, DevRel)
4. Ajouter **20 services 2026** listés dans TECHNIQUE-DOUBLE-CHECK.md (Cursor 3, Windsurf, Braintrust, Langfuse, Polar.sh, Vanta, Drata, Plain, Pylon, etc.)
5. Dégrader **4 services en 🪦 legacy** (SendGrid, PlanetScale MySQL, Copilot Workspace, Gatsby)
6. Ajouter **`aria-live="polite"`** dans `ChapterShell` pour % complétude (a11y WCAG)

### Améliorations V5 (> 1 jour chacun)

7. **Cost calculator live widget** — somme Vercel + Supabase + LLM + autres services sélectionnés → $ mensuel estimé en header
8. **Scanner `package.json`** — upload ou GitHub link → auto-détection stack → pré-remplissage chaps 3-5
9. **Export Terraform / Pulumi** (chap 8 Hosting) — différenciateur unique sur le marché
10. **Decision Tree visuel** (onglet Décisions, pas Technique) — relations causales entre ADRs
11. **Smart onboarding modal** — first-time "Débutant / Ex-Linear / Expert" → filtre chaps + templates
12. **Migration strategy/architecture** vers pattern shared (refactor ~200 lignes)

### Nice to have (V6+)

13. **AI Context Generator MCP-compatible** — export brief Mindeck → format MCP pour Claude Code
14. **Tech Debt Ledger** — section dédiée dans chap 11 Coûts & Compliance
15. **Vendor Lock-in Meter** — score par service tiers
16. **Side-by-side comparison** — bouton "Comparer 2 options" dans chaps 3-8

## 📦 Commits effectués (cette session)

- `feat(technique): phase 0 socle`
- `feat(technique): chap 1-12 V1 MUST` (13 commits)
- `feat(technique): collapse/hide sur chaque bloc`
- `feat(technique): auto-collapse quand 100% rempli (option B)`
- `fix(technique): audit — useChapterPersistence robuste + useHydratedLocalStorage + cleanup code mort` (ce commit)

---

*Audit généré le 2026-04-18 · 9 issues trouvées / 5 fixes appliqués · 6 gaps concurrentiels identifiés · verdict : code solide, UX polie, quelques gaps stratégiques à combler pour devenir n°1 absolu du marché.*
