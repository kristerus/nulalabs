import { useMemo } from "react";
import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import type { WorkflowGraph } from "@/lib/types/workflow";
import { getPhaseColor } from "@/lib/workflow/phaseDetector";

const NODE_WIDTH = 250;
const NODE_HEIGHT = 120;

/**
 * Convert workflow graph to ReactFlow nodes with auto-layout
 */
export function useWorkflowLayout(graph: WorkflowGraph): {
  nodes: Node[];
  edges: Edge[];
} {
  const { nodes, edges } = useMemo(() => {
    if (graph.nodes.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Create dagre graph for layout
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Configure graph layout
    dagreGraph.setGraph({
      rankdir: "LR", // Left to right
      nodesep: 200, // Horizontal spacing between nodes (increased for better visibility)
      ranksep: 300, // Vertical spacing between ranks (increased for better visibility)
      marginx: 50,
      marginy: 50,
    });

    // Add nodes to dagre
    graph.nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    });

    // Add edges to dagre
    graph.edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Run layout algorithm
    dagre.layout(dagreGraph);

    // Convert to ReactFlow nodes with layout positions
    const reactFlowNodes: Node[] = graph.nodes.map((node) => {
      const dagreNode = dagreGraph.node(node.id);

      return {
        id: node.id,
        type: "workflow",
        position: {
          x: dagreNode.x - NODE_WIDTH / 2,
          y: dagreNode.y - NODE_HEIGHT / 2,
        },
        data: {
          ...node,
          color: getPhaseColor(node.phase),
        },
      };
    });

    // Convert to ReactFlow edges
    const reactFlowEdges: Edge[] = graph.edges.map((edge) => {
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type === "parallel" ? "parallel" : "default",
        animated: edge.type === "sequential",
        style: {
          stroke: edge.type === "parallel" ? "#6b7280" : "#3b82f6",
          strokeWidth: 2,
          strokeDasharray: edge.type === "parallel" ? "5,5" : undefined,
        },
        label: edge.label,
      };
    });

    return { nodes: reactFlowNodes, edges: reactFlowEdges };
  }, [graph]);

  return { nodes, edges };
}
