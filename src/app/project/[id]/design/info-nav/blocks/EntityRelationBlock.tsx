"use client";

import { useState } from "react";
import type {
  EntityAttribute,
  InfoEntity,
  InfoNavState,
  InfoRelation,
  RelationType,
} from "../state";
import { makeEntityId, makeRelationId } from "../state";
import BlockStatus from "../components/BlockStatus";

const ATTR_TYPES: EntityAttribute["type"][] = ["text", "number", "boolean", "date", "enum", "ref"];
const RELATION_TYPES: RelationType[] = ["1-1", "1-N", "N-N"];

export default function EntityRelationBlock({
  state,
  onChange,
}: {
  state: InfoNavState;
  onChange: (patch: Partial<InfoNavState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.entities.length > 0);
  const ok = state.entities.length > 0;

  function addEntity() {
    const next: InfoEntity = {
      id: makeEntityId(),
      name: "",
      description: "",
      attributes: [{ name: "id", type: "text", required: true }],
    };
    onChange({ entities: [...state.entities, next] });
  }

  function updateEntity(id: string, patch: Partial<InfoEntity>) {
    onChange({
      entities: state.entities.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  }

  function removeEntity(id: string) {
    onChange({
      entities: state.entities.filter((e) => e.id !== id),
      relations: state.relations.filter((r) => r.fromEntityId !== id && r.toEntityId !== id),
    });
  }

  function addAttribute(entityId: string) {
    const entity = state.entities.find((e) => e.id === entityId);
    if (!entity) return;
    updateEntity(entityId, {
      attributes: [...entity.attributes, { name: "", type: "text", required: false }],
    });
  }

  function updateAttribute(entityId: string, index: number, patch: Partial<EntityAttribute>) {
    const entity = state.entities.find((e) => e.id === entityId);
    if (!entity) return;
    updateEntity(entityId, {
      attributes: entity.attributes.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    });
  }

  function removeAttribute(entityId: string, index: number) {
    const entity = state.entities.find((e) => e.id === entityId);
    if (!entity) return;
    updateEntity(entityId, {
      attributes: entity.attributes.filter((_, i) => i !== index),
    });
  }

  function addRelation() {
    if (state.entities.length < 2) return;
    const next: InfoRelation = {
      id: makeRelationId(),
      fromEntityId: state.entities[0].id,
      toEntityId: state.entities[1].id,
      type: "1-N",
      label: "",
    };
    onChange({ relations: [...state.relations, next] });
  }

  function updateRelation(id: string, patch: Partial<InfoRelation>) {
    onChange({
      relations: state.relations.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  }

  function removeRelation(id: string) {
    onChange({ relations: state.relations.filter((r) => r.id !== id) });
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🧱 Entités &amp; relations
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.entities.length} ent · {state.relations.length} rel)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Model-first.</strong> Définis tes entités métier
            (Project, Task, User…) avec attributs + relations (Project 1-N Task). Utilisable pour
            générer tes migrations SQL et tes types TypeScript.
          </div>

          {state.entities.length > 0 && (
            <div className="space-y-3">
              {state.entities.map((entity) => (
                <div
                  key={entity.id}
                  className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={entity.name}
                      onChange={(e) => updateEntity(entity.id, { name: e.target.value })}
                      placeholder="Nom (ex: Project)"
                      className="h-9 px-3 text-sm rounded border border-border bg-card font-mono font-semibold flex-1"
                    />
                    <input
                      type="text"
                      value={entity.description}
                      onChange={(e) => updateEntity(entity.id, { description: e.target.value })}
                      placeholder="Description"
                      className="h-9 px-3 text-sm rounded border border-border bg-card flex-[2] text-muted"
                    />
                    <button
                      onClick={() => removeEntity(entity.id)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] text-muted font-semibold">Attributs</div>
                    {entity.attributes.map((attr, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-1 items-center"
                      >
                        <input
                          type="text"
                          value={attr.name}
                          onChange={(e) =>
                            updateAttribute(entity.id, i, { name: e.target.value })
                          }
                          placeholder="nom_attribut"
                          className="h-7 px-2 text-xs font-mono rounded border border-border bg-card"
                        />
                        <select
                          value={attr.type}
                          onChange={(e) =>
                            updateAttribute(entity.id, i, {
                              type: e.target.value as EntityAttribute["type"],
                            })
                          }
                          className="h-7 px-2 text-xs rounded border border-border bg-card"
                        >
                          {ATTR_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <label className="text-[10px] text-muted flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={attr.required}
                            onChange={(e) =>
                              updateAttribute(entity.id, i, { required: e.target.checked })
                            }
                          />
                          req
                        </label>
                        <button
                          onClick={() => removeAttribute(entity.id, i)}
                          className="w-6 h-6 rounded text-muted hover:text-red-500 text-xs"
                          aria-label="Retirer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addAttribute(entity.id)}
                      className="text-[11px] px-2 py-0.5 rounded text-muted hover:text-foreground hover:bg-accent/10 transition"
                    >
                      + attribut
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addEntity}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Ajouter une entité
          </button>

          {state.entities.length >= 2 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold">Relations</div>
              {state.relations.map((rel) => (
                <div
                  key={rel.id}
                  className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto] gap-1 items-center"
                >
                  <select
                    value={rel.fromEntityId}
                    onChange={(e) => updateRelation(rel.id, { fromEntityId: e.target.value })}
                    className="h-8 px-2 text-xs rounded border border-border bg-card font-mono"
                  >
                    {state.entities.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name || "?"}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rel.type}
                    onChange={(e) =>
                      updateRelation(rel.id, { type: e.target.value as RelationType })
                    }
                    className="h-8 px-2 text-xs rounded border border-border bg-card font-mono"
                  >
                    {RELATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rel.toEntityId}
                    onChange={(e) => updateRelation(rel.id, { toEntityId: e.target.value })}
                    className="h-8 px-2 text-xs rounded border border-border bg-card font-mono"
                  >
                    {state.entities.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name || "?"}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={rel.label}
                    onChange={(e) => updateRelation(rel.id, { label: e.target.value })}
                    placeholder="Label"
                    className="h-8 px-2 text-xs rounded border border-border bg-card text-muted col-span-2"
                  />
                  <button
                    onClick={() => removeRelation(rel.id)}
                    className="w-7 h-7 rounded text-muted hover:text-red-500 text-xs"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addRelation}
                className="text-xs px-3 py-1 rounded border border-border hover:bg-accent/10 transition"
              >
                + Relation
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
