"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { computeAllChaptersCompleteness } from "@/lib/design-completeness";
import { getActiveChapters } from "@/lib/design/gating";
import { useExperienceLevel } from "@/lib/design/use-experience-level";
import { DESIGN_CHAPTERS, type DesignChapterKey } from "./chapters";
import ChapterPlaceholder from "./chapter-placeholder";
import VisualChapter from "./visual";
import FoundationsChapter from "./foundations";
import IdentityChapter from "./identity";
import InfoNavChapter from "./info-nav";
import FlowsChapter from "./flows";
import PrinciplesChapter from "./principles";
import DesignSystemChapter from "./design-system";
import StatesChapter from "./states";
import MicrocopyChapter from "./microcopy";
import A11yChapter from "./a11y";
import AdaptivityChapter from "./adaptivity";
import ValidationChapter from "./validation";

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

  const experience = useExperienceLevel();
  const activeChapterKeys = useMemo(
    () => getActiveChapters(experience),
    [experience]
  );

  const visibleChapters = useMemo(
    () => DESIGN_CHAPTERS.filter((c) => activeChapterKeys.includes(c.key)),
    [activeChapterKeys]
  );

  // Si le chapitre courant est masqué par le niveau d'expertise, bascule vers le premier visible.
  useEffect(() => {
    if (!activeChapterKeys.includes(activeKey) && visibleChapters.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveKey(visibleChapters[0].key);
    }
  }, [activeChapterKeys, activeKey, visibleChapters]);

  const completenessByChapter = useMemo(
    () => computeAllChaptersCompleteness(initialSections),
    [initialSections]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* ─── MENU VERTICAL (12 chapitres) ─── */}
      <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-4">
        <nav className="bg-card/60 border border-border rounded-xl p-2 space-y-0.5">
          {visibleChapters.map((chapter) => {
            const isActive = chapter.key === activeKey;
            const pct = completenessByChapter[chapter.key] ?? 0;
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
                <ChapterProgress percent={pct} isActive={isActive} />
              </button>
            );
          })}
        </nav>
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
        ) : activeKey === "design-system" ? (
          <DesignSystemChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "states" ? (
          <StatesChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "microcopy" ? (
          <MicrocopyChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "a11y" ? (
          <A11yChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "adaptivity" ? (
          <AdaptivityChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "validation" ? (
          <ValidationChapter
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

function progressTone(percent: number): {
  text: string;
  bar: string;
} {
  if (percent >= 70) return { text: "text-green-600 dark:text-green-400", bar: "bg-green-500" };
  if (percent >= 30) return { text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500" };
  return { text: "text-muted", bar: "bg-muted/60" };
}

function ChapterProgress({ percent, isActive }: { percent: number; isActive: boolean }) {
  const tone = progressTone(percent);
  const labelClass = isActive ? "text-white/90" : tone.text;
  const barClass = isActive ? "bg-white" : tone.bar;
  const trackClass = isActive ? "bg-white/20" : "bg-card/80 border border-border";
  return (
    <span
      className="flex items-center gap-1.5 shrink-0"
      title={`${percent}% complété`}
      aria-label={`Complétude ${percent}%`}
    >
      <span
        className={`h-1 w-8 rounded-full overflow-hidden ${trackClass}`}
        aria-hidden
      >
        <span
          className={`block h-full transition-all duration-500 ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className={`text-[10px] font-mono tabular-nums ${labelClass}`}>
        {percent}%
      </span>
    </span>
  );
}
