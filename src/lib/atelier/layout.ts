import Dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

// Auto-layout hiérarchique (LR gauche → droite) via Dagre.
// Garde les positions après passage pour que React Flow les pick via applyNodeChanges.

const NODE_WIDTH = 170;
const NODE_HEIGHT = 60;

export function autoLayout(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR"
): Node[] {
  if (nodes.length === 0) return nodes;

  const g = new Dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 90 });

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) {
    if (nodes.some((n) => n.id === edge.source) && nodes.some((n) => n.id === edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  Dagre.layout(g);

  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    if (!dagreNode) return node;
    return {
      ...node,
      position: {
        x: dagreNode.x - NODE_WIDTH / 2,
        y: dagreNode.y - NODE_HEIGHT / 2,
      },
    };
  });
}
