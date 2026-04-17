import type { ProjectType } from "@/lib/types";
import type { FoundationsPersona, FoundationsJobStory, TechLevel } from "./state";

// ─── Proto-persona templates par type projet ────────────────────────────────

export interface PersonaTemplate {
  name: string;
  avatarEmoji: string;
  ageRange: string;
  context: string;
  goals: string[];
  frustrations: string[];
  techLevel: TechLevel;
}

export const PERSONA_TEMPLATES: Record<ProjectType, PersonaTemplate[]> = {
  saas: [
    {
      name: "Paul",
      avatarEmoji: "🧑‍💼",
      ageRange: "32-45",
      context:
        "Dirigeant PME 10-50 employés, veut des outils pros mais rejette les usines enterprise",
      goals: ["Prendre de bonnes décisions vite", "Réduire sa charge mentale", "Garder l'équipe alignée"],
      frustrations: ["Les outils trop complexes", "Les logiciels qui demandent 3 mois de setup", "Les prix enterprise opaques"],
      techLevel: "intermédiaire",
    },
    {
      name: "Sarah",
      avatarEmoji: "👩‍💻",
      ageRange: "28-40",
      context: "Product manager dans une scale-up, gère 3 squads en parallèle",
      goals: ["Centraliser les feedbacks", "Prioriser sans se tromper", "Aligner design/dev/biz"],
      frustrations: ["Notion/Linear/Jira qui se dupliquent", "Les stakeholders qui changent d'avis", "Les meetings qui s'éternisent"],
      techLevel: "expert",
    },
    {
      name: "Thomas",
      avatarEmoji: "👨‍💻",
      ageRange: "25-35",
      context: "Dev backend indépendant, bosse avec 5 clients SaaS simultanés",
      goals: ["Livrer vite et bien", "Facturer sans erreur", "Se former sur du temps non-facturable"],
      frustrations: ["Le temps perdu en admin", "Les specs floues", "Les outils qui cassent le flow"],
      techLevel: "expert",
    },
    {
      name: "Marie",
      avatarEmoji: "🧑‍🔬",
      ageRange: "30-42",
      context: "Customer Success dans un SaaS B2B, 200 comptes à suivre",
      goals: ["Détecter les churn avant qu'ils arrivent", "Onboard les nouveaux vite", "Prouver l'impact"],
      frustrations: ["Les stats éparpillées dans 5 outils", "Les users qui ne répondent pas", "Les CSM overloadés"],
      techLevel: "intermédiaire",
    },
    {
      name: "Julien",
      avatarEmoji: "🧑‍🎨",
      ageRange: "26-38",
      context: "Growth marketer dans une startup pré-PMF, cherche des canaux scalables",
      goals: ["Tester vite des hypothèses", "Automatiser ce qui est récurrent", "Mesurer sans usine à gaz"],
      frustrations: ["GA4 imbitable", "Les tools marketing qui facturent au siège", "Le temps de setup des intégrations"],
      techLevel: "intermédiaire",
    },
  ],
  appli: [
    {
      name: "Léa",
      avatarEmoji: "👩",
      ageRange: "20-28",
      context: "Étudiante, vit sur son téléphone, tout doit rentrer entre 2 Réels",
      goals: ["Accomplir un truc vite", "Partager avec ses amis", "Se sentir à la page"],
      frustrations: ["Les apps lentes ou lourdes", "Les onboardings de 10 écrans", "Les pubs intrusives"],
      techLevel: "expert",
    },
    {
      name: "Alex",
      avatarEmoji: "🧑",
      ageRange: "35-45",
      context: "Parent de 2 enfants, journée saturée, moments d'app en micro-pauses",
      goals: ["Gagner du temps", "Garder une routine", "Simplifier la vie de famille"],
      frustrations: ["Les notifications qui spamment", "Les apps qui demandent du focus", "Les comptes en plus à gérer"],
      techLevel: "intermédiaire",
    },
    {
      name: "Max",
      avatarEmoji: "🎮",
      ageRange: "18-30",
      context: "Gamer casual, joueur mobile le soir, 30-60 min par session",
      goals: ["Se détendre", "Progresser un peu chaque jour", "Battre son record"],
      frustrations: ["Les paywalls agressifs", "Les pubs toutes les 3 minutes", "Le pay-to-win"],
      techLevel: "expert",
    },
    {
      name: "Emma",
      avatarEmoji: "🧑‍🎨",
      ageRange: "22-35",
      context: "Créative indé (photo, design, illustration), utilise son mobile en déplacement",
      goals: ["Capturer une idée à la volée", "Prototyper rapidement", "Partager son travail"],
      frustrations: ["Les apps qui simplifient trop", "Les formats propriétaires", "L'absence d'export clean"],
      techLevel: "expert",
    },
    {
      name: "Ken",
      avatarEmoji: "🧓",
      ageRange: "60-75",
      context: "Retraité actif, tablette plutôt que mobile, méfiant des abonnements",
      goals: ["Rester connecté avec ses proches", "Apprendre de nouvelles choses", "Gérer son budget tranquillement"],
      frustrations: ["Les interfaces qui changent tout le temps", "Le texte trop petit", "Les arnaques"],
      techLevel: "débutant",
    },
  ],
  outil: [
    {
      name: "Anthony",
      avatarEmoji: "🧑‍💻",
      ageRange: "30-40",
      context: "Freelance solo en side project, bosse le soir et le weekend, ROI/temps critique",
      goals: ["Avancer vite sans setup", "Ne rien oublier", "Rester motivé sur la durée"],
      frustrations: ["Les apps trop générales (Notion, Asana)", "Le context switching entre outils", "La dette admin"],
      techLevel: "expert",
    },
    {
      name: "Camille",
      avatarEmoji: "👩‍💼",
      ageRange: "28-40",
      context: "Admin bureau PME, utilise son PC 8h/j, routine quotidienne critique",
      goals: ["Traiter une pile de tâches récurrentes", "Ne pas faire d'erreur", "Finir à 17h"],
      frustrations: ["Les outils qui changent d'UI sans prévenir", "Les bugs qui font perdre du travail", "Le manque de raccourcis"],
      techLevel: "intermédiaire",
    },
    {
      name: "Lucas",
      avatarEmoji: "🧑‍🎓",
      ageRange: "18-25",
      context: "Étudiant autodidacte (dev/design/marketing), utilise tout ce qui est gratuit",
      goals: ["Apprendre en faisant", "Se monter un portfolio", "Construire un réseau"],
      frustrations: ["Les trials de 7 jours", "Les tutos obsolètes", "Les tools qui cachent la partie intéressante derrière un paywall"],
      techLevel: "intermédiaire",
    },
    {
      name: "Sophie",
      avatarEmoji: "👩‍🏫",
      ageRange: "35-50",
      context: "Formatrice indé, prépare ses cours 2h avant de les donner, besoin simple et fiable",
      goals: ["Préparer vite", "Être claire pour les apprenants", "Réutiliser ce qui marche"],
      frustrations: ["Les outils qui supposent que tu es dev", "Les exports cassés", "Le manque de templates"],
      techLevel: "débutant",
    },
  ],
  logiciel: [
    {
      name: "Marc",
      avatarEmoji: "🧑‍💼",
      ageRange: "40-55",
      context: "Comptable en cabinet, 40 dossiers clients, logiciel métier utilisé 6h/j",
      goals: ["Fermer un dossier sans erreur", "Rester conforme (RGPD, fiscal)", "Être audité sans stress"],
      frustrations: ["Les bugs sur les montants", "Les mises à jour qui cassent les habitudes", "Les hotlines injoignables"],
      techLevel: "intermédiaire",
    },
    {
      name: "Nadia",
      avatarEmoji: "🧑‍🎨",
      ageRange: "32-50",
      context: "Architecte libérale, suit 8 chantiers, va sur terrain avec sa tablette",
      goals: ["Tenir les délais", "Justifier les honoraires", "Garder l'historique propre"],
      frustrations: ["Les plans cassés au format", "L'absence de mode offline", "Les devis à re-saisir 3 fois"],
      techLevel: "intermédiaire",
    },
    {
      name: "Pierre",
      avatarEmoji: "👨‍🔧",
      ageRange: "35-55",
      context: "Ingénieur BTP, bosse sur site 3j/semaine, logiciel métier obligatoire par l'entreprise",
      goals: ["Documenter proprement", "Transmettre à ses pairs", "Ne pas refaire 2 fois"],
      frustrations: ["Les logiciels pensés pour le bureau", "L'absence de sync mobile/desktop", "Le jargon incompréhensible"],
      techLevel: "intermédiaire",
    },
    {
      name: "Laure",
      avatarEmoji: "🧑‍💼",
      ageRange: "30-45",
      context: "Chef de projet industriel, coordonne 5 équipes avec un ERP interne",
      goals: ["Éviter les retards", "Donner de la visibilité", "Faire des rétrospectives utiles"],
      frustrations: ["Les reportings manuels", "Les données dupliquées", "Le manque d'export propre"],
      techLevel: "intermédiaire",
    },
  ],
  business: [
    {
      name: "Olivier",
      avatarEmoji: "🧑‍💼",
      ageRange: "35-55",
      context: "Entrepreneur série, vient de lever, doit recruter + structurer en parallèle",
      goals: ["Prendre des décisions vite", "S'entourer des bonnes personnes", "Scale sans casser la culture"],
      frustrations: ["Les frameworks théoriques", "Les conseils qui ne matchent pas son contexte", "Le temps perdu en due diligence"],
      techLevel: "expert",
    },
    {
      name: "Claire",
      avatarEmoji: "👩‍💼",
      ageRange: "30-50",
      context: "VC en fonds early-stage, traite 200 deals/an, prend 10 decisions/semaine",
      goals: ["Détecter les signaux forts", "Gagner du temps sur le dealflow", "Justifier ses passes"],
      frustrations: ["Les decks trop longs", "Les founders qui ne répondent pas aux questions", "Les CRM mal tenus"],
      techLevel: "intermédiaire",
    },
    {
      name: "Bruno",
      avatarEmoji: "🧑",
      ageRange: "45-60",
      context: "Partenaire grand compte dans une agence, pilote 10M€ de CA",
      goals: ["Fidéliser", "Cross-seller sans forcer", "Monter en compétence son équipe"],
      frustrations: ["Les reportings clients qui mangent 2 jours/semaine", "Les CRM qui ne parlent pas au reste", "Les outils qui obligent à saisir 2x"],
      techLevel: "intermédiaire",
    },
    {
      name: "Yann",
      avatarEmoji: "🧑‍💼",
      ageRange: "28-45",
      context: "Consultant stratégie indé, missions 2-6 mois, capitalise sur ses livrables",
      goals: ["Rendre des livrables premium", "Réutiliser ce qui marche", "Facturer la valeur pas le temps"],
      frustrations: ["Les templates génériques", "Les clients qui veulent du sur-mesure au prix du standard", "Le manque d'outils pour consultants"],
      techLevel: "expert",
    },
  ],
};

