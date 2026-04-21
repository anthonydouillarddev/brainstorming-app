"use client";

import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Decision, DevItem, Todo } from "@/lib/types";
import type { LinkTarget, Note } from "../types";
import { useDebouncedRowSave } from "../_shared/useDebouncedRowSave";
import LinkPicker from "./LinkPicker";

type Props = {
  note: Note;
  tasks: Todo[];
  ideas: Todo[];
  decisions: Decision[];
  devItems: DevItem[];
  onPatch: (patch: Partial<Note>) => void;
  onDelete: () => void;
  onNavigate: (slug: string, options?: { id?: string }) => void;
};

type Mode = "edit" | "preview";

export default function NoteEditor({
  note,
  tasks,
  ideas,
  decisions,
  devItems,
  onPatch,
  onDelete,
  onNavigate,
}: Props) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [mode, setMode] = useState<Mode>("edit");
  const [linkerOpen, setLinkerOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const { save, saving, lastSaved, saveError } = useDebouncedRowSave<Note>({
    table: "notes",
    id: note.id,
    delayMs: 2000,
  });

  // Re-sync quand la note change : le parent fournit key={note.id} donc le composant
  // remount et l'initial state de useState reprend les nouvelles valeurs — pas besoin
  // d'useEffect pour synchroniser.

  const patch = useCallback(
    (next: Partial<Note>) => {
      onPatch(next);
      save(next);
    },
    [onPatch, save]
  );

  const tags = note.tags ?? [];

  function addTag(raw: string) {
    const cleaned = raw.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 30);
    if (!cleaned || tags.includes(cleaned)) return;
    patch({ tags: [...tags, cleaned] });
    setTagInput("");
  }

  function removeTag(tag: string) {
    patch({ tags: tags.filter((t) => t !== tag) });
  }

  function handleTitle(value: string) {
    setTitle(value);
    patch({ title: value });
  }

  function handleContent(value: string) {
    setContent(value);
    patch({ content: value });
  }

  function togglePin() {
    patch({ pinned: !note.pinned });
  }

  function currentLink(): LinkTarget | null {
    if (note.linked_todo_id) return { kind: "todo", id: note.linked_todo_id };
    if (note.linked_decision_id)
      return { kind: "decision", id: note.linked_decision_id };
    if (note.linked_dev_item_id)
      return { kind: "dev_item", id: note.linked_dev_item_id };
    return null;
  }

  function applyLink(target: LinkTarget | null) {
    patch({
      linked_todo_id: target?.kind === "todo" ? target.id : null,
      linked_decision_id: target?.kind === "decision" ? target.id : null,
      linked_dev_item_id: target?.kind === "dev_item" ? target.id : null,
    });
    setLinkerOpen(false);
  }

  function navigateToLink() {
    const link = currentLink();
    if (!link) return;
    if (link.kind === "todo") onNavigate("tasks", { id: link.id });
    else if (link.kind === "decision")
      onNavigate("decisions", { id: link.id });
    // dev_item : pas d'onglet dédié dans le projet, fallback sur l'accueil
  }

  const link = currentLink();
  const linkLabel = linkLabelFor(link, tasks, ideas, decisions, devItems);

  return (
    <main className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col gap-4 min-h-[620px]">
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <input
            value={title}
            onChange={(e) => handleTitle(e.target.value)}
            placeholder="Titre de la note"
            className="flex-1 text-xl font-semibold bg-transparent border-none outline-none focus:ring-0 min-w-0"
            aria-label="Titre"
          />
          <div className="flex items-center gap-1 shrink-0">
            <IconButton
              active={note.pinned}
              onClick={togglePin}
              label={note.pinned ? "Désépingler" : "Épingler"}
            >
              📌
            </IconButton>
            <IconButton onClick={onDelete} label="Supprimer" destructive>
              🗑️
            </IconButton>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs text-muted">
          <span>
            {saving
              ? "💾 Enregistrement…"
              : saveError
              ? `⚠ ${saveError}`
              : lastSaved
              ? `💾 Sauvegardé à ${lastSaved}`
              : "💾 Auto-save 2s"}
          </span>
          <button
            type="button"
            onClick={() => setLinkerOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background/60 border border-border rounded-full text-xs hover:border-accent/60 hover:text-accent transition-colors"
          >
            🔗 {link ? "Changer le lien" : "Lier à…"}
          </button>
          {link && (
            <button
              type="button"
              onClick={navigateToLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent/40 rounded-full text-xs text-accent hover:bg-accent/20 transition-colors"
              title="Ouvrir l'élément lié"
            >
              {linkLabel}
            </button>
          )}
          {link && (
            <button
              type="button"
              onClick={() => applyLink(null)}
              className="text-xs text-muted hover:text-red-500 transition-colors"
              title="Retirer le lien"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-accent/10 border border-accent/40 text-accent"
            >
              <span>🏷️ {tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="opacity-70 hover:opacity-100"
                aria-label={`Retirer le tag ${tag}`}
              >
                ✕
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
              } else if (e.key === "Backspace" && !tagInput && tags.length) {
                removeTag(tags[tags.length - 1]);
              }
            }}
            placeholder={tags.length === 0 ? "+ Ajouter un tag…" : "+ Tag"}
            className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-none placeholder:text-muted focus:ring-0"
            aria-label="Ajouter un tag"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModeButton active={mode === "edit"} onClick={() => setMode("edit")}>
          ✏️ Éditer
        </ModeButton>
        <ModeButton
          active={mode === "preview"}
          onClick={() => setMode("preview")}
        >
          👁️ Aperçu
        </ModeButton>
      </div>

      {mode === "edit" ? (
        <textarea
          value={content}
          onChange={(e) => handleContent(e.target.value)}
          placeholder="Écris en markdown…
**gras**, *italique*, # Titre, - liste, [lien](url), ```code```"
          className="flex-1 min-h-[400px] bg-background/40 border border-border rounded-xl p-4 text-sm font-mono resize-none focus:outline-none focus:border-accent/60 leading-relaxed"
          spellCheck={false}
        />
      ) : (
        <div className="flex-1 min-h-[400px] bg-background/40 border border-border rounded-xl p-6 text-sm overflow-y-auto prose-markdown">
          {content.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className="text-muted italic">Note vide</p>
          )}
        </div>
      )}

      {linkerOpen && (
        <LinkPicker
          current={link}
          tasks={tasks}
          ideas={ideas}
          decisions={decisions}
          devItems={devItems}
          onClose={() => setLinkerOpen(false)}
          onPick={applyLink}
        />
      )}
    </main>
  );
}

