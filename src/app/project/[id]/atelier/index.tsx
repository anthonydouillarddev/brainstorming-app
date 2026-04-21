"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Decision, DevItem, Project, Todo } from "@/lib/types";
import type { AtelierView, Note, SchemaRow } from "./types";
import NotesView from "./notes/NotesView";
import SchemasView from "./schemas/SchemasView";

const VIEW_STORAGE_KEY = "mindeck:atelier:view";

function readInitialView(): AtelierView {
  if (typeof window === "undefined") return "notes";
  const raw = window.localStorage.getItem(VIEW_STORAGE_KEY);
  return raw === "schemas" ? "schemas" : "notes";
}

type Props = {
  userId: string;
  project: Project;
  tasks: Todo[];
  ideas: Todo[];
  decisions: Decision[];
  onNavigate: (slug: string, options?: { id?: string }) => void;
};

export default function AtelierPanel({
  userId,
  project,
  tasks,
  ideas,
  decisions,
  onNavigate,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [view, setView] = useState<AtelierView>(() => readInitialView());
  const [notes, setNotes] = useState<Note[]>([]);
  const [schemas, setSchemas] = useState<SchemaRow[]>([]);
  const [devItems, setDevItems] = useState<DevItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  function persistView(next: AtelierView) {
    setView(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // localStorage indisponible (private mode, quota) — on ignore silencieusement
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setFetchError(null);
      const [notesRes, schemasRes, devRes] = await Promise.all([
        supabase
          .from("notes")
          .select("*")
          .eq("project_id", project.id)
          .order("pinned", { ascending: false })
          .order("updated_at", { ascending: false }),
        supabase
          .from("schemas")
          .select("*")
          .eq("project_id", project.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("dev_items")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false }),
      ]);
      if (cancelled) return;
      const firstError =
        notesRes.error?.message ??
        schemasRes.error?.message ??
        devRes.error?.message ??
        null;
      if (firstError) {
        setFetchError(firstError);
        setLoading(false);
        return;
      }
      setNotes((notesRes.data ?? []) as Note[]);
      setSchemas((schemasRes.data ?? []) as SchemaRow[]);
      setDevItems((devRes.data ?? []) as DevItem[]);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase, project.id, userId]);

  const handleSwitch = useCallback((next: AtelierView) => {
    persistView(next);
  }, []);

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Vue Atelier"
        className="inline-flex bg-card/60 backdrop-blur-sm border border-border rounded-xl p-1"
      >
        <ToggleButton
          active={view === "notes"}
          onClick={() => handleSwitch("notes")}
          ariaControls="atelier-notes-panel"
        >
          📝 Notes
        </ToggleButton>
        <ToggleButton
          active={view === "schemas"}
          onClick={() => handleSwitch("schemas")}
          ariaControls="atelier-schemas-panel"
        >
          🗺️ Schémas
        </ToggleButton>
      </div>

      {fetchError && (
        <div
          role="alert"
          className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-500"
        >
          Erreur de chargement : {fetchError}
        </div>
      )}

      {loading ? (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-10 text-center text-muted">
          Chargement de l&apos;atelier…
        </div>
      ) : view === "notes" ? (
        <div id="atelier-notes-panel" role="tabpanel">
          <NotesView
            userId={userId}
            projectId={project.id}
            initialNotes={notes}
            onNotesChange={setNotes}
            tasks={tasks}
            ideas={ideas}
            decisions={decisions}
            devItems={devItems}
            onNavigate={onNavigate}
          />
        </div>
      ) : (
        <div id="atelier-schemas-panel" role="tabpanel">
          <SchemasView
            userId={userId}
            projectId={project.id}
            initialSchemas={schemas}
            onSchemasChange={setSchemas}
            tasks={tasks}
            ideas={ideas}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  ariaControls,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaControls: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={ariaControls}
      onClick={onClick}
      className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-accent text-white shadow-sm"
          : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
