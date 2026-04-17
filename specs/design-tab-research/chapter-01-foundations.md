# Chapitre 1 — Fondations stratégiques

> Livrable brut de l'Expert 1 (general-purpose).
> Couvre : JTBD (Ulwick/Christensen), personas (Cooper, NN/g), positionnement (April Dunford), principes design, aha moment, anti-goals.

## 1. Objectif du chapitre

Avant de dessiner un bouton, on doit savoir **à qui on s'adresse, pour résoudre quel problème réel, et ce qui nous rend différent**. Ce chapitre pose les bases : sans lui, toutes les décisions design qui suivent (couleurs, écrans, parcours) tournent dans le vide. C'est la première étape parce que le design n'est pas de la décoration — c'est une réponse à une question qu'il faut d'abord formuler.

## 2. Questions clés à poser à l'user

1. **Quel est le vrai problème que ton produit résout ?**
   - Simple : « Si ton produit disparaissait demain, qu'est-ce que les gens ne pourraient plus faire ? »
   - Expert : « Formule le Job-to-be-Done principal au format Ulwick : *[verbe] + [objet du job] + [contexte]* » ([Strategyn / Ulwick](https://strategyn.com/jobs-to-be-done/)).

2. **Qui est le seul utilisateur à qui ce produit doit parler en priorité ?**
   - Simple : « Dessine une personne qui va adorer ton truc. Raconte sa journée. »
   - Expert : « Définis 1 à 3 proto-personas avec comportements, buts, frustrations et contexte d'usage » ([NN/g — Persona Types](https://www.nngroup.com/articles/persona-types/)).

3. **Quand et pourquoi cette personne utiliserait ton produit ?**
   - Simple : « Raconte-moi le moment exact où elle ouvre ton app. »
   - Expert : « Écris 3 à 5 *job stories* : *When [situation], I want to [motivation], so I can [outcome]* » ([Intercom — Job Stories](https://www.intercom.com/blog/accidentally-invented-job-stories/)).

4. **Que ferait-elle sans toi ?**
   - Simple : « Si ton app n'existait pas, elle ferait quoi à la place ? »
   - Expert : « Liste les *competitive alternatives*, incluant les non-solutions (Excel, rien du tout, un carnet) » ([April Dunford — Positioning](https://www.aprildunford.com/post/a-quickstart-guide-to-positioning)).

5. **Qu'est-ce que toi seul fais mieux ?**
   - Simple : « Qu'est-ce que ton produit fait que les autres n'ont pas ? »
   - Expert : « Identifie tes *unique attributes*, puis traduis-les en *value themes* pour le segment qui y est sensible. »

6. **À quel moment exact l'utilisateur se dit "ah OK, c'est ça le truc !" ?**
   - Simple : « Le moment où elle devient fan, c'est quoi ? Après avoir fait quoi ? »
   - Expert : « Définis l'*aha moment* sous forme d'action quantifiée (ex : "7 amis en 10 jours" Facebook, "2000 messages équipe" Slack) » ([Amplitude — North Star](https://amplitude.com/blog/product-north-star-metric)).

7. **Quels sont tes 3 à 5 principes design non négociables ?**
   - Simple : « Si tu devais choisir entre deux trucs, tu choisis toujours lequel ? (ex : rapide ou complet ?) »
   - Expert : « Formule des principes sous forme de *trade-offs* opposables (ex : "Clarté > Exhaustivité") » ([Airbnb Design Principles](https://principles.design/examples/airbnb-design-principles)).

8. **Dans quelle catégorie de marché tu veux être rangé ?**
   - Simple : « Si quelqu'un demande "c'est quoi ton truc ?", tu réponds en 1 phrase, c'est quoi ? »
   - Expert : « Choisis ta *market category* pour cadrer l'attente utilisateur et rendre ta valeur évidente. »

9. **Quelles émotions doit ressentir l'utilisateur en sortant ?**
   - Simple : « Après avoir utilisé ton app, il se sent comment ? »
   - Expert : « Définis les *emotional* et *social jobs* associés au job fonctionnel » ([Ulwick JTBD Needs Framework](https://strategyn.com/jobs-to-be-done/)).

10. **Qu'est-ce qu'on refuse explicitement de faire ?**
    - Simple : « Ton app ne servira JAMAIS à quoi ? »
    - Expert : « Définis les *anti-goals* et hors-périmètre — ce qu'on laisse à la concurrence. »

## 3. UX du chapitre — 3 modes progressifs

**Mode Débutant — "Conversation guidée"**
Une seule question à l'écran à la fois, style chat. Chaque question a un exemple pré-rempli (ex : « Voici ce qu'un utilisateur comme toi a répondu pour une app de todo : *Quand j'ouvre mon ordi le matin, je veux voir mes 3 priorités du jour, pour ne pas me disperser* »). Zéro jargon. L'user clique "Suivant" ou adapte l'exemple. Barre de progression 10 étapes.

```
┌─────────────────────────────────────────┐
│ Étape 3/10  ●●●○○○○○○○                  │
│                                         │
│ À qui tu penses quand tu imagines       │
│ ton app ?                               │
│                                         │
│ [Exemple : Paul, 32 ans, indépendant,  │
│  débordé, pas geek.]                    │
│                                         │
│ ┌─────────────────────────────────┐     │
│ │ Paul, 32 ans, ...               │     │
│ └─────────────────────────────────┘     │
│                                         │
│        [← Retour]   [Suivant →]         │
└─────────────────────────────────────────┘
```

**Mode Intermédiaire — "Formulaire structuré avec choix guidés"**
Une page par bloc (JTBD, Persona, Positionnement, Aha, Principes). Chaque champ a 3-5 options pré-mâchées cliquables + option "Autre". Tooltip court sous chaque champ expliquant le concept. Sidebar avec résumé live de ce qui a déjà été rempli.

**Mode Expert — "Canvas libre avec validation"**
Vue canvas type Miro : tous les blocs visibles en même temps (job story, 1-3 personas, positioning 5 composantes, aha moment, principes). Champs libres. Validation automatique en temps réel (badge vert / orange / rouge par bloc). Raccourcis clavier. Référence framework affichée en discret (ex : « Ulwick format »).

## 4. Widgets / générateurs à implémenter

| Nom | Rôle | Input → Output |
|---|---|---|
| **Générateur de JTBD statement** | Formate un job fonctionnel propre (Ulwick) | Verbe d'action + objet + contexte → *"Aider [who] à [job] quand [situation]"* |
| **Générateur de Job Story** | Formate une job story (Intercom/Paul Adams) | Situation + Motivation + Outcome → *"When X, I want to Y, so I can Z"* |
| **Bibliothèque de proto-personas** | Starter templates filtrables par type de projet Mindeck | Sélection type (outil/saas/appli/logiciel/business) → 3-6 personas éditables |
| **Positioning Canvas (Dunford)** | Remplir les 5 composantes en ordre imposé | Alternatives → Attributs uniques → Valeur → Segment → Catégorie |
| **Aha Moment Definer** | Traduit la valeur en événement mesurable | Valeur perçue + action user → *"User a fait [X] en [Y] temps"* (ex : "7 amis / 10 jours") |
| **Principes Design Generator** | 3-5 principes sous forme de trade-off | Valeurs choisies → *"A > B"* opposables (ex : "Clarté > Exhaustivité") |
| **Anti-goals builder** | Liste ce que le produit ne fait **pas** | Scope choisi → bullet list de cas d'usage refusés |
| **Concurrent Mapper** | Grille 2×2 alternatives vs unique attrs | Concurrents listés → matrice de différenciation |

## 5. Règles de validation automatique

- **> 3 personas en MVP** → alerte orange : « NN/g recommande 1 à 3 personas maximum en phase initiale. 5+ signale souvent un défaut de focus. » ([NN/g — Just-Right Personas](https://www.nngroup.com/articles/persona-scope/))
- **Job story sans le mot "quand/when"** → refus : la situation/contexte est obligatoire (Paul Adams).
- **JTBD contenant une solution** (« utiliser un tableur », « cliquer sur ») → refus : Ulwick impose un statement *solution-free*.
- **Aha moment non mesurable** (« l'user comprend la valeur ») → alerte rouge : doit être un événement quantifié (verbe + nombre + délai).
- **Principes design > 5** → alerte : au-delà, plus personne ne les retient. Objectif 3-5 ([Airbnb, Atlassian, IBM Carbon](https://principles.design/examples/)).
- **Principes non opposables** (« Être beau », « Être rapide ») → alerte : un vrai principe tranche un trade-off. Forcer le format `A > B`.
- **Positioning sans alternatives concurrentielles** → refus : Dunford impose de commencer par là.
- **Persona sans frustration ou contexte** → alerte : juste un âge et un métier = stéréotype, pas un persona.
- **Aucune *anti-goal*** → alerte : « Un produit qui veut servir tout le monde ne sert personne. »

## 6. Contenus pédagogiques

- **[Tooltip JTBD]** : « Un Job-to-be-Done n'est pas une fonctionnalité. C'est un *progrès* qu'un user cherche dans sa vie. "Écouter de la musique" est un JTBD, "avoir Spotify" n'en est pas un. »
- **[Tooltip Job Story]** : « Commence toujours par le contexte : *When* (quand ça arrive), *I want* (ce qu'il veut), *So I can* (pourquoi c'est important). »
- **[Tooltip Persona vs Proto-persona]** : « Proto-persona = basé sur tes intuitions (rapide, utile pour démarrer). Persona = basé sur de vraies interviews. En MVP, proto suffit. »
- **[Tooltip Aha moment]** : « Ce n'est pas un ressenti, c'est un événement. Mesurable. Exemple : Facebook = 7 amis en 10 jours. »
- **[Tooltip Principes]** : « Un bon principe tranche. "Clair > Exhaustif" force un choix. "Simple et efficace" ne tranche rien, c'est du vent. »
- **[Mini-leçon JTBD]** : « Clayton Christensen : "Les gens n'achètent pas un foret de 8mm, ils achètent un trou de 8mm." Le *job* c'est le trou. »
- **[Mini-leçon Positionnement Dunford]** : « Tu ne positionnes pas dans le vide. Tu positionnes *contre* quelque chose. Commence par lister ce que l'user ferait sans toi. »
- **[Mini-leçon Double Diamond]** : « Diverge avant de converger. Dans ce chapitre, on est encore dans le 1er diamant : on explore, on ne tranche pas encore la solution » ([Design Council](https://www.designcouncil.org.uk/our-resources/the-double-diamond/)).
- **[Exemple ✓ JTBD]** : *"Aider un freelance à facturer ses clients sans se tromper quand il travaille sur plusieurs projets en parallèle."*
- **[Anti-exemple ✗ JTBD]** : *"Avoir un super CRM avec dashboard et intégration Stripe."* (C'est une solution, pas un job.)
- **[Exemple ✓ Job Story]** : *"When je reçois un paiement sur Stripe, I want une notification sur mon téléphone, so I can remercier le client dans les 2 minutes."*
- **[Anti-exemple ✗ Job Story]** : *"L'utilisateur veut être notifié."* (Pas de contexte, pas d'outcome.)
- **[Exemple ✓ Principe]** : *"Vitesse > Personnalisation"* (Linear).
- **[Anti-exemple ✗ Principe]** : *"Être user-friendly"* (tout le monde le dit, ça ne tranche rien).
- **[Exemple ✓ Aha moment]** : *"L'user a créé son premier projet ET ajouté sa 1ère tâche en moins de 3 minutes."*
- **[Anti-exemple ✗ Aha moment]** : *"L'user comprend la valeur du produit."*

## 7. Outputs générés

- **`foundations.md`** — document complet structuré (JTBD, personas, job stories, positionnement, aha, principes, anti-goals). Collable dans Notion, Claude, ou un brief.
- **`foundations.json`** — même contenu structuré pour être réinjecté dans les chapitres suivants (IA, Discovery, UI).
- **Carte d'identité produit PDF** — une page A4 imprimable : 1 phrase de positionnement + 1 persona principal + 3 principes + aha moment. Pour l'épingler au-dessus du bureau.
- **Brief Claude / ChatGPT** — prompt pré-formaté prêt à coller dans une IA pour générer des user flows, wireframes ou copy cohérents avec ces fondations.
- **Checklist de décision** — liste de 10 questions à se poser avant chaque décision design future (ex : "Est-ce que ça aide [persona principal] à faire [JTBD] ?").

## 8. Modèle de données conceptuel

Cohérent avec la convention Mindeck (JSON dans `sections.content` pour un onglet brainstorm dédié, avec `section_key = "foundations"`) :

- `jtbd_core` (string) — statement Ulwick format "Aider [who] à [job] quand [situation]"
- `jtbd_emotional` (string[]) — jobs émotionnels liés
- `jtbd_social` (string[]) — jobs sociaux liés
- `job_stories` (array of objects) — `{ when, i_want, so_i_can }`
- `personas` (array of objects, max 3 en MVP) — `{ name, avatar_emoji, age_range, context, goals[], frustrations[], tech_level }`
- `primary_persona_id` (string) — ID du persona principal
- `positioning_alternatives` (string[]) — competitive alternatives (Dunford #1)
- `positioning_unique_attributes` (string[]) — unique attributes (Dunford #2)
- `positioning_value` (string[]) — value themes (Dunford #3)
- `positioning_segment` (string) — best-fit customer (Dunford #4)
- `positioning_category` (string) — market category (Dunford #5)
- `positioning_statement` (string) — phrase générée en 1 ligne
- `aha_moment_event` (string) — action mesurable
- `aha_moment_threshold` (string) — seuil quantifié (ex : "7 amis / 10 jours")
- `design_principles` (array of objects, max 5) — `{ principle, rationale, trade_off }`
- `anti_goals` (string[]) — hors périmètre explicite
- `mode_used` (enum) — `beginner | intermediate | expert`
- `completeness_score` (int 0-100) — pour auto-collapse cockpit
- `updated_at` (timestamp)

## 9. Pièges classiques à éviter

1. **Sauter la phase "fondations" pour coder tout de suite.** C'est LA raison n°1 d'échec de projets MVP solo : on conçoit dans le vide, puis on refactor 5 fois. Le Double Diamond existe parce que *"understanding the issue rather than merely assuming what it is"* change tout ([Design Council](https://www.designcouncil.org.uk/our-resources/the-double-diamond/)).

2. **Créer 8 personas avec des prénoms mignons et des photos stock.** NN/g alerte : les personas stéréotypés non basés sur de la donnée réelle créent un *echo chamber* des biais de l'équipe ([NN/g — Why Personas Fail](https://www.nngroup.com/articles/why-personas-fail/)). 1-3 proto-personas honnêtes > 10 fiches Canva.

3. **Confondre JTBD et fonctionnalité.** Écrire *"L'user veut un bouton export PDF"* n'est PAS un job. Le job c'est *"partager mon travail avec mon client sans qu'il ait à installer quoi que ce soit."* Ulwick est strict : un JTBD doit être *solution-free* ([Ulwick](https://jobs-to-be-done.com/jobs-to-be-done-a-framework-for-customer-needs-c883cbf61c90)).

4. **Positionnement flou type "la plateforme tout-en-un pour les pros."** April Dunford : *"le positioning statement traditionnel est non seulement inutile mais potentiellement dangereux"* car il masque le fait qu'on ne s'est pas comparé aux alternatives réelles ([Dunford](https://www.aprildunford.com/post/a-quickstart-guide-to-positioning)).

5. **Principes design génériques.** "Simple, beau, efficace" ne guide aucune décision. Un principe doit *trancher un dilemme* : "Vitesse > Personnalisation" (Linear), "Clarté > Richesse" (Stripe). Si ton principe pourrait s'appliquer à n'importe quel produit, il ne dit rien ([Airbnb](https://principles.design/examples/airbnb-design-principles)).

## 10. Références autoritatives

1. **[Tony Ulwick — Jobs-to-be-Done Framework (Strategyn)](https://strategyn.com/jobs-to-be-done/)** — créateur historique du JTBD (1990), pose les règles formelles d'un *outcome statement*.
2. **[Intercom — How we accidentally invented Job Stories](https://www.intercom.com/blog/accidentally-invented-job-stories/)** — Paul Adams, référence pour adapter JTBD au software (pas juste produits physiques).
3. **[Nielsen Norman Group — 3 Persona Types & Why Personas Fail](https://www.nngroup.com/articles/persona-types/)** — l'autorité sur la recherche utilisateur et les pièges des personas.
4. **[April Dunford — Obviously Awesome / Quickstart Positioning](https://www.aprildunford.com/post/a-quickstart-guide-to-positioning)** — référence B2B SaaS moderne pour le positionnement, balaie le *positioning statement* classique.
5. **[Design Council — Double Diamond](https://www.designcouncil.org.uk/our-resources/the-double-diamond/)** — cadre méthodologique canonique (Discover / Define / Develop / Deliver) utilisé par des milliers d'équipes design depuis 2005.
6. **[Shopify Polaris — Experience Values](https://polaris-react.shopify.com/foundations/experience-values)** — exemple de principes design opérationnels (Considerate, Empowering, Crafted, Efficient, Trustworthy, Familiar).
7. **[Amplitude — North Star Metric & Aha Moment](https://amplitude.com/blog/product-north-star-metric)** — méthodologie quantitative pour transformer un aha moment flou en métrique mesurable.
8. **[Don Norman — The Design of Everyday Things](https://mitpress.mit.edu/9780262525671/the-design-of-everyday-things/)** — principes fondateurs (affordances, signifiers, feedback, modèle conceptuel) qui sous-tendent tous les systèmes modernes.

## 11. Priorité MVP

- **MUST** — JTBD statement (1), Proto-persona principal (1), Aha moment mesurable (1), 3 principes design opposables. *Justification : sans ces 4, aucune décision design n'est tranchable dans les chapitres suivants. C'est le minimum vital.*
- **SHOULD** — Positionnement Dunford 5 composantes, 3-5 job stories, anti-goals. *Justification : énormément de valeur, mais peut être reporté si l'user est pressé de passer à l'UI — tant qu'il revient plus tard.*
- **NICE** — 2e et 3e persona, jobs émotionnels/sociaux, Concurrent Mapper 2×2, PDF carte d'identité imprimable. *Justification : raffinements utiles en phase scaling, pas nécessaires pour un MVP solo.*

## 12. Estimation complexité d'implémentation

**Complexité : L (Large)**

Justification :
- **~12 composants React** à créer (mode switcher, JTBD generator, Job Story builder, Persona cards avec CRUD, Positioning canvas 5 blocs, Aha definer, Principles builder, Anti-goals list, validators live, exporters MD/JSON, tooltip system, bibliothèque de templates).
- **Logique custom moyenne** : validations regex et sémantiques sur JTBD (détection de solutions interdites), scoring de complétude, génération de phrases formatées à partir de champs atomiques.
- **Dépendances nouvelles limitées** : aucune lib lourde nécessaire. Peut-être `react-hook-form` si on veut simplifier la gestion des 3 modes, mais faisable en state local pur (cohérent avec la règle Mindeck "pas de lib de state"). Export PDF = `@react-pdf/renderer` optionnel (NICE).
- **Modèle de données** : 1 seule `section_key = "foundations"` avec JSON riche dans `sections.content`. Pas de migration DB nécessaire — compatible avec le schéma existant.
- **Effort estimé** : 4 à 6 jours de dev solo sérieux pour le MUST + SHOULD, +2 jours pour le NICE.

## Sources complémentaires

- [Ulwick — JTBD Framework](https://strategyn.com/jobs-to-be-done/)
- [Ulwick — What Is Jobs-to-be-Done](https://jobs-to-be-done.com/what-is-jobs-to-be-done-fea59c8e39eb)
- [Intercom — Job Stories](https://www.intercom.com/blog/accidentally-invented-job-stories/)
- [Intercom on JTBD (livre)](https://www.intercom.com/resources/books/intercom-jobs-to-be-done)
- [NN/g — Persona Types](https://www.nngroup.com/articles/persona-types/)
- [NN/g — Why Personas Fail](https://www.nngroup.com/articles/why-personas-fail/)
- [NN/g — Just-Right Personas](https://www.nngroup.com/articles/persona-scope/)
- [NN/g — Proto Personas (Video)](https://www.nngroup.com/videos/proto-personas/)
- [April Dunford — Quickstart Guide to Positioning](https://www.aprildunford.com/post/a-quickstart-guide-to-positioning)
- [April Dunford — Obviously Awesome](https://www.aprildunford.com/books)
- [Alan Cooper — Goal-Directed Design](https://www.dubberly.com/articles/alan-cooper-and-the-goal-directed-design-process.html)
- [Alan Cooper — Defending Personas](https://mralancooper.medium.com/defending-personas-2657fe26dd0f)
- [Don Norman — Principles of Design](https://principles.design/examples/don-norman-s-principles-of-design)
- [Design Council — Double Diamond](https://www.designcouncil.org.uk/our-resources/the-double-diamond/)
- [Shopify Polaris — Foundations](https://polaris-react.shopify.com/foundations)
- [Shopify Polaris — Experience Values](https://polaris-react.shopify.com/foundations/experience-values)
- [Material 3 — Foundations](https://m3.material.io/foundations)
- [Amplitude — North Star Metric](https://amplitude.com/blog/product-north-star-metric)
- [Amplitude — Evolving North Star Metric](https://amplitude.com/blog/evolving-the-product-north-star-metric)
- [Airbnb Design Principles](https://principles.design/examples/airbnb-design-principles)
- [Facebook Aha Moment (Mode)](https://mode.com/blog/facebook-aha-moment-simpler-than-you-think/)