// ─── Job stories templates par type projet ─────────────────────────────────

export interface JobStoryTemplate {
  when: string;
  iWant: string;
  soICan: string;
}

export const JOB_STORY_TEMPLATES: Record<ProjectType, JobStoryTemplate[]> = {
  saas: [
    {
      when: "je reçois un ticket support de mon CS",
      iWant: "voir en un coup d'œil si c'est un compte VIP",
      soICan: "répondre sous 2h et garder ma NPS",
    },
    {
      when: "un user termine son onboarding",
      iWant: "être notifié de son aha moment",
      soICan: "comprendre ce qui active vraiment",
    },
    {
      when: "mon MRR chute sur un segment",
      iWant: "voir qui churn et pourquoi",
      soICan: "les contacter avant qu'ils signent chez le concurrent",
    },
    {
      when: "je lance une nouvelle feature",
      iWant: "tracker son adoption sans brancher 5 outils",
      soICan: "décider de la pousser ou la retirer",
    },
  ],
  appli: [
    {
      when: "j'ouvre l'app le matin",
      iWant: "voir mes 3 trucs du jour sans chercher",
      soICan: "démarrer sans réfléchir",
    },
    {
      when: "je finis une session de jeu",
      iWant: "savoir combien j'ai progressé",
      soICan: "avoir envie de revenir demain",
    },
    {
      when: "je partage un contenu avec un pote",
      iWant: "qu'il puisse y accéder sans créer de compte",
      soICan: "ne pas lui coller de friction",
    },
  ],
  outil: [
    {
      when: "je démarre ma journée",
      iWant: "voir ma prochaine action critique",
      soICan: "commencer sans hésiter",
    },
    {
      when: "je termine une tâche",
      iWant: "qu'elle passe à la suivante automatiquement",
      soICan: "maintenir mon flow",
    },
    {
      when: "je reprends un projet après 2 semaines d'arrêt",
      iWant: "retrouver où j'en étais",
      soICan: "ne pas perdre 1h à me recontextualiser",
    },
  ],
  logiciel: [
    {
      when: "un client me paie une facture",
      iWant: "que la compta passe en automatique",
      soICan: "ne rien oublier au bilan",
    },
    {
      when: "je commence un nouveau dossier",
      iWant: "partir d'un template pré-rempli",
      soICan: "gagner 30 min par dossier",
    },
    {
      when: "un audit arrive",
      iWant: "exporter mes données en un format propre",
      soICan: "passer l'audit sereinement",
    },
  ],
  business: [
    {
      when: "je rencontre un prospect",
      iWant: "avoir son contexte en 30 secondes",
      soICan: "rebondir sur ses vrais enjeux",
    },
    {
      when: "un deal se ferme",
      iWant: "que l'équipe delivery soit briefée automatiquement",
      soICan: "ne pas perdre la main entre vente et exécution",
    },
    {
      when: "je prépare une revue trimestrielle",
      iWant: "avoir les 5 KPIs qui comptent",
      soICan: "décider vite sans noyer le board",
    },
  ],
};

