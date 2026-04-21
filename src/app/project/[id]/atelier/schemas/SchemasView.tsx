"use client";

import { useCallback, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Todo } from "@/lib/types";
import type { SchemaRow, SchemaTemplate } from "../types";
import { buildTemplate } from "@/lib/atelier/templates";
import Gallery from "./Gallery";
import Canvas from "./Canvas";

type Props = {
  userId: string;
  projectId: string;
  initialSchemas: SchemaRow[];
  onSchemasChange: (schemas: SchemaRow[]) => void;
  tasks: Todo[];
  ideas: Todo[];
  onNavigate: (slug: string, options?: { id?: string }) => void;
};

export default function SchemasView({
  userId,
  projectId,
  initialSchemas,
  onSchemasChange,
  tasks,
  ideas,
  onNavigate,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [schemas, setSchemas] = useState<SchemaRow[]>(initialSchemas);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const commit = useCallback(
    (next: SchemaRow[]) => {
      setSchemas(next);
      onSchemasChange(next);
    },
    [onSchemasChange]
  );

  const openSchema = schemas.find((s) => s.id === openId) ?? null;

  const handleCreate = useCallback(
    async (template: SchemaTemplate) => {
      if (creating) return;
      setCreating(true);
      setError(null);
      const data = buildTemplate(template);
      const defaultName = defaultNameFor(template);
      const { data: inserted, error } = await supabase
        .from("schemas")
        .insert({
          user_id: userId,
          project_id: projectId,
          name: defaultName,
          template,
          data,
        })
        .select("*")
        .single();
      setCreating(false);
      if (error || !inserted) {
        setError(error?.message ?? "Erreur inconnue");
        return;
      }
      const created = inserted as SchemaRow;
      commit([created, ...schemas]);
      setOpenId(created.id);
    },
    [creating, supabase, userId, projectId, schemas, commit]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Supprimer ce schéma ? Action irréversible.")) return;
      const previous = schemas;
      const next = schemas.filter((s) => s.id !== id);
      commit(next);
      if (openId === id) setOpenId(null);
      const { error } = await supabase.from("schemas").delete().eq("id", id);
      if (error) {
        commit(previous);
        setError(error.message);
      }
    },
    [schemas, openId, commit, supabase]
  );

  const handleRename = useCallback(
    (id: string, name: string) => {
      const next = schemas.map((s) =>
        s.id === id ? { ...s, name, updated_at: new Date().toISOString() } : s
      );
      commit(next);
    },
    [schemas, commit]
  );

  const handleDataUpdate = useCallback(
    (id: string, patch: Partial<SchemaRow>) => {
      const next = schemas.map((s) =>
        s.id === id
          ? { ...s, ...patch, updated_at: new Date().toISOString() }
          : s
      );
      commit(next);
    },
    [schemas, commit]
  );

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-500"
        >
          {error}
        </div>
      )}

      {openSchema ? (
        <Canvas
          schema={openSchema}
          tasks={tasks}
          ideas={ideas}
          onRename={(name) => handleRename(openSchema.id, name)}
          onDataUpdate={(patch) => handleDataUpdate(openSchema.id, patch)}
          onBack={() => setOpenId(null)}
          onNavigate={onNavigate}
        />
      ) : (
        <Gallery
          schemas={schemas}
          creating={creating}
          onOpen={(id) => setOpenId(id)}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function defaultNameFor(template: SchemaTemplate): string {
  switch (template) {
    case "pieuvre":
      return "Nouvelle pieuvre";
    case "arbre":
      return "Nouvel arbre";
    case "mindmap":
      return "Nouvelle mind map";
    case "flow":
      return "Nouveau user flow";
    case "archi":
      return "Nouvelle architecture";
    case "blank":
    default:
      return "Sans titre";
  }
}
