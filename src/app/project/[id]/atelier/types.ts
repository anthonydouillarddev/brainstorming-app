export type AtelierView = "notes" | "schemas";

export type SchemaTemplate =
  | "blank"
  | "pieuvre"
  | "arbre"
  | "mindmap"
  | "flow"
  | "archi";

export type SchemaNodeType = "default" | "root" | "branch" | "leaf";

export type SchemaNodeData = {
  label: string;
  nodeType: SchemaNodeType;
  linkedTodoId?: string | null;
};

export type SchemaNode = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: SchemaNodeData;
};

export type SchemaEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

export type SchemaPayload = {
  nodes: SchemaNode[];
  edges: SchemaEdge[];
};

export type Note = {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  content: string;
  pinned: boolean;
  tags: string[];
  linked_todo_id: string | null;
  linked_decision_id: string | null;
  linked_dev_item_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SchemaRow = {
  id: string;
  user_id: string;
  project_id: string;
  name: string;
  template: SchemaTemplate;
  data: SchemaPayload;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
};

export type LinkTarget =
  | { kind: "todo"; id: string }
  | { kind: "decision"; id: string }
  | { kind: "dev_item"; id: string };

export const SCHEMA_TEMPLATES: {
  value: SchemaTemplate;
  label: string;
  emoji: string;
  description: string;
}[] = [
  { value: "pieuvre", label: "Pieuvre", emoji: "🐙", description: "Analyse des besoins (fonctions principales + contraintes)" },
  { value: "arbre", label: "Arbre de décision", emoji: "🌳", description: "Nœuds conditionnels avec branches oui/non" },
  { value: "mindmap", label: "Mind map", emoji: "🧠", description: "Idée centrale + ramifications libres" },
  { value: "flow", label: "User flow", emoji: "🔀", description: "Parcours utilisateur avec étapes et décisions" },
  { value: "archi", label: "Architecture", emoji: "🏛️", description: "Schéma technique frontend / back / DB" },
  { value: "blank", label: "Canvas vierge", emoji: "⬜", description: "Page blanche, totale liberté" },
];

export const NODE_TYPES: {
  value: SchemaNodeType;
  label: string;
  emoji: string;
}[] = [
  { value: "default", label: "Rectangle", emoji: "⬛" },
  { value: "branch", label: "Branche", emoji: "🔵" },
  { value: "leaf", label: "Feuille", emoji: "🟢" },
  { value: "root", label: "Racine", emoji: "⭐" },
];
