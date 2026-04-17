# Phase 1 — Cartographie macro du design produit numérique

> Livrable brut de l'agent Phase 1 (general-purpose).
> Mission : identifier les 8 à 12 grands chapitres canoniques du "design produit numérique de A à Z".
> Méthode : 18 requêtes web croisées entre NN/g, Material Design 3, Apple HIG, Shopify Polaris, Refactoring UI, Atomic Design (Frost), Laws of UX, A11Y Project, Baymard, Don Norman, Design Council (Double Diamond), articles UX Collective / Smashing Magazine.

J'ai privilégié les points de **convergence forte** entre design systems majeurs (Google/Apple/Shopify) + livres de référence. J'ai écarté les tendances (glassmorphism, neumorphism, effets AI-gen) et les briques qui ne sont pas spécifiques au design produit numérique (branding pur hors-produit, stratégie marketing).

---

## 1. Fondations stratégiques (Pourquoi on design)
- **Pitch 12 ans** : Avant de dessiner quoi que ce soit, il faut savoir pour qui on fait l'app, à quoi elle sert, et pourquoi elle existe.
- **Pourquoi indispensable** : 100 % des sources pro (NN/g, Double Diamond, JTBD, Refactoring UI) martèlent que sauter cette étape produit du "joli qui ne sert à rien". Sans positionnement ni utilisateurs définis, tous les choix de design (couleurs, copy, flows) deviennent arbitraires.
- **Questions clés** :
  - Quel problème exact l'app résout, pour qui, dans quel contexte ?
  - Qu'est-ce qui différencie l'app des alternatives (positionnement) ?
  - Quelles sont les 1 à 3 personas ou "Jobs-to-be-Done" prioritaires ?
  - Quel est le résultat désiré de l'utilisateur (son "aha moment") ?
  - Quels principes design guideront toutes les décisions (ex : "rapide > complet", "clair > exhaustif") ?
- **Sources** : Design Council — Double Diamond ; NN/g — Personas vs. JTBD ; Don Norman — *Design of Everyday Things* (conceptual models) ; Shopify Polaris — Foundations/Experience.

## 2. Identité de marque & ton (Comment on parle)
- **Pitch 12 ans** : La personnalité de l'app — ce à quoi elle ressemble, comment elle parle, ce qu'elle fait ressentir.
- **Pourquoi indispensable** : Tous les design systems matures (Polaris, Material, HIG) séparent "brand expression" de "system". L'identité donne la cohérence émotionnelle — sans elle, l'UI paraît générique ou "AI-générée".
- **Questions clés** :
  - Quels 3 à 5 adjectifs décrivent la marque (ex : sobre, expert, chaleureux) ?
  - Logo, nom, tagline — quelle promesse portent-ils ?
  - Voice & tone : comment on parle (formel/familier, direct/pédagogue) ?
  - Quelles sont les références visuelles/anti-références assumées ?
- **Sources** : Frontify — *Visual Identity Framework* ; IED — *How to create a brand identity* ; Shopify Polaris — *Content* section ; Material 3 — *Customizing Material*.

