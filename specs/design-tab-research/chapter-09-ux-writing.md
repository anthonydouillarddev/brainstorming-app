# Chapitre 9 — Écriture UX & microcopy

> Livrable brut de l'Expert 9 (general-purpose).
> Couvre : les 4 C (Clear, Concise, Consistent, Conversational) + Useful, buttons/CTAs, errors (what+why+how), empty states, confirmation dialogs, inclusive language, i18n-readiness.

## 1. Objectif du chapitre

L'interface parle à l'utilisateur. Ce chapitre t'apprend à écrire tous les petits textes de ton app (boutons, messages, erreurs, champs vides) pour qu'ils soient **clairs, courts, utiles et cohérents**. Un bon microcopy guide sans faire réfléchir ; un mauvais microcopy bloque, frustre ou fait fuir. On va écrire comme on parlerait à un ami qui découvre l'app.

## 2. Questions clés à poser à l'user

1. **Qui parle à qui ?**
   - *Simple* : Qui lit tes textes ? (enfant, pro, débutant tech...)
   - *Expert* : Définis les personas de lecture et leur niveau de maîtrise du domaine.

2. **Quel ton selon le contexte ?**
   - *Simple* : Tu veux être sérieux, drôle, rassurant ?
   - *Expert* : Établis la matrice voice & tone (neutre / chaleureux / grave) par type d'écran.

3. **Quels sont les moments critiques ?**
   - *Simple* : Où l'utilisateur peut être perdu ou énervé ?
   - *Expert* : Liste les high-anxiety touchpoints (paiement, suppression, erreur réseau).

