"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import type { IdentityState, VoiceSliders } from "../state";
import { validateSlidersExtremes, validateArchetypeVsType } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

interface Slider {
  key: keyof VoiceSliders;
  leftLabel: string;
  rightLabel: string;
  group: "nng" | "extra";
}

const SLIDERS: Slider[] = [
  { key: "formalCasual", leftLabel: "Formel", rightLabel: "Casual", group: "nng" },
  { key: "seriousFunny", leftLabel: "Sérieux", rightLabel: "Drôle", group: "nng" },
  {
    key: "respectfulIrreverent",
    leftLabel: "Respectueux",
    rightLabel: "Irrévérencieux",
    group: "nng",
  },
  {
    key: "matterOfFactEnthusiastic",
    leftLabel: "Factuel",
    rightLabel: "Enthousiaste",
    group: "nng",
  },
  { key: "technicalGeneral", leftLabel: "Technique", rightLabel: "Grand public", group: "extra" },
  { key: "warmDistant", leftLabel: "Chaleureux", rightLabel: "Distant", group: "extra" },
  { key: "humbleAmbitious", leftLabel: "Humble", rightLabel: "Ambitieux", group: "extra" },
];

function describeSliders(sliders: VoiceSliders): string {
  const parts: string[] = [];
  if (sliders.formalCasual > 60) parts.push("casual");
  else if (sliders.formalCasual < 40) parts.push("formel");
  if (sliders.seriousFunny > 60) parts.push("avec humour");
  else if (sliders.seriousFunny < 35) parts.push("sérieux");
  if (sliders.respectfulIrreverent > 65) parts.push("direct voire irrévérencieux");
  if (sliders.matterOfFactEnthusiastic > 65) parts.push("enthousiaste");
  else if (sliders.matterOfFactEnthusiastic < 35) parts.push("factuel");
  return parts.length > 0 ? parts.join(", ") : "équilibré sur tous les axes";
}

export default function VoiceSlidersBlock({
  state,
  projectType,
  onChange,
  showExtraSliders = true,
}: {
  state: IdentityState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<IdentityState>) => void;
  showExtraSliders?: boolean;
}) {
  const hasActivity = Object.values(state.voiceSliders).some((v) => v !== 50);
  const [expanded, setExpanded] = useState(hasActivity);
  const issues = [
    ...validateSlidersExtremes(state),
    ...validateArchetypeVsType(state, projectType),
  ];
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = hasActivity && !hasError;

  function update(patch: Partial<VoiceSliders>) {
    onChange({ voiceSliders: { ...state.voiceSliders, ...patch } });
  }

  const visible = SLIDERS.filter((s) => showExtraSliders || s.group === "nng");
  const summary = describeSliders(state.voiceSliders);

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🎚️ Sliders de voix
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && hasActivity && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          Ton : {summary}
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">4 axes NN/G</strong> (référence) +{" "}
            <strong className="text-foreground">3 axes complémentaires</strong>. La{" "}
            <em>voix</em> est ta personnalité (elle ne change pas) ; le <em>ton</em> s&apos;adapte
            au contexte.
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                4 axes Nielsen Norman Group
              </div>
              {visible
                .filter((s) => s.group === "nng")
                .map((s) => (
                  <VoiceSlider
                    key={s.key}
                    slider={s}
                    value={state.voiceSliders[s.key]}
                    onChange={(v) => update({ [s.key]: v })}
                  />
                ))}
            </div>
            {showExtraSliders && (
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                  3 axes complémentaires
                </div>
                {visible
                  .filter((s) => s.group === "extra")
                  .map((s) => (
                    <VoiceSlider
                      key={s.key}
                      slider={s}
                      value={state.voiceSliders[s.key]}
                      onChange={(v) => update({ [s.key]: v })}
                    />
                  ))}
              </div>
            )}
          </div>

          <div className="bg-accent/5 border border-accent/30 rounded-lg p-3 text-sm">
            <div className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-1">
              Ton ton résumé
            </div>
            <div className="font-medium capitalize">{summary}</div>
          </div>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}

function VoiceSlider({
  slider,
  value,
  onChange,
}: {
  slider: Slider;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted">{slider.leftLabel}</span>
        <span className="font-mono text-[10px] text-muted">{value}%</span>
        <span className="font-medium text-muted">{slider.rightLabel}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}