## 3. Architecture de l'information & navigation (Où on est, où on va)
- **Pitch 12 ans** : Ranger le contenu de l'app comme une bibliothèque bien classée — chaque chose à sa place, et tu retrouves tout facilement.
- **Pourquoi indispensable** : NN/g insiste : "navigation is the tip of the iceberg ; IA is the iceberg". Une belle UI sur une mauvaise IA = app frustrante. C'est la couche qui rend un produit "compréhensible" avant d'être "joli".
- **Questions clés** :
  - Quelles sont les entités/objets principaux du produit et leurs relations ?
  - Quel est le sitemap / hiérarchie d'écrans ?
  - Comment l'utilisateur navigue (menu latéral, onglets, breadcrumbs, search) ?
  - Quels labels utilise-t-on (mots de l'utilisateur, pas du dev) ?
- **Sources** : NN/g — *IA vs Navigation* ; Abby Covert — *How to Make Sense of Any Mess* ; Optimal Workshop — IA guides ; Shopify Polaris — *Design/IA*.

## 4. Parcours utilisateurs & flows (Le chemin qu'on fait)
- **Pitch 12 ans** : Dessiner les chemins que les gens vont emprunter pour accomplir leurs tâches, étape par étape.
- **Pourquoi indispensable** : Les flows relient stratégie (JTBD) et écrans concrets. Ils révèlent les frictions avant tout pixel. Baymard a prouvé qu'un checkout mal flow-é fait perdre 26 % des ventes — c'est littéralement l'étape où l'on gagne ou perd.
- **Questions clés** :
  - Quels sont les 3 à 5 parcours critiques (onboarding, tâche principale, paiement, etc.) ?
  - Où sont les frictions, les décisions, les abandons potentiels ?
  - Quel est le nombre minimal d'étapes ? Quoi supprimer ?
  - Quel est le premier "aha moment" et à quelle étape survient-il ?
- **Sources** : Baymard — *Checkout UX Research* ; Justinmind — *User Flows Guide* ; Chameleon — *Onboarding UX Patterns* ; NN/g — *Journey Mapping*.

## 5. Principes d'interaction & lois UX (Comment ça répond)
- **Pitch 12 ans** : Les règles du cerveau humain qu'un bon design respecte : gros boutons = plus faciles à cliquer, trop de choix = décision lente, etc.
- **Pourquoi indispensable** : Ces principes sont scientifiquement validés (Fitts, Hick, Miller, Gestalt). Les ignorer = produire un design qui se bat contre la cognition de l'utilisateur. Don Norman et Jon Yablonski (Laws of UX) sont la référence absolue ici.
- **Questions clés** :
  - Les affordances sont-elles claires (un bouton ressemble-t-il à un bouton) ?
  - Y a-t-il du feedback pour chaque action ?
  - Respecte-t-on les conventions (Jakob's Law) ou pourquoi on les casse ?
  - Réduit-on la charge cognitive (Hick's Law, Miller's Law) ?
- **Sources** : Nielsen — *10 Usability Heuristics* ; lawsofux.com (Yablonski) ; Don Norman — *Design of Everyday Things* ; Apple HIG — *Foundations/Principles*.

## 6. Design visuel : hiérarchie, typo, couleur, espacement (À quoi ça ressemble)
- **Pitch 12 ans** : Rendre l'écran lisible d'un coup d'œil : ce qui est important doit sauter aux yeux, le reste reste discret.
- **Pourquoi indispensable** : 80 % du livre *Refactoring UI* porte là-dessus — et c'est ce qui différencie un dev qui "fait du UI" d'un designer. Tailwind CSS existe en partie pour implémenter ces principes.
- **Questions clés** :
  - Quelle échelle typographique (6 tailles max, ratio 1.25–1.5) ?
  - Quelle palette couleur (neutres larges + 1-2 accents + sémantiques success/warn/error) ?
  - Quelle grille d'espacement (base 4 ou 8 px) ?
  - Hiérarchie : qu'est-ce qui doit être vu en 1er / 2e / 3e ?
- **Sources** : Wathan/Schoger — *Refactoring UI* ; Material 3 — *Typography/Color/Layout* ; Figma — *Typography Guide* ; Apple HIG — *Foundations*.

## 7. Système de design : tokens, composants, patterns (La boîte à briques)
- **Pitch 12 ans** : Au lieu de redessiner un bouton à chaque fois, on en fait un seul modèle réutilisable partout — comme des Lego.
- **Pourquoi indispensable** : C'est la seule façon de scaler la cohérence. Les 3 niveaux (tokens globaux → sémantiques → composants) sont unanimement adoptés (Material, SAP, GitLab, Shopify). Sans tokens, le dark mode ou le rebrand deviennent un enfer.
- **Questions clés** :
  - Quels tokens globaux (couleurs brutes, espacements, radius) ?
  - Quels tokens sémantiques (bg-primary, text-muted, border-danger) ?
  - Quels composants de base (bouton, input, card, modal, table) ?
  - Quels patterns récurrents (liste + empty state, form + validation) ?
- **Sources** : Brad Frost — *Atomic Design* ; Material 3 — *Design Tokens* ; Nathan Curtis — *Naming Tokens* ; Shopify Polaris — *Components*.

## 8. États de l'interface & micro-interactions (Ce qui bouge et répond)
- **Pitch 12 ans** : L'app doit toujours te dire ce qu'elle fait : quand ça charge, quand c'est vide, quand ça plante, quand c'est réussi.
- **Pourquoi indispensable** : Les states (loading, empty, error, success, disabled, hover, focus) sont où les designers juniors oublient 50 % du travail. Une micro-interaction bien calibrée (200-500 ms) est la différence entre "pro" et "amateur".
- **Questions clés** :
  - Chaque composant a-t-il ses 5 états (default, hover, focus, active, disabled) ?
  - Chaque écran gère-t-il loading / empty / error / success ?
  - Les empty states enseignent-ils quoi faire ensuite ?
  - Les animations ont-elles un but (guider) ou sont-elles décoratives ?
- **Sources** : NN/g — *Empty States* ; GitHub Primer — *Empty States* ; Carbon — *Loading Pattern* ; Material 3 — *Interaction States*.

## 9. Écriture UX & microcopy (Les mots qui guident)
- **Pitch 12 ans** : Les petits textes partout dans l'app — boutons, erreurs, tooltips — ils doivent être clairs comme de l'eau.
- **Pourquoi indispensable** : Souvent négligé, alors que le mot sur un bouton a plus d'impact sur la conversion que sa couleur. NN/g a mesuré jusqu'à +124 % d'usabilité sur une copy retravaillée. Les 3 C : Clear, Concise, Consistent.
- **Questions clés** :
  - Les labels de boutons sont-ils des verbes d'action (pas "OK") ?
  - Les messages d'erreur disent-ils quoi faire, pas juste ce qui ne va pas ?
  - Le ton de voix est-il cohérent partout (cf. chap. 2) ?
  - Y a-t-il un glossaire des termes à utiliser/bannir ?
- **Sources** : NN/g — *UX Copy Sizes* ; Smashing — *Microcopy & UX Writing* ; Shopify Polaris — *Content* ; *UX Writing Hub*.

## 10. Accessibilité & inclusion (Utilisable par tout le monde)
- **Pitch 12 ans** : L'app doit marcher aussi pour quelqu'un qui ne voit pas bien, qui ne peut pas utiliser la souris, ou qui a un tremblement.
- **Pourquoi indispensable** : 15 % de la population a un handicap. Juridiquement obligatoire en UE (EAA 2025) et US (ADA). Les bonnes pratiques a11y bénéficient à 100 % des utilisateurs (clavier, contraste, lisibilité). Ce n'est PAS une option.
- **Questions clés** :
  - Contraste texte ≥ 4.5:1, éléments interactifs ≥ 3:1 ?
  - Navigation clavier complète, focus visible ?
  - Labels ARIA, alt texts, structure sémantique HTML ?
  - Respect de `prefers-reduced-motion` ?
- **Sources** : A11Y Project — *Checklist* ; WCAG 2.2 AA ; Material 3 — *Accessibility* ; Apple HIG — *Accessibility Foundations*.

## 11. Adaptativité : responsive, dark mode, densité (S'adapter au contexte)
- **Pitch 12 ans** : L'app doit être belle et utilisable sur un téléphone, un ordi, de jour comme de nuit.
- **Pourquoi indispensable** : En 2026 c'est un "baseline", plus une option. Mobile-first, dark mode par défaut, densité variable (compact/confortable) sont attendus. Le tout repose sur les tokens sémantiques (chap. 7).
- **Questions clés** :
  - Design mobile-first ou desktop-first ? Quels breakpoints ?
  - Dark mode : inversion des tokens sémantiques, pas juste "fond noir" ?
  - Densités d'affichage (compact pour experts, confortable pour novices) ?
  - Comportement tactile vs souris (tailles de cible Fitts) ?
- **Sources** : Material 3 — *Adaptive Design* ; Figmenta — *Dark Mode Strategy* ; UXPin — *Responsive Best Practices 2026* ; Wroblewski — *Mobile First*.

## 12. Validation & itération (Est-ce que ça marche vraiment ?)
- **Pitch 12 ans** : On teste avec de vrais utilisateurs et on améliore, encore et encore — ce n'est jamais "fini".
- **Pourquoi indispensable** : Sans mesure, on design à l'aveugle. Les métriques (SUS, SEQ, task success, time-on-task) transforment le design en discipline. 5 tests utilisateurs suffisent à trouver 85 % des problèmes (Nielsen).
- **Questions clés** :
  - Quelles tâches clés veut-on mesurer (success rate, time, errors) ?
  - Tests modérés, non-modérés, A/B, heatmaps ?
  - Quelles heuristiques d'audit (Nielsen 10) appliquer périodiquement ?
  - Qu'est-ce qu'une "itération réussie" = quel seuil on vise ?
- **Sources** : NN/g — *Heuristic Evaluation* ; Maze — *Usability Metrics* ; Baymard — méthodologie ; Krug — *Don't Make Me Think*.

---

## Ordre proposé & justification

L'enchaînement va du **stratégique** (chap. 1-2, le "pourquoi") au **structurel** (3-4, le "quoi/où"), puis au **comportemental** (5, le "comment ça répond"), puis au **visuel et systémique** (6-7, le "à quoi ça ressemble"), puis à **l'opérationnel fin** (8-9, les détails qui font la qualité), puis aux **contraintes universelles** (10-11, pour tous/partout), et enfin à la **boucle de validation** (12, qui réinjecte dans tout le reste).

C'est le même ordre que le Double Diamond compressé : **Discover → Define → Develop → Deliver → Measure**. C'est aussi cohérent avec la maturité d'un projet Mindeck : au début tu remplis le chap. 1, tu affines ensuite, et tu reviens au chap. 12 quand l'app tourne.

## Chapitres écartés et pourquoi

- **"Design thinking" comme chapitre à part** : j'estime cette abstraction datée et recouvre déjà chap. 1 + 4 + 12. Beaucoup d'articles 2026 critiquent son côté marketing.
- **"Tendances" (glassmorphism, bento grids, AI-gen visuals)** : éphémère, pas une fondation. Peut être mentionné dans chap. 2 (choix visuels) mais pas un chapitre.
- **"Branding complet" (packaging, print, social)** : hors scope produit numérique — je l'ai réduit à "Identité de marque" appliquée au produit.
- **"Performance technique / Core Web Vitals"** : relève du dev, pas du design — mais influence l'UX (mentionnable en chap. 12).
- **"Design ops / gouvernance du design system"** : trop avancé pour un outil perso. À réintroduire seulement si l'app devient multi-user/équipe.
- **"Illustration / iconographie"** : je l'ai fondu dans chap. 6 (visuel) + chap. 7 (système), car rarement un chapitre distinct dans les design systems sérieux.
- **"Émotion / délice / surprise"** : concept réel mais trop flou pour un chapitre — émerge de bien faire les 12 autres. Piège marketing.

**Avis non sycophantique** : Le chapitre 2 (identité de marque) est souvent sur-vendu dans les articles medium ; pour un outil perso pragmatique comme Mindeck, il peut être plus light que les 11 autres. À l'inverse, le chap. 8 (états + micro-interactions) est **systématiquement sous-traité** dans les tutos UI — c'est là qu'il y a le plus de valeur ajoutée à creuser en phase 2.

---

## Sources principales croisées

- [NN/g — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [NN/g — IA vs Navigation](https://www.nngroup.com/articles/ia-vs-navigation/)
- [NN/g — Personas vs JTBD](https://www.nngroup.com/articles/personas-jobs-be-done/)
- [NN/g — Empty States](https://www.nngroup.com/articles/empty-state-interface-design/)
- [Material Design 3 — Foundations](https://m3.material.io/foundations)
- [Material Design 3 — Design Tokens](https://m3.material.io/foundations/design-tokens)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [Shopify Polaris](https://polaris-react.shopify.com/foundations)
- [Atomic Design — Brad Frost](https://atomicdesign.bradfrost.com/)
- [Laws of UX — Jon Yablonski](https://lawsofux.com/)
- [Refactoring UI — Wathan & Schoger](https://refactoringui.com/)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [Baymard Institute — Checkout Research](https://baymard.com/research/checkout-usability)
- [Design Council — Double Diamond](https://www.designcouncil.org.uk/our-resources/the-double-diamond/)
- [IxDF — Affordances (Don Norman)](https://ixdf.org/literature/topics/affordances)
- [Smashing Magazine — Microcopy UX Writing](https://www.smashingmagazine.com/2024/06/how-improve-microcopy-ux-writing-tips-non-ux-writers/)
- [Figmenta — Dark Mode Strategy 2026](https://studio.figmenta.com/en/insights/dark-mode-and-dynamic-theming-ux-comfort-strategy-for-2026)
- [UXPin — Interaction Design Principles](https://www.uxpin.com/studio/blog/interaction-design-its-origin-and-principles/)
