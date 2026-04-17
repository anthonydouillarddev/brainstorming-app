"use client";

import { useState } from "react";
import type { IdentityState, KapfererPrism } from "../state";

interface Facet {
  key: keyof KapfererPrism;
  emoji: string;
  title: string;
  description: string;
  placeholder: string;
  group: "sender" | "receiver";
}

const FACETS: Facet[] = [
  {
    key: "physique",
    emoji: "👁️",
    title: "Physique",
    description: "Les attributs tangibles (logo, couleurs, typo, packaging). Ce qu'on voit.",
    placeholder: "Ex : logo minimal noir & blanc, sans-serif géométrique, UI dense",
    group: "sender",
  },
  {
    key: "personality",
    emoji: "🧑",
    title: "Personnalité",
    description: "Les traits humains de ta marque. Comment elle se comporte si elle était une personne.",
    placeholder: "Ex : calme, rigoureuse, directe, jamais pompeuse",
    group: "sender",
  },
  {
    key: "relationship",
    emoji: "🤝",
    title: "Relation",
    description: "Type de lien avec l'utilisateur. Partenaire ? Coach ? Compagnon ? Mentor ?",
    placeholder: "Ex : partenaire de travail discret, respecte le flow de l'user",
    group: "sender",
  },
  {
    key: "culture",
    emoji: "🏛️",
    title: "Culture",
    description: "Origine, valeurs, histoire. D'où vient la marque ?",
    placeholder: "Ex : bootstrapped à Perth en side project, outil pour soi d'abord",
    group: "sender",
  },
  {
    key: "reflection",
    emoji: "🪞",
    title: "Reflet (cible)",
    description: "Comment l'user veut être perçu quand il utilise ta marque.",
    placeholder: "Ex : indie founder sérieux qui maîtrise son design",
    group: "receiver",
  },
  {
    key: "mentalisation",
    emoji: "💭",
    title: "Mentalisation",
    description: "Ce que l'user devient grâce à ta marque. Sa self-image intérieure.",
    placeholder: "Ex : je me sens autonome et capable de lancer mon SaaS",
    group: "receiver",
  },
];

export default function KapfererPrismBlock({
  state,
  onChange,
}: {
  state: IdentityState;
  onChange: (patch: Partial<IdentityState>) => void;
}) {
  const hasAny = Object.values(state.kapfererPrism).some((v) => v.trim());
  const [expanded, setExpanded] = useState(hasAny);

  function update(key: keyof KapfererPrism, value: string) {
    onChange({ kapfererPrism: { ...state.kapfererPrism, [key]: value } });
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left w-full"
        aria-expanded={expanded}
      >
        <span aria-hidden>{expanded ? "▼" : "▶"}</span>
        🔷 Brand Identity Prism (Kapferer)
        <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
          NICE
        </span>
      </button>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">6 facettes de ton identité</strong> selon Jean-Noël
            Kapferer. 3 côté émetteur (ce que ta marque projette), 3 côté récepteur (ce que l&apos;user
            perçoit &amp; devient). Outil stratégique pour aligner ton équipe ou briefer une
            agence.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                📤 Côté émetteur (ta marque projette)
              </div>
              {FACETS.filter((f) => f.group === "sender").map((f) => (
                <FacetField
                  key={f.key}
                  facet={f}
                  value={state.kapfererPrism[f.key]}
                  onChange={(v) => update(f.key, v)}
                />
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                📥 Côté récepteur (l&apos;user perçoit)
              </div>
              {FACETS.filter((f) => f.group === "receiver").map((f) => (
                <FacetField
                  key={f.key}
                  facet={f}
                  value={state.kapfererPrism[f.key]}
                  onChange={(v) => update(f.key, v)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FacetField({
  facet,
  value,
  onChange,
}: {
  facet: Facet;
  value: string;
  onChange: (value: string) => void;
}) {
  const filled = value.trim().length > 0;
  return (
    <div
      className={`border rounded-xl p-3 space-y-1.5 transition ${
        filled ? "border-accent/50 bg-accent/5" : "border-border bg-card/60"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          {facet.emoji}
        </span>
        <span className="font-semibold text-sm">{facet.title}</span>
        {filled && <span className="text-[10px] text-green-600">✓</span>}
      </div>
      <p className="text-[11px] text-muted leading-relaxed">{facet.description}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={facet.placeholder}
        rows={2}
        className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card"
      />
    </div>
  );
}
