# Chapitre 2 — Identité de marque & ton

> Livrable brut de l'Expert 2 (general-purpose).
> Couvre : archétypes (Jung/Pearson, avec honnêteté sur le côté pseudoscience), voice & tone (Mailchimp, NN/g 4 dimensions), verbal identity, brand promise (Dunford/Neumeier).
> Différenciation Brainstorm→Branding (intuition floue) vs Design Identité (système opérationnel).

## 1. Objectif du chapitre

Aider l'utilisateur à répondre à **trois questions** : "Si mon produit parlait, il ressemblerait à qui ?", "Qu'est-ce qu'il dit (et qu'est-ce qu'il ne dit JAMAIS) ?", et "Comment ça se voit dans chaque bouton, chaque email, chaque message d'erreur ?". À la fin, l'utilisateur ressort avec une **carte d'identité verbale + visuelle** utilisable immédiatement par ChatGPT, un designer, ou lui-même à 2h du matin un dimanche.

---

## 2. Questions clés à poser à l'user

| # | Simple (enfant 12 ans) | Expert |
|---|---|---|
| 1 | Si ton app était une personne, tu la décrirais comment en 3 mots ? | Quels sont tes 3-5 brand attributes principaux (avec intensité 1-5) ? |
| 2 | Est-ce que ton app est sérieuse ou rigolote ? | Où te situes-tu sur les 4 axes NN/G (formel↔casual, sérieux↔drôle, respectueux↔irrévérencieux, enthousiaste↔factuel) ? |
| 3 | Y a-t-il des mots que ton app ne dirait JAMAIS ? | Quel est ton vocabulaire banni (jargon, buzzwords, termes de la concurrence à éviter) ? |
| 4 | Si tu devais choisir 3 marques qui te parlent, ce serait qui ? | Liste tes brand references (3) ET tes anti-references (2) avec justification. |
| 5 | Comment tu parles à un utilisateur quand tout va bien VS quand il a fait une erreur ? | Définis ta voice & tone matrix (5 contextes × ton adapté). |
| 6 | Qu'est-ce que ton produit promet aux gens ? | Formule ta brand promise en 1 phrase (≤ 15 mots) avec bénéfice émotionnel ET rationnel. |
| 7 | C'est quoi le feeling qu'on doit avoir en utilisant ton app ? | Quelle est ta directive émotionnelle principale (calme, énergie, confiance, joie, concentration) ? |
| 8 | Quel mot décrit le mieux le style visuel que tu vises ? | Positionne ta DA sur 3 axes : minimal↔expressif, chaud↔froid, classique↔expérimental. |

---

## 3. UX du chapitre — 3 modes progressifs

**Mode Débutant — "Raconte-moi ton produit"**

```
+------------------------------------------------------+
|  Si ton produit était une personne, ce serait qui ?  |
|                                                      |
|  [ Le Sage ]   [ Le Créatif ]   [ Le Compagnon ]     |
|  calme, posé   curieux, libre   chaleureux, fiable   |
|                                                      |
|  [ Le Rebelle ]  [ L'Expert ]   [ Le Magicien ]      |
|  franc, direct   rigoureux      fait gagner du temps |
|                                                      |
|  [ Le Héros ]  [ L'Ami ]  [ Choisir autre chose → ]  |
+------------------------------------------------------+
|  Puis : 3 mini-questions avec emojis                 |
|  → Génère automatiquement une brand card v1          |
+------------------------------------------------------+
```
Pas de vocabulaire expert. 6-8 cartes d'archétypes **simplifiés et renommés en français courant** (on cache le mot "archétype"). L'user clique, on génère une première brand card.

**Mode Intermédiaire — "Affine le curseur"**

```
+------------------------------------------------------+
|  Voice attributes (4 sliders NN/G)                   |
|  Formel      o——————●———o     Casual                 |
|  Sérieux     ●———o———————o    Drôle                  |
|  Respectueux o———●———————o    Irrévérencieux         |
|  Factuel     o——————●———o     Enthousiaste           |
|                                                      |
|  3 sliders complémentaires                           |
|  Technique   ●————o——————o    Grand public           |
|  Chaleureux  o——————————●o    Distant                |
|  Humble      o——●————————o    Ambitieux              |
|                                                      |
|  Glossaire guidé                                     |
|  ✓ On dit → [ajouter des mots]                       |
|  ✗ On ne dit jamais → [ajouter]                      |
+------------------------------------------------------+
```

