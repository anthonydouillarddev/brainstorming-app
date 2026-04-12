"use client";

import { useState } from "react";
import type { Field } from "@/lib/sections";

export type LinkStatus = "unread" | "in_progress" | "done";

export interface LinkItem {
  title: string;
  url: string;
  tag: string;
  status?: LinkStatus;
}

export const LINK_STATUSES: { value: LinkStatus; label: string; emoji: string; color: string }[] = [
  { value: "unread", label: "Pas ouvert", emoji: "⚪", color: "text-muted" },
  { value: "in_progress", label: "En cours", emoji: "🔵", color: "text-blue-500" },
  { value: "done", label: "Traité", emoji: "✅", color: "text-green-500" },
];

export function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  switch (field.type) {
    case "question":
      return <QuestionField field={field} value={(value as string) || ""} onChange={onChange} />;
    case "text":
      return <TextField field={field} value={(value as string) || ""} onChange={onChange} />;
    case "choice":
      return <ChoiceField field={field} value={(value as string[]) || []} onChange={onChange} />;
    case "links":
      return <LinksField field={field} value={(value as LinkItem[]) || []} onChange={onChange} />;
    case "score":
      return <ScoreField field={field} value={(value as number) || 0} onChange={onChange} />;
    default:
      return null;
  }
}

