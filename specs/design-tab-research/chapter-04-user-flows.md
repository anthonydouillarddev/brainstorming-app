# Chapitre 4 — Parcours utilisateurs & flows

> Livrable brut de l'Expert 4 (general-purpose).
> Couvre : user flows vs task flows vs wireflows, journey mapping, onboarding patterns, critical path analysis, friction audit, North Star Action, AARRR.

## 1. Objectif du chapitre

Un parcours utilisateur, c'est le chemin qu'une personne emprunte dans ton produit, étape par étape, du moment où elle découvre ton app jusqu'à ce qu'elle obtienne ce qu'elle était venue chercher. Si ce chemin est trop long, confus ou ennuyeux, elle part. Si chaque étape est évidente et récompensée, elle revient. Ce chapitre t'aide à dessiner ce chemin avant de coder pour repérer les pièges avant que tes utilisateurs tombent dedans.

## 2. Questions clés à poser à l'user

1. **Simple** : « Quelle est la première chose que ton user doit réussir pour se dire "ouah, ça vaut le coup" ? »
   **Expert** : « Quel est ton aha moment et à quelle étape du funnel se situe-t-il ? »

2. **Simple** : « Raconte-moi en 5 étapes maximum ce que fait un user typique la première fois qu'il ouvre ton app. »
   **Expert** : « Décris le critical path de l'onboarding, du landing au first value delivery. »

3. **Simple** : « Combien de clics pour arriver au résultat utile ? »
   **Expert** : « Quel est le nombre de steps/fields/decisions sur ton primary task flow et où se situent les frictions évitables ? »

4. **Simple** : « Est-ce que l'user doit s'inscrire AVANT de voir la valeur, ou APRÈS ? »
   **Expert** : « Ton produit utilise-t-il un pattern "try before signup" (reverse trial) ou un gated signup ? Justifie. »

5. **Simple** : « Quelles sont les 3 actions que l'user doit faire dans la première semaine pour devenir accro ? »
   **Expert** : « Quelle est ta North Star Action et ton activation metric (ex : "3 projets créés en 7 jours") ? »

6. **Simple** : « Qu'est-ce qui peut mal tourner à chaque étape ? »
   **Expert** : « Map les edge cases et les failure states de chaque étape du happy path. »

7. **Simple** : « Comment l'user se sent à chaque étape : content, perdu, énervé ? »
   **Expert** : « Trace la courbe émotionnelle (emotion graph) sur l'ensemble du journey. »

8. **Simple** : « Quand l'user est bloqué, qu'est-ce qui l'aide à repartir ? »
   **Expert** : « Quels sont les recovery flows et les empty states pédagogiques prévus ? »

9. **Simple** : « Est-ce que ton app explique ce qu'elle fait, ou elle fait attendre l'user devant un formulaire vide ? »
   **Expert** : « Utilises-tu un pattern "empty state teaching", "progressive disclosure" ou "guided tour" ? »

10. **Simple** : « Après combien de temps l'user a-t-il envie d'en parler à un pote ? »
    **Expert** : « Où se situe ton referral trigger dans le lifecycle AARRR ? »

## 3. UX du chapitre — 3 modes progressifs

**Mode Débutant — "Le chemin en 5 cases"**

```
+------------------------------------------------------------+
| Raconte-moi ce que fait ton user typique, étape par étape |
+------------------------------------------------------------+
| Étape 1 : [Il arrive sur la landing page_____________]    |
| Étape 2 : [Il clique sur "Essayer gratuit"___________]    |
| Étape 3 : [Il crée son premier projet________________]    |
| Étape 4 : [Il voit le cockpit se remplir_____________]    |
| Étape 5 : [Il ajoute une tâche et coche un item______]    |
+------------------------------------------------------------+
| 💡 Dans laquelle de ces étapes l'user dit "ouah" ?        |
| (clique sur l'étape) → Étape 4 marquée ⭐ Aha moment      |
+------------------------------------------------------------+
```

