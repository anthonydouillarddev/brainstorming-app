"use client";

import { makeEntityId, type ArchitectureState, type Entity, type PkStrategy } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const PK_STRATEGIES: { value: PkStrategy; label: string; hint: string }[] = [
  { value: "uuid", label: "UUID v4", hint: "Recommandé — pas de leak d'ID" },
  { value: "serial", label: "Serial (autoincrement)", hint: "Simple mais leak taille DB" },
  { value: "nanoid", label: "nanoid", hint: "Plus court que UUID, url-friendly" },
  { value: "snowflake", label: "Snowflake", hint: "Distribué, timestamp-based" },
];

const SOFT_DELETE: { value: ArchitectureState["softDelete"]; label: string; hint: string }[] = [
  { value: "yes", label: "Oui", hint: "deleted_at timestamp. Corbeille, GDPR-friendly." },
  { value: "no", label: "Non", hint: "Hard delete. Simple mais pas de récupération." },
  { value: "per-entity", label: "Variable", hint: "Certaines tables soft, d'autres hard." },
];

export default function EntitiesBlock({
  state,
  onChange,
}: {
  state: ArchitectureState;
  onChange: (patch: Partial<ArchitectureState>) => void;
}) {
  const validEntities = state.entities.filter((e) => e.name.trim().length > 0).length;
  const filled =
    (validEntities >= 3 ? 1 : 0) +
    (state.pkStrategy ? 1 : 0) +
    (state.softDelete ? 1 : 0) +
    (state.erDiagramUrl.trim().length > 0 ? 1 : 0);

  function addEntity() {
    const next: Entity = { id: makeEntityId(), name: "", description: "" };
    onChange({ entities: [...state.entities, next] });
  }

  function updateEntity(id: string, patch: Partial<Entity>) {
    onChange({
      entities: state.entities.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  }

  function removeEntity(id: string) {
    onChange({ entities: state.entities.filter((e) => e.id !== id) });
  }

  return (
    <CollapsibleSection
      emoji="🗂️"
      title="Modèle de données"
      description="Liste les tables principales + stratégie PK + soft delete. Évite les migrations coûteuses."
      filled={filled}
      total={4}
      storageKey="mindeck:technique:architecture:entities:open"
    >
      {/* Entities list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">Entités principales</span>
          <button
            type="button"
            onClick={addEntity}
            className="text-[11px] px-2 py-1 rounded-lg bg-card border border-border hover:border-accent hover:text-accent transition"
          >
            + Ajouter entité
          </button>
        </div>
        {state.entities.length === 0 && (
          <p className="text-[11px] text-muted bg-background/60 border border-dashed border-border rounded-xl p-3">
            Ex: <code>projects</code>, <code>sections</code>, <code>todos</code>, <code>decisions</code>, <code>risks</code>…
          </p>
        )}
        {state.entities.map((e) => (
          <div key={e.id} className="flex items-start gap-2">
            <input
              type="text"
              value={e.name}
              onChange={(ev) => updateEntity(e.id, { name: ev.target.value })}
              placeholder="nom_table"
              className="w-40 bg-background border border-border rounded-lg px-2 py-1 text-xs font-mono"
            />
            <input
              type="text"
              value={e.description}
              onChange={(ev) => updateEntity(e.id, { description: ev.target.value })}
              placeholder="Description courte (ex: projets soft-deletable par user)"
              className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-xs"
            />
            <button
              type="button"
              onClick={() => removeEntity(e.id)}
              className="text-xs text-muted hover:text-red-500 px-1"
              aria-label="Supprimer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* PK strategy */}
      <div>
        <div className="text-xs font-semibold mb-2">PK strategy</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {PK_STRATEGIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange({ pkStrategy: p.value })}
              className={`text-left rounded-xl border p-2.5 transition ${
                state.pkStrategy === p.value
                  ? "bg-accent/10 border-accent"
                  : "bg-background border-border hover:border-accent/50"
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">{p.label}</div>
              <div className="text-[11px] text-muted">{p.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Soft delete */}
      <div>
        <div className="text-xs font-semibold mb-2">Soft delete</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {SOFT_DELETE.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange({ softDelete: s.value })}
              className={`text-left rounded-xl border p-2.5 transition ${
                state.softDelete === s.value
                  ? "bg-accent/10 border-accent"
                  : "bg-background border-border hover:border-accent/50"
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">{s.label}</div>
              <div className="text-[11px] text-muted">{s.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Diagramme ER (URL ou Mermaid inline)</span>
        <span className="block text-[11px] text-muted">
          Optionnel : lien vers draw.io, Mermaid Live, ou dbdiagram.io
        </span>
        <input
          type="text"
          value={state.erDiagramUrl}
          onChange={(e) => onChange({ erDiagramUrl: e.target.value })}
          placeholder="https://dbdiagram.io/d/..."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>
    </CollapsibleSection>
  );
}
