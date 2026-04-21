"use client";

import { useState } from "react";
import { SCHEMA_TEMPLATES } from "../types";
import type { SchemaRow, SchemaTemplate } from "../types";
import TemplateModal from "./TemplateModal";

type Props = {
  schemas: SchemaRow[];
  creating: boolean;
  onOpen: (id: string) => void;
  onCreate: (template: SchemaTemplate) => void;
  onDelete: (id: string) => void;
};

export default function Gallery({
  schemas,
  creating,
  onOpen,
  onCreate,
  onDelete,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function handlePick(template: SchemaTemplate) {
    setPickerOpen(false);
    onCreate(template);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-base font-semibold">
          Schémas ({schemas.length})
        </h3>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={creating}
          className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-60"
        >
          {creating ? "Création…" : "+ Nouveau schéma"}
        </button>
      </div>

      {schemas.length === 0 ? (
        <EmptyState onOpenPicker={() => setPickerOpen(true)} creating={creating} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {schemas.map((s) => (
            <SchemaCard
              key={s.id}
              schema={s}
              onOpen={() => onOpen(s.id)}
              onDelete={() => onDelete(s.id)}
            />
          ))}
        </div>
      )}

      {pickerOpen && (
        <TemplateModal onClose={() => setPickerOpen(false)} onPick={handlePick} />
      )}
    </div>
  );
}

function SchemaCard({
  schema,
  onOpen,
  onDelete,
}: {
  schema: SchemaRow;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const meta = SCHEMA_TEMPLATES.find((t) => t.value === schema.template);
  const nodeCount = schema.data?.nodes?.length ?? 0;
  const edgeCount = schema.data?.edges?.length ?? 0;
  return (
    <div className="group bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all relative">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={`Ouvrir ${schema.name}`}
      >
        <div className="aspect-[4/3] bg-background/40 border-b border-border flex items-center justify-center relative overflow-hidden">
          {schema.thumbnail ? (
            <div
              className="w-full h-full flex items-center justify-center p-4"
              dangerouslySetInnerHTML={{ __html: schema.thumbnail }}
            />
          ) : (
            <span className="text-5xl">{meta?.emoji ?? "⬜"}</span>
          )}
        </div>
        <div className="p-4">
          <div className="font-medium text-sm truncate">
            {schema.name || "Sans titre"}
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-1">
            <span>
              {meta?.emoji} {meta?.label ?? "Canvas"}
            </span>
            <span>·</span>
            <span>
              {nodeCount} nœud{nodeCount > 1 ? "s" : ""}
            </span>
            {edgeCount > 0 && (
              <>
                <span>·</span>
                <span>
                  {edgeCount} lien{edgeCount > 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-card/90 border border-border text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Supprimer"
        title="Supprimer"
      >
        🗑️
      </button>
    </div>
  );
}

function EmptyState({
  onOpenPicker,
  creating,
}: {
  onOpenPicker: () => void;
  creating: boolean;
}) {
  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-10 text-center">
      <div className="text-5xl mb-3">🗺️</div>
      <h3 className="text-lg font-semibold mb-2">Aucun schéma pour l&apos;instant</h3>
      <p className="text-muted text-sm mb-6 max-w-md mx-auto">
        Crée un schéma pour visualiser tes idées avec des nœuds et des liaisons.
      </p>
      <button
        type="button"
        onClick={onOpenPicker}
        disabled={creating}
        className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-60"
      >
        {creating ? "Création…" : "+ Créer un schéma"}
      </button>
    </div>
  );
}