**Mode Expert — "Construis le système"**

```
+------------------------------------------------------+
|  Brand Identity Prism (Kapferer)                     |
|  +-------------------+-------------------+           |
|  | Physique          | Personnalité      |           |
|  | (assets visuels)  | (traits humains)  |           |
|  +-------------------+-------------------+           |
|  | Relation          | Culture           |           |
|  | (comment on parle)| (valeurs, origine)|           |
|  +-------------------+-------------------+           |
|  | Reflet (cible)    | Mentalisation     |           |
|  |                   | (ce que l'user    |           |
|  |                   | devient)          |           |
|  +-------------------+-------------------+           |
|                                                      |
|  Voice & Tone Matrix (5 contextes)                   |
|  Contexte      | Ton     | Exemple ✓ | Piège ✗       |
|  Onboarding    | ...     | ...        | ...          |
|  Erreur        | ...     | ...        | ...          |
|  Succès        | ...     | ...        | ...          |
|  Empty state   | ...     | ...        | ...          |
|  Paiement/Bill | ...     | ...        | ...          |
+------------------------------------------------------+
```

Transitions **douces** : on garde les réponses d'un mode à l'autre, on ne jette rien.

---

## 4. Widgets / générateurs à implémenter

1. **Persona Picker (mode Débutant)** — 8 cartes d'archétypes simplifiés (Sage, Créatif, Compagnon, Rebelle, Expert, Magicien, Héros, Ami). Click → pré-remplit sliders + glossaire.
2. **Voice Sliders (4 axes NN/G + 3 complémentaires)** — sliders 0-100 avec labels bilatéraux et libellé dynamique ("Ton : casual et enthousiaste, légèrement humoristique").
3. **Voice & Tone Matrix** — tableau éditable : 5 lignes de contextes (onboarding, success, error, empty state, billing/paiement) × 3 colonnes (ton, exemple à écrire ✓, à éviter ✗).
4. **Glossaire DO/DON'T** — deux colonnes. Auto-suggestions basées sur archétype choisi (ex. si "Compagnon" → suggère "on" plutôt que "vous", "oups" plutôt que "erreur").
5. **Brand Promise Generator** — mini-formulaire : "Pour [cible], [produit] est [catégorie] qui [bénéfice unique] contrairement à [alternative]." Template April Dunford adapté.
6. **References & Anti-references** — 3 champs "marques que j'admire" + 2 champs "marques dont je veux me démarquer" + justification en 1 ligne.
7. **Tone Dial par contexte** — pour chaque message type généré ailleurs dans Mindeck (erreurs, CTA, etc.), un mini dial rappelle le ton choisi.
8. **Preview en direct** — 4 micro-mockups (bouton CTA, toast erreur, empty state, email de bienvenue) qui se re-génèrent live selon les sliders.
9. **Mood strip visuel** — bande de 5 images/mots-clés de mood (ex. "calme / matinal / lin naturel / café / lumière chaude"). Pas un mood board complet, juste un cadrage.
10. **Export brand card** — bouton "Exporter pour Claude / ChatGPT" qui produit un bloc markdown copiable.

---

## 5. Règles de validation automatique

1. **Incohérence archétype × ton** : si archétype "Sage" (calme, posé) et slider "Sérieux↔Drôle" > 70 vers drôle → alerte jaune "Ton Sage avec beaucoup d'humour : vérifier la cohérence (ex. Dumbledore fait des blagues, mais pas de blagues potaches)."
2. **Glossaire contradictoire** : un mot dans DO et DON'T → erreur bloquante.
3. **Promise floue** : si la brand promise contient "leader", "innovant", "révolutionnaire", "solution" sans précision → warning "Buzzword détecté, préciser."
4. **Tone matrix incomplète** : moins de 3 contextes remplis → on bloque l'export expert (pas l'avancement général).
5. **Anti-reference = référence** : si une marque apparaît dans les deux colonnes → erreur.
6. **Sliders extrêmes tous alignés** : tous les sliders à 0 ou 100 → suggestion "Un ton 100% neutre n'existe pas, nuance tes curseurs."
7. **Mismatch type de projet** : si type = "logiciel métier/business" et slider "Sérieux↔Drôle" > 85 vers drôle → info "Les logiciels métier trop fun inspirent peu confiance — exemple : personne ne veut un logiciel de compta qui fait des blagues sur ses erreurs de TVA."
8. **Verbal ↔ visuel décalés** : DA "minimal, froid" + ton "enthousiaste exubérant" → alerte.

