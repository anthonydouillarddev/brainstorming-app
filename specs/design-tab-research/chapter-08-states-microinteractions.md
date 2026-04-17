# Chapitre 8 — États d'interface & micro-interactions

> Livrable brut de l'Expert 8 (general-purpose).
> **Chapitre systématiquement sous-traité dans les tutos UI — gros potentiel de valeur ajoutée.**
> Couvre : states composants (7), states écran (empty/loading/error/success/partial), micro-interactions Saffer, animations, haptic.

## 1. Objectif du chapitre

L'app doit **toujours** te dire ce qu'elle fait. Quand tu cliques, elle te répond. Quand elle charge, elle te montre. Quand c'est vide, elle t'explique pourquoi et quoi faire. Quand ça casse, elle te dit comment réparer. Ce chapitre s'occupe de tous ces petits moments invisibles qui font la différence entre une app qui donne envie et une app qu'on abandonne après 30 secondes.

---

## 2. Questions clés à poser à l'user

| # | Simple | Expert |
|---|--------|--------|
| 1 | Quand tu cliques sur un bouton, qu'est-ce qui doit se passer immédiatement ? | Quelle est ta stratégie de feedback synchrone (<100ms) vs asynchrone (loading state) ? |
| 2 | Comment on voit qu'un bouton est "en train de charger" ? | Spinner inline, bouton désactivé + label dynamique, ou optimistic UI avec rollback ? |
| 3 | Quand un écran est vide (aucune donnée), qu'est-ce qu'il affiche ? | Différencies-tu first-use / user-cleared / no-results / error empty states ? |
| 4 | Quand ça plante, qu'est-ce que l'utilisateur voit ? | Hiérarchie error : validation inline / toast réseau / page 500 / modal permission ? |
| 5 | Combien de temps maximum peut durer un chargement avant qu'on montre quelque chose ? | Seuils RAIL (100ms/300ms/1s/10s) et stratégie par seuil (skeleton, spinner, progress bar) ? |
| 6 | Est-ce que le focus clavier est visible quand on tabule ? | Outline custom, `:focus-visible` uniquement, ou halo couleur accent + ratio contraste 3:1 ? |
| 7 | Quand on supprime un truc, est-ce qu'on peut annuler ? | Undo toast 5-10s ou confirmation modale selon criticité de l'action ? |
| 8 | Les animations, elles servent à quoi ? | Purposeful (masquer latence, guider regard, renforcer hiérarchie) vs decorative — ratio cible ? |
| 9 | Si un utilisateur a désactivé les animations dans son OS, qu'est-ce qui se passe ? | `prefers-reduced-motion: reduce` → fade only, pas de translate/scale/parallax ? |
| 10 | Les messages d'erreur expliquent quoi faire, ou juste qu'il y a un problème ? | Template : ce qui s'est passé + pourquoi + action concrète + lien aide ? |
| 11 | Sur mobile, il y a des vibrations quand on interagit ? | Haptic : light/medium/heavy mappés à quels événements (success, warning, error) ? |
| 12 | Les transitions entre écrans, elles durent combien ? | Duration tokens (fast 150ms / base 250ms / slow 400ms) + easing system (ease-out entry, ease-in exit) ? |

---

## 3. UX du chapitre — 3 modes progressifs

### Mode Débutant — Audit checklist par écran

Pour chaque écran principal de ton app, l'outil te force à répondre aux 5 questions qu'on oublie :

```
┌─ Écran : "Liste des projets" ────────────────────────┐
│                                                      │
│  [ ] Empty state défini ?                            │
│      └─ Quoi afficher quand 0 projet ?               │
│                                                      │
│  [ ] Loading state défini ?                          │
│      └─ Skeleton, spinner, ou progressive ?          │
│                                                      │
│  [ ] Error state défini ?                            │
│      └─ Si la DB répond pas, on montre quoi ?        │
│                                                      │
│  [ ] Success feedback défini ?                       │
│      └─ Après création d'un projet, on voit quoi ?   │
│                                                      │
│  [ ] Partial state envisagé ?                        │
│      └─ Si réseau lent, skeleton partiel ?           │
│                                                      │
│  Score écran : 2/5 → Mindeck t'alerte                │
└──────────────────────────────────────────────────────┘
```

Chaque case non cochée = alerte rouge + conseil "la plupart des apps oublient X, voici pourquoi c'est critique".

### Mode Intermédiaire — State matrix par composant

