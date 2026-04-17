import type { Project } from "@/lib/types";
import type { InfoNavState } from "../state";
import { getScreenPath } from "../state";

export function exportInfoNavJson(state: InfoNavState, project: Project): string {
  const urlMap = state.screens.map((screen) => {
    const path = getScreenPath(state, screen.id);
    return {
      screenId: screen.id,
      title: screen.title,
      slug: screen.slug,
      fullPath: "/" + path.map((p) => p.slug).join("/"),
      breadcrumb: path.map((p) => p.title),
      isPrimaryNav: screen.isPrimaryNav,
      parentId: screen.parentId,
    };
  });

  return JSON.stringify(
    {
      $description: "Mindeck — Architecture Info & Nav (chap. 3)",
      $source: "mindeck",
      project: {
        name: project.official_name || project.name,
        type: project.type,
      },
      navPattern: state.navPattern,
      navItems: state.navItems,
      sitemap: state.screens.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        emoji: s.emoji,
        parentId: s.parentId,
        position: s.position,
        isPrimaryNav: s.isPrimaryNav,
        description: s.description,
      })),
      urlMap,
      labels: state.labels,
      entities: state.entities,
      relations: state.relations,
      commandPalette: state.commandPalette,
      meta: {
        modeUsed: state.modeUsed,
        updatedAt: state.updatedAt,
      },
    },
    null,
    2
  );
}
