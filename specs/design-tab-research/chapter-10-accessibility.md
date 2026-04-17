# Chapitre 10 — Accessibilité & inclusion

> Livrable brut de l'Expert 10 (general-purpose).
> Couvre : WCAG 2.2 AA/AAA, 4 principes POUR, critères AA prioritaires, European Accessibility Act (EAA) 2025, ADA, RGAA, ARIA, outils d'audit.
> **Pragmatique** : 80/20 sur WCAG, pas 300 critères.

## 1. Objectif du chapitre

Rendre ton produit utilisable par **tout le monde**, y compris les personnes aveugles, malvoyantes, sourdes, dyslexiques, motrices ou simplement fatiguées. L'accessibilité ce n'est pas "un truc en plus pour les handicapés" : c'est la base qui permet à ton appli de fonctionner quand quelqu'un utilise un clavier cassé, une main occupée par un bébé, ou lit en plein soleil. Et depuis juin 2025, en Europe, c'est **la loi** (EAA) — pas optionnel.

## 2. Questions clés à poser à l'user

| # | Simple | Expert |
|---|--------|--------|
| 1 | "Ton produit sera utilisé dans l'UE ?" | "Ton produit relève-t-il de l'EAA (e-commerce, banque, transport, livre, téléphonie, service consommateur en UE) ?" |
| 2 | "Tu vends en France uniquement ou partout ?" | "Quels référentiels t'engagent : EAA/EN 301 549, ADA Title III, RGAA, Section 508, AODA ?" |
| 3 | "T'as combien de salariés ?" | "Es-tu microentreprise (<10 employés ET <2M€ CA) — exempté de l'EAA ?" |
| 4 | "T'as déjà testé ton site avec le clavier seul ?" | "Quel niveau de conformité vises-tu : A, AA (légal), AAA (gouvernemental) ?" |
| 5 | "Tes couleurs se voient bien sur du texte ?" | "As-tu audité tes paires de contraste (texte ≥4.5:1, UI ≥3:1) ?" |
| 6 | "Tes boutons sont assez gros pour un doigt ?" | "Respectes-tu la cible tactile 2.5.5 (44×44) ou la dérogation 2.5.8 (24×24 avec spacing) ?" |
| 7 | "Y a des animations qui bougent tout seules ?" | "Honores-tu `prefers-reduced-motion` et `prefers-color-scheme` ?" |
| 8 | "Tu peux zoomer à 200% sans que ça casse ?" | "Reflow 1.4.10 à 400% sans scroll horizontal — testé ?" |
| 9 | "Tes formulaires ont des étiquettes ?" | "Tous tes inputs ont `<label for>` ou `aria-label` + `aria-describedby` pour les erreurs ?" |
| 10 | "Les images ont un texte de description ?" | "Alt text informatif vs. `alt=""` pour décoratives — as-tu la règle par composant ?" |
| 11 | "T'as prévu de tester avec un lecteur d'écran ?" | "Plan de tests NVDA+Firefox, VoiceOver+Safari, TalkBack+Chrome ?" |
| 12 | "Tu sais écrire simple ?" | "Niveau de lecture cible (CECR A2/B1, Flesch > 60) et langue par défaut (`lang`) déclarée ?" |

## 3. UX du chapitre — 3 modes progressifs

**Mode Débutant — "Top 10 WCAG AA" checklist interactive**
10 cases à cocher, chacune avec :
- 1 phrase en langage simple ("Tes boutons se voient bien quand on appuie dessus ?")
- 1 exemple visuel OK vs KO
- 1 mini-explication ("Ça aide qui ? Tout le monde qui navigue au clavier, par exemple ton pote qui s'est cassé la souris.")
Score / 10 + badge "Prêt pour la plupart des gens".

**Mode Intermédiaire — Audit par écran**
L'user colle un screenshot ou décrit un écran. Mindeck génère une checklist ciblée :
- Scan sémantique (landmarks, headings, ordre du tab)
- Calcul des contrastes sur les paires couleur déclarées au chapitre 6
- Targets tactiles mesurés sur les composants listés
- Fixes suggérés avec priorité (bloquant / alerte / nice-to-have)

