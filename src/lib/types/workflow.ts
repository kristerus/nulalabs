/**
 * Workflow visualization types for metabolomics analysis flow diagrams
 */

export type WorkflowNodeType = "user_query" | "analysis" | "visualization";

export type WorkflowNodeStatus = "completed" | "in_progress" | "error";

export type WorkflowEdgeType = "sequential" | "parallel";

/**
 * Metadata extracted from AI reasoning about workflow structure
 */
export interface WorkflowMetadata {
  isParallel?: boolean;
  phase?: string;
  description?: string;
}

/**
 * Tool call summary for workflow nodes
 */
export interface WorkflowToolCall {
  toolName: string;
  args: Record<string, any>;
  result?: any;
  isError?: boolean;
}

/**
 * Node in the workflow graph representing an analysis step
 */
export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  phase: string;
  messageId: string;
  messageIndex: number;
  toolCalls?: WorkflowToolCall[];
  artifacts?: string[];
  userQuery?: string;
  timestamp: number;
  status: WorkflowNodeStatus;
  metadata?: WorkflowMetadata;
  position?: { x: number; y: number };
}

/**
 * Edge connecting workflow nodes
 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: WorkflowEdgeType;
  label?: string;
}

/**
 * Complete workflow graph structure
 */
export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

/**
 * Artifact entry with metadata
 */
export interface ArtifactEntry {
  id: string;
  code: string;
  title?: string;
  createdAt: number;
  messageId: string;
}
