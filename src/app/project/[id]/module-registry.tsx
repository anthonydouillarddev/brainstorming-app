import type { ReactNode } from "react";
import type { SectionDef } from "@/lib/sections";
import type {
  Decision,
  Project,
  RoadmapItem,
  Risk,
  Todo,
} from "@/lib/types";
import Cockpit from "./cockpit";
import BrainstormEditor from "./editor";
import DecisionsPanel from "./decisions";
import SingleSectionPanel from "./resources";
import DesignPanel from "./design";
import TechniquePanel from "./technique";
import TasksTab from "./tasks-tab";
import AtelierPanel from "./atelier";

export type ModuleContext = {
  userId: string;
  project: Project;
  sections: Record<string, string>;
  sectionDefs: SectionDef[];
  tasks: Todo[];
  ideas: Todo[];
  decisions: Decision[];
  roadmap: RoadmapItem[];
  risks: Risk[];
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange: (next: Record<string, string>) => void;
  onTasksChange: (todos: Todo[]) => void;
  onIdeasChange: (todos: Todo[]) => void;
  onDecisionsChange: (decisions: Decision[]) => void;
  onRoadmapChange: (items: RoadmapItem[]) => void;
  onRisksChange: (risks: Risk[]) => void;
  onNavigate: (slug: string, options?: { id?: string }) => void;
};

type ModuleRenderer = (ctx: ModuleContext) => ReactNode;

export const MODULE_COMPONENTS: Record<string, ModuleRenderer> = {
  cockpit: (ctx) => (
    <Cockpit
      project={ctx.project}
      sections={ctx.sections}
      todos={ctx.tasks}
      decisions={ctx.decisions}
      roadmap={ctx.roadmap}
      risks={ctx.risks}
      onUpdate={ctx.onProjectUpdate}
      onRoadmapChange={ctx.onRoadmapChange}
      onRisksChange={ctx.onRisksChange}
      onGoToTasks={() => ctx.onNavigate("tasks")}
      onGoToDesign={() => ctx.onNavigate("design")}
      onGoToTechnique={() => ctx.onNavigate("technique")}
    />
  ),
  brainstorm: (ctx) => (
    <BrainstormEditor
      project={ctx.project}
      initialSections={ctx.sections}
      sectionDefs={ctx.sectionDefs}
      onProjectUpdate={ctx.onProjectUpdate}
      onSectionsChange={ctx.onSectionsChange}
    />
  ),
  tasks: (ctx) => (
    <TasksTab
      userId={ctx.userId}
      project={ctx.project}
      tasks={ctx.tasks}
      ideas={ctx.ideas}
      onTasksChange={ctx.onTasksChange}
      onIdeasChange={ctx.onIdeasChange}
    />
  ),
  decisions: (ctx) => (
    <DecisionsPanel
      projectId={ctx.project.id}
      initialDecisions={ctx.decisions}
      onChange={ctx.onDecisionsChange}
    />
  ),
  technique: (ctx) => (
    <TechniquePanel
      project={ctx.project}
      initialSections={ctx.sections}
      onProjectUpdate={ctx.onProjectUpdate}
      onSectionsChange={ctx.onSectionsChange}
    />
  ),
  design: (ctx) => (
    <DesignPanel
      project={ctx.project}
      initialSections={ctx.sections}
      onProjectUpdate={ctx.onProjectUpdate}
      onSectionsChange={ctx.onSectionsChange}
    />
  ),
  resources: (ctx) => (
    <SingleSectionPanel
      project={ctx.project}
      sectionKey="resources"
      initialSections={ctx.sections}
      onProjectUpdate={ctx.onProjectUpdate}
      onSectionsChange={ctx.onSectionsChange}
    />
  ),
  atelier: (ctx) => (
    <AtelierPanel
      userId={ctx.userId}
      project={ctx.project}
      tasks={ctx.tasks}
      ideas={ctx.ideas}
      decisions={ctx.decisions}
      onNavigate={ctx.onNavigate}
    />
  ),
};

export function hasModuleRenderer(componentKey: string): boolean {
  return componentKey in MODULE_COMPONENTS;
}

export function renderModule(
  componentKey: string,
  ctx: ModuleContext,
  moduleName?: string,
  moduleIcon?: string
): ReactNode {
  const renderer = MODULE_COMPONENTS[componentKey];
  if (!renderer) {
    return <ModulePlaceholder slug={componentKey} name={moduleName} icon={moduleIcon} />;
  }
  return renderer(ctx);
}

export function ModulePlaceholder({
  slug,
  name,
  icon,
}: {
  slug: string;
  name?: string;
  icon?: string;
}) {
  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-10 shadow-sm text-center">
      <div className="text-5xl mb-4">{icon ?? "🧩"}</div>
      <h2 className="text-xl font-bold mb-2">
        Module {name ?? slug}
      </h2>
      <p className="text-muted text-sm max-w-sm mx-auto">
        Ce module sera bientôt disponible. Les données sont déjà sécurisées — il n&apos;y a
        plus qu&apos;à brancher l&apos;interface.
      </p>
    </div>
  );
}