**Mode Expert — WCAG 2.2 matrice complète + compliance légal**
- Tableau complet des 50 critères AA + 28 critères AAA marqués "optionnels"
- Générateur d'accessibility statement conforme Annexe V EAA
- ARIA pattern picker (pour chaque composant custom : modal, combobox, tabs, disclosure, menu, tree, grid… aligné sur l'APG W3C)
- Rapport de conformité EAA / ADA / RGAA avec highlight des critères bloquants
- Matrice "qui audite quoi" (automatique via axe catches ~40%, le reste manuel)

## 4. Widgets / générateurs à implémenter

- **Contrast checker** — récupère toutes les paires définies au chapitre 6 (couleurs) et chapitre 7 (typo). Pour chaque paire : ratio calculé, verdict AA / AA large / AAA / FAIL. Highlight rouge sur les combos cassés. Réutilise l'algorithme WCAG 2 (pas APCA — pas encore normatif).
- **Focus indicator designer** — prévisualise le style :focus de chaque composant. Vérifie 2.4.11 (not obscured) et 2.4.13 (focus appearance : périmètre 2px minimum, ratio 3:1 état focus/non-focus).
- **Keyboard nav simulator** — guide pas-à-pas : "Tabule ton interface. Tous les éléments interactifs sont-ils atteignables ? L'ordre est-il logique ? Y a-t-il un piège clavier (focus trap involontaire) ?"
- **Touch target measurer** — saisie des dimensions de chaque élément cliquable. Alerte < 44×44 (AAA 2.5.5) ou < 24×24 (AA 2.5.8). Vérifie aussi le spacing entre targets.
- **Colorblindness simulator** — preview de la palette en protanopie, deutéranopie (la plus fréquente, 6% des hommes), tritanopie et achromatopsie. Détecte les paires indiscernables (ex. rouge/vert info-only).
- **ARIA pattern picker** — pour chaque composant custom, propose le pattern APG correspondant avec : rôles, attributs, raccourcis clavier attendus, pièges (ex. dialog = `role="dialog"` + `aria-modal="true"` + focus trap + `aria-labelledby`).
- **Screen reader test plan** — recommande la combo selon le public cible (NVDA+Firefox pour Windows grand public ~40%, JAWS+Chrome pour enterprise, VoiceOver+Safari obligatoire iOS/macOS, TalkBack+Chrome pour Android).
- **Motion & prefers-reduced-motion checker** — liste toutes les animations déclarées au chap. 7, exige un fallback `@media (prefers-reduced-motion: reduce)`.
- **Alt text assistant** — pour chaque image listée : décoratif (`alt=""`) / informatif (≤125 chars) / complexe (alt court + `aria-describedby` vers description longue) / texte dans image (déconseillé).
- **Form labeling validator** — chaque champ : label visible ? lié programmatiquement ? erreur annoncée via `aria-live` ? instructions données avant le champ et pas seulement en placeholder ?
- **Legal compliance report** — une page par juridiction : EAA (Annexe V), RGAA (statement conforme DINUM), ADA Title III (WCAG 2.1 AA comme standard de fait), AODA (Ontario), EN 301 549.
- **Accessibility statement generator** — modèle conforme Annexe V EAA (scope, niveau de conformité, exceptions, date, contact, autorité de recours) — OBLIGATOIRE depuis juin 2025 si sous EAA.

## 5. Règles de validation automatique

- Ratio contraste texte normal < **4.5:1** → **BLOQUANT**
- Ratio contraste texte large (≥18pt ou 14pt bold) < **3:1** → **BLOQUANT**
- Ratio contraste UI/icônes/bordures focus < **3:1** → **BLOQUANT**
- Info encodée **uniquement en couleur** (ex. rouge = erreur sans icône/texte) → **ALERTE**
- `outline: none` sans style `:focus-visible` de remplacement → **BLOQUANT**
- Bouton icon-only sans `aria-label` ni texte visuellement caché → **BLOQUANT**
- Touch target < 24×24 sans spacing 24px → **BLOQUANT** (AA 2.5.8)
- Touch target < 44×44 → **ALERTE** (AAA 2.5.5, best practice mobile)
- Animation > 3 Hz ou flash rouge saturé → **BLOQUANT** (risque épilepsie photosensible, 2.3.1)
- Animation sans fallback `prefers-reduced-motion` → **ALERTE**
- Image informative avec `alt=""` ou `alt="image"` ou `alt="logo.png"` → **BLOQUANT**
- Input sans `<label>` associé ou `aria-label` → **BLOQUANT**
- Placeholder utilisé comme seul label → **BLOQUANT**
- Page sans `<h1>` ou avec plusieurs `<h1>` → **ALERTE**
- Hiérarchie de headings cassée (h1 → h3 en sautant h2) → **ALERTE**
- `<html lang>` absent → **BLOQUANT**
- Zoom 200% casse la mise en page → **BLOQUANT** (1.4.4)
- Focus trap non-intentionnel (impossible de sortir d'une zone au clavier) → **BLOQUANT**
- ARIA utilisé sur un élément natif qui fait déjà le job (ex. `<button role="button">`) → **ALERTE** (ARIA cargo-cult)
- Cible EAA ET pas d'accessibility statement publié → **BLOQUANT LÉGAL**

## 6. Contenus pédagogiques

**Tooltip "C'est quoi ARIA ?"** — ARIA (Accessible Rich Internet Applications) c'est un langage pour dire aux lecteurs d'écran "ce bouton là, c'est en fait une modale fermable". Règle n°1 : **si l'HTML natif fait le job, utilise-le**. ARIA ne corrige jamais un mauvais HTML, il l'annote quand on ne peut pas faire autrement.

**Mini-leçon "Lecteur d'écran 101"** — 80% des aveugles utilisent un lecteur d'écran qui transforme la page en audio. Pour eux, ton `<div onclick>` n'est pas un bouton : c'est rien. Un `<button>` oui. Teste toi-même : télécharge NVDA (gratuit, Windows), ouvre ton site, éteins ton écran, et navigue 5 minutes. Tu comprendras en 10 secondes pourquoi les landmarks (`<main>`, `<nav>`, `<header>`) comptent.

**"Ça aide TOUT LE MONDE, pas juste les handicapés"**
- Sous-titres vidéo → user dans le métro sans écouteurs, parent d'un bébé qui dort, apprenant d'une langue étrangère
- Contrastes élevés → user au soleil, écran cheap, yeux fatigués à 2h du mat
- Targets tactiles 44px → tout le monde avec de gros doigts, bus qui secoue, gant
- Plain language → non-natifs, stressés, multitâches
- Keyboard nav → power users, devs, souris cassée
- Reduced motion → ADHD, vertige, vieux laptop qui rame

**Visuels OK vs KO**
- OK : bouton "Supprimer" avec icône poubelle + texte + fond rouge. KO : icône poubelle rouge seule.
- OK : champ "Email" avec label au-dessus, visible en permanence. KO : placeholder "Email" qui disparaît dès qu'on tape.
- OK : erreur formulaire avec icône ⚠ + texte rouge + `aria-live="polite"`. KO : texte rouge seul.

**Le seuil 4.5:1 expliqué** — ratio de contraste entre la couleur du texte et son fond. Noir sur blanc = 21:1 (max). Gris clair sur blanc = souvent 2:1 (fail). WCAG AA demande 4.5:1 pour du texte normal, c'est le seuil où 80% des malvoyants lisent sans douleur. Astuce : teste sur webaim.org/resources/contrastchecker.

## 7. Outputs générés

- **A11y audit report (markdown)** — synthèse par principe POUR, avec top 10 issues bloquantes, score AA global (ex. 42/50 critères respectés), et checklist des tests manuels à faire
- **WCAG 2.2 AA compliance score** — note /100 pondérée (bloquants × 3, alertes × 1)
- **Legal compliance checklist** — une ligne par juridiction : EAA ✓/✗, RGAA ✓/✗, ADA ✓/✗, avec critères manquants
- **ARIA spec par composant** — pour chaque composant custom : rôle, attributs, interactions clavier, code squelette (sans impl concrète, juste la "recette")
- **Accessibility statement draft** — template Annexe V EAA prêt à publier (nom entreprise, périmètre, niveau AA, exceptions listées, date, email contact, autorité nationale)
- **Test plan** — checklist manuelle : parcours clavier only, tests NVDA/VoiceOver sur les 5 écrans critiques, zoom 200%, colorblindness preview
- **Inclusive content guidelines** — règles rédactionnelles projet (niveau lisibilité cible, glossaire jargon à éviter, longueur phrases)

## 8. Modèle de données conceptuel

- `a11yTargets` : { wcagLevel: "AA"|"AAA", juridictions: string[], eaaApplicable: bool, microenterpriseExempt: bool }
- `contrastPairs` : [{ id, foreground, background, ratio, usage, verdict, isLargeText }]
- `components` : [{ id, name, isCustom, ariaPattern, keyboardInteractions, screenReaderExpected, touchTargetSize }]
- `motionPrefs` : { hasAnimations: bool, reducedMotionFallback: bool, flashingElements: bool }
- `formsInventory` : [{ inputId, label, labelingMethod, errorHandling, helpText }]
- `imagesInventory` : [{ imageId, purpose: "decorative"|"informative"|"functional"|"complex", altText }]
- `languages` : { primary: "fr", secondary: string[], hasLangSwitcher: bool }
- `auditResults` : { toolName, date, issues: [{ criterion, severity, location, fix }] }
- `accessibilityStatement` : { publishedUrl, lastReviewDate, conformanceLevel, exceptions: string[], contactEmail, enforcementAuthority }
- `testingPlan` : { screenReaders: string[], devices: string[], manualChecklistCompleted: bool }

## 9. Pièges classiques à éviter

1. **`outline: none` sans remplacement `:focus-visible`** — le péché capital. Tu casses la navigation clavier pour tout le monde qui ne voit pas sa souris. Règle : si tu enlèves l'outline par défaut (moche), tu DOIS fournir mieux.
2. **Placeholder comme seul label** — disparaît dès la frappe, invisible en mémoire courte. Utilise `<label>` visible + placeholder éventuel en exemple.
3. **Texte dans une image** (logo exclus) — impossible à zoomer proprement, à traduire, à rechercher. Si c'est du texte, c'est du `<p>`.
4. **`alt="image"` / `alt="photo.jpg"` / `alt="logo"`** — alt text vide est correct pour une image décorative (`alt=""`). Répéter "image" est bruit pour le lecteur d'écran qui annonce déjà "graphic".
5. **ARIA cargo-cult** — `<button role="button">`, `aria-label` sur des éléments qui ont déjà un texte, `role="navigation"` sur un `<nav>`. Règle n°1 ARIA : pas d'ARIA vaut mieux qu'un mauvais ARIA.
6. **Flash > 3 Hz ou rouge saturé clignotant** — risque d'épilepsie photosensible (2.3.1). Non-négociable, critère A, le plus sévère.
7. **Infinite scroll sans pause / skip** — piège cognitif et clavier. Toujours un "charger plus" actionnable ou un footer atteignable.
8. **Info uniquement en couleur** — "Les champs en rouge sont obligatoires." Non. Ajoute un astérisque, le mot "requis", ou une icône. 8% des hommes sont daltoniens.
9. **Focus trap involontaire** — classique des modals mal codées : le tab sort de la modal dans la page derrière. À l'inverse : modal qui coince le focus à jamais. Pattern APG dialog obligatoire.
10. **Contraste sur fond image / gradient** — le ratio se mesure contre le pixel le plus défavorable, pas la moyenne. Ajoute un overlay sombre ou une card solide.
11. **Pas de `<html lang>`** — le lecteur d'écran lit tout en anglais avec accent. 1 ligne à ajouter, critère A (3.1.1).
12. **Icônes "clic" sans nom accessible** — `<button><svg/></button>` tout seul = bouton "bouton" pour le lecteur d'écran. Ajoute `aria-label="Supprimer"` ou un span visuellement caché.

## 10. Références autoritatives

- **W3C WAI — WCAG 2.2 Quick Reference** : [w3.org/WAI/WCAG22/quickref](https://www.w3.org/WAI/WCAG22/quickref/) et [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- **W3C ARIA Authoring Practices Guide (APG)** : [w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg/) — patterns ARIA canoniques
- **WebAIM** — contrast, checklist, WebAIM Million report 2025/2026 : [webaim.org](https://webaim.org/standards/wcag/checklist) et [WebAIM Million](https://webaim.org/projects/million/)
- **The A11Y Project checklist** : [a11yproject.com/checklist](https://www.a11yproject.com/checklist/) — version pragmatique grand public
- **Deque University & axe-core** : [dequeuniversity.com](https://dequeuniversity.com/resources/wcag-2.2/) — cours + moteur d'audit
- **Heydon Pickering — Inclusive Components** : [inclusive-components.design](https://inclusive-components.design/) — patterns UI accessibles par composant
- **Sara Soueidan — Practical Accessibility + blog** : [sarasoueidan.com/blog](https://www.sarasoueidan.com/blog/) — focus indicators, ARIA live regions
- **GOV.UK Design System — Accessibility** : [design-system.service.gov.uk/accessibility](https://design-system.service.gov.uk/accessibility/) — dos & don'ts posters canoniques
- **RGAA 4.1 France (DINUM)** : [accessibilite.numerique.gouv.fr](https://accessibilite.numerique.gouv.fr/) — référentiel français (106 critères)
- **European Accessibility Act** : [commission.europa.eu](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en) + EN 301 549 harmonisé
- **MDN Web Docs — Accessibility** : [developer.mozilla.org/Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) — référence dev
- **Apple HIG — Accessibility** : [developer.apple.com/design/human-interface-guidelines/accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## 11. Priorité MVP

**MUST** — les 10 critères qui couvrent ~80% des issues réelles (d'après WebAIM Million 2025 : 94.8% des homepages fail, dont 79% sur le contraste, 55% sur l'alt text, 34% sur les labels).
1. **Contraste** 4.5:1 / 3:1 (1.4.3, 1.4.11)
2. **Keyboard navigation** complète, pas de piège (2.1.1, 2.1.2)
3. **Focus visible** partout, jamais `outline: none` orphelin (2.4.7)
4. **Semantic HTML** : `<button>`, `<a>`, `<nav>`, `<main>`, `<h1-h6>` cohérents (1.3.1, 2.4.6)
5. **Form labels** explicites et associés (1.3.1, 3.3.2)
6. **Alt text** pour images informatives, `alt=""` pour décoratives (1.1.1)
7. **`<html lang>`** déclaré (3.1.1)
8. **Touch targets ≥ 24×24** avec spacing (2.5.8)
9. **Pas d'info uniquement en couleur** (1.4.1)
10. **Zoom 200% sans casse** (1.4.4)

**SHOULD** — 20% restants, clairement abordables sur un MVP solide.
- `prefers-reduced-motion` respecté
- `prefers-color-scheme` (déjà fait dans Mindeck)
- ARIA live regions pour les notifications / toasts
- Skip link "Aller au contenu principal"
- Hiérarchie de headings propre (pas de saut)
- Error identification + suggestions formulaire (3.3.1, 3.3.3)
- Accessibility statement publié (obligatoire EAA si applicable)

**NICE** — critères AAA ou niches, **overkill pour un outil perso comme Mindeck**. À n'attaquer que sur un produit grand public à large audience.
- Contraste 7:1 (AAA 1.4.6) — trop restrictif pour la plupart des palettes
- Touch target 44×44 (AAA 2.5.5) — OK sur mobile mais 24×24 suffit en AA
- Langue des signes pour vidéos (AAA 1.2.6) — pas de vidéo = pas concerné
- Aide contextuelle AAA 3.3.5 — luxe
- Audit JAWS payant (~1000€/an) — NVDA gratuit suffit pour 90% des cas

**Verdict franc pour Mindeck (outil perso, pas sous EAA si <10 employés)** : vise le MUST à fond, SHOULD sur les formulaires critiques, ignore NICE. Tu évites l'effet "audit théorique à 300 critères" qui bloque les projets perso.

## 12. Estimation complexité d'implémentation

- **Mode Débutant (top 10 checklist + tooltips pédagogiques)** : **S** (1-2 jours)
- **Contrast checker + colorblindness simulator** : **M** (2-3 jours, réutilise chap. 6)
- **Mode Intermédiaire (audit screen + fixes suggérés)** : **L** (1-2 semaines)
- **ARIA pattern picker (couvrir 15 patterns APG essentiels)** : **L** (1-2 semaines)
- **Mode Expert (matrice 50 critères + legal reports EAA/ADA/RGAA)** : **XL** (3-4 semaines)
- **Accessibility statement generator conforme Annexe V** : **M** (2-3 jours, surtout du templating)
- **Intégration axe-core pour auto-audit live** : **L** (1 semaine, mais game changer)

**Total chapitre complet : XL** (~4-6 semaines dev focalisé). **MVP utile et honnête : M** (1-2 semaines) = top 10 checklist + contrast checker + colorblindness simulator + accessibility statement generator + pattern picker pour 5 composants (dialog, tabs, combobox, disclosure, menu).

---

## Sources

- [W3C WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [W3C — What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [W3C ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM's WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)
- [WebAIM Million 2025 Report](https://webaim.org/projects/million/)
- [WebAIM Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [The A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [Deque University — WCAG 2.2 Updates](https://dequeuniversity.com/resources/wcag-2.2/)
- [Inclusive Components — Heydon Pickering](https://inclusive-components.design/)
- [Sara Soueidan — Blog](https://www.sarasoueidan.com/blog/)
- [Sara Soueidan — Accessible Focus Indicators Guide](https://www.sarasoueidan.com/blog/focus-indicators/)
- [GOV.UK Design System — Accessibility](https://design-system.service.gov.uk/accessibility/)
- [GOV.UK — Dos and don'ts on designing for accessibility](https://accessibility.blog.gov.uk/2016/09/02/dos-and-donts-on-designing-for-accessibility/)
- [RGAA — Référentiel général d'amélioration de l'accessibilité](https://accessibilite.numerique.gouv.fr/)
- [European Commission — European Accessibility Act](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en)
- [EAA Fines & Penalties by Country — Level Access](https://www.levelaccess.com/blog/penalties-for-eaa-non-compliance/)
- [EAA Accessibility Statement Guide — Level Access](https://www.levelaccess.com/blog/eaa-accessibility-statement/)
- [Audioeye — Website Accessibility in 2025 (ADA lawsuits)](https://www.audioeye.com/post/website-accessibility-in-2025/)
- [ADA Title III — Seyfarth Shaw](https://www.adatitleiii.com/)
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [MDN — ARIA landmark roles](https://developer.mozilla.org/en-US/blog/aria-accessibility-html-landmark-roles/)
- [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [DaltonLens — Colorblindness Simulator](https://daltonlens.org/colorblindness-simulator)
- [Accessibility.build — Screen Reader Testing Guide](https://www.accessibility.build/guides/screen-reader-testing)
- [Harvard — Use Plain Language](https://accessibility.huit.harvard.edu/use-plain-language)
