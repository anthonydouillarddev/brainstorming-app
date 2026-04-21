"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { SchemaNodeData } from "../types";

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
          <span
            aria-label="Lié à une tâche"
            title="Lié à une tâche"
            className="text-xs opacity-80"
          >
            🔗
          </span>
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
