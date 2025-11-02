"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { WorkflowNode } from "./WorkflowNode";
import { ParallelEdge } from "./WorkflowEdge";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  workflow: WorkflowNode,
};

const edgeTypes = {
  parallel: ParallelEdge,
};

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (nodeId: string) => void;
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodeClick,
}: WorkflowCanvasProps) {
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          gap={16}
          size={1}
          className="bg-background"
          color="hsl(var(--muted-foreground) / 0.1)"
        />
        <Controls className="bg-background border border-border rounded-lg" />
        <MiniMap
          className="bg-background border border-border rounded-lg"
          nodeColor={(node) => {
            const data = node.data as { color?: string };
            return data.color || "#6b7280";
          }}
        />
      </ReactFlow>
    </div>
  );
}
