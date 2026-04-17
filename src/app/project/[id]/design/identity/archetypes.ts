// 8 archétypes simplifiés en français (dérivés Pearson/Mark, renommés pour éviter jargon)
// Avec disclaimer honnête : c'est un aide-mémoire créatif, pas une vérité scientifique.

export type ArchetypeKey =
  | "sage"
  | "creator"
  | "companion"
  | "rebel"
  | "expert"
  | "magician"
  | "hero"
  | "friend";

export interface Archetype {
  key: ArchetypeKey;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  examples: string[];
  // Pré-remplissage quand choisi
  sliderDefaults: {
    formalCasual: number; // 0 = formel, 100 = casual
    seriousFunny: number; // 0 = sérieux, 100 = drôle
    respectfulIrreverent: number; // 0 = respectueux, 100 = irrévérencieux
    matterOfFactEnthusiastic: number; // 0 = factuel, 100 = enthousiaste
  };
  doWords: string[];
  dontWords: string[];
}

export const ARCHETYPES: Archetype[] = [
  {
    key: "sage",
    name: "Le Sage",
    emoji: "🧠",
    tagline: "Calme, posé, rigoureux",
    description:
      "Transmet du savoir avec pédagogie et clarté. Ton mesuré, phrases construites. Inspire la confiance par la compétence, pas par le tapage.",
    examples: ["The New York Times", "Nest", "Wikipedia"],
    sliderDefaults: {
      formalCasual: 30,
      seriousFunny: 15,
      respectfulIrreverent: 15,
      matterOfFactEnthusiastic: 35,
    },
    doWords: ["expliquer", "comprendre", "clarifier", "nuancer", "précisément"],
    dontWords: ["révolutionnaire", "wow", "épique", "dingue", "game-changer"],
  },
  {
    key: "creator",
    name: "Le Créatif",
    emoji: "🎨",
    tagline: "Curieux, libre, expressif",
    description:
      "Aime bricoler, assembler, expérimenter. Ton joueur mais précis. Encourage l'exploration plutôt que la perfection.",
    examples: ["Notion", "Figma", "Dribbble"],
    sliderDefaults: {
      formalCasual: 70,
      seriousFunny: 55,
      respectfulIrreverent: 40,
      matterOfFactEnthusiastic: 70,
    },
    doWords: ["explorer", "créer", "expérimenter", "bricoler", "imagine"],
    dontWords: ["conforme", "standard", "règle", "norme", "convention"],
  },
  {
    key: "companion",
    name: "Le Compagnon",
    emoji: "🤝",
    tagline: "Chaleureux, fiable, familier",
    description:
      "Tu peux lui faire confiance comme à un vieux pote. Ton accessible, humain, sans condescendance. Utilise « on » plutôt que « vous ».",
    examples: ["Slack", "Mailchimp", "Discord"],
    sliderDefaults: {
      formalCasual: 80,
      seriousFunny: 55,
      respectfulIrreverent: 50,
      matterOfFactEnthusiastic: 70,
    },
    doWords: ["on", "oups", "ensemble", "pas de souci", "on s'en occupe"],
    dontWords: ["monsieur", "madame", "procédure", "conforme", "réclamation"],
  },
  {
    key: "rebel",
    name: "Le Rebelle",
    emoji: "⚡",
    tagline: "Franc, direct, disruptif",
    description:
      "Dit les choses en face. Refuse les bullshit et le jargon corporate. Ton qui tranche, pas brutal mais sans flatterie.",
    examples: ["Linear", "Substack", "Basecamp"],
    sliderDefaults: {
      formalCasual: 65,
      seriousFunny: 40,
      respectfulIrreverent: 75,
      matterOfFactEnthusiastic: 50,
    },
    doWords: ["direct", "sans détour", "on arrête", "vraiment", "franchement"],
    dontWords: ["synergie", "leverage", "disruptif", "solution globale", "enjeux"],
  },
  {
    key: "expert",
    name: "L'Expert",
    emoji: "🎯",
    tagline: "Rigoureux, technique, focalisé",
    description:
      "Parle à des pros qui savent déjà. Pas besoin de tout expliquer, on va à l'essentiel. Ton technique mais pas hautain.",
    examples: ["Stripe", "Vercel", "Cloudflare"],
    sliderDefaults: {
      formalCasual: 40,
      seriousFunny: 15,
      respectfulIrreverent: 25,
      matterOfFactEnthusiastic: 30,
    },
    doWords: ["API", "throughput", "benchmark", "implémenter", "optimiser"],
    dontWords: ["simple", "facile", "magique", "juste", "rapide"],
  },
  {
    key: "magician",
    name: "Le Magicien",
    emoji: "✨",
    tagline: "Fait gagner du temps, automatise",
    description:
      "Promet de faire disparaître la friction. Ton enthousiaste, focus sur le résultat, pas sur le comment. « Ça juste marche. »",
    examples: ["Zapier", "Linear", "Raycast"],
    sliderDefaults: {
      formalCasual: 60,
      seriousFunny: 45,
      respectfulIrreverent: 40,
      matterOfFactEnthusiastic: 80,
    },
    doWords: ["automatiquement", "en un clic", "sans effort", "zéro config", "juste marche"],
    dontWords: ["manuellement", "paramétrer", "configurer", "étape par étape"],
  },
  {
    key: "hero",
    name: "Le Héros",
    emoji: "🏆",
    tagline: "Audacieux, performant, ambitieux",
    description:
      "Aide l'user à se dépasser. Ton motivant, orienté action et performance. Célèbre les victoires, même petites.",
    examples: ["Nike", "Strava", "Peloton"],
    sliderDefaults: {
      formalCasual: 55,
      seriousFunny: 35,
      respectfulIrreverent: 55,
      matterOfFactEnthusiastic: 85,
    },
    doWords: ["vas-y", "dépasse", "record", "challenge", "tu l'as fait"],
    dontWords: ["suffisant", "acceptable", "moyen", "correct", "OK"],
  },
  {
    key: "friend",
    name: "L'Ami",
    emoji: "😊",
    tagline: "Familier, simple, bienveillant",
    description:
      "Tutoyer par défaut, expressions du quotidien, jamais de honte. Ton qui rassure sans infantiliser. Encourage sans juger.",
    examples: ["Duolingo", "Headspace", "Calm"],
    sliderDefaults: {
      formalCasual: 85,
      seriousFunny: 60,
      respectfulIrreverent: 35,
      matterOfFactEnthusiastic: 75,
    },
    doWords: ["tu", "pas grave", "on essaie", "à bientôt", "bravo"],
    dontWords: ["échec", "erreur", "faute", "incorrect", "invalide"],
  },
];

export const ARCHETYPE_DISCLAIMER = `Les archétypes viennent de Pearson/Mark (2001), pas de Jung lui-même. **C'est un aide-mémoire créatif, pas une science.** Si ça t'aide à verbaliser, garde-le. Si ça te bloque, passe direct aux sliders.`;
