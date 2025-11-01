import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

/**
 * Extract a concise insight from an analysis response using LLM
 *
 * This function makes a lightweight Haiku call to summarize the key finding
 * from a longer analysis response into a single, actionable insight.
 */
export async function extractInsightFromResponse(
  responseText: string,
  phase: string
): Promise<string | null> {
  if (!responseText || responseText.trim().length === 0) {
    return null;
  }

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5'),
      prompt: `You are analyzing the output from a metabolomics data analysis step.

Analysis Phase: ${phase}

Analysis Response:
${responseText}

Extract the single most important insight, finding, or action from this analysis.

Requirements:
- Maximum 100 characters
- Be specific and quantitative when possible
- Focus on: key findings, decisions made, actions taken, or important discoveries
- Use active voice
- No unnecessary words

Examples of good insights:
- "Loaded 245 metabolites across 120 samples from 3 batches"
- "High CV in lipids (avg 18%, max 34%) - flagged for review"
- "PCA: PC1 explains 67% variance, clear group separation"
- "Applied log + quantile normalization, reduced batch variance to 5%"
- "12 metabolites significantly different (p<0.05, FC>2)"

Return ONLY the insight text, nothing else.`,
    });

    const insight = text.trim();

    // Validate insight length
    if (insight.length > 150) {
      return insight.substring(0, 147) + '...';
    }

    return insight || null;
  } catch (error) {
    console.error('Error extracting insight:', error);
    return null;
  }
}

/**
 * Extract insights from multiple responses in parallel
 */
export async function extractInsightsInBatch(
  responses: Array<{ text: string; phase: string }>
): Promise<Array<string | null>> {
  return Promise.all(
    responses.map(({ text, phase }) => extractInsightFromResponse(text, phase))
  );
}
