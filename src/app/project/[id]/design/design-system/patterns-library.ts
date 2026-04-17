export type PatternType = "empty" | "loading" | "error" | "success";

export interface PatternTemplate {
  id: string;
  type: PatternType;
  label: string;
  emoji: string;
  structure: string; // markdown de référence
  example: string; // exemple concret
}

export const PATTERN_TEMPLATES: PatternTemplate[] = [
  {
    id: "empty-first-use",
    type: "empty",
    label: "Empty state — 1re utilisation",
    emoji: "📭",
    structure: `### Structure
1. Illustration/emoji (optionnel mais impactant)
2. **Headline** (1 phrase) — ce qui se passe
3. **Description** (1-2 phrases) — pourquoi c'est vide et quoi faire
4. **CTA primary** — l'action évidente à lancer
5. CTA secondaire (optionnel) — apprendre ou explorer`,
    example: `💡
**Rien ici pour l'instant.**
Crée ton premier projet en 30 secondes et gagne 10 min par facture.
[ + Nouveau projet ]  [ Voir un exemple ]`,
  },
  {
    id: "empty-no-result",
    type: "empty",
    label: "Empty state — Aucun résultat",
    emoji: "🔍",
    structure: `### Structure
1. Headline « Aucun résultat pour *{{query}}* »
2. Suggestions : « Essaie avec d'autres mots-clés » + liste
3. CTA secondaire : « Réinitialiser les filtres »`,
    example: `Aucun résultat pour **« facturation »**.
Essaie « factures », « invoices » ou retire un filtre.
[ Réinitialiser les filtres ]`,
  },
  {
    id: "loading-skeleton",
    type: "loading",
    label: "Loading — Skeleton screen",
    emoji: "👻",
    structure: `### Structure
1. Skeleton avec la structure attendue (pas spinner vide)
2. Durée cible : < 200ms pour apparaître, < 1s pour contenu final
3. Animation shimmer subtile (2-3s loop)
4. Pas de Lorem ipsum — blocs gris avec bonne hauteur`,
    example: `[████████████░░░░]  Header
[██████░░░░░░░░░░]  Line 1
[████████████████]  Line 2
[████░░░░░░░░░░░░]  Line 3`,
  },
  {
    id: "loading-spinner",
    type: "loading",
    label: "Loading — Spinner + message",
    emoji: "⏳",
    structure: `### Structure
1. Spinner visible < 100ms après action
2. Texte contextuel (ex: « Génération en cours… »)
3. Au-delà de 5s, afficher progress bar ou estimation
4. Permettre d'annuler si > 10s`,
    example: `⏳ Génération du rapport…
Ça prend 3-5 secondes en général.
[ Annuler ]`,
  },
  {
    id: "error-form",
    type: "error",
    label: "Error — Validation formulaire",
    emoji: "❌",
    structure: `### Structure
1. Message **sous le champ** (pas en haut de page)
2. aria-describedby + aria-invalid
3. Actionnable : explique comment corriger
4. Jamais de « Error 422 » — humain`,
    example: `Email : nom@exemple
⚠ **Format invalide.** Exemple : nom@domaine.fr`,
  },
  {
    id: "error-server",
    type: "error",
    label: "Error — Serveur / Network",
    emoji: "🔥",
    structure: `### Structure
1. Ton empathique, pas technique
2. Action immédiate proposée (Réessayer)
3. Fallback (contact support, rafraîchir)
4. Détails techniques en disclosure (pour le debug)`,
    example: `Oups, notre serveur boude.
On réessaie dans une minute ?
[ 🔄 Réessayer ]  [ Voir les détails ]`,
  },
  {
    id: "success-completion",
    type: "success",
    label: "Success — Action complétée",
    emoji: "✅",
    structure: `### Structure
1. Confirmation immédiate (Toast < 3s)
2. Pas de modal bloquante pour un succès simple
3. Next action claire : « Continuer », « Retour à... »
4. Option undo si réversible`,
    example: `✓ Projet « Mindeck » créé
Ouvert dans un nouveau tab.
[ Ouvrir le projet ]  [ Annuler ]`,
  },
  {
    id: "success-milestone",
    type: "success",
    label: "Success — Milestone (aha moment)",
    emoji: "🎉",
    structure: `### Structure
1. Célébration visuelle proportionnée (pas de confettis gratuits)
2. Résumé de ce qui vient d'être accompli
3. Aperçu du prochain jalon
4. Partage optionnel si pertinent`,
    example: `🎉 Premier projet publié !
Tu as gagné ton badge « Starter ».
Prochain palier : 3 projets publiés.
[ Partager ]  [ Nouveau projet ]`,
  },
];
