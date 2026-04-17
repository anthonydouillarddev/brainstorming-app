// Bibliothèque de lois UX (reliability=strong uniquement)
// Sources : Nielsen Norman Group, Laws of UX (Yablonski), Don Norman, Gestalt, Cognitive Load Theory

export type LawCategory = "perception" | "memory" | "decision" | "motivation" | "time";

export type LawReliability = "strong" | "medium" | "folklore";

export interface UXLaw {
  slug: string;
  name: string;
  category: LawCategory;
  reliability: LawReliability;
  summary: string;
  exampleGood: string;
  exampleBad: string;
  sourceUrl: string;
  sourceLabel: string;
}

export const UX_LAWS: UXLaw[] = [
  {
    slug: "fitts",
    name: "Fitts's Law",
    category: "time",
    reliability: "strong",
    summary: "Plus une cible est grande et proche, plus vite on clique dessus.",
    exampleGood: "Bouton « Publier » 56px en bas-droite, dans la thumb zone.",
    exampleBad: "Lien « Supprimer le compte » en petit texte gris au milieu d'un paragraphe.",
    sourceUrl: "https://lawsofux.com/fittss-law/",
    sourceLabel: "Fitts 1954, Laws of UX",
  },
  {
    slug: "hick",
    name: "Hick's Law",
    category: "decision",
    reliability: "strong",
    summary: "Plus on a d'options, plus le temps de décision augmente.",
    exampleGood: "Menu catégorisé en 3 groupes de 3-5 items.",
    exampleBad: "Sidebar avec 25 items en vrac.",
    sourceUrl: "https://lawsofux.com/hicks-law/",
    sourceLabel: "Hick & Hyman 1952",
  },
  {
    slug: "miller",
    name: "Miller's Law",
    category: "memory",
    reliability: "strong",
    summary:
      "On retient ~4 à 7 chunks en mémoire de court terme — mais pas sur une page. Applique au chunking, pas aux menus.",
    exampleGood: "N° de tel groupé : 06 12 34 56 78 (5 chunks) vs 0612345678 (10 chiffres).",
    exampleBad: "Couper un menu à 7 par principe : Amazon a 30+ liens et fonctionne très bien.",
    sourceUrl: "https://uxmyths.com/post/931925744/myth-23",
    sourceLabel: "Miller 1956 (UX Myths sur l'abus)",
  },
  {
    slug: "jakob",
    name: "Jakob's Law",
    category: "memory",
    reliability: "strong",
    summary: "Les users passent la plupart de leur temps sur d'autres sites. Ton site doit marcher comme ceux-là.",
    exampleGood: "Burger menu en haut à droite, logo cliquable = accueil.",
    exampleBad: "Inventer un nouveau pattern de swipe « original » (80% d'users perdus).",
    sourceUrl: "https://lawsofux.com/jakobs-law/",
    sourceLabel: "Jakob Nielsen",
  },
  {
    slug: "doherty",
    name: "Doherty Threshold",
    category: "time",
    reliability: "strong",
    summary: "Au-delà de 400ms sans feedback, l'attention décroche.",
    exampleGood: "Skeleton screen < 200ms, puis contenu chargé.",
    exampleBad: "Bouton qui met 2s à réagir sans spinner.",
    sourceUrl: "https://lawsofux.com/doherty-threshold/",
    sourceLabel: "Doherty 1982, IBM",
  },
  {
    slug: "peak-end",
    name: "Peak-End Rule",
    category: "memory",
    reliability: "strong",
    summary:
      "On retient un parcours par son point fort (peak) et sa fin (end), pas par sa moyenne.",
    exampleGood: "Animation de victoire à la fin d'un flow, ou thanks screen personnalisé.",
    exampleBad: "Flow bien conçu qui finit sur « Votre requête a été traitée. » sec.",
    sourceUrl: "https://www.nngroup.com/articles/peak-end-rule/",
    sourceLabel: "Kahneman, NN/g",
  },
  {
    slug: "von-restorff",
    name: "Von Restorff Effect",
    category: "perception",
    reliability: "strong",
    summary: "L'élément qui ressort visuellement est plus retenu.",
    exampleGood: "1 CTA primary coloré parmi 3 actions secondaires grises.",
    exampleBad: "5 CTAs colorés qui rivalisent — plus rien ne ressort.",
    sourceUrl: "https://lawsofux.com/von-restorff-effect/",
    sourceLabel: "Hedwig von Restorff 1933",
  },
  {
    slug: "aesthetic",
    name: "Aesthetic-Usability Effect",
    category: "perception",
    reliability: "strong",
    summary: "Ce qui est beau paraît plus facile à utiliser. Mais attention : ne cache pas les vrais bugs UX.",
    exampleGood: "Linear, Stripe — esthétique soignée qui renforce la confiance.",
    exampleBad: "« C'est joli, ça suffit » — ignorer une friction majeure.",
    sourceUrl: "https://lawsofux.com/aesthetic-usability-effect/",
    sourceLabel: "Kurosu & Kashimura 1995",
  },
  {
    slug: "serial-position",
    name: "Serial Position Effect",
    category: "memory",
    reliability: "strong",
    summary: "On retient mieux le début et la fin d'une liste que le milieu.",
    exampleGood: "CTA primary en 1er ou en dernier dans une nav, pas au milieu.",
    exampleBad: "Item le plus important en position 5/10.",
    sourceUrl: "https://lawsofux.com/serial-position-effect/",
    sourceLabel: "Ebbinghaus",
  },
  {
    slug: "tesler",
    name: "Tesler's Law (Conservation of Complexity)",
    category: "decision",
    reliability: "strong",
    summary:
      "La complexité ne peut pas être réduite, juste déplacée. Question : qui la subit, l'user ou le dev ?",
    exampleGood: "Parser libéral côté dev, interface simple pour l'user.",
    exampleBad: "Forcer l'user à saisir au format exact (ex: date « YYYY-MM-DD ») parce que le dev a la flemme.",
    sourceUrl: "https://lawsofux.com/teslers-law/",
    sourceLabel: "Larry Tesler",
  },
  {
    slug: "goal-gradient",
    name: "Goal-Gradient Effect",
    category: "motivation",
    reliability: "strong",
    summary: "Plus on est proche du but, plus on est motivé à finir.",
    exampleGood: "Progress bar onboarding « 3/4 étapes », profil « 80% complété ».",
    exampleBad: "Flow long sans indicateur de progression — abandon fréquent au milieu.",
    sourceUrl: "https://lawsofux.com/goal-gradient-effect/",
    sourceLabel: "Clark Hull 1932",
  },
  {
    slug: "zeigarnik",
    name: "Zeigarnik Effect",
    category: "memory",
    reliability: "strong",
    summary: "Les tâches inachevées restent plus en mémoire que les tâches finies.",
    exampleGood: "Todolist qui montre les in-progress en tête + notif pour finir.",
    exampleBad: "Une fois abandonné un flow, aucun rappel — l'user oublie.",
    sourceUrl: "https://lawsofux.com/zeigarnik-effect/",
    sourceLabel: "Bluma Zeigarnik 1927",
  },
  {
    slug: "paradox-active-user",
    name: "Paradox of the Active User",
    category: "motivation",
    reliability: "strong",
    summary:
      "Les users ne lisent pas l'onboarding, l'aide, les release notes. Ils veulent finir leur tâche maintenant.",
    exampleGood: "Empty state teaching contextuel, tooltips au bon moment.",
    exampleBad: "Tour guidé auto-play 10 écrans qu'ils skip.",
    sourceUrl: "https://www.nngroup.com/articles/paradox-of-the-active-user/",
    sourceLabel: "Carroll & Rosson 1987",
  },
  {
    slug: "postel",
    name: "Postel's Law",
    category: "decision",
    reliability: "strong",
    summary: "Sois libéral dans ce que tu acceptes en entrée, strict dans ce que tu produis en sortie.",
    exampleGood: "Accepter « +33 6 12 34 56 78 », « 06.12.34.56.78 », « 0612345678 » — normaliser silencieusement.",
    exampleBad: "Rejeter un format de numéro qui est valide mais mal formaté.",
    sourceUrl: "https://lawsofux.com/postels-law/",
    sourceLabel: "Jon Postel (RFC 793)",
  },
  {
    slug: "proximity",
    name: "Law of Proximity (Gestalt)",
    category: "perception",
    reliability: "strong",
    summary: "Les éléments proches sont perçus comme groupés.",
    exampleGood: "Un champ avec son label collé, un bouton collé à sa description.",
    exampleBad: "Labels éloignés de leurs champs — ambiguïté sur quel label va avec quel input.",
    sourceUrl: "https://lawsofux.com/law-of-proximity/",
    sourceLabel: "Wertheimer 1923",
  },
  {
    slug: "similarity",
    name: "Law of Similarity (Gestalt)",
    category: "perception",
    reliability: "strong",
    summary: "Les éléments qui se ressemblent sont perçus comme liés.",
    exampleGood: "Tous les boutons primaires ont la même couleur + icône cohérente.",
    exampleBad: "3 boutons de la même fonction qui ont des styles différents.",
    sourceUrl: "https://lawsofux.com/law-of-similarity/",
    sourceLabel: "Wertheimer 1923",
  },
  {
    slug: "affordances",
    name: "Affordances &amp; Signifiers (Norman)",
    category: "perception",
    reliability: "strong",
    summary:
      "Un bouton doit ressembler à un bouton. Les affordances suggèrent les actions possibles, les signifiers les rendent évidentes.",
    exampleGood: "Ombre + hover state sur les boutons, curseur pointer sur les liens.",
    exampleBad: "Texte en gras utilisé comme bouton — ambigu.",
    sourceUrl: "https://en.wikipedia.org/wiki/The_Design_of_Everyday_Things",
    sourceLabel: "Don Norman",
  },
  {
    slug: "gulfs",
    name: "Gulfs of Execution &amp; Evaluation (Norman)",
    category: "perception",
    reliability: "strong",
    summary:
      "Gulf of execution = distance entre intention user et action possible. Gulf of evaluation = distance entre résultat et compréhension.",
    exampleGood: "Signifier (bouton visible) + feedback immédiat (toast de confirmation).",
    exampleBad: "User clique, rien ne semble se passer — re-clic, duplication d'action.",
    sourceUrl: "https://www.nngroup.com/articles/two-ux-gulfs-evaluation-execution/",
    sourceLabel: "Norman, NN/g",
  },
];

export const LAW_CATEGORIES: Record<LawCategory, { label: string; emoji: string }> = {
  perception: { label: "Perception", emoji: "👁️" },
  memory: { label: "Mémoire", emoji: "🧠" },
  decision: { label: "Décision", emoji: "🎯" },
  motivation: { label: "Motivation", emoji: "🔥" },
  time: { label: "Temps", emoji: "⏱️" },
};
