/**
 * Extract a simple insight from response text without LLM calls
 *
 * Focus on FINDINGS/RESULTS, not actions:
 * - Look for quantitative results (numbers, percentages, counts)
 * - Extract conclusions and discoveries
 * - Avoid action verbs (Loading, Calling, Running, etc.)
 * - Prioritize "what we found" over "what we did"
 */

/**
 * Extract insight by finding results/findings in the text
 */
export function extractSimpleInsight(text: string, maxLength: number = 120): string | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  // Clean the text
  let cleanText = text.trim();

  // Filter out sentences that describe actions rather than findings
  const actionVerbs = ['loading', 'calling', 'running', 'executing', 'processing', 'using', 'analyzing', 'checking'];
  const skipPatterns = actionVerbs.map(v => new RegExp(`^${v}\\b`, 'i'));

  // Remove markdown formatting
  cleanText = cleanText
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove code marks
    .replace(/#+\s+/g, ''); // Remove headers

  // Split into sentences
  const sentences = cleanText.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);

  if (sentences.length === 0) {
    return null;
  }

  // Find first sentence that contains a finding (not an action)
  let insight: string | null = null;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();

    // Skip if sentence starts with action verb
    if (skipPatterns.some(pattern => pattern.test(trimmed))) {
      continue;
    }

    // Prefer sentences with numbers (quantitative results)
    const hasNumbers = /\d+/.test(trimmed);

    // Prefer sentences with result keywords
    const resultKeywords = ['found', 'detected', 'identified', 'shows', 'contains', 'reveals', 'has', 'were', 'are'];
    const hasResultKeyword = resultKeywords.some(keyword =>
      trimmed.toLowerCase().includes(keyword)
    );

    if (hasNumbers || hasResultKeyword) {
      insight = trimmed;
      break;
    }

    // If no better match, use first non-action sentence
    if (!insight) {
      insight = trimmed;
    }
  }

  if (!insight) {
    return null;
  }

  // If insight is very short and we have a second sentence, try to include it
  if (insight.length < 50 && sentences.length > 1) {
    const secondSentence = sentences[1]?.trim();
    if (secondSentence && !skipPatterns.some(pattern => pattern.test(secondSentence))) {
      const combined = `${insight}. ${secondSentence}`;
      if (combined.length <= maxLength) {
        insight = combined;
      }
    }
  }

  // Truncate if too long
  if (insight.length > maxLength) {
    insight = insight.substring(0, maxLength - 3) + '...';
  }

  // Clean up any remaining artifacts
  insight = insight
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^[:\-•\s]+/, '') // Remove leading punctuation
    .trim();

  return insight || null;
}

/**
 * Extract insight with context about the analysis phase
 */
export function extractInsightWithPhase(
  text: string,
  phase: string,
  maxLength: number = 120
): string | null {
  const insight = extractSimpleInsight(text, maxLength);

  if (!insight) {
    return null;
  }

  // Check if insight already mentions key phase terms
  const phaseTerms = {
    'Data Loading': ['load', 'dataset', 'data', 'file'],
    'QC Assessment': ['qc', 'quality', 'cv', 'coefficient'],
    'Data Preprocessing': ['normaliz', 'transform', 'preprocess', 'filter'],
    'Exploratory Analysis': ['explor', 'distribution', 'summary'],
    'Statistical Testing': ['test', 'significant', 'p-value', 'statistics'],
    'Dimensionality Reduction': ['pca', 'dimension', 'component'],
    'Comparative Analysis': ['compar', 'differ', 'between', 'groups'],
    'Visualization': ['plot', 'chart', 'visualiz', 'graph'],
  };

  const relevantTerms = phaseTerms[phase as keyof typeof phaseTerms] || [];
  const hasPhaseContext = relevantTerms.some(term =>
    insight.toLowerCase().includes(term)
  );

  // If insight doesn't mention phase context and is generic, return null
  // This prevents showing unhelpful insights like "Let me analyze this..."
  if (!hasPhaseContext && (
    insight.toLowerCase().startsWith('let me') ||
    insight.toLowerCase().startsWith('i will') ||
    insight.toLowerCase().startsWith('i can') ||
    insight.toLowerCase().startsWith('i\'ll')
  )) {
    return null;
  }

  return insight;
}