Pas de jargon, juste un entonnoir de 5 cases texte avec un bouton "marquer comme aha moment".

**Mode Intermédiaire — "Flow builder + template"**

Choix d'un template pré-rempli selon le type de projet Mindeck :
- `saas` → template "freemium SaaS onboarding" (landing → signup → empty state → guided first action → aha → habit loop)
- `appli` → template "mobile first-run" (splash → permissions → sample data → push notif opt-in après 2e session)
- `outil` (perso) → template minimaliste (pas d'onboarding, direct au canvas)
- `logiciel` (métier B2B) → template "gated demo" (form → call → account provisioning → training)
- `business` (non-tech) → template funnel de vente classique (landing → lead magnet → email seq → call)

Flow builder simple avec étapes chaînées et branches oui/non :

```
[Landing] → [Signup] → [Onboarding 3 steps] → [Empty state]
                             ↓                     ↓
                         [Skip?]             [Create first item]
                             ↓                     ↓
                         [Email D+1]         [Aha ⭐]
                             ↓                     ↓
                       [Re-engagement]     [Habit: 3 items/week]
```

**Mode Expert — "Journey map + critical path + friction score"**

Canvas en grille, phases en colonnes, dimensions en lignes. Classique NN/g mais allégé.

```
+----------+----------+------------+-----------+-----------+----------+
|          | DISCOVER | ACQUISITION| ACTIVATION| RETENTION | REVENUE  |
+----------+----------+------------+-----------+-----------+----------+
| Action   | Google   | Landing +  | Signup +  | Daily     | Upgrade  |
|          | search   | CTA        | 1st proj  | use       | Pro      |
+----------+----------+------------+-----------+-----------+----------+
| Touchpts | SEO, X   | Web        | Web, Email| App, Push | Billing  |
+----------+----------+------------+-----------+-----------+----------+
| Pensées  | "Ça va   | "C'est     | "OK je    | "Indispens| "Je paie |
|          | m'aider?"| quoi ?"    | tente"    | able"     | volontiers"|
+----------+----------+------------+-----------+-----------+----------+
| Émotion  | 😐       | 🙂         | 😕→🤩     | 😊        | 😌       |
+----------+----------+------------+-----------+-----------+----------+
| Friction |  -       | Popup cook | 4 champs  | Notif spam| Paywall  |
|          |          | + chat bot | form      | mobile    | surprise |
+----------+----------+------------+-----------+-----------+----------+
| Score    |  1/5     | 3/5        | 4/5       | 2/5       | 3/5      |
+----------+----------+------------+-----------+-----------+----------+
```

Le critical path analyzer surligne en rouge le chemin minimal obligatoire (landing → signup → first value) et compte les étapes. Le friction score additionne : nombre d'étapes, nombre de champs, nombre de décisions forcées, nombre de popups/modals intrusifs. Seuil d'alerte à définir (voir §5).

Note honnête : les journey maps 12 colonnes × 8 lignes de cabinets de conseil sont souvent **de la masturbation intellectuelle**. Ce qui compte : phases, actions, émotions, frictions. 5 colonnes suffisent pour 99% des projets. Ne pas forcer Anthony à remplir 60 cases.

## 4. Widgets / générateurs à implémenter

- **Flow builder** — éditeur d'étapes chaînées avec branches (oui/non, success/fail). Export mermaid. Drag & drop pour réordonner.
- **Onboarding pattern picker** — 6 patterns avec preview visuel + quand les utiliser :
  1. *Self-service* (Notion, Figma) — user explore seul
  2. *Guided tour* (Intercom, Trello) — tooltips séquentiels
  3. *Empty state teaching* (Linear, Superhuman) — la page vide explique quoi faire
  4. *Checklist* (Asana, Slack) — progress bar + quick wins
  5. *Progressive disclosure* (Apple) — features révélées au fil de l'usage
  6. *Sample data / template* (Airtable, Notion) — user atterrit sur un projet pré-rempli
- **Friction counter** — compte auto les clicks, fields, screens, decisions du flow principal. Badge vert (<5), jaune (5-8), rouge (>8).
- **Aha moment finder** — guide 3 questions : "Quelle émotion positive tu veux déclencher ? Quelle action la déclenche ? À quelle étape du flow ?" → marque l'étape avec une étoile.
- **Journey map canvas** — grille éditable phases × dimensions, avec emojis pour les émotions.
- **Critical path analyzer** — met en évidence le chemin obligatoire minimum + compte les steps optionnels vs obligatoires.
- **North Star Action picker** — formule guidée : "L'action [VERBE] par [SEGMENT] dans [TIMEFRAME] qui prouve qu'ils ont obtenu [VALEUR]" → ex : "3 projets créés en 7 jours".
- **Empty state generator** — propose texte + CTA + illustration pour chaque écran potentiellement vide.

## 5. Règles de validation automatique

- Onboarding > 5 étapes → ⚠️ alerte "Raccourcis. Chaque étape supplémentaire coûte ~10-20% de completion rate (Baymard)."
- Signup demandé AVANT toute livraison de valeur → ⚠️ alerte "Anti-pattern SaaS 2020+. Envisage reverse trial ou try-before-signup (Reforge)."
- Aucun aha moment marqué → ⚠️ bloquant. "Tu ne peux pas construire un produit sans savoir quand l'user dit ouah."
- Formulaire de signup > 3 champs → ⚠️ "Chaque champ supplémentaire = ~10% d'abandon (Baymard checkout UX)."
- Aucune émotion mappée négativement → ⚠️ "Suspicieux. Aucun user n'a un parcours 100% positif. Où sont les moments de doute ?"
- Pas de recovery flow pour les edge cases (erreur serveur, email déjà pris, mot de passe oublié) → ⚠️ warning.
- Pas de North Star Action définie → ⚠️ "Sans NSA, impossible de mesurer l'activation."
- Onboarding avec > 3 popups/modals avant le premier écran utile → ⚠️ "Modal fatigue garantie."
- Permission request (notif, localisation, camera) avant value delivery → ⚠️ "Demande les permissions APRÈS avoir montré la valeur (Apple HIG, Google Material)."

## 6. Contenus pédagogiques

**Tooltip "User flow vs task flow vs wireflow"**
- *Task flow* : les étapes linéaires d'UNE tâche précise (ex : créer un projet).
- *User flow* : inclut les décisions et branches (ex : si user pas connecté → signup, sinon → dashboard).
- *Wireflow* : user flow + wireframes de chaque écran.

**Mini-leçon "Aha moment"** (Samuel Hulick, UserOnboard.com) : le user n'achète pas ta feature, il achète une meilleure version de lui-même. L'aha moment, c'est la première fois qu'il perçoit concrètement cette meilleure version. Exemple Facebook : "7 amis ajoutés en 10 jours". Exemple Slack : "2000 messages envoyés par une équipe".

**Mini-leçon "AARRR" (Dave McClure / Reforge)** : Acquisition → Activation → Rétention → Revenue → Referral. À chaque étape, un drop-off. Mesure chaque taux de conversion, attaque le plus faible en premier.

**✓ Exemples à suivre** :
- *Linear* : onboarding 3 écrans, ensuite empty state ultra-pédagogique avec raccourcis clavier visibles.
- *Superhuman* : concierge onboarding 1-on-1 de 30 min (pas scalable mais légendaire pour l'activation).
- *Figma* : template "Welcome file" qui enseigne les features par l'exploration.
- *Notion* : sample workspace pré-rempli + checklist latérale "Get started" avec 5 quick wins.

**✗ Anti-exemples** :
- *SaaS B2B 2015-2020* : signup 8 champs + confirmation email + login + tour guidé 12 étapes + dashboard vide. Résultat : 70% de drop-off avant la première action utile.
- *Apps mobiles* qui demandent notifs/localisation AVANT d'avoir montré la moindre valeur.
- *Onboarding "tutoriel slide"* de 10 écrans que tout le monde skip (TechCrunch, 2016).
- *Dark patterns* type "obligation de lier carte bancaire pour essai gratuit" → backlash prévisible.

## 7. Outputs générés

- **User flow diagram** (mermaid) — exportable en PNG/SVG, copiable dans Claude pour discussion.
- **Journey map markdown** — tableau phases × dimensions avec emojis, exportable.
- **Spec onboarding** — doc structurée : pattern choisi, nombre d'étapes, copy de chaque écran, aha moment, NSA, activation metric.
- **Friction report** — liste priorisée des frictions détectées + score global + 3 actions prioritaires.
- **Critical path summary** — chemin minimum obligatoire + nombre de steps + benchmark vs médiane secteur.
- **AARRR dashboard template** — 5 métriques à tracker, placeholders pour branchement analytics plus tard.

## 8. Modèle de données conceptuel

Champs à stocker côté section Design (étend le JSON de la section `design` existante) :

- `user_flows[]` : collection de flows
  - `id`, `name`, `type` (onboarding | primary_task | recovery | edge_case)
  - `steps[]` : `{ id, label, screen, action, is_critical, is_aha_moment, decisions[], emotion }`
  - `branches[]` : `{ from_step_id, condition, to_step_id }`
- `journey_map` : `{ phases[] : { name, actions, thoughts, emotion (1-5), touchpoints[], frictions[], opportunities[] } }`
- `onboarding_spec` : `{ pattern, step_count, aha_moment_step_id, nsa, activation_metric, copy_per_step[] }`
- `friction_score` : `{ total, breakdown: { steps, fields, decisions, modals }, flagged_issues[] }`
- `north_star_action` : `{ verb, segment, timeframe, value, formula_string }`

Réutilisation des tables existantes : les user flows peuvent être référencés depuis les `todos` (ex : "Implémenter écran step 3 du flow onboarding") et depuis les `decisions` (ex : ADR "Choix pattern onboarding"). Pas besoin de nouvelle table dédiée dans un premier temps — JSON dans `sections.content` suffit (cohérent avec l'archi actuelle sans sur-ingénierie).

## 9. Pièges classiques à éviter

1. **Onboarding = form géant** — 10 champs avant la première action utile. Tue l'activation. Fix : ne demander que email + mot de passe, différer le reste (progressive profiling).
2. **Pas d'aha moment clair** — l'équipe ne sait pas répondre à "quand l'user dit ouah ?". Impossible d'optimiser un truc qu'on n'a pas défini.
3. **Trop d'étapes sur le critical path** — au-delà de 5 étapes avant la value delivery, chute mesurée de ~10-20% par étape (Baymard, secteur e-commerce mais extrapolable).
4. **Journey map de 60 cases jamais relue** — écrite une fois en workshop, jamais mise à jour, devient de la déco. Mieux vaut un map de 5×5 vivant qu'un map de 12×8 mort.
5. **Confondre happy path et vraie vie** — mapper uniquement le scénario où tout marche. Les edge cases (email déjà utilisé, connexion perdue, paiement refusé) représentent 20-30% du trafic et sont les moments les plus critiques pour la fidélisation.
6. **Permissions / paywalls prématurés** — demander notif push ou carte bancaire AVANT d'avoir prouvé la valeur. Conversion divisée par 2-5 selon études Apple/Google.
7. **Guided tour auto-play 10 étapes** — personne ne lit. Préférer empty state teaching contextuel.

## 10. Références autoritatives

1. **Nielsen Norman Group — Journey Mapping 101** : https://www.nngroup.com/articles/journey-mapping-101/ (référence académique sur la structure journey map)
2. **Baymard Institute — Checkout UX & Form Usability** : https://baymard.com/research (études empiriques sur friction, fields count, abandon rates)
3. **Samuel Hulick — UserOnboard.com** : https://www.useronboard.com/ (teardowns d'onboarding + livre "The Elements of User Onboarding")
4. **Reforge — Activation & Growth** : https://www.reforge.com/blog (articles sur aha moment, NSA, reverse trial — Brian Balfour, Casey Winters)
5. **Appcues — Onboarding Patterns** : https://www.appcues.com/blog (catalogue de patterns + benchmarks sectoriels)
6. **Chameleon — Product Adoption** : https://www.chameleon.io/blog (friction audit, empty states)
7. **Google Ventures Design Sprint book (Jake Knapp)** — chapitre "Map" : technique de user flow mapping rapide en équipe
8. **UK Design Council — Double Diamond** : https://www.designcouncil.org.uk/our-resources/the-double-diamond/ (framework Discover/Define/Develop/Deliver)
9. **Andrew Chen — "The Law of Shitty Clickthroughs"** : https://andrewchen.com/ (décroissance des canaux + importance activation)
10. **Apple Human Interface Guidelines — Onboarding** : https://developer.apple.com/design/human-interface-guidelines/onboarding (timing des permissions)

## 11. Priorité MVP

- **MUST** : Mode Débutant (entonnoir 5 étapes + marquage aha moment), North Star Action picker, onboarding pattern picker avec 6 patterns, friction counter simple (compte steps + fields). Sans ça, le chapitre n'apporte rien.
- **SHOULD** : Flow builder avec branches, templates pré-remplis par type de projet Mindeck, règles de validation auto (alertes > 5 steps, signup avant valeur), export mermaid, exemples Linear/Slack/Figma intégrés en tooltips.
- **NICE** : Journey map canvas grille complet (Mode Expert), critical path analyzer avec coloration, empty state generator, AARRR dashboard template, benchmarks sectoriels chiffrés.

Justification : 80% de la valeur pour un projet solo se joue sur "définir l'aha moment + compter les étapes". Le reste est du confort pour plus tard ou pour des projets B2B complexes.

## 12. Estimation complexité d'implémentation

- **Mode Débutant** : **S** — 5 textareas + 1 sélecteur d'étoile. Stockage JSON direct. 1 journée.
- **Onboarding pattern picker + NSA formula** : **S** — composants de sélection avec contenus statiques. 1 journée.
- **Flow builder avec branches + export mermaid** : **L** — vraie interface drag & drop, calcul du critical path, sérialisation propre. 3-5 jours. Attention à ne pas ré-inventer Whimsical/Miro. Rester minimaliste : liste d'étapes + indentation pour les branches suffit au début.
- **Journey map canvas grille** : **M** — tableau éditable avec cellules multi-champs, pas trivial mais sans feature exotique. 2-3 jours.
- **Friction counter + règles de validation** : **S** — simples calculs sur les données du flow. 0.5 jour.
- **Critical path analyzer** : **M** — parcours du graphe des étapes, détection chemin minimum. 1-2 jours.
- **Templates pré-remplis par type de projet** : **S** — données statiques à écrire une fois. 0.5 jour mais beaucoup d'écriture de contenu pédagogique.

**Total estimé MVP (MUST)** : **S-M** (~3-4 jours de dev + 1 jour de rédaction contenus).
**Total version complète (MUST + SHOULD + NICE)** : **L-XL** (~2-3 semaines).

Recommandation : livrer le MUST en 1 sprint, observer l'usage réel d'Anthony sur ses propres projets Mindeck, puis décider quelles briques SHOULD/NICE justifient l'investissement. Le risque sinon : construire un journey-map-canvas-12-colonnes qui finit comme un template Notion jamais ouvert.
