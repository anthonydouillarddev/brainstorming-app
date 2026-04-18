// Workflow automation / orchestration LLM pour le chap 10 IA & Automation.
// n8n (self-host OSS recommandé), Zapier, Make, Pipedream, Activepieces.
// Phase 0 : squelette. Phase 4 enrichira avec recipes types + templates JSON n8n.

export type WorkflowTool = {
  id: string;
  name: string;
  score: "populaire" | "emergent" | "legacy";
  selfHost: boolean;
  freeTier: string;
  pricing: string;
  bestFor: string;
  url: string;
};

export const WORKFLOW_TOOLS: WorkflowTool[] = [
  {
    id: "n8n",
    name: "n8n",
    score: "populaire",
    selfHost: true,
    freeTier: "illimité en self-host",
    pricing: "Cloud dès $20/mo",
    bestFor: "Self-host OSS, 500+ intégrations, orchestration LLM, Mindeck recommandé",
    url: "https://n8n.io",
  },
  {
    id: "zapier",
    name: "Zapier",
    score: "populaire",
    selfHost: false,
    freeTier: "100 tasks/mois",
    pricing: "$20-70+/mo scaling",
    bestFor: "Leader historique, 5000+ intégrations, cher à scale",
    url: "https://zapier.com",
  },
  {
    id: "make",
    name: "Make.com",
    score: "populaire",
    selfHost: false,
    freeTier: "1000 ops/mois",
    pricing: "$9-30+/mo",
    bestFor: "Visual workflows complexes, cheaper than Zapier",
    url: "https://make.com",
  },
  {
    id: "pipedream",
    name: "Pipedream",
    score: "emergent",
    selfHost: false,
    freeTier: "10k invocations/mois",
    pricing: "$19+/mo",
    bestFor: "Code-first (Node/Python), dev-friendly",
    url: "https://pipedream.com",
  },
  {
    id: "activepieces",
    name: "Activepieces",
    score: "emergent",
    selfHost: true,
    freeTier: "illimité en self-host",
    pricing: "Cloud dès $10/mo",
    bestFor: "Alternative OSS à Zapier, TypeScript-first",
    url: "https://activepieces.com",
  },
];

// Exemples de recipes (enrichir Phase 4 avec JSON import-ready n8n)
export const WORKFLOW_RECIPES = [
  {
    id: "signup-onboarding",
    title: "Onboarding user à l'inscription",
    description: "Signup Supabase → vérifier email Resend → ajouter Loops → ping Slack → générer brief onboarding Claude",
    tools: ["n8n", "make"],
  },
  {
    id: "daily-digest",
    title: "Digest quotidien Mindeck",
    description: "Cron 8h → fetch projets actifs → résumer avec Claude → envoyer email Resend",
    tools: ["n8n"],
  },
  {
    id: "llm-batch-analysis",
    title: "Analyse batch LLM",
    description: "Trigger webhook → récupérer batch de données → Claude analyse chaque item → écrire résultats DB",
    tools: ["n8n", "pipedream"],
  },
];

// GPU compute pour modèles custom (chap 10 V3)
export type GPUProvider = {
  id: string;
  name: string;
  score: "populaire" | "emergent" | "legacy";
  bestFor: string;
  url: string;
};

export const GPU_PROVIDERS: GPUProvider[] = [
  {
    id: "modal",
    name: "Modal",
    score: "populaire",
    bestFor: "Serverless GPU, scale-to-zero, Python-first",
    url: "https://modal.com",
  },
  {
    id: "replicate",
    name: "Replicate",
    score: "populaire",
    bestFor: "API-first pour models prêts à l'emploi",
    url: "https://replicate.com",
  },
  {
    id: "runpod",
    name: "RunPod",
    score: "emergent",
    bestFor: "Pod-based GPU rental, moins cher pour longs workloads",
    url: "https://runpod.io",
  },
  {
    id: "fal",
    name: "Fal.ai",
    score: "emergent",
    bestFor: "Spécialisé image/video generation latence basse",
    url: "https://fal.ai",
  },
];
