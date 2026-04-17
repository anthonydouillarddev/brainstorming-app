# Chapitre 12 — Validation & itération

> Livrable brut de l'Expert 12 (general-purpose).
> Couvre : 5-user rule (Nielsen), usability testing, SUS, SEQ, PMF score (Sean Ellis), NSM, analytics produit, Mom Test (Rob Fitzpatrick), Atomic Research.
> **Adapté au scope Anthony solo** (pas de budget UX agency).

## 1. Objectif du chapitre

Construire un truc sans jamais le montrer à personne, c'est comme écrire une lettre sans l'envoyer : tu sais pas si elle est claire. Ce chapitre t'apprend à **tester ton projet avec de vrais utilisateurs** (même 5 suffisent !) et à **mesurer si ça marche vraiment** avec des chiffres simples. Parce qu'un beau design qui sert à rien reste un design qui sert à rien.

## 2. Questions clés à poser à l'user

1. **As-tu déjà montré ton projet à quelqu'un d'autre que toi ?** / *Combien de personnes extérieures ont utilisé ton produit ?*
2. **Peux-tu décrire ce que fait ton produit en 1 phrase, sans jargon ?** / *Si un enfant de 10 ans te demande à quoi ça sert, tu réponds quoi ?*
3. **Quelle est la tâche principale qu'un user doit réussir pour que ton produit soit utile ?** / *Quel est le "moment aha" de ton app ?*
4. **Comment mesures-tu aujourd'hui si ton produit est utilisé ou non ?** / *As-tu des analytics en place ? Lesquels ?*
5. **Quelle est ta North Star Metric — le chiffre unique qui prouve que ton produit crée de la valeur ?** / *Si tu devais n'afficher qu'un seul KPI, ce serait lequel ?*
6. **Connais-tu le % de tes users qui seraient "très déçus" si ton produit disparaissait demain ?** / *As-tu déjà mesuré le Product/Market Fit façon Sean Ellis ?*
7. **Quand un user galère sur une étape, comment le sais-tu ?** / *As-tu un feedback widget, session recording ou hotjar/clarity ?*
8. **As-tu une trace écrite des insights de tes derniers entretiens users ?** / *Où stockes-tu les retours users que tu collectes ?*
9. **Fais-tu des A/B tests, ou tu décides au feeling ?** / *Comment tranches-tu entre 2 designs quand tu hésites ?*
10. **Ton produit a-t-il déjà été testé par quelqu'un qui n'est ni un ami, ni de la famille ?** / *As-tu des testeurs "froids" (ne te connaissent pas) ?*
11. **Quelle question poses-tu en premier dans un entretien user ?** / *Ton script d'interview commence par quoi ?*
12. **Si je te dis "NPS à 50", c'est bon ou pas bon ?** / *Comprends-tu les limites des métriques marketing vs produit ?*

## 3. UX du chapitre — 3 modes progressifs

### Mode Débutant — "5 amis testent ton app"

Un **checklist guidé ultra simple** en 3 phases :

**Avant le test (prépa)**
- [ ] Définir 1 objectif clair ("Je veux savoir si les gens comprennent comment créer un projet")
- [ ] Choisir 3 tâches précises à faire tester (ex : "Crée un nouveau projet", "Ajoute une tâche", "Change le thème")
- [ ] Recruter 5 personnes (pas ta maman — on y reviendra)
- [ ] Préparer 1 script de 10 lignes (accueil + consignes + questions finales)

**Pendant le test (animation)**
- [ ] Dire "ce n'est PAS toi qu'on teste, c'est l'app" (rassurer)
- [ ] Demander au user de **penser à voix haute** (Think-Aloud Protocol de Nielsen)
- [ ] Ne JAMAIS aider, ne JAMAIS expliquer — observer et noter
- [ ] Chronométrer chaque tâche (time-on-task)
- [ ] Noter chaque hésitation, chaque clic raté

