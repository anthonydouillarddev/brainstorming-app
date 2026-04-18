import type { ProjectType } from "@/lib/types";

export function getAuthSecContextHint(type: ProjectType): string {
  const hints: Record<ProjectType, string> = {
    saas: "SaaS B2C : Supabase Auth + email/magic link + OAuth Google/GitHub. MFA optionnel V1.",
    outil: "Outil CLI : API key locale encrypted + optionnel OAuth device flow.",
    appli: "Appli mobile : Supabase Auth SDK + biometric MFA (Face ID / Fingerprint).",
    logiciel: "Logiciel desktop : OAuth device flow + PAT stocké Keychain/Keystore.",
    business: "Business : pas d'auth custom si no-code. Stripe Customer Portal.",
  };
  return hints[type];
}
