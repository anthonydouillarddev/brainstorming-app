"use client";

import { useState } from "react";
import type { IdentityState } from "../state";

// Génère un micro-copy contextuel depuis les sliders + archétype
function generateCTA(state: IdentityState): string {
  const s = state.voiceSliders;
  if (s.seriousFunny > 65 && s.formalCasual > 60) return "Allez, on se lance 🚀";
  if (s.formalCasual > 60) return "C'est parti";
  if (s.formalCasual < 35) return "Démarrer";
  if (s.matterOfFactEnthusiastic > 65) return "Je veux essayer !";
  return "Commencer";
}

function generateError(state: IdentityState): string {
  const s = state.voiceSliders;
  if (s.warmDistant < 30 && s.seriousFunny > 55)
    return "Oups, le serveur boude. On réessaie dans une minute ?";
  if (s.formalCasual > 65) return "Petit hic. On réessaie ?";
  if (s.formalCasual < 30) return "Une erreur est survenue. Veuillez réessayer.";
  if (s.warmDistant < 30) return "Ça n'a pas marché. Pas grave, on ressaie.";
  return "Une erreur est survenue. Réessaie dans un instant.";
}

function generateEmpty(state: IdentityState): string {
  const s = state.voiceSliders;
  if (s.formalCasual > 65) return "Rien à se mettre sous la dent ici. Crée ton premier truc ↓";
  if (s.formalCasual < 35) return "Aucun élément à afficher. Créez votre premier élément.";
  return "Rien ici pour l'instant. Crée ton premier projet ↓";
}

function generateWelcome(state: IdentityState, projectName: string): string {
  const s = state.voiceSliders;
  if (s.formalCasual > 70 && s.matterOfFactEnthusiastic > 65)
    return `Salut ! Bienvenue sur ${projectName} 🎉`;
  if (s.formalCasual > 60) return `Hey, bienvenue sur ${projectName}.`;
  if (s.formalCasual < 35) return `Bienvenue sur ${projectName}.`;
  return `Bienvenue sur ${projectName} ! On t'a préparé un espace rien qu'à toi.`;
}

export default function LivePreviewBlock({
  state,
  projectName,
}: {
  state: IdentityState;
  projectName: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const cta = generateCTA(state);
  const errorMsg = generateError(state);
  const empty = generateEmpty(state);
  const welcome = generateWelcome(state, projectName);

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left w-full"
        aria-expanded={expanded}
      >
        <span aria-hidden>{expanded ? "▼" : "▶"}</span>
        👀 Live preview micro-copy
        <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
          SHOULD
        </span>
      </button>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">4 micro-copys générés live</strong> depuis tes
            sliders. C&apos;est une approximation — ajuste dans la tone matrix pour du copy
            définitif.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PreviewCard title="🚀 Bouton CTA principal">
              <button className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold">
                {cta}
              </button>
            </PreviewCard>

            <PreviewCard title="❌ Message d'erreur">
              <div className="text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400">
                {errorMsg}
              </div>
            </PreviewCard>

            <PreviewCard title="📭 Empty state">
              <div className="text-sm p-3 rounded-lg bg-card border border-dashed border-border text-muted text-center">
                {empty}
              </div>
            </PreviewCard>

            <PreviewCard title="👋 Message de bienvenue">
              <div className="text-sm p-3 rounded-lg bg-accent/5 border border-accent/30">
                {welcome}
              </div>
            </PreviewCard>
          </div>
        </>
      )}
    </div>
  );
}

function PreviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card/60 border border-border rounded-xl p-3 space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">{title}</div>
      {children}
    </div>
  );
}
