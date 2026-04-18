# TECHNIQUE-DOUBLE-CHECK.md

> Synthèse de 4 recherches web parallèles (2026-04-18) pour valider que l'onglet Technique de Mindeck est **le meilleur** du marché et identifier les gaps à combler en V5.

## 🎯 Verdict global

**Mindeck est déjà best-in-class sur** :
- ✅ Pédagogie débutant→expert (12 chaps avec Mode Débutant — unique sur le marché)
- ✅ All-in-one brainstorm → design → tech → prod
- ✅ Scoring ICE + cockpit pilotage
- ✅ Catalogue 26 catégories services avec scoring 🔥🌱🪦
- ✅ Exports Markdown + JSON + Claude brief (personne ne fait aussi bien pour l'IA)

**Mindeck perd vs marché sur** :
- ❌ **Pas de cost calculator live** (demande #1 des indie hackers 2026)
- ❌ **Pas d'auto-import package.json** (GitHub Projects/Cortex scannent auto)
- ❌ **Pas d'export Infrastructure-as-Code** (Terraform/Pulumi)
- ❌ **Pas de decision tree visuel** entre ADRs
- ❌ **Pas de Cmd+K command palette** (standard 2026)
- ❌ **6 catégories services manquantes** (AI Eval, AI Gateway, AI Observability, Compliance Auto, A/B Testing dédié, Feature Flags dédié)

## 📊 1. Gap analysis vs concurrents

### Concurrents directs benchmarkés

| Produit | Ce qu'il fait mieux | Ce que Mindeck fait mieux |
|---|---|---|
| **Notion** | Flexibilité DB + templates infinis | Pédagogie, UI focalisée |
| **Linear** | UX bluffante, ADR "Decisions" natif | 12 chaps Design, cockpit |
| **Cortex (IDP)** | Auto-scan 60+ outils | Solo-friendly, pas d'overhead |
| **StackShare** | Catalogue communautaire | Scoring 🔥🌱🪦, filtrage type projet |

### 5 manques critiques identifiés

1. **Cost estimator live** ⭐⭐⭐ — Tous les SaaS le font (Vercel, Supabase preview). Mindeck a une matrice statique dans chap 11 mais pas de live calc sur la stack Services choisie.
2. **Auto-import GitHub / package.json** ⭐⭐⭐ — Demande #1 des indie hackers 2026.
3. **Export Terraform / Pulumi** ⭐⭐ — Personne ne le fait encore depuis un outil de cadrage → **opportunité de différenciation**.
4. **Decision Tree visuel entre ADRs** ⭐⭐ — "Si X choisi, Y devient impossible".
5. **Cmd+K Command Palette** ⭐ — Standard 2026 attendu.

## 💬 2. Feedback dev forums 2026

### Top 10 frustrations

1. **Notion DB non-scalable** ("slow APIs + no GitHub integration")
2. **Cost opacity** ("combien ça coûte vraiment à scale ?")
3. **Stack decisions = trial & error** — pas de framework pour comparer 3 options
4. **Tech debt tracking invisible** — pas d'outil standard pour "pourquoi on a choisi X"
5. **AI-generated code = security blank** — scanner vulnérabilités Claude/Cursor
6. **Infrastructure budgeting scattered** — Vercel + Railway + Supabase + Stripe = 4 dashboards
7. **Onboarding AI-assistants inefficace** — "comment briefer Claude sur ma stack ?"
8. **Vendor lock-in anxiety** — Supabase vs Firebase : pas de matrice exit strategy
9. **Design System ROI invisible** — "dois-je investir dans un DS ?"
10. **Package.json → stack inference missing** — aucun scanner

### Features rêvées (à implémenter dans V5+)

- Cost Calculator intégré (Vercel + Supabase + Stripe auto)
- Decision Matrix visuelle (scoring RICE sur stack)
- Package.json Scanner (upload ou link GitHub)
- ADR templating auto
- Tech Debt Ledger
- Stack Sharepoint (export pour mentor/dev)
- Vendor Lock-in Meter (score par service)
- AI Context Generator (brief Claude digeste)
- Infrastructure Checklist (monitoring, backup, rate limit)
- Multi-scenario testing (Stack A vs B à 100k users)

### Vocabulaire 2026 à intégrer

**Agentic** · **Cognitive Debt** (Thoughtworks) · **Vendor Lock-in** · **Decision Matrix** · **Tech Debt Ledger** · **MCP** (Model Context Protocol) · **E2B/Replicate/Modal** (agent sandboxes) · **FinOps** · **DX** · **Portability**

### Workflow AI 2026 "80/15/5"

- **80%** Cursor IDE pour daily coding
- **15%** Claude Code pour refactors larges
- **5%** ChatGPT/Perplexity pour research

**Implication Mindeck** : le "Stack brief export Claude" est un différenciateur unique — il faut l'améliorer (format MCP-compatible ?).

## 🆕 3. Nouveautés SaaS 2026 (catégories manquantes)

### 6 nouvelles catégories à ajouter au chap 7 Services tiers

1. **🧪 AI Eval & Testing** — DeepEval, Braintrust Evals, Galileo
2. **👀 AI Observability & Tracing** — Langfuse (acquis ClickHouse), Pydantic Logfire, Helicone, Braintrust
3. **🚪 AI Gateway & Routing** — Portkey (2T tokens/jour), OpenRouter, LiteLLM
4. **✅ Compliance Automation** — Vanta, Drata, Delve
5. **💬 DevRel/API-First Support** — Plain (GraphQL, $35/seat), Pylon (Slack-first)
6. **🚩 Feature Flags dédiés** (actuellement dans chap 8 Hosting, à extraire) — DevCycle, LaunchDarkly, Statsig

### 20 services à ajouter au catalogue

| Catégorie | Service | Score |
|---|---|---|
| AI Eval | Braintrust | 🔥 |
| AI Eval | Langfuse | 🔥 |
| AI Eval | Pydantic Logfire | 🌱 |
| AI Eval | Helicone | 🌱 |
| AI Gateway | Portkey | 🔥 |
| AI Gateway | OpenRouter | 🔥 |
| AI Gateway | LiteLLM | 🌱 |
| AI Dev | Cursor 3 | 🔥 |
| AI Dev | Windsurf | 🔥 |
| AI Dev | Claude Code | 🔥 |
| DB | Convex | 🌱 |
| Payment | Polar.sh | 🌱 |
| Compliance | Vanta | 🌱 |
| Compliance | Drata | 🌱 |
| Support | Plain | 🌱 |
| Support | Pylon | 🌱 |
| Infra | Vercel AI Gateway | 🔥 |
| Infra | Vercel Toolbar | 🌱 |
| Feature Flags | DevCycle | 🌱 |
| Analytics | PostHog AI | 🔥 |

### 4 services à dégrader en 🪦 legacy

- **SendGrid** (email) → Resend/Postmark l'ont surpassé
- **PlanetScale** (MySQL) → Neon (Postgres + branching) l'a dépassé
- **GitHub Copilot Workspace** → Cursor + Claude Code le dépassent (18% vs 29% déclin)
- **Gatsby** → Next.js 16 Turbopack

## 🎨 4. Patterns UX 2026 à adopter

### Top 10 patterns à implémenter (par impact)

1. **Cmd+K Command Palette** — accès universel. Linear, Notion, Vercel l'ont tous.
2. **Inline AI suggestions** — chip auto-complète champs si <50% rempli (+37% adoption).
3. **Progressive disclosure via auto-collapse** — ✅ Mindeck a déjà ça (bravo).
4. **Deep link + keyboard nav** — `Arrow keys` pour naviguer chapitres, `Space/Enter` pour collapse.
5. **Smart onboarding "Choose Your Path"** — modal first-time (débutant / ex-Linear / expert).
6. **Live side-by-side comparison** — 2 options ADR en colonnes.
7. **Micro-interactions sparingly** — checkmark animé au save, pas de confetti.
8. **Feedback affordance précis** — toast "Section sauvegardée ✓" + "Prochaine étape : …".
9. **Form validation contextuelle** — inline errors + green light + boutons disabled si prérequis manquants.
10. **Export contextuelle** — `Cmd+E` pour export chapitre actuel.

### Shortcuts clavier attendus

| Shortcut | Action |
|---|---|
| `Cmd+K` | Command palette |
| `Cmd+E` | Export MD chapitre |
| `Cmd+Shift+S` | Sync Brainstorm → Cockpit |
| `Tab / Shift+Tab` | Naviguer chapitres |
| `Space / Enter` | Expand/collapse bloc |
| `Ctrl+Shift+L` | Toggle Débutant/Formulaire |

### A11y 2026 (WCAG 2.2 AA)

- `aria-expanded` sur chaque header → ✅ déjà dans `CollapsibleSection`
- `Enter`/`Space` toggle → ✅ déjà (button natif)
- Focus visible ring 2px → à vérifier au screenshot
- `aria-live="polite"` pour % complétude → à ajouter
- Zoom 200% sans casse → à tester

## 🚀 Roadmap V5 prioritaire

### 🔥 MUST (< 1 semaine de dev solo)

1. **Ajouter 6 catégories services** au catalogue (chap 7) — `services-catalog.ts` : AI Eval, AI Gateway, AI Observability, Compliance Auto, Feature Flags, DevRel Support.
2. **Ajouter 20 nouveaux services** (voir tableau ci-dessus) dans les catégories existantes.
3. **Dégrader 4 services** en 🪦 legacy (SendGrid, PlanetScale, Copilot Workspace, Gatsby).
4. **Cmd+K Command Palette** — composant partagé, ouvre une search + actions (naviguer chap, toggle mode, export).
5. **`aria-live="polite"`** pour le % complétude dans ChapterShell (a11y).

### 🌱 SHOULD (V5.1)

6. **Cost calculator live** — widget qui somme coûts Vercel + Supabase + LLM + autres selon sélections → affiche $ mensuel estimé en header chap 7 et chap 11.
7. **Decision Tree ADRs** — visualisation des liens entre décisions archivées (dans l'onglet Décisions, pas Technique).
8. **Side-by-side comparison** — bouton "Comparer 2 options" dans chaps 3-8 pour mettre 2 services en colonnes.
9. **Smart onboarding modal** — first-time "Débutant / Ex-Linear / Expert" → filtre chaps + templates.

### ⭐ NICE (V6+)

10. **Package.json scanner** — upload/GitHub link → auto-détection stack → pré-remplissage chaps 3-5.
11. **Terraform/Pulumi export** — chap 8 Hosting génère config IaC prête à déployer.
12. **AI Context Generator MCP-compatible** — export brief pour Claude Code en format MCP.
13. **Vendor Lock-in Meter** — score par service tiers.
14. **Tech Debt Ledger** — section dédiée dans chap 11 Coûts & Compliance.

## 📚 Sources consolidées

- [Notion Tech Stack Templates 2026](https://www.notion.com/templates/tech-stack)
- [Linear MCP for Product Management](https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management)
- [Cortex Internal Developer Portal](https://www.cortex.io/ebook/best-practices-for-building-or-deploying-an-internal-developer-portal)
- [Cursor vs Windsurf vs Zed 2026](https://www.octavehq.com/post/windsurf-vs-cursor-vs-zed-which-ai-ide-in-2026)
- [DevCycle vs LaunchDarkly 2026](https://devcycle.com/launchdarkly-vs-devcycle)
- [Terraform vs Pulumi vs OpenTofu 2026](https://dev.to/muskan_8abedcc7e12/infrastructure-as-code-best-practices-terraform-pulumi-and-opentofu-in-2026-4nc1)
- [Indie Hacker SaaS Stack 2026](https://www.tldl.io/resources/indie-hacker-saas-stack-2026)
- [Ask HN: Personal Software Stack 2026](https://news.ycombinator.com/item?id=46392642)
- [Thoughtworks Radar 34: Cognitive Debt](https://techedgeai.com/thoughtworks-technology-radar-34-highlights-ai-induced-cognitive-debt-and-new-security-mandates/)
- [Portkey Gateway 2T Tokens/Day](https://thenewstack.io/portkey-gateway-open-source/)
- [Langfuse ClickHouse Acquisition 2026](https://www.braintrust.dev/articles/langsmith-alternatives-2026)
- [Vanta vs Drata 2026](https://cybersierra.co/blog/vanta-drata-review/)
- [PostHog AI 2026](https://blog.elest.io/posthog-the-all-in-one-product-analytics-platform-with-ai/)
- [Vercel AI Gateway 2026](https://vercel.com/ai-gateway)
- [Linear Shortcuts Design 2026](https://shortcuts.design/tools/toolspage-linear/)
- [Notion AI April 2026](https://fazm.ai/blog/notion-ai-releases-april-2026)
- [SaaS Onboarding 2026](https://www.appcues.com/blog/user-onboarding-tools)
- [Collapsible A11y WCAG](https://www.thewcag.com/examples/accordions)

---

*Document généré le 2026-04-18 · basé sur 4 recherches web parallèles (concurrents, feedback forums, nouveautés SaaS, patterns UX) · verdict : Mindeck best-in-class sur pédagogie mais doit combler 6 gaps critiques pour être n°1 absolu.*
