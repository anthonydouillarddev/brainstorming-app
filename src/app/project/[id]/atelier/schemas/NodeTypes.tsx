"use client";

import { createContext, useContext } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { SchemaNodeData } from "../types";

type NodeNavigate = (todoId: string) => void;

const NodeNavigateContext = createContext<NodeNavigate | null>(null);

export function NodeNavigateProvider({
  navigate,
  children,
}: {
  navigate: NodeNavigate;
  children: React.ReactNode;
}) {
  return (
    <NodeNavigateContext.Provider value={navigate}>
      {children}
    </NodeNavigateContext.Provider>
  );
}

const BASE_CLASSES =
  "px-4 py-2.5 rounded-xl border text-center text-sm font-medium shadow-sm min-w-[110px] max-w-[220px] transition-colors";

function classesFor(nodeType: SchemaNodeData["nodeType"], selected: boolean) {
  const ring = selected ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : "";
  switch (nodeType) {
    case "root":
      return `${BASE_CLASSES} ${ring} bg-accent text-white border-accent font-semibold`;
    case "branch":
      return `${BASE_CLASSES} ${ring} bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/50`;
    case "leaf":
      return `${BASE_CLASSES} ${ring} bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/50`;
    case "default":
    default:
      return `${BASE_CLASSES} ${ring} bg-card text-foreground border-border`;
  }
}

export default function AtelierNode({ data, selected }: NodeProps) {
  const nd = data as SchemaNodeData;
  const linked = !!nd.linkedTodoId;
  const navigate = useContext(NodeNavigateContext);
  return (
    <div className={classesFor(nd.nodeType, !!selected)}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-accent !border-2 !border-card"
      />
      <div className="flex items-center justify-center gap-1.5 break-words">
        <span>{nd.label || "Sans libellé"}</span>
        {linked && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (navigate && nd.linkedTodoId) navigate(nd.linkedTodoId);
            }}
            aria-label="Ouvrir la tâche liée"
            title="Ouvrir la tâche liée"
            className="text-xs opacity-80 hover:opacity-100 cursor-pointer"
          >
            🔗
          </button>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-accent !border-2 !border-card"
      />
    </div>
  );
}

export const nodeTypes = { atelier: AtelierNode };
