import type { WorkflowToolCall } from "@/lib/types/workflow";

/**
 * Detect analysis phase from tool calls and reasoning text
 */
export function detectPhaseFromTools(
  toolCalls: WorkflowToolCall[],
  reasoningText?: string
): string {
  if (toolCalls.length === 0) {
    return "Analysis";
  }

  // Check reasoning text first for explicit phase annotation
  if (reasoningText) {
    const phaseMatch = reasoningText.match(/phase="([^"]+)"/i);
    if (phaseMatch) {
      return phaseMatch[1];
    }
  }

  // Analyze tool names to infer phase
  const toolNames = toolCalls.map((t) => t.toolName.toLowerCase());

  // Data Loading phase
  if (
    toolNames.some(
      (name) =>
        name.includes("load") ||
        name.includes("read") ||
        name.includes("fetch") ||
        name.includes("get_data")
    )
  ) {
    return "Data Loading";
  }

  // QC Assessment phase
  if (
    toolNames.some(
      (name) =>
        name.includes("cv") ||
        name.includes("coefficient") ||
        name.includes("quality") ||
        name.includes("qc") ||
        name.includes("check") ||
        name.includes("validate") ||
        name.includes("replicate")
    )
  ) {
    return "QC Assessment";
  }

  // Data Preprocessing phase
  if (
    toolNames.some(
      (name) =>
        name.includes("normalize") ||
        name.includes("transform") ||
        name.includes("filter") ||
        name.includes("clean") ||
        name.includes("preprocess") ||
        name.includes("impute") ||
        name.includes("scale")
    )
  ) {
    return "Data Preprocessing";
  }

  // Dimensionality Reduction phase
  if (
    toolNames.some(
      (name) =>
        name.includes("pca") ||
        name.includes("tsne") ||
        name.includes("umap") ||
        name.includes("dimension") ||
        name.includes("cluster")
    )
  ) {
    return "Dimensionality Reduction";
  }

  // Statistical Testing phase
  if (
    toolNames.some(
      (name) =>
        name.includes("stat") ||
        name.includes("test") ||
        name.includes("compare") ||
        name.includes("anova") ||
        name.includes("ttest") ||
        name.includes("correlation") ||
        name.includes("regression")
    )
  ) {
    return "Statistical Testing";
  }

  // Comparative Analysis phase
  if (
    toolNames.some(
      (name) =>
        name.includes("compare") ||
        name.includes("difference") ||
        name.includes("between") ||
        name.includes("contrast")
    )
  ) {
    return "Comparative Analysis";
  }

  // Exploratory Analysis phase
  if (
    toolNames.some(
      (name) =>
        name.includes("explore") ||
        name.includes("summarize") ||
        name.includes("describe") ||
        name.includes("distribution")
    )
  ) {
    return "Exploratory Analysis";
  }

  // Visualization phase
  if (
    toolNames.some(
      (name) =>
        name.includes("plot") ||
        name.includes("chart") ||
        name.includes("visualiz") ||
        name.includes("graph")
    )
  ) {
    return "Visualization";
  }

  // Default
  return "Analysis";
}

/**
 * Get phase color for visualization
 * Returns a color from the metabolomics color palette
 */
export function getPhaseColor(phase: string): string {
  const phaseColorMap: Record<string, string> = {
    "Data Loading": "#3b82f6", // blue
    "QC Assessment": "#8b5cf6", // purple
    "Data Preprocessing": "#6366f1", // indigo
    "Exploratory Analysis": "#10b981", // emerald
    "Statistical Testing": "#f59e0b", // amber
    "Dimensionality Reduction": "#ec4899", // pink
    "Comparative Analysis": "#06b6d4", // cyan
    "Visualization": "#14b8a6", // teal
    "Analysis": "#6b7280", // gray (default)
  };

  return phaseColorMap[phase] || phaseColorMap["Analysis"];
}

/**
 * Get phase icon name (lucide-react icon names)
 */
export function getPhaseIcon(phase: string): string {
  const phaseIconMap: Record<string, string> = {
    "Data Loading": "database",
    "QC Assessment": "shield-check",
    "Data Preprocessing": "filter",
    "Exploratory Analysis": "search",
    "Statistical Testing": "calculator",
    "Dimensionality Reduction": "git-branch",
    "Comparative Analysis": "git-compare",
    "Visualization": "bar-chart-3",
    "Analysis": "activity",
  };

  return phaseIconMap[phase] || phaseIconMap["Analysis"];
}

/**
 * Determine if this phase typically involves parallel processing
 */
export function isTypicallyParallel(phase: string): boolean {
  const parallelPhases = ["QC Assessment", "Exploratory Analysis"];
  return parallelPhases.includes(phase);
}