**Après le test (debrief)**
- [ ] Poser la SEQ (Single Ease Question) : "Sur 7, c'était facile ou dur ?"
- [ ] Demander 1 chose à améliorer en priorité
- [ ] Regrouper les 5 tests : quels problèmes reviennent ≥ 2 fois ? → à fixer

Le mode débutant pousse l'explication derrière chaque case : **"Pourquoi 5 users ? Parce que Jakob Nielsen a prouvé en 2000 que 5 users révèlent 85% des problèmes d'utilisabilité"** (source Nielsen Norman Group, "Why You Only Need to Test with 5 Users").

### Mode Intermédiaire

- **Usability test plan builder** : formulaire qui génère un plan complet (objectifs SMART, personas, 3-5 scénarios, questions pré/post)
- **Heuristic evaluation auto-guide** : on affiche les 10 heuristiques de Nielsen une par une, l'user coche les violations par écran, avec exemples
- **SUS calculator** : les 10 questions du System Usability Scale (Brooke 1996), score automatique /100, benchmark affiché ("68 = moyenne industrie", "> 80 = excellent")
- **First-click test planner** : 1 écran + 1 tâche → où cliquent-ils en premier ? (Bob Bailey a montré que si le 1er clic est bon, la task success rate grimpe à 87%)
- **Interview script generator** version "Mom Test" (Rob Fitzpatrick) : pas de questions orientées, parler du passé pas du futur

### Mode Expert

- **North Star Metric + input metrics builder** : 1 NSM (ex : "Projects actively managed per week") + 3-5 input metrics qui y contribuent (taux activation, rétention W1, etc.)
- **PMF score tracker** (Sean Ellis survey) : envoi automatique aux users actifs, dashboard % "very disappointed" (seuil 40% = PMF)
- **Event tracking plan generator** : convention `noun_verb` (PostHog/Amplitude recommandée), ex : `project_created`, `task_completed`, avec properties typées
- **Research repository template** : base de données structurée (quotes + tags + insights + actions)
- **Funnel analyzer spec** : définir les étapes critiques (landing → signup → activation → retention)
- **A/B test plan builder** avec calcul de **sample size** automatique (Evan Miller calculator intégré conceptuellement) pour éviter les tests sous-dimensionnés

## 4. Widgets / générateurs à implémenter

1. **Usability test plan generator** — objectif + audience + 3-5 scenarios + questions pré/post + SEQ + script d'animation
2. **Nielsen 10 heuristics audit** — grille par écran, check-by-check, notation 0-4 de sévérité (Nielsen severity scale)
3. **Cognitive walkthrough wizard** — pour chaque tâche : (1) l'user sait-il quoi faire ? (2) voit-il l'option ? (3) comprend-il que c'est la bonne ? (4) a-t-il un feedback ?
4. **SUS calculator** — 10 questions Likert 1-5, formule officielle (impair-1 + 5-pair) × 2.5
5. **SEQ widget** — 1 seule question après chaque tâche, score 1-7
6. **PMF score tracker** — Sean Ellis test, segmentation par source d'acquisition
7. **North Star + input metrics builder** — 1 NSM (Reforge / Amplitude framework) + 3-5 input metrics
8. **Event tracking plan generator** — nom d'événement + properties + qui trigger + quand + pourquoi (Mixpanel "Object + Action" ou PostHog convention)
9. **Interview script generator (Mom Test)** — 5 whys, questions ouvertes, pas de pitches déguisés
10. **Research repository** — quotes + insights + tags + statut (à faire / en cours / action prise) — format Atomic Research (Tomer Sharon)
11. **A/B test plan** — hypothèse + métrique primaire + sample size + durée + critères d'arrêt
12. **Heatmap / session recording setup guide** — comment installer Microsoft Clarity (gratuit) ou PostHog self-hosted

## 5. Règles de validation automatique

