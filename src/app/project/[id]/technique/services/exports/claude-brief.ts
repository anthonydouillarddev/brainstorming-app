import { SERVICES_CATALOG } from "@/lib/technique/services-catalog";
import type { ServicesState } from "../state";

export function exportServicesClaudeBrief(state: ServicesState, projectName: string): string {
  const l: string[] = [];
  l.push(`# Brief Claude — Services tiers ${projectName}`);
  l.push("Tu es expert intégrations SaaS. Aide à configurer ces services :");
  l.push("");
  const used = state.selections.filter((s) => s.status === "used");
  if (used.length === 0) {
    l.push("_Aucun service sélectionné pour l'instant._");
  } else {
    l.push("## Services à configurer");
    for (const sel of used) {
      const cat = SERVICES_CATALOG.find((c) => c.id === sel.categoryId);
      if (!cat) continue;
      l.push(`- **${cat.label}** → ${sel.selectedService}${sel.notes ? ` (${sel.notes})` : ""}`);
    }
  }
  l.push("");
  l.push("## Ce que je te demande");
  l.push("1. Pour chaque service listé, donne les env vars requises + lien docs d'install.");
  l.push("2. Ordre d'intégration recommandé (dépendances).");
  l.push("3. Coût total mensuel estimé (avec free tiers).");
  l.push("4. 3 pièges classiques (ex: Stripe webhooks sans signature verify).");
  return l.join("\n");
}
