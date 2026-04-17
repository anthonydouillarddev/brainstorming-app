"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import { validatePersonas } from "../validators";
import {
  makePersonaId,
  type FoundationsPersona,
  type FoundationsState,
  type TechLevel,
} from "../state";
import { PERSONA_TEMPLATES, personaFromTemplate } from "../templates";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const AVATAR_EMOJIS = ["👤", "🧑‍💼", "👩‍💻", "🧑‍🎨", "👨‍🔧", "👩‍🏫", "🧑‍🔬", "👨‍💻", "🧓", "🧑"];

function emptyPersona(): FoundationsPersona {
  return {
    id: makePersonaId(),
    name: "",
    avatarEmoji: "👤",
    ageRange: "",
    context: "",
    goals: [],
    frustrations: [],
    techLevel: "intermédiaire",
  };
}

export default function PersonasBlock({
  state,
  projectType,
  onChange,
}: {
  state: FoundationsState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<FoundationsState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.personas.length > 0);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const templates = projectType ? PERSONA_TEMPLATES[projectType] : [];
  const issues = validatePersonas(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");

  const primary = state.personas.find((p) => p.id === state.primaryPersonaId) ?? state.personas[0];
  const ok =
    !!primary &&
    !!primary.name.trim() &&
    !!primary.context.trim() &&
    primary.goals.length > 0 &&
    !hasError;

  function updatePersona(id: string, patch: Partial<FoundationsPersona>) {
    const nextPersonas = state.personas.map((p) => (p.id === id ? { ...p, ...patch } : p));
    onChange({ personas: nextPersonas });
  }

  function addPersona() {
    const next = emptyPersona();
    const nextPersonas = [...state.personas, next];
    onChange({
      personas: nextPersonas,
      primaryPersonaId: state.primaryPersonaId ?? next.id,
    });
  }

  function addFromTemplate(index: number) {
    const tpl = templates[index];
    if (!tpl || state.personas.length >= 3) return;
    const persona = personaFromTemplate(tpl);
    const nextPersonas = [...state.personas, persona];
    onChange({
      personas: nextPersonas,
      primaryPersonaId: state.primaryPersonaId ?? persona.id,
    });
    setTemplatesOpen(false);
  }

  function removePersona(id: string) {
    const nextPersonas = state.personas.filter((p) => p.id !== id);
    onChange({
      personas: nextPersonas,
      primaryPersonaId:
        state.primaryPersonaId === id ? nextPersonas[0]?.id ?? null : state.primaryPersonaId,
    });
  }

  const primarySummary =
    primary && primary.name.trim()
      ? `${primary.avatarEmoji} ${primary.name}${
          primary.context ? ` — ${primary.context.slice(0, 80)}${primary.context.length > 80 ? "…" : ""}` : ""
        }`
      : null;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🧑 Persona principal
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.personas.length}/3 max en V1)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && primarySummary && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          {primarySummary}
        </div>
      )}

      {expanded && (
      <>
      <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
        <strong className="text-foreground">Proto-persona</strong> = basé sur tes intuitions
        (rapide, utile pour démarrer). NN/g recommande 1-3 max en phase initiale. Sans contexte +
        frustration, c&apos;est un stéréotype, pas un persona.
      </div>

      {state.personas.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            onClick={addPersona}
            className="text-sm font-medium px-4 py-3 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Créer mon persona principal
          </button>
          {templates.length > 0 && (
            <button
              onClick={() => setTemplatesOpen((v) => !v)}
              className="text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📚 Choisir depuis templates ({templates.length})
            </button>
          )}
        </div>
      )}

      {templatesOpen && state.personas.length < 3 && templates.length > 0 && (
        <div className="bg-card/60 border border-accent/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold">
              Templates pour type <strong>{projectType}</strong> — clic pour ajouter
            </div>
            <button
              onClick={() => setTemplatesOpen(false)}
              className="text-xs text-muted hover:text-foreground"
            >
              Fermer
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => addFromTemplate(i)}
                className="text-left p-3 rounded-lg border border-border bg-card hover:border-accent hover:bg-accent/5 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tpl.avatarEmoji}</span>
                  <span className="font-semibold text-sm">{tpl.name}</span>
                  <span className="text-[10px] text-muted">({tpl.ageRange})</span>
                </div>
                <div className="text-[11px] text-muted mt-1 line-clamp-2">{tpl.context}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {state.personas.map((persona) => {
          const isPrimary = persona.id === state.primaryPersonaId;
          return (
            <div
              key={persona.id}
              className={`bg-card/60 border rounded-xl p-4 space-y-3 ${
                isPrimary ? "border-accent/60" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => updatePersona(persona.id, { avatarEmoji: emoji })}
                      className={`w-8 h-8 text-lg rounded hover:bg-accent/10 transition ${
                        persona.avatarEmoji === emoji ? "bg-accent/20 ring-1 ring-accent" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={persona.name}
                  onChange={(e) => updatePersona(persona.id, { name: e.target.value })}
                  placeholder="Nom (ex : Paul)"
                  className="h-9 px-3 text-sm rounded border border-border bg-card flex-1 min-w-[140px]"
                />
                <input
                  type="text"
                  value={persona.ageRange}
                  onChange={(e) => updatePersona(persona.id, { ageRange: e.target.value })}
                  placeholder="Âge (ex : 32-45)"
                  className="h-9 px-3 text-sm rounded border border-border bg-card w-32"
                />
                {!isPrimary && state.personas.length > 1 && (
                  <button
                    onClick={() => onChange({ primaryPersonaId: persona.id })}
                    className="text-xs px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                  >
                    Définir comme principal
                  </button>
                )}
                {isPrimary && (
                  <span className="text-[11px] px-2 py-0.5 bg-accent text-white rounded">
                    Principal
                  </span>
                )}
                <button
                  onClick={() => removePersona(persona.id)}
                  className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                  title="Supprimer"
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Contexte d&apos;usage</label>
                <textarea
                  value={persona.context}
                  onChange={(e) => updatePersona(persona.id, { context: e.target.value })}
                  placeholder="Ex : freelance, bosse seul depuis sa cuisine, 3 projets client en parallèle"
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded border border-border bg-card"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ListField
                  label="🎯 Goals (max 3)"
                  items={persona.goals}
                  max={3}
                  placeholder="Ex : facturer ses clients rapidement"
                  onChange={(goals) => updatePersona(persona.id, { goals })}
                />
                <ListField
                  label="😤 Frustrations (max 3)"
                  items={persona.frustrations}
                  max={3}
                  placeholder="Ex : doit copier-coller entre Excel et le mail"
                  onChange={(frustrations) => updatePersona(persona.id, { frustrations })}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-medium">Niveau tech :</label>
                {(["débutant", "intermédiaire", "expert"] as TechLevel[]).map((lv) => (
                  <button
                    key={lv}
                    onClick={() => updatePersona(persona.id, { techLevel: lv })}
                    className={`text-xs px-2 py-1 rounded border transition ${
                      persona.techLevel === lv
                        ? "bg-accent text-white border-accent"
                        : "border-border hover:bg-accent/10"
                    }`}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {state.personas.length > 0 && state.personas.length < 3 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={addPersona}
            className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
          >
            + Ajouter un persona secondaire
          </button>
          {templates.length > 0 && (
            <button
              onClick={() => setTemplatesOpen((v) => !v)}
              className="text-xs px-3 py-1.5 rounded border border-accent/30 text-accent hover:bg-accent/10 transition"
            >
              📚 Depuis templates
            </button>
          )}
        </div>
      )}

      <IssueList issues={issues} />
      </>
      )}
    </div>
  );
}

function ListField({
  label,
  items,
  max,
  placeholder,
  onChange,
}: {
  label: string;
  items: string[];
  max: number;
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  function add(text: string) {
    const trimmed = text.trim();
    if (!trimmed || items.includes(trimmed) || items.length >= max) return;
    onChange([...items, trimmed]);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function update(i: number, value: string) {
    onChange(items.map((item, idx) => (idx === i ? value : item)));
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium">{label}</label>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className="h-8 px-2 text-xs rounded border border-border bg-card flex-1"
            />
            <button
              onClick={() => remove(i)}
              className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
              aria-label="Retirer"
            >
              ×
            </button>
          </div>
        ))}
        {items.length < max && (
          <input
            type="text"
            placeholder={placeholder}
            className="h-8 px-2 text-xs rounded border border-dashed border-border bg-card w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value;
                add(value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
