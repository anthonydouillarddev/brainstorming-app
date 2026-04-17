// 10 heuristiques de Nielsen (updated NN/g 2024)

export interface NielsenHeuristic {
  num: number;
  slug: string;
  title: string;
  question: string;
  exampleGood: string;
  exampleBad: string;
  summary: string;
}

export const NIELSEN_HEURISTICS: NielsenHeuristic[] = [
  {
    num: 1,
    slug: "visibility",
    title: "Visibilité du status système",
    question: "Quand quelque chose se passe dans ton app, est-ce que l'user le voit ?",
    exampleGood: "Spinner pendant le chargement, barre de progression sur upload, badge save auto",
    exampleBad: "Bouton qui freeze sans signe, sauvegarde silencieuse, upload sans feedback",
    summary: "Feedback < 100ms sur chaque action. L'user ne doit jamais se demander si ça marche.",
  },
  {
    num: 2,
    slug: "match-real-world",
    title: "Parler le langage de l'user",
    question: "Tes mots, icônes et métaphores correspondent au monde réel de l'user ?",
    exampleGood: "« Corbeille », « Brouillon », « Enregistrer »",
    exampleBad: "« Entity deleted », « Draft state », « Commit » (pour un non-dev)",
    summary: "Vocabulaire user > jargon tech. Métaphores concrètes > abstractions système.",
  },
  {
    num: 3,
    slug: "user-control",
    title: "Contrôle &amp; liberté",
    question: "Si l'user clique par erreur, peut-il revenir facilement ?",
    exampleGood: "Undo 5s (Gmail), Esc pour fermer une modal, confirmation destructive",
    exampleBad: "Suppression sans confirmation, pas de back button, flow forcé linéaire",
    summary: "Undo natif, escape routes, confirmations pour actions destructives.",
  },
  {
    num: 4,
    slug: "consistency",
    title: "Cohérence &amp; standards",
    question: "Les mêmes actions utilisent les mêmes mots/icônes partout ?",
    exampleGood: "Un bouton primary a toujours la même couleur/taille, nav identique",
    exampleBad: "« Valider » ici, « OK » là, « Confirmer » ailleurs pour la même action",
    summary: "Jakob's Law : ton app doit se comporter comme celles que l'user connaît déjà.",
  },
  {
    num: 5,
    slug: "error-prevention",
    title: "Prévention des erreurs",
    question: "Tu préviens les erreurs avant qu'elles arrivent ?",
    exampleGood: "Disable du bouton tant qu'un champ requis est vide, contraintes inline",
    exampleBad: "Laisse submit un formulaire invalide, message d'erreur générique après",
    summary: "Better error prevention than error handling. Validation inline, disable smart.",
  },
  {
    num: 6,
    slug: "recognition",
    title: "Reconnaître &gt; se souvenir",
    question: "L'user peut retrouver ce qu'il cherche sans se rappeler des choses ?",
    exampleGood: "Autocomplete, historique visible, labels sur les icônes",
    exampleBad: "Icônes seules sans label, recherche qui ne garde pas l'historique",
    summary: "Rends le visible. La mémoire humaine est limitée, montre les options.",
  },
  {
    num: 7,
    slug: "flexibility",
    title: "Flexibilité &amp; efficacité",
    question: "Tu offres des raccourcis pour les power users sans gêner les débutants ?",
    exampleGood: "Cmd+K pour ouvrir command palette, raccourcis clavier discrets",
    exampleBad: "Raccourcis affichés en gros sans la version visible pour débutants",
    summary: "Layer les features : débutants voient les clicks, experts ont les raccourcis.",
  },
  {
    num: 8,
    slug: "aesthetic",
    title: "Design esthétique &amp; minimaliste",
    question: "Tu affiches uniquement ce qui est pertinent, rien de plus ?",
    exampleGood: "Une landing centrée sur une seule valeur, UI épurée Linear",
    exampleBad: "6 CTAs, 4 couleurs sémantiques, 10 badges — tout rivalise pour l'attention",
    summary: "Chaque info en plus dilue les infos importantes. Von Restorff : tout ressort = rien ne ressort.",
  },
  {
    num: 9,
    slug: "recovery",
    title: "Aider à réparer les erreurs",
    question: "Quand l'user fait une erreur, il comprend quoi faire pour la réparer ?",
    exampleGood: "« Oups, email déjà utilisé. Se connecter ? » + lien direct",
    exampleBad: "« Error 500 », « Unexpected error occurred », codes techniques",
    summary: "Messages humains, actionnables, proposant une solution. Jamais de code d'erreur brut.",
  },
  {
    num: 10,
    slug: "help",
    title: "Aide &amp; documentation",
    question: "Si l'user a besoin d'aide, il la trouve au bon endroit ?",
    exampleGood: "Tooltip contextuels, empty state avec explication, FAQ inline",
    exampleBad: "Documentation séparée à chercher, tour guidé 10 étapes imposé",
    summary: "Aide contextuelle > manuel séparé. Progressive disclosure > tour guidé.",
  },
];