Pour chaque composant interactif, une matrice à remplir avec **preview visuel live** :

```
Composant : Button Primary
┌────────────┬────────────┬──────────────────────┐
│   State    │   Défini ? │   Preview            │
├────────────┼────────────┼──────────────────────┤
│ default    │    [✓]     │  [ Envoyer ]         │
│ hover      │    [✓]     │  [ Envoyer ] +2%br   │
│ focus      │    [✗]     │  ⚠ ALERTE a11y      │
│ active     │    [✓]     │  [ Envoyer ] -1%br   │
│ disabled   │    [✓]     │  [ Envoyer ] 40%op   │
│ loading    │    [?]     │  [ ⟳ Envoi... ]      │
│ error      │    [✗]     │  non défini          │
└────────────┴────────────┴──────────────────────┘

Composants à auditer : Button, Input, Textarea, Select,
Checkbox, Radio, Toggle, Link, Card interactive, Row clickable,
Tab, Menu item, Avatar, Badge clickable.
```

### Mode Expert — Micro-interactions spec

Éditeur complet suivant le framework Dan Saffer (Trigger → Rules → Feedback → Loops & Modes) :

```
┌─ Micro-interaction : "Cocher un todo" ───────────────────┐
│                                                          │
│  TRIGGER                                                 │
│    Type      : user-initiated                            │
│    Event     : click / tap / keyboard (Space)            │
│    Area      : checkbox 24×24 (hit target 44×44 mobile)  │
│                                                          │
│  RULES                                                   │
│    ├─ Optimistic UI : done=true immédiat                 │
│    ├─ Mutation Supabase async                            │
│    ├─ Si erreur : rollback + toast "Impossible"          │
│    └─ Si done=true : déplacer en bas après 400ms         │
│                                                          │
│  FEEDBACK                                                │
│    Visual   : checkbox fill + strikethrough texte        │
│    Motion   : checkmark scale 0→1 (200ms, spring)        │
│    Haptic   : light impact (mobile)                      │
│    Sound    : none                                       │
│    Delay    : 0ms (synchrone)                            │
│                                                          │
│  LOOPS & MODES                                           │
│    Loop     : none                                       │
│    Mode     : si todo blocked → animation shake refus ?  │
│    Undo     : toast 5s "Annuler"                         │
│                                                          │
│  A11Y                                                    │
│    aria-checked, aria-label, focus visible, announce     │
│                                                          │
│  REDUCED MOTION                                          │
│    → fade only, pas de scale/translate                   │
└──────────────────────────────────────────────────────────┘
```

Éditeur de timing avec courbe d'easing manipulable visuellement (cubic-bezier handles) + preview live.

---

## 4. Widgets / générateurs à implémenter

1. **State matrix auditor** — tableau composants × 7 états (default/hover/focus/active/disabled/loading/error), coche ✓ ✗ ?, export markdown + CSS variables.
2. **Screen states checklist** — pour chaque écran listé, valide empty/loading/error/success/partial. Score global + alertes.
3. **Empty state builder** — inputs icon (picker), headline (< 6 mots), description (< 15 mots), CTA primary, CTA secondary optionnel. Preview mobile + desktop.
4. **Loading strategy picker** — arbre de décision : contenu < 300ms ? → rien. 300ms-1s ? → spinner. 1s-10s ? → skeleton + progress. >10s ? → progress bar + ETA + cancel.
5. **Error message template generator** — 4 champs : What happened (phrase courte) / Why (optionnel, plain language) / What to do (action concrète) / Help link. Validateur anti "Something went wrong".
6. **Animation timing picker** — sliders duration (0-800ms) + easing presets (linear, ease-out, ease-in, ease-in-out, spring custom) + preview sur carré déplacé.
7. **Reduced motion audit** — scanne les animations définies et flag celles qui n'ont pas de fallback `prefers-reduced-motion`.
8. **Focus ring designer** — outline color + offset + width + ratio contraste calculé vs background.
9. **Haptic mapper** (si mobile futur) — liste événements × intensité (none/light/medium/heavy/success/warning/error).
10. **Toast orchestrator** — position (top/bottom, left/center/right), stack, auto-dismiss timing par type, swipe to dismiss.
11. **Undo pattern generator** — choix entre confirmation modale vs optimistic + undo toast selon criticité (low/medium/high destructive).
12. **Skeleton shape builder** — dessine les shapes skeleton d'un écran en mimant la future structure (card = rectangle 200×80 + barre texte × 2).

---

