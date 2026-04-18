"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { computeAllChaptersCompleteness } from "@/lib/technique/completeness";
import { getActiveChapters } from "@/lib/technique/gating";
import { useExperienceLevel } from "@/lib/design/use-experience-level";
import { TECHNIQUE_CHAPTERS, type TechniqueChapterKey } from "./chapters";
import ChapterPlaceholder from "./chapter-placeholder";
import StrategyChapter from "./strategy";
import ArchitectureChapter from "./architecture";
import FrontendChapter from "./frontend";
import BackendChapter from "./backend";
import DataChapter from "./data";
import AuthSecurityChapter from "./auth-security";
import ServicesChapter from "./services";
import HostingDevopsChapter from "./hosting-devops";
import ObservabilityChapter from "./observability";
import AiAutomationChapter from "./ai-automation";
import CostsComplianceChapter from "./costs-compliance";

const LS_ACTIVE_CHAPTER_PREFIX = "mindeck_technique_active_chapter_";

export default function TechniquePanel({
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
  const [activeKey, setActiveKey] = useState<TechniqueChapterKey>("strategy");
  const lsKey = `${LS_ACTIVE_CHAPTER_PREFIX}${project.id}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(lsKey);
    if (saved && TECHNIQUE_CHAPTERS.some((c) => c.key === saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveKey(saved as TechniqueChapterKey);
    }
  }, [lsKey]);

  function selectChapter(key: TechniqueChapterKey) {
    setActiveKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(lsKey, key);
    }
  }

  const activeChapter = TECHNIQUE_CHAPTERS.find((c) => c.key === activeKey)!;

  const experience = useExperienceLevel();
  const activeChapterKeys = useMemo(
    () => getActiveChapters(experience),
    [experience]
  );

  const visibleChapters = useMemo(
    () => TECHNIQUE_CHAPTERS.filter((c) => activeChapterKeys.includes(c.key)),
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

  const isBeginner = experience === "beginner";

  // Transition douce Q2 : si la section `tech` (legacy brainstorm) existe, on affiche un bandeau.
  const hasLegacyStack =
    !!initialSections["tech"] || !!initialSections["legacy-stack"];

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* ─── MENU VERTICAL (chapitres filtrés par expertise) ─── */}
      <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        <nav
          aria-label="Chapitres Technique"
          className="bg-card/60 border border-border rounded-xl p-2 space-y-0.5"
        >
          {visibleChapters.map((chapter) => {
            const isActive = chapter.key === activeKey;
            const pct = completenessByChapter[chapter.key] ?? 0;
            return (
              <button
                key={chapter.key}
                onClick={() => selectChapter(chapter.key)}
                aria-label={`${chapter.label} · complétude ${pct}%`}
                aria-current={isActive ? "page" : undefined}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                  isActive
                    ? "bg-accent text-white"
                    : "hover:bg-accent/10 text-foreground"
                }`}
              >
                <span className="text-base" aria-hidden>
                  {chapter.emoji}
                </span>
                <span className="flex-1 truncate">
                  <span className="opacity-60 mr-1">{chapter.num}.</span>
                  {chapter.label}
                </span>
                <ChapterProgress percent={pct} isActive={isActive} />
              </button>
            );
          })}
        </nav>

        {isBeginner && (
          <div className="mt-3 text-[11px] text-muted px-2 leading-relaxed">
            🎓 {visibleChapters.length} chapitres essentiels (mode Débutant).{" "}
            <span className="text-foreground">
              Passe en Intermédiaire ou Expert via l&apos;avatar → Settings → Apparence
            </span>{" "}
            pour débloquer les {TECHNIQUE_CHAPTERS.length - visibleChapters.length} chapitres
            avancés.
          </div>
        )}
      </aside>

      {/* ─── CONTENU DU CHAPITRE ACTIF ─── */}
      <main className="flex-1 min-w-0 w-full space-y-4">
        {hasLegacyStack && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-sm flex items-start gap-3">
            <span className="text-xl shrink-0" aria-hidden>📦</span>
            <div className="flex-1">
              <div className="font-semibold mb-1">Ancienne saisie Technique disponible</div>
              <p className="text-muted text-xs leading-relaxed">
                Une saisie de l&apos;ancien onglet Technique existe pour ce projet. Elle est conservée
                en lecture seule. La migration vers les 12 nouveaux chapitres sera proposée dès que
                le chap 1 Stratégie sera livré.
              </p>
            </div>
          </div>
        )}

        {activeKey === "strategy" ? (
          <StrategyChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "architecture" ? (
          <ArchitectureChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "frontend" ? (
          <FrontendChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "backend" ? (
          <BackendChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "data" ? (
          <DataChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "auth-security" ? (
          <AuthSecurityChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "services" ? (
          <ServicesChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "hosting-devops" ? (
          <HostingDevopsChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "observability" ? (
          <ObservabilityChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "ai-automation" ? (
          <AiAutomationChapter
            project={project}
            initialSections={initialSections}
            onProjectUpdate={onProjectUpdate}
            onSectionsChange={onSectionsChange}
          />
        ) : activeKey === "costs-compliance" ? (
          <CostsComplianceChapter
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
  return { text: "text-foreground/70", bar: "bg-foreground/40" };
}

function ChapterProgress({ percent, isActive }: { percent: number; isActive: boolean }) {
  const tone = progressTone(percent);
  const labelClass = isActive ? "text-white/90" : tone.text;
  const barClass = isActive ? "bg-white" : tone.bar;
  const trackClass = isActive ? "bg-white/20" : "bg-card/80 border border-border";
  return (
    <span className="flex items-center gap-1.5 shrink-0" aria-hidden>
      <span className={`h-1 w-8 rounded-full overflow-hidden ${trackClass}`}>
        <span
          className={`block h-full transition-all duration-500 ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className={`text-[11px] font-mono font-semibold tabular-nums ${labelClass}`}>
        {percent}%
      </span>
    </span>
  );
}
