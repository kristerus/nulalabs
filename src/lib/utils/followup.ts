/**
 * Extract follow-up question from AI message text
 *
 * The AI is instructed to end responses with:
 * ---FOLLOWUP---
 * [suggested question]
 *
 * This function parses the text and returns the suggested question.
 */

const FOLLOWUP_DELIMITER = '---FOLLOWUP---';

export function extractFollowupQuestion(text: string): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Check if delimiter exists
  if (!text.includes(FOLLOWUP_DELIMITER)) {
    return null;
  }

  // Split by delimiter and get the part after it
  const parts = text.split(FOLLOWUP_DELIMITER);

  if (parts.length < 2) {
    return null;
  }

  // Get the follow-up text (everything after the delimiter)
  const followupText = parts[1].trim();

  if (!followupText || followupText.length === 0) {
    return null;
  }

  // Remove any trailing punctuation if needed, but keep question marks
  return followupText;
}

/**
 * Remove follow-up delimiter and question from display text
 * This ensures the follow-up doesn't appear in the chat message
 */
export function removeFollowupFromText(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  if (!text.includes(FOLLOWUP_DELIMITER)) {
    return text;
  }

  // Split by delimiter and return only the part before it
  const parts = text.split(FOLLOWUP_DELIMITER);
  return parts[0].trim();
}