function FieldHeader({ field }: { field: Field }) {
  return (
    <>
      <label className="block text-sm font-semibold mb-1">{field.label}</label>
      {field.hint && (
        <p className="text-xs text-muted mb-2 pl-0.5 border-l-2 border-accent/30 ml-0.5 px-2">
          {field.hint}
        </p>
      )}
      {field.tools && field.tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-[10px] uppercase tracking-wider text-muted font-semibold self-center">
            Outils
          </span>
          {field.tools.map((tool) => (
            <a
              key={tool.url}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted hover:text-accent hover:border-accent/50 transition-colors inline-flex items-center gap-0.5"
            >
              {tool.label}
              <span className="text-[9px]">↗</span>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function Suggestions({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (val: string) => void;
}) {
  if (!field.suggestions || field.suggestions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {field.suggestions.map((sug) => {
        const isActive = value.trim() === sug.value;
        return (
          <span
            key={sug.value}
            className={`inline-flex items-center rounded-full border text-xs overflow-hidden transition-colors ${
              isActive
                ? "bg-accent/15 border-accent/50 text-accent"
                : "bg-background/60 border-border text-muted hover:text-foreground hover:border-muted"
            }`}
          >
            <button
              type="button"
              onClick={() => onChange(isActive ? "" : sug.value)}
              className="px-2.5 py-1"
              title={isActive ? "Cliquer pour retirer" : `Choisir ${sug.value}`}
            >
              {isActive ? "✓ " : ""}
              {sug.value}
            </button>
            {sug.doc && (
              <a
                href={sug.doc}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1.5 py-1 border-l border-border/60 hover:text-accent transition-colors"
                title={`Doc ${sug.value}`}
                onClick={(e) => e.stopPropagation()}
              >
                ↗
              </a>
            )}
          </span>
        );
      })}
    </div>
  );
}

function QuestionField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <FieldHeader field={field} />
      <Suggestions field={field} value={value} onChange={onChange} />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={2}
        className="w-full px-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder:text-muted/30 outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-y min-h-[60px] transition-all"
      />
    </div>
  );
}

function TextField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <FieldHeader field={field} />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className="w-full px-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder:text-muted/30 outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-y min-h-[120px] transition-all"
      />
    </div>
  );
}

function ChoiceField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  function toggle(option: string) {
    if (value.includes(option)) onChange(value.filter((v) => v !== option));
    else onChange([...value, option]);
  }
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{field.label}</label>
      {field.hint && (
        <p className="text-xs text-muted mb-2 pl-0.5 border-l-2 border-accent/30 ml-0.5 px-2">
          {field.hint}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {field.options?.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`text-sm px-3.5 py-2 rounded-xl border transition-all ${
              value.includes(option)
                ? "bg-accent/15 border-accent/50 text-accent font-medium shadow-sm"
                : "bg-background/60 border-border text-muted hover:text-foreground hover:border-muted"
            }`}
          >
            {value.includes(option) ? "✓ " : ""}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function LinksField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: LinkItem[];
  onChange: (val: LinkItem[]) => void;
}) {
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("Autre");
  const [isDragOver, setIsDragOver] = useState(false);
  const tags = ["TikTok", "YouTube", "Article", "Produit", "Design", "Doc", "Autre"];

  function addLinkFromUrl(rawUrl: string) {
    const trimmed = rawUrl.trim();
    if (!trimmed) return;
    const safeUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    let title = newTitle.trim();
    if (!title) {
      try {
        title = new URL(safeUrl).hostname.replace(/^www\./, "");
      } catch {
        title = safeUrl;
      }
    }
    onChange([...value, { title, url: safeUrl, tag: newTag, status: "unread" }]);
    setNewUrl("");
    setNewTitle("");
    setNewTag("Autre");
  }

  function addLink() {
    addLinkFromUrl(newUrl);
  }

  function removeLink(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateLink(index: number, patch: Partial<LinkItem>) {
    onChange(value.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function cycleStatus(current: LinkStatus | undefined): LinkStatus {
    const order: LinkStatus[] = ["unread", "in_progress", "done"];
    const idx = order.indexOf(current ?? "unread");
    return order[(idx + 1) % order.length];
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const uri = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (uri) addLinkFromUrl(uri);
  }

  const tagColors: Record<string, string> = {
    TikTok: "bg-pink-500/15 text-pink-500",
    YouTube: "bg-red-500/15 text-red-500",
    Article: "bg-blue-500/15 text-blue-500",
    Produit: "bg-green-500/15 text-green-500",
    Design: "bg-purple-500/15 text-purple-500",
    Doc: "bg-cyan-500/15 text-cyan-500",
    Autre: "bg-muted/15 text-muted",
  };

  // Sort: unread → in_progress → done
  const statusOrder: Record<LinkStatus, number> = { unread: 0, in_progress: 1, done: 2 };
  const sortedValue = [...value]
    .map((link, originalIndex) => ({ link, originalIndex }))
    .sort((a, b) => {
      const sa = statusOrder[a.link.status ?? "unread"];
      const sb = statusOrder[b.link.status ?? "unread"];
      return sa - sb;
    });

  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{field.label}</label>
      {field.hint && <p className="text-xs text-muted mb-2">{field.hint}</p>}

      {sortedValue.length > 0 && (
        <div className="space-y-2 mb-3">
          {sortedValue.map(({ link, originalIndex }) => {
            const status = link.status ?? "unread";
            const statusInfo = LINK_STATUSES.find((s) => s.value === status) ?? LINK_STATUSES[0];
            const isDone = status === "done";
            return (
              <div
                key={originalIndex}
                className={`flex items-center gap-2 bg-background/60 border border-border rounded-xl px-3 py-2 transition-opacity ${
                  isDone ? "opacity-60" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => updateLink(originalIndex, { status: cycleStatus(status) })}
                  className={`text-sm shrink-0 ${statusInfo.color} hover:scale-110 transition-transform`}
                  title={`${statusInfo.label} — clic pour changer`}
                  aria-label={`Statut : ${statusInfo.label}`}
                >
                  {statusInfo.emoji}
                </button>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    tagColors[link.tag] || tagColors.Autre
                  }`}
                >
                  {link.tag}
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm text-accent hover:underline truncate flex-1 ${
                    isDone ? "line-through" : ""
                  }`}
                >
                  {link.title}
                </a>
                <button
                  onClick={() => removeLink(originalIndex)}
                  className="text-muted hover:text-red-400 text-xs shrink-0"
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`space-y-2 rounded-xl p-3 border transition-all ${
          isDragOver
            ? "bg-accent/10 border-accent/60 border-dashed"
            : "bg-background/60 border-border"
        }`}
      >
        {isDragOver && (
          <p className="text-xs text-accent text-center font-medium py-1">
            Déposer le lien ici
          </p>
        )}
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Coller ou glisser-déposer un lien..."
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-1 focus:ring-accent"
          onKeyDown={(e) => e.key === "Enter" && addLink()}
        />
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titre (optionnel)"
            className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-1 focus:ring-accent"
          />
          <select
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="px-2 py-2 bg-card border border-border rounded-lg text-sm text-foreground outline-none"
          >
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addLink}
            className="px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent-hover transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: number;
  onChange: (val: number) => void;
}) {
  const max = field.max || 10;
  return (
    <div className="flex items-center gap-3 py-1">
      <label className="text-sm font-medium flex-1">{field.label}</label>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? 0 : n)}
            className={`w-7 h-7 rounded text-xs font-medium transition-all ${
              n <= value
                ? n <= 3
                  ? "bg-red-600 text-white"
                  : n <= 6
                  ? "bg-yellow-600 text-white"
                  : "bg-green-600 text-white"
                : "bg-background/60 border border-border text-muted hover:text-foreground"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <span
        className={`text-sm font-bold w-8 text-right ${
          value <= 3 ? "text-red-400" : value <= 6 ? "text-yellow-400" : "text-green-400"
        }`}
      >
        {value > 0 ? value : "—"}
      </span>
    </div>
  );
}
