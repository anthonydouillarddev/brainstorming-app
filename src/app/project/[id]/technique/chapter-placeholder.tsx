"use client";

import type { TechniqueChapter } from "./chapters";

export default function ChapterPlaceholder({ chapter }: { chapter: TechniqueChapter }) {
  return (
    <div className="bg-card/60 border border-dashed border-border rounded-2xl p-10 text-center space-y-4">
      <div className="text-6xl">{chapter.emoji}</div>
      <div>
        <h2 className="text-2xl font-bold mb-1">
          {chapter.num}. {chapter.label}
        </h2>
        <p className="text-sm text-muted">{chapter.hint}</p>
      </div>
      <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
        🚧 En développement — disponible bientôt
      </div>
      <p className="text-xs text-muted max-w-md mx-auto">
        Ce chapitre fait partie des 12 sections de l&apos;onglet Technique. La recherche est
        consolidée dans <code className="px-1 py-0.5 rounded bg-background/60 text-[10px]">TECHNIQUE-RESEARCH.md</code>{" "}
        à la racine du projet. L&apos;implémentation suit l&apos;ordre séquentiel 1 → 12.
      </p>
    </div>
  );
}
