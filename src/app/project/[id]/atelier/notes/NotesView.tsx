"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Decision, DevItem, Todo } from "@/lib/types";
import type { Note } from "../types";
import NotesSidebar from "./NotesSidebar";
import NoteEditor from "./NoteEditor";

type Props = {
  userId: string;
  projectId: string;
  initialNotes: Note[];
  onNotesChange: (notes: Note[]) => void;
  tasks: Todo[];
  ideas: Todo[];
  decisions: Decision[];
  devItems: DevItem[];
  onNavigate: (slug: string) => void;
};

export default function NotesView({
  userId,
  projectId,
  initialNotes,
  onNotesChange,
  tasks,
  ideas,
  decisions,
  devItems,
  onNavigate,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialNotes[0]?.id ?? null
  );
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const commit = useCallback(
    (next: Note[]) => {
      setNotes(next);
      onNotesChange(next);
    },
    [onNotesChange]
  );

  const sorted = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
  }, [notes]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  );

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    setError(null);
    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        project_id: projectId,
        title: "Sans titre",
        content: "",
        pinned: false,
      })
      .select("*")
      .single();
    setCreating(false);
    if (error || !data) {
      setError(error?.message ?? "Erreur inconnue");
      return;
    }
    const created = data as Note;
    commit([created, ...notes]);
    setSelectedId(created.id);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette note ? Action irréversible.")) return;
    const previous = notes;
    const next = notes.filter((n) => n.id !== id);
    commit(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? null);
    }
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      commit(previous);
      setError(error.message);
    }
  }

  const handleUpdate = useCallback(
    (id: string, patch: Partial<Note>) => {
      const next = notes.map((n) =>
        n.id === id
          ? { ...n, ...patch, updated_at: new Date().toISOString() }
          : n
      );
      commit(next);
    },
    [notes, commit]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 min-h-[620px]">
      <NotesSidebar
        notes={sorted}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        creating={creating}
        error={error}
      />
      {selectedNote ? (
        <NoteEditor
          key={selectedNote.id}
          note={selectedNote}
          tasks={tasks}
          ideas={ideas}
          decisions={decisions}
          devItems={devItems}
          onPatch={(patch) => handleUpdate(selectedNote.id, patch)}
          onDelete={() => handleDelete(selectedNote.id)}
          onNavigate={onNavigate}
        />
      ) : (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">Aucune note sélectionnée</h3>
          <p className="text-muted text-sm max-w-sm">
            Crée ta première note avec le bouton{" "}
            <span className="font-medium">+ Nouvelle note</span>.
          </p>
        </div>
      )}
    </div>
  );
}
