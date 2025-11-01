import { useMemo, useState } from "react";
import type { UIMessage } from "@/lib/types";
import type { WorkflowGraph, WorkflowNode } from "@/lib/types/workflow";
import { buildWorkflowGraph } from "@/lib/workflow/workflowBuilder";

export interface UseWorkflowResult {
  graph: WorkflowGraph;
  selectedNode: WorkflowNode | null;
  selectNode: (nodeId: string | null) => void;
  isEmpty: boolean;
  nodeCount: number;
  phaseCount: number;
}

/**
 * Hook to manage workflow state and graph generation
 */
export function useWorkflow(messages: UIMessage[]): UseWorkflowResult {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Build workflow graph from messages (memoized)
  const graph = useMemo(() => {
    return buildWorkflowGraph(messages);
  }, [messages]);

  // Get selected node
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return graph.nodes.find((node) => node.id === selectedNodeId) || null;
  }, [selectedNodeId, graph.nodes]);

  // Calculate stats
  const isEmpty = graph.nodes.length === 0;
  const nodeCount = graph.nodes.length;
  const phaseCount = new Set(graph.nodes.map((n) => n.phase)).size;

  const selectNode = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };

  return {
    graph,
    selectedNode,
    selectNode,
    isEmpty,
    nodeCount,
    phaseCount,
  };
}
