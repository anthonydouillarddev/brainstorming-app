"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Todo } from "@/lib/types";
import type {
  SchemaEdge,
  SchemaNode,
  SchemaNodeData,
  SchemaNodeType,
  SchemaPayload,
  SchemaRow,
} from "../types";
import { NODE_TYPES } from "../types";
import { useDebouncedRowSave } from "../_shared/useDebouncedRowSave";
import { nodeTypes, NodeNavigateProvider } from "./NodeTypes";

type Props = {
  schema: SchemaRow;
  tasks: Todo[];
  ideas: Todo[];
  onRename: (name: string) => void;
  onDataUpdate: (patch: Partial<SchemaRow>) => void;
  onBack: () => void;
  onNavigate: (slug: string, options?: { id?: string }) => void;
};

type FlowNode = Node<SchemaNodeData>;

function toFlowNodes(nodes: SchemaNode[]): FlowNode[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type ?? "atelier",
    position: n.position,
    data: n.data,
  }));
}

function toFlowEdges(edges: SchemaEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? null,
    targetHandle: e.targetHandle ?? null,
    style: { stroke: "var(--ac)", strokeWidth: 2 },
  }));
}

function toPayload(nodes: FlowNode[], edges: Edge[]): SchemaPayload {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data as SchemaNodeData,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
    })),
  };
}

export default function Canvas(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}