function IconButton({
  onClick,
  active,
  label,
  destructive,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-8 h-8 rounded-lg text-sm transition-colors inline-flex items-center justify-center ${
        active
          ? "bg-accent/15 text-accent"
          : destructive
          ? "text-muted hover:text-red-500 hover:bg-red-500/10"
          : "text-muted hover:text-foreground hover:bg-background/60"
      }`}
    >
      {children}
    </button>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
        active
          ? "bg-accent/15 text-accent border border-accent/40"
          : "text-muted hover:text-foreground border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function linkLabelFor(
  link: LinkTarget | null,
  tasks: Todo[],
  ideas: Todo[],
  decisions: Decision[],
  devItems: DevItem[]
): string {
  if (!link) return "";
  if (link.kind === "todo") {
    const todo = [...tasks, ...ideas].find((t) => t.id === link.id);
    return todo ? `📋 ${todo.text.slice(0, 40)}` : "📋 Tâche introuvable";
  }
  if (link.kind === "decision") {
    const dec = decisions.find((d) => d.id === link.id);
    return dec ? `🧭 ${dec.title.slice(0, 40)}` : "🧭 Décision introuvable";
  }
  const dev = devItems.find((d) => d.id === link.id);
  return dev ? `🧪 ${dev.title.slice(0, 40)}` : "🧪 Dev item introuvable";
}

// Styles markdown inline pour matcher le design Mindeck
const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-semibold mt-3 mb-1.5" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-3 leading-relaxed" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline"
    />
  ),
  code: ({
    className,
    ...rest
  }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => (
    <code
      className={`bg-background/80 border border-border rounded px-1.5 py-0.5 text-xs font-mono ${className ?? ""}`}
      {...rest}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-background/80 border border-border rounded-xl p-3 text-xs overflow-x-auto mb-3"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-accent/50 pl-4 italic text-muted mb-3"
      {...props}
    />
  ),
  hr: () => <hr className="border-border my-4" />,
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-3">
      <table className="text-xs border border-border rounded-lg" {...props} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="bg-background/60 px-3 py-2 border border-border text-left font-semibold"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-3 py-2 border border-border" {...props} />
  ),
};
