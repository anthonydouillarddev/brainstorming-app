import type {
  SchemaEdge,
  SchemaNode,
  SchemaPayload,
  SchemaTemplate,
} from "@/app/project/[id]/atelier/types";

let counter = 1;
const nextId = () => `n${counter++}`;

function reset() {
  counter = 1;
}

function node(
  x: number,
  y: number,
  label: string,
  nodeType: SchemaNode["data"]["nodeType"] = "default"
): SchemaNode {
  return {
    id: nextId(),
    type: "atelier",
    position: { x, y },
    data: { label, nodeType },
  };
}

function edge(source: string, target: string): SchemaEdge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
  };
}

function connect(nodes: SchemaNode[], pairs: [number, number][]): SchemaEdge[] {
  return pairs.map(([a, b]) => edge(nodes[a].id, nodes[b].id));
}

function blankTemplate(): SchemaPayload {
  reset();
  const nodes = [node(400, 240, "Nouveau nœud", "default")];
  return { nodes, edges: [] };
}

function pieuvreTemplate(): SchemaPayload {
  reset();
  const nodes = [
    node(380, 250, "Utilisateur", "root"),
    node(140, 100, "Planifier", "branch"),
    node(620, 100, "Brainstormer", "branch"),
    node(140, 400, "Visualiser", "branch"),
    node(620, 400, "Collaborer", "branch"),
    node(380, 50, "Suivre avancée", "leaf"),
    node(380, 450, "Exporter", "leaf"),
  ];
  const edges = connect(nodes, [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 6],
  ]);
  return { nodes, edges };
}

function arbreTemplate(): SchemaPayload {
  reset();
  const nodes = [
    node(380, 60, "Choix stack front", "root"),
    node(180, 200, "Next.js", "branch"),
    node(580, 200, "Remix", "branch"),
    node(80, 360, "SSR", "leaf"),
    node(280, 360, "SSG", "leaf"),
    node(480, 360, "API pur", "leaf"),
    node(680, 360, "SSR only", "leaf"),
  ];
  const edges = connect(nodes, [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ]);
  return { nodes, edges };
}

function mindmapTemplate(): SchemaPayload {
  reset();
  const nodes = [
    node(400, 250, "Idée centrale", "root"),
    node(160, 120, "Branche 1", "branch"),
    node(640, 120, "Branche 2", "branch"),
    node(160, 380, "Branche 3", "branch"),
    node(640, 380, "Branche 4", "branch"),
  ];
  const edges = connect(nodes, [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ]);
  return { nodes, edges };
}

function flowTemplate(): SchemaPayload {
  reset();
  const nodes = [
    node(80, 250, "Arrivée", "root"),
    node(280, 250, "Login", "default"),
    node(480, 150, "Dashboard", "branch"),
    node(480, 350, "Onboarding", "branch"),
    node(680, 250, "Projet", "leaf"),
  ];
  const edges = connect(nodes, [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
  ]);
  return { nodes, edges };
}

function archiTemplate(): SchemaPayload {
  reset();
  const nodes = [
    node(380, 60, "Frontend Next.js", "branch"),
    node(380, 200, "API Routes", "default"),
    node(180, 340, "Supabase DB", "leaf"),
    node(580, 340, "OpenAI", "leaf"),
    node(380, 460, "Vercel Deploy", "root"),
  ];
  const edges = connect(nodes, [
    [0, 1],
    [1, 2],
    [1, 3],
    [0, 4],
  ]);
  return { nodes, edges };
}

export function buildTemplate(template: SchemaTemplate): SchemaPayload {
  switch (template) {
    case "pieuvre":
      return pieuvreTemplate();
    case "arbre":
      return arbreTemplate();
    case "mindmap":
      return mindmapTemplate();
    case "flow":
      return flowTemplate();
    case "archi":
      return archiTemplate();
    case "blank":
    default:
      return blankTemplate();
  }
}