function CanvasInner({
  schema,
  tasks,
  ideas,
  onRename,
  onDataUpdate,
  onBack,
  onNavigate,
}: Props) {
  const [nameDraft, setNameDraft] = useState(schema.name);
  const [nodes, setNodes] = useState<FlowNode[]>(() =>
    toFlowNodes(schema.data.nodes)
  );
  const [edges, setEdges] = useState<Edge[]>(() =>
    toFlowEdges(schema.data.edges)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const idCounterRef = useRef(0);

  const { save, saving, lastSaved, saveError } = useDebouncedRowSave<SchemaRow>({
    table: "schemas",
    id: schema.id,
    delayMs: 2000,
    onSaved: (patch) => onDataUpdate(patch),
  });

  // Propagate data changes to debounced save (skip first mount to avoid loop)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    save({ data: toPayload(nodes, edges) });
  }, [nodes, edges, save]);

  const selected = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId]
  );

  const allTodos = useMemo(() => [...tasks, ...ideas], [tasks, ideas]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((ns) => applyNodeChanges(changes, ns) as FlowNode[]);
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((es) => applyEdgeChanges(changes, es));
    },
    []
  );

  const edgeCounterRef = useRef(0);
  const onConnect: OnConnect = useCallback((connection: Connection) => {
    edgeCounterRef.current += 1;
    setEdges((es) =>
      addEdge(
        {
          ...connection,
          id: `e-${connection.source}-${connection.target}-${edgeCounterRef.current}`,
          style: { stroke: "var(--ac)", strokeWidth: 2 },
        },
        es
      )
    );
  }, []);

  const onSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedId(params.nodes[0]?.id ?? null);
    },
    []
  );

  function addNode(nodeType: SchemaNodeType) {
    idCounterRef.current += 1;
    const id = `n-${schema.id.slice(0, 8)}-${idCounterRef.current}`;
    setNodes((ns) => [
      ...ns,
      {
        id,
        type: "atelier",
        position: {
          x: 200 + Math.random() * 200,
          y: 200 + Math.random() * 150,
        },
        data: { label: "Nouveau nœud", nodeType },
      },
    ]);
    setSelectedId(id);
  }

  function updateSelected(patch: Partial<SchemaNodeData>) {
    if (!selectedId) return;
    setNodes((ns) =>
      ns.map((n) =>
        n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n
      )
    );
  }

  function deleteSelected() {
    if (!selectedId) return;
    setNodes((ns) => ns.filter((n) => n.id !== selectedId));
    setEdges((es) =>
      es.filter((e) => e.source !== selectedId && e.target !== selectedId)
    );
    setSelectedId(null);
  }

  function clearAll() {
    if (!confirm("Vider le canvas ? Action irréversible.")) return;
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
  }

  function commitName() {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== schema.name) {
      onRename(trimmed);
      save({ name: trimmed });
    } else {
      setNameDraft(schema.name);
    }
  }

  function navigateToTodo(todoId: string) {
    if (!todoId) return;
    onNavigate("tasks", { id: todoId });
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden flex flex-col h-[680px]">
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap bg-background/40">
        <button
          type="button"
          onClick={onBack}
          className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:border-muted transition-colors"
        >
          ← Galerie
        </button>
        <input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setNameDraft(schema.name);
          }}
          className="flex-1 min-w-[120px] text-sm font-medium bg-transparent border-none outline-none focus:ring-0"
          aria-label="Nom du schéma"
        />
        <div className="text-xs text-muted shrink-0">
          {saving
            ? "💾 Enregistrement…"
            : saveError
            ? `⚠ ${saveError}`
            : lastSaved
            ? `💾 Sauvegardé à ${lastSaved}`
            : "💾 Auto-save"}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr_220px] min-h-0">
        <aside className="hidden md:flex flex-col border-r border-border p-3 gap-1 bg-background/30 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1 px-1">
            Ajouter
          </div>
          {NODE_TYPES.map((nt) => (
            <button
              key={nt.value}
              type="button"
              onClick={() => addNode(nt.value)}
              className="text-left text-sm px-3 py-2 rounded-lg bg-card border border-border hover:border-accent/40 hover:text-accent transition-colors"
            >
              <span className="mr-1.5">{nt.emoji}</span>
              {nt.label}
            </button>
          ))}
          <div className="h-3" />
          <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1 px-1">
            Actions
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="text-left text-sm px-3 py-2 rounded-lg border border-border text-muted hover:text-red-500 hover:border-red-500/40 transition-colors"
          >
            🗑️ Tout effacer
          </button>
        </aside>

        <div className="relative bg-background/20 min-h-[400px]">
          <NodeNavigateProvider navigate={navigateToTodo}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={24} size={1} />
              <Controls showInteractive={false} />
              <MiniMap pannable zoomable className="!bg-card !border-border" />
            </ReactFlow>
          </NodeNavigateProvider>
        </div>

        <aside className="hidden md:flex flex-col border-l border-border p-4 gap-3 bg-background/30 overflow-y-auto">
          <h3 className="text-[10px] uppercase tracking-wider text-muted font-semibold">
            Propriétés
          </h3>
          {!selected ? (
            <p className="text-sm text-muted italic text-center py-6">
              Sélectionne un nœud pour éditer ses propriétés.
            </p>
          ) : (
            <>
              <Field label="Texte">
                <input
                  value={selected.data.label ?? ""}
                  onChange={(e) => updateSelected({ label: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent/60"
                />
              </Field>
              <Field label="Type">
                <select
                  value={selected.data.nodeType}
                  onChange={(e) =>
                    updateSelected({
                      nodeType: e.target.value as SchemaNodeType,
                    })
                  }
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent/60"
                >
                  {NODE_TYPES.map((nt) => (
                    <option key={nt.value} value={nt.value}>
                      {nt.emoji} {nt.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="🔗 Lier à une tâche">
                <select
                  value={selected.data.linkedTodoId ?? ""}
                  onChange={(e) =>
                    updateSelected({ linkedTodoId: e.target.value || null })
                  }
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent/60"
                >
                  <option value="">— Aucune —</option>
                  {allTodos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.text.slice(0, 40)}
                    </option>
                  ))}
                </select>
              </Field>
              {selected.data.linkedTodoId && (
                <button
                  type="button"
                  onClick={() =>
                    navigateToTodo(selected.data.linkedTodoId ?? "")
                  }
                  className="text-xs text-accent hover:underline"
                >
                  Ouvrir la tâche →
                </button>
              )}
              <button
                type="button"
                onClick={deleteSelected}
                className="mt-auto w-full px-3 py-2 text-sm rounded-lg border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors"
              >
                🗑️ Supprimer le nœud
              </button>
            </>
          )}
        </aside>
      </div>

      <div className="px-4 py-2.5 border-t border-border bg-background/30 text-xs text-muted">
        💡 Astuce : tire depuis la pastille à droite d&apos;un nœud pour créer une liaison.
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
