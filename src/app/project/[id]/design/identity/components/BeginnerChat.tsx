"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { ARCHETYPES, type ArchetypeKey } from "../archetypes";
import type { IdentityState } from "../state";

type Step = "archetype" | "promise" | "glossary-do" | "glossary-dont" | "tone-error" | "done";

const STEPS: Step[] = [
  "archetype",
  "promise",
  "glossary-do",
  "glossary-dont",
  "tone-error",
  "done",
];

export default function BeginnerChat({
  state,
  project,
  onChange,
  onSwitchMode,
}: {
  state: IdentityState;
  project: Project;
  onChange: (patch: Partial<IdentityState>) => void;
  onSwitchMode: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    if (!state.archetypeKey) return 0;
    if (!state.brandPromise.trim()) return 1;
    if (state.doWords.length === 0) return 2;
    if (state.dontWords.length === 0) return 3;
    const err = state.toneMatrix.find((r) => r.id === "error");
    if (!err?.exampleDo?.trim()) return 4;
    return 5;
  });
  const [draft, setDraft] = useState("");

  const step = STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  function next() {
    setDraft("");
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  }

  function prev() {
    setDraft("");
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function pickArchetype(key: ArchetypeKey) {
    const archetype = ARCHETYPES.find((a) => a.key === key);
    if (!archetype) return;
    onChange({
      archetypeKey: key,
      voiceSliders: { ...state.voiceSliders, ...archetype.sliderDefaults },
      doWords: state.doWords.length === 0 ? archetype.doWords : state.doWords,
      dontWords: state.dontWords.length === 0 ? archetype.dontWords : state.dontWords,
    });
    next();
  }

  function submitPromise() {
    if (!draft.trim()) return;
    onChange({ brandPromise: draft.trim() });
    next();
  }

  function submitDoWords() {
    const words = draft
      .split(/[,\n]/)
      .map((w) => w.trim())
      .filter((w) => w && !state.doWords.includes(w));
    if (words.length === 0) return;
    onChange({ doWords: [...state.doWords, ...words] });
    next();
  }

  function submitDontWords() {
    const words = draft
      .split(/[,\n]/)
      .map((w) => w.trim())
      .filter((w) => w && !state.dontWords.includes(w));
    if (words.length === 0) return;
    onChange({ dontWords: [...state.dontWords, ...words] });
    next();
  }

  function submitToneError() {
    if (!draft.trim()) return;
    onChange({
      toneMatrix: state.toneMatrix.map((r) =>
        r.id === "error"
          ? { ...r, tone: r.tone || "empathique, sans blame", exampleDo: draft.trim() }
          : r
      ),
    });
    next();
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 md:p-8 space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">
            Étape {stepIndex + 1} / {STEPS.length}
          </span>
          <span className="font-mono text-muted">{progress}%</span>
        </div>
        <div className="h-2 bg-card border border-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step === "archetype" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            Si ton produit était une personne, ce serait qui ?
          </h2>
          <p className="text-sm text-muted">
            Choisis la carte qui te parle le plus. Ça n&apos;est pas définitif — on pourra toujours
            ajuster après.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ARCHETYPES.map((a) => (
              <button
                key={a.key}
                onClick={() => pickArchetype(a.key)}
                className={`p-3 rounded-xl border-2 text-center transition ${
                  state.archetypeKey === a.key
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-accent/50"
                }`}
              >
                <div className="text-3xl mb-1">{a.emoji}</div>
                <div className="font-semibold text-sm">{a.name}</div>
                <div className="text-[10px] text-muted">{a.tagline}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "promise" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            En une phrase, qu&apos;est-ce que {project.official_name || project.name} promet à ses
            users ?
          </h2>
          <p className="text-sm text-muted">
            Évite « leader », « innovant », « solution » — des mots flous que tout le monde dit.
            Sois concret, ≤ 15 mots.
          </p>
          <textarea
            value={draft || state.brandPromise}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Ex : Pour les indie founders, un design system en 30 minutes sans code."
            className="w-full px-4 py-3 text-base rounded-xl border border-border bg-card"
            autoFocus
          />
          <Nav onPrev={prev} onNext={submitPromise} canNext={!!(draft || state.brandPromise).trim()} />
        </div>
      )}

      {step === "glossary-do" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">Quels mots ta marque utilise souvent ?</h2>
          <p className="text-sm text-muted">
            5 mots ou expressions qui reviennent dans ton ton. Sépare par virgule ou retour à la
            ligne. (Déjà pré-remplis depuis l&apos;archétype, tu peux les éditer après.)
          </p>
          {state.doWords.length > 0 && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-2 text-xs">
              <span className="text-muted">Déjà ajoutés : </span>
              <span className="font-medium">{state.doWords.join(", ")}</span>
            </div>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Ex : simple, clair, on, ensemble, rapide"
            className="w-full px-4 py-3 text-base rounded-xl border border-border bg-card"
            autoFocus
          />
          <Nav onPrev={prev} onNext={submitDoWords} canNext={!!draft.trim() || state.doWords.length > 0} canSkip={state.doWords.length > 0} />
        </div>
      )}

      {step === "glossary-dont" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">Et quels mots tu refuses d&apos;utiliser ?</h2>
          <p className="text-sm text-muted">
            Les trucs qui te font grincer des dents. Jargon, clichés, buzzwords.
          </p>
          {state.dontWords.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2 text-xs">
              <span className="text-muted">Déjà ajoutés : </span>
              <span className="font-medium">{state.dontWords.join(", ")}</span>
            </div>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Ex : leader, synergie, révolutionnaire, disruptif"
            className="w-full px-4 py-3 text-base rounded-xl border border-border bg-card"
            autoFocus
          />
          <Nav onPrev={prev} onNext={submitDontWords} canNext={!!draft.trim() || state.dontWords.length > 0} canSkip={state.dontWords.length > 0} />
        </div>
      )}

      {step === "tone-error" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            Comment ta marque parle quand l&apos;user fait une erreur ?
          </h2>
          <p className="text-sm text-muted">
            C&apos;est LE moment de vérité du ton. Écris un exemple de message d&apos;erreur qui te
            parle.
          </p>
          <textarea
            value={draft || state.toneMatrix.find((r) => r.id === "error")?.exampleDo || ""}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Ex : Oups, notre serveur boude. On réessaie dans une minute ?"
            className="w-full px-4 py-3 text-base rounded-xl border border-border bg-card"
            autoFocus
          />
          <Nav onPrev={prev} onNext={submitToneError} canNext={!!(draft || state.toneMatrix.find((r) => r.id === "error")?.exampleDo)?.trim()} />
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h2 className="text-lg md:text-xl font-bold">
              Ton identité de marque est posée !
            </h2>
            <p className="text-sm text-muted">
              Tu as défini ton archétype, ta promise, ton glossaire et ton ton d&apos;erreur. Tu
              peux maintenant exporter la brand card ou continuer à affiner dans le mode Formulaire
              (plus de blocs : sliders précis, tone matrix complète, références, prism Kapferer).
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={onSwitchMode}
              className="text-sm px-5 py-2 rounded bg-accent text-white hover:bg-accent-hover transition"
            >
              Passer au mode Formulaire →
            </button>
            <button
              onClick={prev}
              className="text-sm px-5 py-2 rounded border border-border hover:bg-accent/10 transition"
            >
              ← Revoir mes réponses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Nav({
  onPrev,
  onNext,
  canNext,
  canSkip = false,
}: {
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
  canSkip?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <button
        onClick={onPrev}
        className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 transition"
      >
        ← Retour
      </button>
      <div className="flex gap-2">
        {canSkip && (
          <button
            onClick={onNext}
            className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 transition"
          >
            Passer
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canNext}
          className="text-sm px-5 py-2 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
