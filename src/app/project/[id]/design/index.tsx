"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { DESIGN_CHAPTERS, type DesignChapterKey } from "./chapters";
import ChapterPlaceholder from "./chapter-placeholder";
import VisualChapter from "./visual";
import FoundationsChapter from "./foundations";
import IdentityChapter from "./identity";
import InfoNavChapter from "./info-nav";
import FlowsChapter from "./flows";
import PrinciplesChapter from "./principles";

const LS_ACTIVE_CHAPTER = "mindeck_design_active_chapter";

export default function DesignPanel({
  project,
  initialSections,
  onProjectUpdate,
  onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const [activeKey, setActiveKey] = useState<DesignChapterKey>("visual");

  // Restaure le dernier chapitre ouvert
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(LS_ACTIVE_CHAPTER);
    if (saved && DESIGN_CHAPTERS.some((c) => c.key === saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveKey(saved as DesignChapterKey);
    }
  }, []);

  function selectChapter(key: DesignChapterKey) {
    setActiveKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_ACTIVE_CHAPTER, key);
    }
  }

  const activeChapter = DESIGN_CHAPTERS.find((c) => c.key === activeKey)!;

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* ─── MENU VERTICAL (12 chapitres) ─── */}
      <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-4">
        <nav className="bg-card/60 border border-border rounded-xl p-2 space-y-0.5">
          {DESIGN_CHAPTERS.map((chapter) => {
            const isActive = chapter.key === activeKey;
            const isReady = chapter.status === "ready";
            return (
              <button
                key={chapter.key}
                onClick={() => selectChapter(chapter.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                  isActive
                    ? "bg-accent text-white"
                    : "hover:bg-accent/10 text-foreground"
                }`}
              >
                <span className="text-base">{chapter.emoji}</span>
                <span className="flex-1 truncate">
                  <span className="opacity-60 mr-1">{chapter.num}.</span>
                  {chapter.label}
                </span>
                {isReady ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-white" : "bg-green-500"
                    }`}
                    title="Prêt"
                  />
                ) : (
                  <span
                    className={`text-[9px] font-mono uppercase px-1 py-0.5 rounded ${
                      isActive ? "bg-white/20" : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-3 text-[11px] text-muted px-2 leading-relaxed">
          12 chapitres issus de la recherche design. <strong>6 prêts</strong> (Fondations,
          Identité, Info &amp; Nav, Parcours, Principes UX, Visuel) · 6 en dev.
        </div>
      </aside>

      {/* ─── CONTENU DU CHAPITRE ACTIF ─── */}
      <main className="flex-1 min-w-0 w-full">
        {activeKey === "visual" ? (
          <VisualChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "foundations" ? (
          <FoundationsChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "identity" ? (
          <IdentityChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "info-nav" ? (
          <InfoNavChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "flows" ? (
          <FlowsChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "principles" ? (
          <PrinciplesChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : (
          <ChapterPlaceholder chapter={activeChapter} />
        )}
      </main>
    </div>
  );
}
