"use client";

import type { DesignChapter } from "./chapters";

export default function ChapterPlaceholder({ chapter }: { chapter: DesignChapter }) {
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
        Ce chapitre fait partie des 12 sections de recherche design identifiées. Il sera livré dans
        une prochaine itération. Le chapitre <strong>Visuel (6)</strong> est déjà disponible et
        contient tout ce dont tu as besoin pour démarrer.
      </p>
    </div>
  );
}