// ─── Anti-goals templates par type projet ──────────────────────────────────

export const ANTI_GOALS_TEMPLATES: Record<ProjectType, string[]> = {
  saas: [
    "Remplacer Slack/Notion/Linear : on reste focus sur UN job principal",
    "Servir les grandes entreprises (enterprise) en phase MVP",
    "Être un outil no-code : on cible les users techniques",
    "Intégrer tous les outils du marché dès le jour 1",
  ],
  appli: [
    "Devenir un réseau social de plus",
    "Spammer les users avec des notifications",
    "Vendre les données utilisateurs",
    "Exiger un compte avant de montrer la valeur",
    "Remplacer une app stock qui fait déjà bien le job",
  ],
  outil: [
    "Être utilisable en équipe (c'est un outil solo)",
    "Remplacer une suite bureautique complète",
    "Ajouter de l'AI juste pour cocher la case",
    "Imposer un onboarding de plus de 60 secondes",
  ],
  logiciel: [
    "Être utilisable sans formation (logiciel métier assumé)",
    "Se rendre indispensable via du lock-in propriétaire",
    "Ajouter des features que personne n'utilise",
    "Supprimer la version desktop au profit du web",
  ],
  business: [
    "Vendre la solution avant d'avoir qualifié le problème",
    "Chercher la croissance à tout prix vs marge saine",
    "Faire du sur-mesure déguisé en produit",
    "Ignorer la conformité (RGPD, compliance) jusqu'à ce qu'un avocat prévienne",
  ],
};

// ─── Helper : convertit un template en persona complet (avec ID) ───────────

export function personaFromTemplate(template: PersonaTemplate): FoundationsPersona {
  return {
    id: `persona-tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...template,
  };
}

export function jobStoryFromTemplate(template: JobStoryTemplate): FoundationsJobStory {
  return {
    id: `jobstory-tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...template,
  };
}
