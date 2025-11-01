import { UIMessage } from 'ai';

export interface ToolCallSummary {
  toolName: string;
  args: Record<string, any>;
  result: any;
  messageId: string;
  messageIndex: number;
  timestamp?: number;
}

export interface DataContextSummary {
  toolCalls: ToolCallSummary[];
  loadedDatasets: string[];
  availableInformation: string[];
  lastUpdated: number;
}

/**
 * Analyzes message history to extract tool calls and their results
 * This helps the AI understand what data is already available in context
 */
export function buildDataContext(messages: UIMessage[]): DataContextSummary {
  const toolCalls: ToolCallSummary[] = [];
  const loadedDatasets = new Set<string>();
  const availableInfo = new Set<string>();

  messages.forEach((message, idx) => {
    // Only look at assistant messages that might contain tool calls
    if (message.role === 'assistant' && message.parts) {
      message.parts.forEach((part: any) => {
        // Check for tool calls (AI SDK v5 format - be permissive with types)
        const isToolCall = part.type === 'tool-call' ||
                          part.type === 'dynamic-tool' ||
                          part.type?.startsWith('tool-') ||
                          part.toolName; // Has toolName property

        if (isToolCall) {
          const toolName = part.toolName;
          const args = part.args || {};

          // Skip if toolName is undefined
          if (!toolName) {
            console.warn('[Context] Skipping tool call with undefined toolName', { part });
            return;
          }

          // Find the corresponding tool result
          const resultPart: any = message.parts?.find((p: any) =>
            p.type === 'tool-result' && p.toolCallId === part.toolCallId
          );

          const summary: ToolCallSummary = {
            toolName,
            args,
            result: resultPart?.result || null,
            messageId: message.id,
            messageIndex: idx,
          };

          toolCalls.push(summary);

          // Extract semantic information about what was loaded
          const datasetInfo = inferDatasetInfo(toolName, args, resultPart?.result);
          if (datasetInfo.dataset) {
            loadedDatasets.add(datasetInfo.dataset);
          }
          datasetInfo.information.forEach(info => availableInfo.add(info));
        }
      });
    }
  });

  return {
    toolCalls,
    loadedDatasets: Array.from(loadedDatasets),
    availableInformation: Array.from(availableInfo),
    lastUpdated: Date.now(),
  };
}

/**
 * Infer what kind of data was loaded based on tool name and arguments
 * This helps track what datasets are available in the conversation
 */
function inferDatasetInfo(
  toolName: string,
  args: Record<string, any>,
  result: any
): { dataset: string | null; information: string[] } {
  const info: string[] = [];
  let dataset: string | null = null;

  // Safety check
  if (!toolName || typeof toolName !== 'string') {
    return { dataset, information: info };
  }

  // Common patterns for data-loading tools
  if (toolName.includes('load') || toolName.includes('get') || toolName.includes('read')) {
    // Try to infer dataset name
    if (toolName.includes('compound')) {
      dataset = 'Compound list';
      info.push('compound names, formulas, retention times');
    } else if (toolName.includes('cv') || toolName.includes('coefficient')) {
      dataset = 'CV analysis results';
      info.push('CV values by extraction method');
      info.push('quality metrics (CV distribution, outliers)');
    } else if (toolName.includes('acquisition')) {
      dataset = 'Acquisition data';
      info.push('sample acquisition information');
    } else {
      // Generic data loading
      dataset = 'Dataset';
      info.push('analysis data');
    }

    // Check if result gives us more info
    if (result && typeof result === 'object') {
      if (result.rowCount || result.length) {
        const count = result.rowCount || result.length;
        dataset = dataset ? `${dataset} (${count} rows)` : `Dataset (${count} rows)`;
      }
    }
  }

  // Analysis tools
  if (toolName.includes('analyze') || toolName.includes('calculate')) {
    info.push(`${toolName} analysis results`);
  }

  return { dataset, information: info };
}

/**
 * Generate a concise context string to inject into the system prompt
 * Optimized for token reduction
 */
export function formatContextForPrompt(context: DataContextSummary): string {
  if (context.toolCalls.length === 0) {
    return ''; // No context to add yet
  }

  const sections: string[] = [];

  sections.push('## Previous Data Loaded\n');

  // Concise dataset list
  if (context.loadedDatasets.length > 0) {
    sections.push(`Datasets: ${context.loadedDatasets.join(', ')}`);
  }

  // Concise info list (limit to 3 most recent)
  if (context.availableInformation.length > 0) {
    const recentInfo = context.availableInformation.slice(-3);
    sections.push(`Info: ${recentInfo.join(', ')}`);
  }

  // Condensed instructions
  sections.push('\n⚠️ REUSE existing data. Only reload if user requests new/different data.\n');

  return sections.join('\n');
}

/**
 * Check if a tool call would be redundant based on context
 * Returns true if this exact tool call was already made
 */
export function isRedundantToolCall(
  toolName: string,
  args: Record<string, any>,
  context: DataContextSummary
): boolean {
  return context.toolCalls.some(call => {
    if (call.toolName !== toolName) return false;

    // Compare arguments (simple equality check)
    const argsMatch = JSON.stringify(call.args) === JSON.stringify(args);
    return argsMatch;
  });
}

/**
 * Get a previous tool result if it exists
 */
export function getCachedToolResult(
  toolName: string,
  args: Record<string, any>,
  context: DataContextSummary
): any | null {
  const match = context.toolCalls.find(call => {
    if (call.toolName !== toolName) return false;
    return JSON.stringify(call.args) === JSON.stringify(args);
  });

  return match?.result || null;
}