- **"0 user test réalisé depuis 90 jours"** → alerter : "Tu designes dans le vide (no-design-in-vacuum). Programme 1 test cette semaine"
- **"PMF score < 40%"** → alerter : "Pas encore de PMF selon Sean Ellis. N'accélère pas l'acquisition, itère sur le produit"
- **"NSM = page_views ou signups"** → alerter : "C'est une vanity metric. Ta NSM doit refléter la valeur reçue par l'user (ex : 'projets terminés'), pas le trafic"
- **"Moins de 5 users testés"** → rappel : "Nielsen prouve que 5 suffisent, mais sous 5 tu rates 85% des insights"
- **"A/B test lancé sans calcul sample size"** → bloquer : "Sans sample size, tu vas tirer des conclusions sur du bruit statistique (Evan Miller)"
- **"Interviews testées uniquement sur amis/famille"** → alerter : "Biais massif (mom test). Trouve 3 users qui ne te connaissent pas"
- **"Session recording activé sans consentement RGPD"** → bloquer : "Ajoute un banner cookie consent"
- **"Research repository vide depuis 6 mois"** → alerter : "Tes insights se perdent. Stocke-les atomiquement (1 insight = 1 card)"
- **"SUS score < 68"** → rappel : "Tu es sous la moyenne industrie. Priorise les fixes avant d'ajouter des features"

## 6. Contenus pédagogiques

**Tooltips clés :**
- "**Pourquoi 5 users suffisent**" : Nielsen a modélisé mathématiquement que N(1 − (1−L)^n) users révèlent tous les problèmes, avec L ≈ 31%. Après 5 users, le ROI décroît : le 6e user révèle majoritairement les mêmes problèmes.
- "**Le piège du NPS pour les early-stage**" : NPS (Reichheld 2003) est corrélé à la satisfaction moyenne, pas à la croissance. Pour un produit early, **PMF score (Sean Ellis)** est 10× plus actionnable. NPS devient utile à l'échelle (> 1000 users) comme indicateur de tendance, pas comme métrique primaire. Dire "NPS de 50 c'est bon" sans contexte industrie = non-sens.
- "**Vanity metric vs value metric**" : "Vues de page" = vanity. "Users qui ont complété l'onboarding et reviennent semaine 2" = value. La value metric reflète **la valeur reçue**, pas l'activité brute.
- "**Le Mom Test (Rob Fitzpatrick)**" : Ne JAMAIS demander "Est-ce que tu utiliserais ça ?" → tout le monde dit oui pour être gentil. Demander "La dernière fois que tu as eu ce problème, qu'as-tu fait ?" → tu obtiens des faits.
- "**Moderated vs unmoderated**" : Moderated (Zoom + toi) = insights profonds mais lent. Unmoderated (Maze, Lyssna) = scalable mais insights superficiels. Pour un dev solo : moderated pour les 5 premiers, unmoderated ensuite.
- "**Severity rating de Nielsen**" : 0 = pas un problème, 1 = cosmétique, 2 = mineur, 3 = majeur (à fixer avant release), 4 = catastrophe.

