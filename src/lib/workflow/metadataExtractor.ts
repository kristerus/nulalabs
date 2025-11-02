import type { WorkflowMetadata } from "@/lib/types/workflow";

/**
 * Extract workflow metadata from AI reasoning text
 *
 * Looks for annotations like:
 * [WORKFLOW: type="parallel" phase="QC Assessment" insight="Key finding here"]
 * [WORKFLOW: type="sequential" phase="Data Loading" insight="Loaded 245 metabolites"]
 */
export function extractWorkflowMetadata(text: string): WorkflowMetadata | null {
  if (!text) return null;

  // Match workflow annotation pattern with optional insight field
  const workflowPattern = /\[WORKFLOW:\s*type="(parallel|sequential)"(?:\s+phase="([^"]+)")?(?:\s+insight="([^"]+)")?\]/i;
  const match = text.match(workflowPattern);

  if (!match) return null;

  const [, type, phase, insight] = match;

  return {
    isParallel: type === "parallel",
    phase: phase || undefined,
    insight: insight || undefined,
    description: text.trim(),
  };
}

/**
 * Extract all workflow annotations from text
 * Returns array of metadata objects with their positions
 */
export function extractAllWorkflowAnnotations(
  text: string
): Array<{ metadata: WorkflowMetadata; index: number }> {
  if (!text) return [];

  const results: Array<{ metadata: WorkflowMetadata; index: number }> = [];
  const workflowPattern = /\[WORKFLOW:\s*type="(parallel|sequential)"(?:\s+phase="([^"]+)")?(?:\s+insight="([^"]+)")?\]/gi;

  let match: RegExpExecArray | null;
  while ((match = workflowPattern.exec(text)) !== null) {
    const [, type, phase, insight] = match;
    results.push({
      metadata: {
        isParallel: type === "parallel",
        phase: phase || undefined,
        insight: insight || undefined,
        description: text.substring(
          Math.max(0, match.index - 50),
          Math.min(text.length, match.index + match[0].length + 50)
        ),
      },
      index: match.index,
    });
  }

  return results;
}

/**
 * Check if text contains any workflow annotations
 */
export function hasWorkflowAnnotations(text: string): boolean {
  if (!text) return false;
  return /\[WORKFLOW:\s*type="(parallel|sequential)"/i.test(text);
}

/**
 * Remove workflow annotations from text for display
 */
export function stripWorkflowAnnotations(text: string): string {
  if (!text) return text;
  return text.replace(/\[WORKFLOW:\s*type="(parallel|sequential)"(?:\s+phase="([^"]+)")?\]/gi, "").trim();
}

/**
 * Extract phase name from text
 * First tries to find explicit phase annotation, then falls back to context clues
 */
export function extractPhase(text: string): string | null {
  if (!text) return null;

  // Try explicit phase annotation first
  const phaseMatch = text.match(/phase="([^"]+)"/i);
  if (phaseMatch) {
    return phaseMatch[1];
  }

  // Try to infer from context
  const lowerText = text.toLowerCase();

  if (lowerText.includes("loading") || lowerText.includes("load data")) {
    return "Data Loading";
  }
  if (
    lowerText.includes("qc") ||
    lowerText.includes("quality") ||
    lowerText.includes("coefficient of variation")
  ) {
    return "QC Assessment";
  }
  if (lowerText.includes("preprocess") || lowerText.includes("normalize") || lowerText.includes("transform")) {
    return "Data Preprocessing";
  }
  if (lowerText.includes("pca") || lowerText.includes("dimensionality")) {
    return "Dimensionality Reduction";
  }
  if (
    lowerText.includes("statistical") ||
    lowerText.includes("test") ||
    lowerText.includes("compare")
  ) {
    return "Statistical Testing";
  }
  if (lowerText.includes("exploratory") || lowerText.includes("explore")) {
    return "Exploratory Analysis";
  }
  if (lowerText.includes("visualiz")) {
    return "Visualization";
  }

  return null;
}
