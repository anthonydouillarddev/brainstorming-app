"use client";

import { useState } from "react";
import type { Field } from "@/lib/sections";

export interface LinkItem {
  title: string;
  url: string;
  tag: string;
}

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
      <label className="block text-sm font-semibold mb-1">{field.label}</label>
      {field.hint && (
        <p className="text-xs text-muted mb-2 pl-0.5 border-l-2 border-accent/30 ml-0.5 px-2">
          {field.hint}
        </p>
      )}
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
      <label className="block text-sm font-semibold mb-1">{field.label}</label>
      {field.hint && (
        <p className="text-xs text-muted mb-2 pl-0.5 border-l-2 border-accent/30 ml-0.5 px-2">
          {field.hint}
        </p>
      )}
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
  const tags = ["TikTok", "YouTube", "Article", "Produit", "Design", "Doc", "Autre"];

  function addLink() {
    if (!newUrl.trim()) return;
    const safeUrl = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
    let title = newTitle.trim();
    if (!title) {
      try {
        title = new URL(safeUrl).hostname;
      } catch {
        title = safeUrl;
      }
    }
    onChange([...value, { title, url: safeUrl, tag: newTag }]);
    setNewUrl("");
    setNewTitle("");
    setNewTag("Autre");
  }

  function removeLink(index: number) {
    onChange(value.filter((_, i) => i !== index));
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

  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{field.label}</label>
      {field.hint && <p className="text-xs text-muted mb-2">{field.hint}</p>}

      {value.length > 0 && (
        <div className="space-y-2 mb-3">
          {value.map((link, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-background/60 border border-border rounded-xl px-3 py-2"
            >
              <span className={`text-xs px-2 py-0.5 rounded-full ${tagColors[link.tag] || tagColors.Autre}`}>
                {link.tag}
              </span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline truncate flex-1"
              >
                {link.title}
              </a>
              <button
                onClick={() => removeLink(i)}
                className="text-muted hover:text-red-400 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 bg-background/60 border border-border rounded-xl p-3">
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Coller le lien ici..."
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
            className="px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
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