4. **Quels verbes d'action utilises-tu pour les CTA ?**
   - *Simple* : Tes boutons disent quoi ? (Pas "OK" j'espère.)
   - *Expert* : Glossaire des verbes d'action standards + bannis + synonymes autorisés.

5. **Comment formules-tu tes erreurs ?**
   - *Simple* : Quand ça plante, tu dis quoi à l'utilisateur ?
   - *Expert* : Structure "what happened + why + how to fix" + copy de repli par code HTTP.

6. **Que voit-on quand c'est vide ?**
   - *Simple* : Une page sans contenu, ça dit quoi à l'utilisateur ?
   - *Expert* : Empty states pédagogiques : headline + description + CTA primaire.

7. **Quels mots tu bannis ?**
   - *Simple* : Y a-t-il des mots compliqués ou ringards à éviter ?
   - *Expert* : Table DO/DON'T + jargon interne à traduire vers user-facing.

8. **L'app sera-t-elle traduite un jour ?**
   - *Simple* : Tu veux pouvoir passer en anglais / espagnol ?
   - *Expert* : Checklist i18n-readiness (idiomes, pluralisation, longueur, ordre des variables).

9. **Comment confirmes-tu les actions destructives ?**
   - *Simple* : Avant de supprimer, tu demandes comment ?
   - *Expert* : Pattern confirmation par criticité (destructive irréversible / réversible / low-impact).

10. **Ton copy est-il inclusif ?**
    - *Simple* : Est-ce que tout le monde se reconnaît dans tes mots ?
    - *Expert* : Audit inclusif (genre, abilism, culturalismes, références localisées).

## 3. UX du chapitre — 3 modes progressifs

**Mode Débutant — "Écris-moi ce texte"**
L'utilisateur choisit un contexte (bouton, erreur, page vide, dialog) et décrit l'action en 1 phrase. L'app propose 3 à 5 formulations ranked par clarté, avec la règle appliquée en dessous. Exemple : action = "valider l'inscription" → "Créer mon compte" / "Commencer" / "M'inscrire" (vs ❌ "OK" / "Soumettre"). Pédagogie par l'exemple avant/après.

**Mode Intermédiaire — Templates contextualisés**
Bibliothèque de patterns pré-remplis à customiser : empty states (5 variantes), error messages (8 patterns par code), onboarding steps, tooltips, confirmation dialogs, 404/500, success toasts. Chaque template affiche les variables à remplir + un exemple concret. L'utilisateur édite, valide, et le template rejoint son copy deck.

**Mode Expert — Voice & tone matrix + glossaire**
Tableau croisé ton × contexte (déjà amorcé chapitre 2 Brand). Éditeur de glossaire DO/DON'T avec justifications. Reading level checker (grade Flesch-Kincaid, phrases passives, mots >12 lettres). Checklist i18n complète. Export d'un style guide markdown utilisable par une équipe ou un LLM.

## 4. Widgets / générateurs à implémenter

- **Button copy generator** : input = verbe + objet (ex : "envoyer invitation") → output = 5 libellés ranked avec longueur en caractères et score clarté. Flag si libellé >25 caractères ou mot générique ("Soumettre", "Valider" sans objet).

- **Error message builder** : 4 champs structurés (*what happened / why / how to fix / optional CTA*) → assemble en message conforme au pattern Atlassian/Nielsen. Pré-remplit selon code HTTP ou type d'erreur (validation, réseau, permission).

- **Empty state copy generator** : 3 champs (*headline motivante / description 1 ligne / CTA primaire*) + suggestion d'illustration. Templates par cas (liste vide, recherche sans résultat, première visite).

- **Confirmation dialog rewriter** : détecte les boutons "OK / Annuler" et les réécrit en verbes explicites ("Supprimer le projet / Garder") selon le pattern NN/g.

- **Placeholder vs label checker** : analyse les formulaires et alerte si un placeholder porte l'info essentielle sans label visible (pattern anti-Nielsen connu depuis 2014).

- **Glossary DO/DON'T** : table éditable 3 colonnes (*terme à éviter / préféré / raison*). Seed avec 30 entrées par défaut (ex : "utilisateur" → "toi" ou "vous", "cliquer" → "toucher" sur mobile, "supprimer" gardé sans euphémisme).

- **Tone check** : détecte les incohérences de ton (humour sur message d'erreur paiement, formalisme excessif sur onboarding ludique). Basé sur la matrice voice & tone du chapitre 2.

- **Reading level checker** : style Hemingway — grade level cible (6e = GOV.UK standard), % de phrases passives, phrases >20 mots, mots rares. Highlight par couleur directement dans le texte.

- **Copy deck export** : tableau de tous les libellés de l'app (clé, contexte, FR, EN à remplir plus tard, notes) exportable CSV pour handoff design/dev/traducteur.

- **Microcopy linter** : règles automatiques (voir §5) appliquées à tout texte entré, avec sévérité (error / warning / suggestion).

## 5. Règles de validation automatique

- Bouton contenant "OK", "Submit", "Soumettre", "Valider" seul → **error**, suggérer verbe + objet.
- Message d'erreur sans "how to fix" → **warning**, proposer un CTA de récupération.
- Message d'erreur contenant "Something went wrong" / "Une erreur est survenue" sans contexte → **warning**.
- Label en MAJUSCULES complètes → **warning** (lisibilité réduite, source Nielsen).
- Placeholder >40 caractères ou portant l'info unique du champ → **error**.
- Phrase >25 mots → **warning** (simplifier).
- Voix passive >20% du texte → **suggestion**.
- Usage de "please kindly" / "veuillez bien vouloir" → **warning** (obséquieux, source Mailchimp).
- Points d'exclamation >1 par écran → **warning** (diminue la force).
- Jargon tech en user-facing ("timeout", "payload", "500") sans traduction → **error**.
- Texte non-inclusif détecté (liste par défaut : "mec/guys", pronoms genrés forcés, idiomes culturels) → **warning**.
- Ton détecté incohérent avec contexte (humour sur écran légal/paiement/erreur critique) → **error**.
- CTA dupliqué dans la même vue avec libellés différents ("Enregistrer" + "Sauvegarder") → **warning** (incohérence).

## 6. Contenus pédagogiques

Les tooltips contextuels affichent la règle avec un exemple avant/après. Par exemple, au survol d'un bouton "Soumettre" : *"Un bouton doit dire ce qui se passe après le clic. ❌ 'Soumettre' ✓ 'Envoyer le message'. Source : NN/g 2015."*

Mini-leçons de 2 minutes par sujet, avec comparaisons :
- ❌ "Une erreur inattendue s'est produite" → ✓ "Ton fichier est trop lourd (max 5 Mo). Compresse-le ou choisis-en un plus petit."
- ❌ "Aucun projet" (empty state) → ✓ "Crée ton premier projet et pose ta première brique. [Nouveau projet]"
- ❌ "Êtes-vous sûr ? [OK] [Annuler]" → ✓ "Supprimer le projet 'Mindeck' ? Cette action est définitive. [Supprimer] [Garder]"
- ❌ "Please kindly enter your email" → ✓ "Ton email"
- ❌ "404 Not Found" → ✓ "Cette page n'existe plus ou a déménagé. [Retour à l'accueil]"

Règle mnémo **les 4 C + U** (Mailchimp + Nielsen) : **C**lear, **C**oncise, **C**onsistent, **C**onversational, **U**seful.

## 7. Outputs générés

- **Microcopy guide** (markdown) : principes de voix/ton, règles par contexte (boutons, erreurs, empty states, onboarding, dialogs, tooltips, 404/500), liste de patterns recommandés avec exemples.
- **Glossary DO/DON'T** (CSV + markdown) : table terme banni / préféré / raison, utilisable par l'équipe et par un LLM.
- **Error messages library** (JSON ou markdown) : tous les messages d'erreur possibles classés par code/contexte, prêts à l'emploi.
- **Copy deck** (CSV) : tableau exhaustif des libellés de l'app (clé technique, contexte, FR, placeholder EN, notes de ton, longueur max). C'est le livrable phare pour handoff dev + traducteurs.
- **Voice & tone matrix** (markdown) : synthèse ton × contexte exportable.
- **Onboarding scripts** : séquences d'écrans d'accueil prêtes à l'emploi.
- **i18n-readiness checklist** : audit des pièges de localisation identifiés.

## 8. Modèle de données conceptuel

Pour chaque **entrée de microcopy** :
- identifiant (clé unique, ex : `button.project.create`)
- contexte (bouton / erreur / empty / tooltip / dialog / toast / onboarding / legal / 404-500)
- ton (neutre / chaleureux / grave / ludique)
- libellé FR
- libellé EN (optionnel, i18n)
- longueur max (caractères)
- variables dynamiques (ex : `{projectName}`)
- notes (pourquoi cette formulation)
- alternatives rejetées + raison
- statut (draft / validated / deprecated)

Pour le **glossaire** : terme banni, terme préféré, raison, catégorie (jargon / ton / inclusif / idiome), exemples.

Pour les **règles de linting** : id, pattern détecté, sévérité, message d'explication, suggestion de remplacement.

## 9. Pièges classiques à éviter

1. **Bouton "OK / Annuler"** sur action destructive → toujours verbe explicite + objet ("Supprimer le projet / Garder"). Source : NN/g.
2. **"Une erreur est survenue"** sans contexte ni solution → l'utilisateur est coincé. Toujours *what + why + how*.
3. **Placeholder utilisé comme label** → quand l'utilisateur tape, il oublie ce qu'était le champ. Label visible obligatoire (Nielsen, W3C WCAG).
4. **"Please kindly" / "Veuillez bien vouloir"** → obséquieux, ralentit la lecture. Source : Mailchimp Content Style Guide.
5. **Points d'exclamation partout** ("Bienvenue ! Super ! Génial !") → dilue l'enthousiasme, donne un ton forcé. Max 1 par écran.
6. **Jargon dev** en user-facing ("null", "timeout", "payload", "403 Forbidden") → traduire systématiquement ("Tu n'as pas accès à cette page").
7. **Humour sur écran grave** (erreur paiement, suppression de compte, legal) → briser la confiance. Ton chaleureux OK sur onboarding, JAMAIS sur écran critique. Source : Atlassian Voice & Tone.
8. **Labels en MAJUSCULES** → lisibilité réduite ~15% (NN/g). Title case ou sentence case uniquement.
9. **CTA vague** ("En savoir plus", "Cliquer ici") → préférer "Lire le guide complet", "Voir les prix".
10. **Incohérence de vocabulaire** ("Enregistrer" / "Sauvegarder" / "Valider" pour la même action) → choisir un terme et le respecter. Glossaire obligatoire.
11. **Idiome intraduisible** ("It's a piece of cake", "Aux petits oignons") → piège i18n, préférer formulation neutre.
12. **Copy condescendant** ("Oups ! Tu as fait une bêtise") → respecter l'utilisateur, ne jamais blâmer.

## 10. Références autoritatives

- **Kinneret Yifrah, *Microcopy: The Complete Guide*** (2017) — bible du microcopy, patterns par contexte, études de cas. Référence incontournable.
- **Mailchimp Content Style Guide** (styleguide.mailchimp.com) — voice & tone, grammaire, inclusivité, approche conversationnelle. Pionnier du genre.
- **Shopify Polaris — Content guidelines** (polaris.shopify.com/content) — patterns par composant (buttons, banners, modals), vocabulaire produit.
- **Atlassian Design System — Voice and tone** (atlassian.design/content) — matrice ton par contexte, inclusive writing, error messages.
- **Microsoft Writing Style Guide** (learn.microsoft.com/style-guide) — référence complète, bias-free communication, accessibility.
- **Nielsen Norman Group — UX Writing articles** (nngroup.com) — recherche UX appliquée aux micro-textes (placeholders, CTAs, error messages, confirmation dialogs).
- **GOV.UK — Content design: planning, writing and managing content** (gov.uk/guidance/content-design) — plain language, reading age, accessibility, inclusivité. Standard public exceptionnel.
- **Material Design 3 — Writing** (m3.material.io/foundations/content-design) — principes Google, structure d'error messages, empty states.
- **Apple Human Interface Guidelines — Writing** (developer.apple.com/design/human-interface-guidelines/writing) — concision Apple, capitalisation, ton.
- **UX Writing Hub** (uxwritinghub.com) — cours, frameworks, glossaires gratuits.

## 11. Priorité MVP

**Must**
- Button copy generator (3-5 suggestions par action)
- Error message builder (what + why + how)
- Empty state generator (headline + description + CTA)
- Glossary DO/DON'T (30 entrées seed)
- Microcopy linter avec 8 règles critiques (OK button, vague error, placeholder-as-label, all caps, jargon, etc.)
- Copy deck export CSV

**Should**
- Confirmation dialog rewriter
- Voice & tone matrix éditable
- Reading level checker (grade + passive voice)
- Templates d'onboarding
- Error messages library par code HTTP

**Nice**
- Tone check contextuel automatique (détection humour sur écran grave)
- i18n-readiness checklist interactive
- Integration LLM pour suggérer reformulations
- Versioning du copy deck avec diff entre versions
- A/B testing framework pour tester 2 versions de copy

## 12. Estimation complexité d'implémentation

**Complexité globale : L** (Large).

Détail par bloc :
- Générateurs (buttons, errors, empty states) : **M** — templates + règles heuristiques, peut être boosté avec un appel LLM côté serveur.
- Linter de microcopy : **M** — regex + règles heuristiques pour le MVP, plus sophistiqué (NLP) en V2.
- Reading level checker : **S** — formule Flesch-Kincaid adaptée au français (implémentation existante open source).
- Glossary DO/DON'T éditable : **S** — CRUD simple avec seed par défaut.
- Copy deck export : **S** — CSV generator + schéma de données.
- Voice & tone matrix : **S** — réutilisation du module chapitre 2.
- Confirmation dialog rewriter : **M** — parser + règles de réécriture.
- Tone check contextuel : **L** — détection NLP légère, classification de ton, règle contextuelle.
- Integration LLM pour reformulations : **L** — infra API + prompts engineering + coûts.

Le bloc LLM peut faire passer l'ensemble à **XL** si on veut une suggestion intelligente pour chaque bouton / erreur / empty state. Pour le MVP, privilégier les générateurs par templates + règles heuristiques : suffisant pour couvrir 80% des cas, et extensible en V2 avec LLM.