## 5. Règles de validation automatique

| Règle | Seuil | Sévérité |
|-------|-------|----------|
| Composant interactif sans état `focus` visible | obligatoire | ERREUR a11y bloquante |
| Focus outline contraste < 3:1 avec background | WCAG 2.2 SC 1.4.11 | ERREUR a11y |
| Loading sans indicateur au-delà de 1s | >1000ms | ALERTE |
| Loading sans progress indicator au-delà de 10s | >10000ms | ERREUR UX |
| Spinner affiché pour un chargement < 300ms | <300ms | ALERTE (pire que rien) |
| Empty state sans CTA ou explication | obligatoire | ALERTE |
| Empty state avec message seul "Aucune donnée" | texte générique | ALERTE |
| Error message sans action suggérée | obligatoire | ERREUR UX |
| Error message contenant "Something went wrong" / "Error occurred" | interdit | ERREUR UX |
| Animation > 500ms sans justification | durée | ALERTE |
| Animation sans fallback `prefers-reduced-motion` | obligatoire | ERREUR a11y |
| Toast auto-dismiss < 5s pour message important | <5000ms | ALERTE |
| Toast auto-dismiss sans pause au hover | obligatoire | ALERTE a11y |
| Destructive action sans confirmation OU undo | obligatoire | ERREUR UX |
| Hit target < 44×44 sur mobile | Apple HIG | ALERTE |
| Hit target < 24×24 sur desktop | WCAG 2.5.5 | ALERTE |
| Disabled state sans explication (tooltip / helper) | obligatoire | ALERTE |
| Hover-only interaction (pas d'équivalent touch/clavier) | interdit | ERREUR a11y |
| Easing `linear` sur mouvement UI (hors progress bar) | anti-pattern | INFO |
| Même animation répétée > 3 fois / écran | fatigue | ALERTE |

---

## 6. Contenus pédagogiques

### États de composants

**Default** — L'état par défaut, sans interaction. Doit clairement indiquer l'interactivité (affordance) : cursor pointer, contraste suffisant, forme reconnue (bouton arrondi).

**Hover** — Réaction au survol souris. Change subtile : background +5-10%, border color, élévation. **Piège** : n'existe pas sur touch, ne pas en faire dépendre une info critique.

**Focus** — **Le plus oublié, le plus critique pour l'a11y**. Obligatoire sur tout élément interactif. Utiliser `:focus-visible` pour ne l'afficher qu'au clavier. Outline ≥ 2px, offset 2px, contraste 3:1. ✓ GitHub (halo bleu épais), Stripe (ring accent). ✗ Apps qui suppriment `outline: none` sans remplacement.

**Active / Pressed** — Feedback instantané du clic (<100ms). Scale(0.98), darken 5%, ou translateY(1px). Renforce le sentiment de "truc physique cliqué".

**Disabled** — Opacity 40-50%, cursor not-allowed, **pas d'interaction**. **Piège majeur** : un bouton disabled sans explication est frustrant. Toujours tooltip ou helper text "Remplir X pour activer".

**Loading** — Deux patterns : bouton devient `[⟳ Envoi...]` (inline spinner + label dynamique + disabled), ou overlay sur zone. Ne pas masquer le bouton.

**Error** — Input bordure rouge + icône ⚠ + message sous le champ expliquant **quoi faire**. Pas juste "Invalid".

### États d'écran — les 5 qu'on oublie

**Empty state — 4 sous-types (Wroblewski, NN/g)** :
1. *First-use empty* — jamais utilisé l'app. Montre quoi faire en premier. ✓ Slack "Welcome to your first channel", Linear "Create your first issue".
2. *User-cleared empty* — a tout fini / supprimé. Féliciter + proposer next. ✓ Todoist "Inbox zero ! Profite".
3. *No-results empty* — recherche / filtre vide. Expliquer + proposer de modifier. ✓ Airbnb "Pas de résultat à Perth, essaie sans filtre".
4. *Error empty* — donnée pas chargée à cause d'une erreur. Différent d'un empty "normal".

**Template empty state** : icône + titre court + description + CTA primary (+ CTA secondary optionnel).

**Loading state** :
- **Skeleton** (NN/g, Luke W) : préférable à spinner quand structure connue, donne impression de vitesse (-20% perceived). ✓ LinkedIn, Facebook, YouTube.
- **Spinner** : pour chargements courts où structure inconnue.
- **Progressive** : affiche ce qui arrive au fur et à mesure. ✓ Medium (texte d'abord, images ensuite).
- **Optimistic UI** : affiche le résultat avant la confirmation serveur, rollback si erreur. ✓ Linear, Superhuman, Gmail envoi.

Seuils de perception (Jakob Nielsen, 1993, toujours valides) :
- **0-100ms** : instantané, rien à afficher.
- **100-300ms** : quick, transition courte suffit.
- **300ms-1s** : noticeable, spinner ou skeleton.
- **1s-10s** : loss of flow, progress indicator obligatoire + message.
- **10s+** : user abandons, progress bar + ETA + action cancel.

**Error state** :
- *Validation* (inline) : à côté du champ, immédiat.
- *Network* (toast) : "Connexion perdue, on retente dans 5s".
- *Permission* (modal / page) : "Accès refusé, contacte l'admin".
- *404* : page custom, humour léger acceptable + navigation.
- *500* : "Erreur de notre côté, on a été notifié. Retente dans 1min".

**Template error** (Nielsen/Norman) : **Quoi s'est passé + Pourquoi + Quoi faire + Lien aide**. ✗ "Something went wrong". ✓ Stripe "Card declined by your bank. Try another card or contact your bank".

**Success state** :
- *Toast* : action mineure, auto-dismiss 4-6s.
- *Inline* : validation formulaire, checkmark vert à côté du champ.
- *Full-page* : milestone important (achat, inscription). ✓ Stripe Checkout success page avec détails.

**Partial state** (souvent oublié) : données partiellement chargées, réseau lent. Afficher ce qu'on a + indicateur de chargement sur le reste. ✓ Twitter timeline qui stream.

### Micro-interactions — framework Dan Saffer

Dan Saffer, dans *Microinteractions: Designing with Details* (O'Reilly, 2013), définit 4 parties :

1. **Trigger** — ce qui déclenche. User-initiated (clic, tap, hover, raccourci clavier) ou system-initiated (notif, arrivée message, changement d'état).
2. **Rules** — ce qui se passe. Logique métier, état, contraintes (undo possible ? optimistic ? rollback ?).
3. **Feedback** — ce que l'user perçoit. Visuel, sonore, haptique, textuel.
4. **Loops & Modes** — ce qui persiste dans le temps. Loop : animation cyclique (battement notif). Mode : état spécial (mode édition, mode focus).

### Animation — principles

**Purposeful vs decorative** (Material Design, Apple HIG) :
- *Purposeful* : guide le regard, masque latence, révèle hiérarchie, confirme action. → À garder.
- *Decorative* : parallax inutile, animation flashy. → À éviter ou minimiser.

**Durée** (Material 3, Carbon) :
- **100-150ms** : micro (hover, focus).
- **200-300ms** : standard (modal open, menu).
- **400-500ms** : emphatic (page transition).
- **>500ms** : justification obligatoire, rare.

**Easing** :
- *ease-out* (`cubic-bezier(0, 0, 0.2, 1)`) : entrées, éléments qui arrivent (rapide puis lent).
- *ease-in* (`cubic-bezier(0.4, 0, 1, 1)`) : sorties, éléments qui partent.
- *ease-in-out* : mouvements qui traversent l'écran.
- *linear* : uniquement pour progress indicators continus.
- *spring* : pour toucher "jouet" / ludique (Framer Motion, iOS).

**`prefers-reduced-motion`** (WCAG 2.1 SC 2.3.3, MDN) : obligatoire. Remplacer scale/translate/rotate par fade seul ou transition instantanée. Certains users ont des troubles vestibulaires et peuvent être malades physiquement.

### Feedback tactile / sonore

**Haptic (iOS Human Interface Guidelines)** :
- *Light* : sélection, toggle.
- *Medium* : confirmation action.
- *Heavy* : attention requise.
- *Success/Warning/Error* : patterns spécifiques.

À utiliser avec parcimonie — sur-utilisation = désactivation par user.

**Sound** : rare mais mémorable. ✓ Slack "knock brush" de notif, Stripe "cha-ching" d'achat. Toujours désactivable. Jamais par défaut sur mobile sans demande.

---

## 7. Outputs générés

1. **State spec markdown** — tableau par composant × 7 états avec tokens CSS, durations, easings, preview snapshots.
2. **Empty states library** — catalogue JSON : `{screen_id, type, icon, headline, description, cta_primary, cta_secondary}`.
3. **Error messages library** — template 4 parts par type d'erreur (validation, network, permission, 404, 500).
4. **Animation timing guidelines** — tokens `duration-fast/base/slow/emphatic` + `ease-out/in/inout/spring` exportables CSS.
5. **Motion principles doc** — markdown : purposeful animations listées, décoratives bannies, règles reduced-motion.
6. **Micro-interactions catalog** — spec par interaction (trigger/rules/feedback/loops), format markdown structuré.
7. **Loading strategy matrix** — par écran : stratégie choisie + seuils.
8. **A11y state audit report** — liste des composants avec focus manquant / contraste insuffisant / disabled sans helper.
9. **Reduced motion CSS** — snippet prêt à l'emploi avec médias queries.
10. **Haptic spec** (si mobile) — mapping événement → intensité.

---

## 8. Modèle de données conceptuel

```
component_states
  id, project_id, component_name, state_key (default|hover|focus|active|disabled|loading|error)
  defined (bool), preview_url, css_tokens (jsonb), notes, a11y_validated (bool)

screen_states
  id, project_id, screen_name, empty_defined, loading_defined,
  error_defined, success_defined, partial_defined, completeness_score (0-5)

empty_states
  id, project_id, screen_id, subtype (first_use|user_cleared|no_results|error)
  icon, headline, description, cta_primary_label, cta_primary_action,
  cta_secondary_label, cta_secondary_action

loading_strategies
  id, project_id, screen_id, strategy (none|spinner|skeleton|progressive|optimistic)
  expected_duration_ms, threshold_triggered, progress_indicator (bool)

error_messages
  id, project_id, error_type (validation|network|permission|404|500|custom)
  what_happened, why, what_to_do, help_link, display_mode (inline|toast|modal|page)

microinteractions
  id, project_id, name, trigger_type, trigger_event, rules (jsonb),
  feedback_visual, feedback_motion, feedback_haptic, feedback_sound, feedback_delay_ms,
  loop_type, mode_type, undo_enabled, reduced_motion_fallback

animation_tokens
  id, project_id, token_name, duration_ms, easing, use_case

motion_audit
  id, project_id, animation_ref, is_purposeful (bool), has_reduced_motion_fallback (bool),
  justification, flagged (bool)
```

---

## 9. Pièges classiques à éviter

1. **Supprimer `outline: none` sans remplacer le focus ring** — tue l'a11y clavier. Utiliser `:focus-visible` + custom ring.
2. **Empty state "Aucune donnée"** — générique, inutile. Toujours : icône + pourquoi c'est vide + CTA concret.
3. **Spinner infini** — pas de timeout, pas de fallback. Après 10s sans réponse : message + retry + support.
4. **Message d'erreur "Something went wrong"** — l'insulte ultime. Dire quoi, pourquoi, quoi faire. Même "Error 500" est mieux que "Oops".
5. **Animations décoratives partout** — fatigue visuelle, ralentissement perçu. Purposeful uniquement.
6. **Oublier `prefers-reduced-motion`** — exclut les users avec troubles vestibulaires, viole WCAG.
7. **Disabled state sans explication** — user bloque, n'ose pas cliquer, abandonne. Tooltip ou helper text obligatoire.
8. **Pas d'état loading sur les actions async** — user re-clique 3 fois, triple submission. Désactiver + feedback visible immédiat.
9. **Toast qui disparaît en 2s** — pas le temps de lire. 5-8s minimum, pause on hover, dismissible.
10. **Hover-only interaction** — invisible sur touch. Toujours prévoir équivalent tap/clic long/bouton.
11. **Pas d'undo sur destructive** — user supprime par erreur, perd tout. Undo toast 5-10s > modal de confirmation (friction).
12. **Animation trop longue sur action fréquente** — modal qui met 600ms à ouvrir à chaque fois → insupportable après 10x. 200-300ms max.
13. **Skeleton qui ne ressemble pas au contenu final** — casse l'illusion, pire qu'un spinner. Matcher la structure exacte.
14. **Success state trop discret** — user ne sait pas si son action a marché. Feedback visible + durable assez pour être perçu.

---

## 10. Références autoritatives

1. **Nielsen Norman Group** — *Empty States in UX Design* (Kate Kaplan, 2020), *Response Times: The 3 Important Limits* (Nielsen, 1993, revisité 2024), *Error Message Guidelines* (NN/g). https://www.nngroup.com/articles/empty-state-interaction-design/
2. **Dan Saffer** — *Microinteractions: Designing with Details* (O'Reilly, 2013). Le livre de référence sur trigger/rules/feedback/loops.
3. **Material Design 3** — *Motion* (purposeful animation, duration & easing tokens, states). https://m3.material.io/styles/motion/overview
4. **Apple Human Interface Guidelines** — *Motion*, *Feedback*, *Haptics*. https://developer.apple.com/design/human-interface-guidelines/motion
5. **GitHub Primer Design System** — *Empty states*, *Interaction states specs*. https://primer.style/design/ui-patterns/empty-states
6. **IBM Carbon Design System** — *Interaction states*, *Motion guidelines* (duration tokens, easing curves). https://carbondesignsystem.com/guidelines/motion/overview/
7. **Refactoring UI** (Adam Wathan, Steve Schoger) — chapitre *Designing with state in mind*.
8. **Growth.Design** — case studies micro-interactions (Tinder, Duolingo, Superhuman). https://growth.design/case-studies
9. **WCAG 2.2** — SC 1.4.11 Non-text Contrast (focus indicators), SC 2.3.3 Animation from Interactions, SC 2.4.7 Focus Visible, SC 2.4.11 Focus Not Obscured.
10. **Luke Wroblewski** — *Mobile First*, articles sur skeleton screens et perceived performance.
11. **MDN Web Docs** — `prefers-reduced-motion`, `:focus-visible`, `cubic-bezier`. https://developer.mozilla.org/
12. **Vitaly Friedman / Smashing Magazine** — *Designing Better Empty States*, *Error Messages Best Practices*.
13. **Pablo Stanley / UX Collective** — articles micro-interactions et animation purposeful.
14. **Refiner.io blog** — *The 5 states every screen should have*.

---

## 11. Priorité MVP

**MUST** (v1, bloquant pour livrer) :
- Screen states checklist (5 états × N écrans)
- State matrix auditor (composants × 7 états)
- Empty state builder (template icon + headline + desc + CTA)
- Error message template generator (4 parts)
- Loading strategy picker (arbre de décision)
- Focus ring designer avec validation contraste
- Règles de validation automatique (les 5 critiques : focus manquant, error sans action, spinner sans timeout, empty générique, reduced-motion absent)

**SHOULD** (v2, améliore sensiblement) :
- Micro-interactions spec editor (Saffer framework)
- Animation timing picker avec preview
- Reduced motion audit automatique
- Toast orchestrator
- Undo pattern generator
- Skeleton shape builder

**NICE** (v3+, pour les pros) :
- Haptic mapper (quand mobile sera envisagé)
- Motion principles doc auto-généré
- Export CSS variables / design tokens
- Intégration Figma (import states actuels)
- A11y state audit report détaillé avec snapshots
- Sound design picker

---

## 12. Estimation complexité d'implémentation

| Bloc | Complexité | Justification |
|------|------------|---------------|
| Screen states checklist | **S** | Liste + checkboxes, logique simple |
| State matrix auditor | **M** | Matrice composants × états, preview CSS live |
| Empty state builder | **M** | Form + preview responsive + library icônes |
| Error message generator | **S** | Template 4 champs + validateur texte |
| Loading strategy picker | **S** | Arbre décision + recommandation |
| Focus ring designer | **M** | Color picker + calc contraste + preview |
| Micro-interactions spec editor | **L** | Structure Saffer complexe, JSON imbriqué, preview timing |
| Animation timing picker | **L** | Courbe cubic-bezier interactive + preview animée |
| Reduced motion audit | **M** | Parser animations définies, check fallbacks |
| Haptic mapper | **S** | Table de mapping simple |
| Validation automatique (ensemble règles) | **L** | 20 règles, intégration temps réel tous les widgets |
| Export state spec markdown | **M** | Sérialisation propre multi-formats |
| Intégration live (sync cockpit, like Mindeck) | **M** | Debounced save, optimistic UI, rollback |

**Total chapitre : XL** — c'est le plus dense en logique métier et en validation automatique. Répartir sur 2-3 sprints. Commencer par les MUST (S/M surtout), le framework Saffer et le timing editor viennent après.

---

**Note finale** — Ce chapitre est effectivement sous-traité partout. 80% des cours UI s'arrêtent à "fais un hover subtil". La vraie valeur de Mindeck ici : **forcer le designer/dev à définir explicitement les 5 états d'écran pour chaque vue, avec garde-fous automatiques**. C'est ça qui transformera un projet amateur en projet pro — plus que n'importe quelle palette ou grille de mise en page.
