import type { UIMessage } from "@/lib/types";
import type {
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
  WorkflowToolCall,
} from "@/lib/types/workflow";
import { detectPhaseFromTools } from "./phaseDetector";
import { extractWorkflowMetadata } from "./metadataExtractor";
import { nanoid } from "nanoid";

/**
 * Extract tool calls from a message
 */
function extractToolCalls(message: UIMessage): WorkflowToolCall[] {
  if (!message.parts) return [];

  const toolCalls: WorkflowToolCall[] = [];

  for (const part of message.parts) {
    if (part.type.startsWith("tool-")) {
      // Check if it's a tool-call part with toolName
      if ("toolName" in part && typeof part.toolName === "string") {
        // Find corresponding result
        const toolCallId = "toolCallId" in part ? part.toolCallId : undefined;
        const resultPart = message.parts.find(
          (p) =>
            p.type === "tool-result" &&
            "toolCallId" in p &&
            p.toolCallId === toolCallId
        );

        toolCalls.push({
          toolName: part.toolName,
          args: ("args" in part && part.args) ? part.args as Record<string, any> : {},
          result: resultPart && "result" in resultPart ? resultPart.result : undefined,
          isError: resultPart && "isError" in resultPart ? Boolean(resultPart.isError) : false,
        });
      }
    }
  }

  return toolCalls;
}

/**
 * Extract reasoning/thinking text from a message
 */
function extractReasoningText(message: UIMessage): string {
  if (!message.parts) return "";

  const reasoningParts = message.parts.filter((p) => p.type === "reasoning");
  if (reasoningParts.length > 0) {
    return reasoningParts.map((p) => ("text" in p ? p.text : "")).join("\n");
  }

  // Fallback: look for text before ---ANSWER--- delimiter
  const textParts = message.parts.filter((p) => p.type === "text");
  if (textParts.length > 0) {
    const fullText = textParts.map((p) => ("text" in p ? p.text : "")).join("\n");
    const delimiterIndex = fullText.indexOf("---ANSWER---");
    if (delimiterIndex > 0) {
      return fullText.substring(0, delimiterIndex);
    }
    return fullText;
  }

  return "";
}

/**
 * Extract user query text from message
 */
function getMessageText(message: UIMessage): string {
  if (!message.parts) return "";

  const textParts = message.parts.filter((p) => p.type === "text");
  return textParts.map((p) => ("text" in p ? p.text : "")).join(" ");
}

/**
 * Extract label from user query (first 50 chars)
 */
function extractQueryLabel(message: UIMessage): string {
  const text = getMessageText(message);
  if (text.length <= 50) return text;
  return text.substring(0, 47) + "...";
}

/**
 * Check if message has artifacts (JSX code blocks)
 */
function hasArtifacts(message: UIMessage): boolean {
  const text = getMessageText(message);
  return /```jsx/.test(text) || /<artifact>/.test(text);
}

/**
 * Build workflow graph from conversation messages
 */
export function buildWorkflowGraph(messages: UIMessage[]): WorkflowGraph {
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];

  let currentPhase = "Initial";
  let lastNodeId: string | null = null;
  const phaseNodes: Map<string, string[]> = new Map(); // Track nodes by phase for parallel grouping

  messages.forEach((message, idx) => {
    if (message.role === "user") {
      // User query node
      const nodeId = `user-${message.id}`;
      const queryText = getMessageText(message);

      nodes.push({
        id: nodeId,
        type: "user_query",
        label: extractQueryLabel(message),
        phase: currentPhase,
        messageId: message.id,
        messageIndex: idx,
        userQuery: queryText,
        timestamp: Date.now(),
        status: "completed",
      });

      // Link to previous node sequentially
      if (lastNodeId) {
        edges.push({
          id: `${lastNodeId}-${nodeId}`,
          source: lastNodeId,
          target: nodeId,
          type: "sequential",
        });
      }

      lastNodeId = nodeId;
    } else if (message.role === "assistant") {
      // Extract reasoning and metadata
      const reasoningText = extractReasoningText(message);
      const metadata = extractWorkflowMetadata(reasoningText);
      const toolCalls = extractToolCalls(message);

      // Determine phase
      if (metadata?.phase) {
        currentPhase = metadata.phase;
      } else if (toolCalls.length > 0) {
        currentPhase = detectPhaseFromTools(toolCalls, reasoningText);
      }

      // Create analysis node if there are tool calls
      if (toolCalls.length > 0) {
        const nodeId = `analysis-${message.id}`;
        const status: "completed" | "in_progress" | "error" =
          toolCalls.some((t) => t.isError) ? "error" : "completed";

        nodes.push({
          id: nodeId,
          type: "analysis",
          label: `${currentPhase}`,
          phase: currentPhase,
          messageId: message.id,
          messageIndex: idx,
          toolCalls,
          timestamp: Date.now(),
          status,
          metadata: metadata || undefined,
        });

        // Handle parallel vs sequential edges
        if (metadata?.isParallel && lastNodeId) {
          // Parallel: Add to phase group
          if (!phaseNodes.has(currentPhase)) {
            phaseNodes.set(currentPhase, []);
          }
          phaseNodes.get(currentPhase)!.push(nodeId);

          // Connect from previous node
          edges.push({
            id: `${lastNodeId}-${nodeId}`,
            source: lastNodeId,
            target: nodeId,
            type: "parallel",
          });
        } else if (lastNodeId) {
          // Sequential
          edges.push({
            id: `${lastNodeId}-${nodeId}`,
            source: lastNodeId,
            target: nodeId,
            type: "sequential",
          });
        }

        lastNodeId = nodeId;
      }

      // Create visualization node if there are artifacts
      if (hasArtifacts(message)) {
        const nodeId = `viz-${message.id}`;

        // Count artifact blocks
        const text = getMessageText(message);
        const artifactCount = (text.match(/```jsx/g) || []).length;

        nodes.push({
          id: nodeId,
          type: "visualization",
          label: `Visualization`,
          phase: currentPhase,
          messageId: message.id,
          messageIndex: idx,
          artifacts: [`artifact-${message.id}`], // Simplified - actual extraction happens in chat page
          timestamp: Date.now(),
          status: "completed",
        });

        // Link to previous node
        if (lastNodeId) {
          edges.push({
            id: `${lastNodeId}-${nodeId}`,
            source: lastNodeId,
            target: nodeId,
            type: "sequential",
          });
        }

        lastNodeId = nodeId;
      }
    }
  });

  return { nodes, edges };
}

/**
 * Get nodes for a specific phase
 */
export function getNodesForPhase(
  graph: WorkflowGraph,
  phase: string
): WorkflowNode[] {
  return graph.nodes.filter((node) => node.phase === phase);
}

/**
 * Get all unique phases in the workflow
 */
export function getAllPhases(graph: WorkflowGraph): string[] {
  const phases = new Set(graph.nodes.map((node) => node.phase));
  return Array.from(phases);
}

/**
 * Get nodes by type
 */
export function getNodesByType(
  graph: WorkflowGraph,
  type: "user_query" | "analysis" | "visualization"
): WorkflowNode[] {
  return graph.nodes.filter((node) => node.type === type);
}

/**
 * Count artifacts in workflow
 */
export function countArtifacts(graph: WorkflowGraph): number {
  return graph.nodes.reduce((count, node) => {
    return count + (node.artifacts?.length || 0);
  }, 0);
}