---

## 6. Contenus pédagogiques

- **Tooltip "Voice vs Tone"** : "La voix, c'est ta personnalité, elle ne change pas. Le ton, c'est ton humeur, il change selon la situation. Tu es toujours toi, mais tu ne parles pas pareil à ton pote et à ton banquier." (Mailchimp)
- **Mini-leçon "Pourquoi un glossaire ?"** : 3 phrases + exemple avant/après. "Avant : Notre solution n'oublie aucun détail. Après : Rien ne passe à travers."
- **Exemple ✓** : Mailchimp erreur — "Oups, notre serveur boude. Réessaie dans une minute." Exemple ✗ : "Error 500. An unexpected error occurred."
- **Encart honnête sur les archétypes** : "À savoir : les 12 archétypes de Jung/Pearson sont une **invention marketing des années 2000**, pas de la science. Jung lui-même disait qu'il y a autant d'archétypes que de situations. **C'est utile comme point de départ**, pas comme vérité. Si ça t'aide à verbaliser, garde-le. Si ça te bloque, ignore-le." (The Drum, Mark Ritson)
- **Leçon "Promise"** : template April Dunford vs storytelling Neumeier (3 questions : qui es-tu, qu'est-ce que tu fais, pourquoi ça compte).
- **Anti-exemple de slider extrême** : "Un produit 100% sérieux, c'est Word 2003. Un produit 100% drôle, c'est un faux site. La vérité vit entre."
- **Pourquoi anti-references** : "Dire ce qu'on n'est PAS est souvent plus clair que ce qu'on est. Notion se définit beaucoup comme 'pas Microsoft Office'."
- **Règle d'or Polaris** : "Lis ta phrase à voix haute. Si tu ne la dirais pas à un humain, réécris-la."

---

## 7. Outputs générés

1. **Brand Card markdown** — 1 page : archétype + 3 mots-clés + 4 sliders + brand promise + DO/DON'T words + 5 lignes de la tone matrix.
2. **Voice & Tone Guide étendu** (mode expert) — 3-4 pages : prism Kapferer, matrix complète, glossaire avec justifications, references/anti-references.
3. **JSON structuré** (`brand.json`) — pour consommation par d'autres chapitres Mindeck (copywriting, notifications) ou un LLM externe.
4. **Claude/ChatGPT prompt** — bloc prêt à coller : "Écris dans le ton de ma marque : [récap]. Exemple ✓ : ... Exemple ✗ : ..."
5. **Snippets micro-copy** — 4 exemples auto-générés (bouton principal, message d'erreur, empty state, email de bienvenue) dans le ton défini.
6. **PDF one-pager** — version imprimable à filer à un freelance.

---

## 8. Modèle de données conceptuel

```
brand_identity
  id (uuid)
  project_id (fk)
  mode (enum: beginner | intermediate | expert)
  archetype_key (string, nullable)           — "sage", "creator", etc.
  attributes (json)                           — [{label, intensity 1-5}]
  voice_sliders (json)                        — {formal_casual:0-100, serious_funny:0-100, ...}
  brand_promise (text ≤ 200)
  emotional_direction (string)                — "calm" | "energy" | "trust" | "joy" | "focus"
  visual_axes (json)                          — {minimal_expressive, warm_cold, classic_experimental}
  do_words (text[])
  dont_words (text[])
  references (json)                           — [{name, why_i_like}]
  anti_references (json)                      — [{name, why_i_dont}]
  tone_matrix (json)                          — [{context, tone, example_do, example_dont}]
  prism (json, nullable)                      — 6 facettes Kapferer (expert)
  mood_keywords (text[])                      — 3-5 mots ambiance
  last_validated_at (timestamp)
  validation_warnings (json)                  — warnings non bloquants à afficher
  created_at, updated_at
```

Une seule ligne par projet (upsert). Les champs du mode Débutant pré-remplissent ceux du mode Expert (pas de rupture).

---

## 9. Pièges classiques à éviter

1. **Confondre voice et tone** — voice = constante (personnalité), tone = variable (contexte). Ne pas laisser l'user définir "le ton de la marque" comme un truc figé.
2. **Traiter les archétypes comme une vérité** — c'est un **aide-mémoire créatif, pas un framework scientifique**. Pearson/Mark ont inventé la grille en 2001, Jung n'a jamais parlé de 12. Le présenter honnêtement évite les crises de foi plus tard.
3. **Adjectifs vagues non actionnables** — "moderne", "premium", "innovant" ne veulent rien dire. Exiger des mots + exemples + contre-exemples (règle Frontify).
4. **Oublier le contexte d'erreur et d'empty state** — 80% des guides brand parlent du marketing et oublient les messages d'erreur, qui sont les moments de vérité du ton. Polaris et IBM Carbon insistent là-dessus.
5. **Copier une marque admirée sans filtre** — "Je veux être comme Linear" → l'user finit avec un produit sans âme. Forcer la justification + la contre-partie ("ce que je NE copie pas de Linear").
6. **Verbal sans visuel (ou inverse)** — une voix "chaleureuse" avec une DA "clinique blanc-sur-blanc" = friction. Les 2 doivent être pensés ensemble (principe Kapferer du prism).
7. **Faire du branding avant de savoir à qui on parle** — ce chapitre **suppose** que le chapitre 1 (positionnement, cible) est rempli. Sinon → warning "Remplis d'abord le chapitre Positionnement."

---

## 10. Références autoritatives

- [Mailchimp Content Style Guide — Voice and Tone](https://styleguide.mailchimp.com/voice-and-tone/) — référence historique, distinction voice vs tone.
- [Shopify Polaris — Voice and Tone](https://polaris.shopify.com/content/voice-and-tone) — règles d'écriture UI pragmatiques.
- [Atlassian Design System — Voice and tone principles](https://atlassian.design/content/voice-and-tone-principles/) — "Bold, optimistic, and practical (with a wink)".
- [IBM Carbon — Content voice and tone](https://carbondesignsystem.com/guidelines/content/overview/) — verbal identity dans un grand produit tech.
- [Nielsen Norman Group — The Four Dimensions of Tone of Voice](https://www.nngroup.com/articles/tone-of-voice-dimensions/) — axes formel/casual, sérieux/drôle, respectueux/irrévérencieux, enthousiaste/factuel.
- [Jennifer Aaker — Dimensions of Brand Personality (Stanford GSB)](https://www.gsb.stanford.edu/faculty-research/working-papers/dimensions-brand-personality) — 5 dimensions (sincérité, excitation, compétence, sophistication, ruggedness).
- [Marty Neumeier — The Brand Gap](https://www.martyneumeier.com/the-brand-gap) — "un brand est un gut feeling", 3 questions clés.
- [Frontify — Brand Voice vs Tone vs Personality](https://www.frontify.com/en/guide/brand-voice-vs-tone-vs-personality) — cadre opérationnel des sliders.
- [Kapferer Brand Identity Prism](https://umbrex.com/resources/frameworks/marketing-frameworks/kapferer-brand-identity-prism/) — 6 facettes pour le mode expert.
- [The Drum — Yes brand archetypes are pseudoscience](https://thedrum.com/opinion/2025/04/08/yes-brand-archetypes-are-pseudoscience-does-make-them-completely-useless) — critique honnête des archétypes Jung/Pearson.
- [CRU Brand Consultancy — The 12 Archetypes: what they can and can't do](https://www.madebycru.com/zine/die-12-archetypen-nach-jung-was-sie-konnen-und-was-nicht) — mise au point historique sur Jung.

---

## 11. Priorité MVP

**MUST (v1)**
- Persona Picker simplifié (8 cartes, pas 12, et en français)
- 4 sliders NN/G + 3 complémentaires
- Glossaire DO/DON'T
- Brand Promise (champ unique + hint)
- Tone Matrix avec 3 contextes minimum (onboarding, erreur, succès)
- Export markdown brand card
- Disclaimer pédagogique honnête sur les archétypes

Justification : sans ces 7 briques, on ne dépasse pas le brainstorm existant. Le persona + sliders + glossaire + matrix suffisent à générer 80% de la valeur — l'user peut déjà coller le résultat dans Claude et générer du copy cohérent.

**SHOULD (v1.1)**
- References / Anti-references avec justification
- Preview live (4 micro-mockups qui se mettent à jour)
- Export JSON
- Validation croisée archétype × sliders × type de projet
- Mood keywords

Justification : améliore drastiquement la qualité du résultat, mais demande plus de dev et de contenu (templates de mockups, règles de validation).

**NICE (v2)**
- Brand Identity Prism Kapferer complet
- PDF one-pager imprimable
- Tone Dial contextuel qui s'invite dans les autres chapitres Mindeck
- Versioning de la brand card (historique des itérations)
- Génération LLM assistée ("aide-moi à remplir le glossaire à partir de mon archétype")

Justification : le prism Kapferer est intellectuellement satisfaisant mais l'user solo n'en aura souvent pas besoin. Le versioning vient utile seulement quand la marque existe depuis 6+ mois.

---

## 12. Estimation complexité d'implémentation

**Mode Débutant — S** : 8 cartes statiques + 3 champs texte + logique de pré-remplissage. Pur front.

**Mode Intermédiaire — M** : 7 sliders avec libellé dynamique, glossaire éditable (chips), tone matrix table éditable. Un bon composant Table + Sliders, validation côté client.

**Mode Expert — L** : Kapferer prism (6 zones éditables), validations croisées complexes, export multi-format (md + JSON + PDF), preview live des mockups. Le PDF demande une lib (react-pdf ou impression CSS).

**Global chapitre — L (≈ 10-15 jours solo)** : la difficulté n'est pas technique mais **éditoriale** — rédiger les 8 descriptions d'archétypes, les 30-40 DO/DON'T suggérés par archétype, les tooltips, les exemples ✓/✗, les validations. Le code est simple (forms, sliders, JSON); le contenu pédagogique est le vrai investissement.

---

## Différenciation brainstorm → design (essentielle)

**Brainstorm → Branding (actuel)** = 4-5 champs bruts : nom, domaine, couleurs floues, font, logo status, tone en 1 mot. L'user écrit "moderne et épuré" et passe à autre chose. **Sortie : du texte libre non actionnable.**

**Design → Identité de marque (ce chapitre)** = **système de décisions** : archétype + sliders quantifiés + tone matrix par contexte + glossaire exhaustif + validation de cohérence + export structuré JSON/markdown pour LLM. **Sortie : une brand card qu'un freelance, un LLM ou un rédacteur peut exécuter sans poser de question.**

La bascule conceptuelle : le brainstorm capture une **intuition**, le design onglet produit un **système opérationnel**.

---

## Sources complémentaires

- [Shopify Polaris — Voice and tone](https://polaris.shopify.com/content/voice-and-tone)
- [Mailchimp Content Style Guide — Voice and Tone](https://styleguide.mailchimp.com/voice-and-tone/)
- [Atlassian Design System — Voice and tone principles](https://atlassian.design/content/voice-and-tone-principles/)
- [Jennifer Aaker — Dimensions of Brand Personality (SSRN)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=945432)
- [Stanford GSB — Dimensions of Brand Personality](https://www.gsb.stanford.edu/faculty-research/working-papers/dimensions-brand-personality)
- [Marty Neumeier — The Brand Gap](https://www.martyneumeier.com/the-brand-gap)
- [IBM Carbon — Content guidelines](https://carbondesignsystem.com/guidelines/content/overview/)
- [Frontify — Brand Voice vs Tone vs Personality](https://www.frontify.com/en/guide/brand-voice-vs-tone-vs-personality)
- [Frontify — How to create a distinct tone of voice](https://www.frontify.com/en/guide/brand-tone-of-voice)
- [Frontify — Brand Storytelling](https://www.frontify.com/en/guide/brand-storytelling)
- [NN/G — The Four Dimensions of Tone of Voice](https://www.nngroup.com/articles/tone-of-voice-dimensions/)
- [Kapferer Brand Identity Prism — Umbrex](https://umbrex.com/resources/frameworks/marketing-frameworks/kapferer-brand-identity-prism/)
- [The Drum — Yes, brand archetypes are pseudoscience](https://thedrum.com/opinion/2025/04/08/yes-brand-archetypes-are-pseudoscience-does-make-them-completely-useless)
- [CRU Brand Consultancy — The 12 Archetypes: what they can and can't do](https://www.madebycru.com/zine/die-12-archetypen-nach-jung-was-sie-konnen-und-was-nicht)
- [Carol Pearson — The Pearson 12-Archetype System](https://carolspearson.com/about/the-pearson-12-archetype-system-human-development-and-evolution)
- [Nine Blaess — Brand Personality Slider template](https://www.nineblaess.de/blog/brand-personality-slider/)
- [Ramotion — Verbal Identity: Definition, Components & Examples](https://www.ramotion.com/blog/verbal-identity/)
- [Journey Engine — SaaS Positioning (April Dunford principles)](https://journeyengine.com/eat-the-big-fish/)
