"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getAllTypes,
  getModulePresetsForType,
  getWorlds,
  suggestTypeFromTitle,
} from "@/lib/taxonomy";
import type { ProjectTypeDef, ProjectWorld, TabModule } from "@/lib/types";
import TypePickerModal from "./TypePickerModal";
import { createProjectWithModules } from "./actions";

type PresetModule = TabModule & { isRecommended: boolean; displayOrder: number };

type Suggestion = {
  type: ProjectTypeDef;
  score: number;
  matches: string[];
};

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [worlds, setWorlds] = useState<ProjectWorld[]>([]);
  const [types, setTypes] = useState<ProjectTypeDef[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [selectedType, setSelectedType] = useState<ProjectTypeDef | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [presetModules, setPresetModules] = useState<PresetModule[]>([]);
  const [loadingPreset, setLoadingPreset] = useState(false);
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<string>>(new Set());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userChoseTypeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [w, t] = await Promise.all([getWorlds(supabase), getAllTypes(supabase)]);
        if (cancelled) return;
        setWorlds(w);
        setTypes(t);
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    if (name.trim().length < 3 || types.length === 0) {
      setSuggestion(null);
      return;
    }
    suggestTimerRef.current = setTimeout(() => {
      const result = suggestTypeFromTitle(name, types);
      if (result.type && result.score >= 1) {
        setSuggestion({ type: result.type, score: result.score, matches: result.matches });
        if (!userChoseTypeRef.current) {
          setSelectedType(result.type);
        }
      } else {
        setSuggestion(null);
        if (!userChoseTypeRef.current) setSelectedType(null);
      }
    }, 300);
    return () => {
      if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    };
  }, [name, types]);

  useEffect(() => {
    if (step !== 2 || !selectedType) return;
    let cancelled = false;
    async function loadPreset(typeId: string) {
      setLoadingPreset(true);
      try {
        const presets = await getModulePresetsForType(supabase, typeId);
        if (cancelled) return;
        setPresetModules(presets);
        setSelectedModuleIds(new Set(presets.map((m) => m.id)));
      } finally {
        if (!cancelled) setLoadingPreset(false);
      }
    }
    loadPreset(selectedType.id);
    return () => {
      cancelled = true;
    };
  }, [step, selectedType, supabase]);

  const worldForSelected = useMemo(
    () => worlds.find((w) => w.id === selectedType?.worldId) ?? null,
    [worlds, selectedType]
  );

  const nameIsValid = name.trim().length >= 2 && name.trim().length <= 100;
  const canContinue = nameIsValid && !!selectedType;

  function handlePickType(type: ProjectTypeDef) {
    userChoseTypeRef.current = true;
    setSelectedType(type);
  }

  function toggleModule(id: string, mandatory: boolean) {
    if (mandatory) return;
    setSelectedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(useRecommended: boolean) {
    if (!selectedType || !nameIsValid) return;
    setSubmitting(true);
    setError(null);
    const ids = useRecommended
      ? presetModules.map((m) => m.id)
      : Array.from(selectedModuleIds);
    const result = await createProjectWithModules({
      name: name.trim(),
      typeId: selectedType.id,
      selectedModuleIds: ids,
    });
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push(`/project/${result.projectId}`);
    router.refresh();
  }

  const essentials = useMemo(
    () => presetModules.filter((m) => m.isMandatory).sort((a, b) => a.displayOrder - b.displayOrder),
    [presetModules]
  );
  const recommended = useMemo(
    () =>
      presetModules
        .filter((m) => !m.isMandatory && m.isRecommended)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [presetModules]
  );
  const optional = useMemo(
    () =>
      presetModules
        .filter((m) => !m.isMandatory && !m.isRecommended)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [presetModules]
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 w-full">
      <div className="mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-muted hover:text-foreground text-sm transition-colors mb-4"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight">🆕 Nouveau projet</h1>
        <p className="text-muted text-sm mt-1">
          {step === 1
            ? "Donne un nom et on te suggère le bon type"
            : "Choisis les modules pour ton projet"}
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <StepDot active={step >= 1} label="Type" />
        <div className="flex-1 h-px bg-border" />
        <StepDot active={step >= 2} label="Modules" />
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
            <label htmlFor="name" className="block text-sm font-semibold mb-2">
              Nom du projet <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Ma boutique de t-shirts, Mon app de méditation…"
              autoFocus
              maxLength={100}
              className="w-full px-4 py-3 bg-background/60 border border-border rounded-xl text-foreground placeholder:text-muted/40 outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>

          {loadingMeta ? (
            <div className="bg-card/60 border border-border rounded-2xl p-5 text-center text-muted text-sm">
              Chargement des types…
            </div>
          ) : (
            <SuggestionCard
              suggestion={suggestion}
              selectedType={selectedType}
              worldForSelected={worldForSelected}
              onChange={() => setPickerOpen(true)}
              onChoose={() => setPickerOpen(true)}
            />
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-5 py-3 text-muted hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuer →
            </button>
          </div>

          <TypePickerModal
            open={pickerOpen}
            worlds={worlds}
            types={types}
            selectedTypeId={selectedType?.id ?? null}
            onSelect={handlePickType}
            onClose={() => setPickerOpen(false)}
          />
        </div>
      )}

      {step === 2 && selectedType && (
        <div className="space-y-5">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedType.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{selectedType.name}</div>
                <div className="text-xs text-muted">
                  {worldForSelected?.name} · {name.trim()}
                </div>
              </div>
            </div>
          </div>

          {loadingPreset ? (
            <div className="bg-card/60 border border-border rounded-2xl p-5 text-center text-muted text-sm">
              Chargement des modules…
            </div>
          ) : (
            <>
              <ModuleGroup
                title="Essentiels"
                hint="Toujours activés"
                modules={essentials}
                selectedIds={selectedModuleIds}
                onToggle={toggleModule}
              />
              {recommended.length > 0 && (
                <ModuleGroup
                  title={`Recommandés pour « ${selectedType.name} »`}
                  modules={recommended}
                  selectedIds={selectedModuleIds}
                  onToggle={toggleModule}
                />
              )}
              {optional.length > 0 && (
                <ModuleGroup
                  title="Optionnels"
                  modules={optional}
                  selectedIds={selectedModuleIds}
                  onToggle={toggleModule}
                />
              )}
            </>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStep(1)}
              className="px-5 py-3 bg-background/60 border border-border text-muted hover:text-foreground rounded-xl transition-colors"
            >
              ← Retour
            </button>
            <button
              type="button"
              disabled={submitting || loadingPreset}
              onClick={() => handleSubmit(true)}
              className="flex-1 py-3 bg-card border border-border text-foreground font-medium rounded-xl hover:border-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Créer avec tous les modules du preset"
            >
              Config recommandée
            </button>
            <button
              type="button"
              disabled={submitting || loadingPreset}
              onClick={() => handleSubmit(false)}
              className="flex-1 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Création…" : "Créer le projet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          active ? "bg-accent text-white" : "bg-card border border-border text-muted"
        }`}
      >
        {active ? "●" : "○"}
      </div>
      <span
        className={`text-xs font-medium ${active ? "text-foreground" : "text-muted"}`}
      >
        {label}
      </span>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  selectedType,
  worldForSelected,
  onChange,
  onChoose,
}: {
  suggestion: Suggestion | null;
  selectedType: ProjectTypeDef | null;
  worldForSelected: ProjectWorld | null;
  onChange: () => void;
  onChoose: () => void;
}) {
  if (!selectedType) {
    return (
      <button
        type="button"
        onClick={onChoose}
        className="w-full bg-card/80 backdrop-blur-sm border border-dashed border-border rounded-2xl p-5 text-left hover:border-muted transition-colors"
      >
        <div className="font-semibold text-sm mb-1">Choisis ton type</div>
        <div className="text-xs text-muted">
          Tape un nom descriptif (ex : « ma boutique », « mon app mobile ») ou ouvre la
          liste des types.
        </div>
      </button>
    );
  }

  const isSuggested = suggestion && suggestion.type.id === selectedType.id;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
      <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-2">
        {isSuggested ? "🎯 Type détecté" : "Type sélectionné"}
      </div>
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0">{selectedType.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold">{selectedType.name}</div>
          <div className="text-xs text-muted mt-0.5">
            {worldForSelected?.name ?? "—"}
          </div>
          {isSuggested && suggestion && suggestion.matches.length > 0 && (
            <div className="text-xs text-muted mt-1.5">
              Matches :{" "}
              {suggestion.matches.map((m, i) => (
                <span key={m}>
                  <span className="px-1.5 py-0.5 rounded-md bg-accent/10 text-accent">
                    {m}
                  </span>
                  {i < suggestion.matches.length - 1 ? " " : ""}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onChange}
          className="text-xs px-3 py-1.5 rounded-lg bg-background/60 border border-border text-muted hover:text-foreground hover:border-muted transition-colors shrink-0"
        >
          Changer
        </button>
      </div>
    </div>
  );
}

function ModuleGroup({
  title,
  hint,
  modules,
  selectedIds,
  onToggle,
}: {
  title: string;
  hint?: string;
  modules: PresetModule[];
  selectedIds: Set<string>;
  onToggle: (id: string, mandatory: boolean) => void;
}) {
  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-bold text-sm">{title}</h3>
        {hint && <span className="text-[11px] text-muted">{hint}</span>}
      </div>
      <div className="space-y-2">
        {modules.map((m) => {
          const checked = selectedIds.has(m.id) || m.isMandatory;
          return (
            <label
              key={m.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                m.isMandatory
                  ? "bg-background/40 border-border cursor-default"
                  : checked
                  ? "bg-accent/10 border-accent/40 cursor-pointer"
                  : "bg-background/60 border-border hover:border-muted cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={m.isMandatory}
                onChange={() => onToggle(m.id, m.isMandatory)}
                className="w-4 h-4 accent-accent disabled:opacity-60"
              />
              <span className="text-xl">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{m.name}</div>
                {m.isMandatory && (
                  <div className="text-[11px] text-muted">Toujours activé</div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
