/**
 * Pre-defined suggestion queries for the welcome screen
 * These are example queries users can click to start conversations
 */

export const suggestions = [
  "What data is available to analyze?",
  "Show me a summary of the dataset",
  "Create a visualization of the key metrics",

] as const;

export type SuggestionQuery = typeof suggestions[number];