**Mini-leçons :**
- "Les 3 types de research" (Tomer Sharon) : génératif (découvrir), évaluatif (valider), continu (monitoring)
- "Triangulation quali + quanti" : les chiffres disent QUOI, les interviews disent POURQUOI
- "Le piège du HiPPO" (Highest Paid Person's Opinion) : dans un solo-project, c'est toi. Test > intuition.

**Check ✓ / ✗**
- ✓ Tester 5 users cold, pas 20 amis
- ✓ NSM = value metric (ex : "projects completed")
- ✓ SUS après chaque release majeure
- ✗ NPS comme métrique unique early-stage
- ✗ "Ça marche chez moi" comme validation
- ✗ A/B test sur 50 users et conclure

## 7. Outputs générés

- **Usability test plan** (markdown exportable Claude-ready)
- **SUS score report** (score /100 + benchmark + breakdown question par question)
- **NSM + input metrics dashboard spec** (définitions + formules + seuils)
- **Interview notes template** (structure Atomic Research : participant + quote + insight + tag + action)
- **A/B test plan** (hypothèse + métrique + sample size + durée)
- **Heuristic evaluation report** (10 heuristiques × écrans, severity rating)
- **PMF score report** (% very disappointed + segmentation)
- **Event tracking plan** (tableau noun_verb + properties + triggers)
- **Research insights digest** (top 5 insights du mois, avec quotes + actions)

## 8. Modèle de données conceptuel

Champs à stocker (extension du modèle Mindeck existant) :

**Table `research_items`** (nouvelle — ou réutiliser `decisions` ?)
- `id`, `project_id`, `type` (`usability_test` | `interview` | `heuristic_eval` | `survey` | `ab_test` | `insight`)
- `title`, `objective`, `method`, `participants_count`
- `conducted_at`, `script` (text), `raw_notes` (text)
- `findings` (jsonb : [{ quote, insight, severity, tag }])
- `actions_taken` (text)

**Table `metrics`** (nouvelle)
- `id`, `project_id`, `kind` (`nsm` | `input_metric` | `pmf_score` | `sus_score` | `seq_score`)
- `name`, `definition`, `formula`, `target_value`, `current_value`
- `measured_at`, `is_primary`

**Table `events_plan`** (nouvelle)
- `id`, `project_id`, `event_name` (noun_verb), `properties` (jsonb), `trigger_location`, `purpose`

**Liens avec l'existant :**
- Un **insight** peut générer un **todo** (P1 si severity 3-4) — lien `todos.research_item_id`
- Un **insight structurant** devient une **decision (ADR)** — lien `decisions.source_research_id`
- Les **métriques NSM + input metrics** s'affichent dans le **cockpit** (sous la section "NSM + métriques SaaS" déjà existante)
- Un **risque identifié en test** peut créer un **risk** — lien `risks.source_research_id`

**Alternative minimaliste (recommandée pour scope solo)** : stocker tout en `research_items` avec un `type` discriminant, pas de tables séparées. Linker vers `todos`/`decisions`/`risks` par `source_research_id` nullable.

## 9. Pièges classiques à éviter

1. **NPS comme métrique unique early-stage** — NPS est corrélé à la taille de marché, pas à la qualité produit. Utiliser PMF score (Sean Ellis) + SUS + rétention.
2. **Vanity metrics** (pageviews, signups totaux) — aucune info sur la valeur créée. Toujours lier à une action de valeur.
3. **Tester amis/famille sans briefing** — biais de complaisance énorme. Même en famille, briefer : "sois brutalement honnête, je gagne rien avec du 'c'est bien'".
4. **A/B tests sans sample size suffisant** — conclure sur 100 users = tirer sur du bruit. Calculer avant (Evan Miller, calculator). Solo indie = souvent pas assez de trafic pour A/B test propre → préférer user testing qualitatif.
5. **Ignorer les insights qualitatifs au profit des chiffres** — 5 users qui galèrent sur un même bouton valent plus qu'un taux de conversion à 2 décimales près.
6. **Research sans repository** — insights perdus dans des docs éparpillés = jamais actionnés. Atomic Research (1 insight = 1 card searchable).
7. **Confondre Moderated et Unmoderated** — unmoderated (Maze) est rapide mais rate le "pourquoi". Pour un produit early, commencer moderated.
8. **Biais du chercheur** (questions orientées : "Tu aimerais une fonction X, non ?") — Mom Test : parler du passé, pas du futur.
9. **Tester la mauvaise chose** — tester un prototype laid au lieu du parcours critique. Prioriser les 3 tâches qui font vivre ton produit.
10. **Ne pas clore la boucle** — collecter des insights sans jamais fixer de problème. Règle : chaque test → ≥ 1 action concrète dans les 2 semaines.
11. **Session recording sans consentement RGPD** — risque légal.
12. **Sur-optimiser avant PMF** — A/B tester la couleur d'un bouton quand PMF < 40% = perte de temps. Ordre : PMF → rétention → acquisition → optimisation.

## 10. Références autoritatives

1. **Nielsen, J. (2000)** — *"Why You Only Need to Test with 5 Users"*, Nielsen Norman Group. Le fondement scientifique du 5-user rule.
2. **Nielsen, J. (1994)** — *10 Usability Heuristics for User Interface Design*, NN/g. La référence pour l'heuristic evaluation.
3. **Brooke, J. (1996)** — *"SUS: A Quick and Dirty Usability Scale"*, article fondateur du System Usability Scale. Complété par Sauro & Lewis *"Quantifying the User Experience"* (2016) pour les benchmarks.
4. **Sauro, J. — MeasuringU** — référence mondiale pour les métriques UX quanti (SUS, SEQ, benchmarks industriels). measuringu.com
5. **Krug, S. (2009)** — *Rocket Surgery Made Easy* — guide pratique du DIY usability testing, parfait pour un dev solo.
6. **Fitzpatrick, R. (2013)** — *The Mom Test* — LA bible pour interviewer les users sans biais.
7. **Ellis, S.** — *PMF Survey methodology* (40% "very disappointed" rule), publié sur Startup-Marketing.com et repris par GrowthHackers et Reforge.
8. **Reforge / Amplitude** — *North Star Framework* (John Cutler, Sean McBride). Guide gratuit sur amplitude.com/north-star.
9. **Sharon, T. (2018)** — *Atomic Research* — méthodologie research repository. Articles sur Medium + livre *Validating Product Ideas*.
10. **PostHog Handbook** — product analytics open-source, guide event tracking et funnel. posthog.com/docs
11. **Microsoft Clarity** — heatmaps + session recording gratuit illimité, alternative légère à Hotjar.
12. **Reichheld, F. (2003)** — *"The One Number You Need to Grow"*, HBR — papier fondateur du NPS (à connaître pour ses limites).

## 11. Priorité MVP

**Must (V1)**
- Usability test plan generator (mode débutant)
- Checklist "5 users testent ton app"
- Interview script generator (Mom Test)
- SUS calculator
- Research repository (table simple : insight + quote + action)
- North Star Metric field dans cockpit (déjà existant — à enrichir avec input metrics)
- Règle validation "0 test depuis 90j → alerte"

**Should (V2)**
- Nielsen 10 heuristics audit wizard
- PMF score tracker (Sean Ellis survey)
- Event tracking plan generator
- SEQ widget post-tâche
- Linking research_items → todos / decisions / risks

**Nice (V3+)**
- Cognitive walkthrough wizard
- A/B test plan avec sample size calculator
- Heatmap / session recording setup guide (Microsoft Clarity)
- Funnel analyzer spec
- Atomic Research format complet (tags + search)
- First-click test planner

## 12. Estimation complexité d'implémentation

**L (Large)**

Justification :
- **S** pour chaque widget isolé (SUS calculator, SEQ, interview script generator) — juste des formulaires + formules
- **M** pour le research repository (nouvelle table + UI listing + linking vers existant)
- **L** pour l'ensemble cohérent avec 3 modes progressifs, linking cross-tables (research_items ↔ todos/decisions/risks), outputs markdown et règles de validation intelligentes
- **XL évité** car pas d'intégration analytics externe temps-réel (PostHog / Clarity = config manuelle, pas d'API calls) et pas d'A/B test engine natif

Recommandation d'ordre d'implémentation pour Anthony :
1. Semaine 1 : checklist "5 users" + SUS calculator + interview script (Mom Test) — value immédiate
2. Semaine 2 : research repository minimal (1 table, linking optionnel)
3. Semaine 3 : règles de validation + tooltips pédagogiques
4. Plus tard : heuristic audit, PMF tracker, event plan

---

**Note finale sur le NPS** (demandée sans sycophantie) : le NPS est **surfait pour un produit early-stage solo**. Il mesure une intention verbale ("recommanderiez-vous ?") qui corrèle faiblement à l'action réelle, et dépend massivement du contexte culturel (les Français notent 7/10 quand les Américains notent 9/10 pour la même satisfaction). Pour Mindeck à ton stade : **PMF score + SUS + rétention W4** donnent 10× plus d'info actionnable. Le NPS devient intéressant à > 1000 users actifs comme indicateur de tendance, pas avant.
