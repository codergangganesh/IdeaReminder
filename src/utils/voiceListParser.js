/**
 * Parses spoken text into multiple distinct checklist/subitem strings.
 * 
 * Handles voice patterns such as:
 * - "apples, bananas, oranges, milk"
 * - "apples, bananas, oranges and milk"
 * - "apples and bananas and oranges and milk"
 * - "1. apples 2. bananas 3. oranges"
 * - "first apples second bananas third oranges"
 * - "apples then bananas then milk"
 * - Line breaks / bullet points
 * 
 * @param {string} rawText The speech transcript or user text
 * @returns {string[]} Array of separated, cleaned items
 */
export function parseSpokenItems(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];
  const text = rawText.trim();
  if (!text) return [];

  let rawList = [];

  // Case 1: Multiple lines (newlines)
  if (text.includes('\n')) {
    rawList = text.split(/\r?\n+/);
  }
  // Case 2: Numbered or bullet list ("1. ... 2. ...", "1) ... 2) ...", "- ... - ...", "• ...")
  else if (/(?:^|\s+)(?:\d+[\.\)]|[-*•])\s+/i.test(text)) {
    rawList = text.split(/(?:^|\s+)(?:\d+[\.\)]|[-*•])\s+/i);
  }
  // Case 3: Sequential ordinal words: "first ... second ... third ..."
  else if (/\b(?:first|second|third|fourth|fifth|sixth)\b/i.test(text)) {
    rawList = text.split(/\s*(?:\b(?:first|second|third|fourth|fifth|sixth|lastly|finally)\b[:,]?\s*)/i);
  }
  // Case 4: Comma or semicolon delimited (standard speech list)
  else if (text.includes(',') || text.includes(';')) {
    const chunks = text.split(/[,;]+/);
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;

      // Check if chunk starts with conjunction like "and", "then", "also", "plus"
      const strippedConjunction = trimmed.replace(/^(?:and|also|plus|then)\s+/i, '');

      // Check if the final chunk has " and " inside it (e.g., "oranges and milk")
      // Avoid splitting common fixed idioms if possible
      const isFixedIdiom = /\b(bread\s+and\s+butter|salt\s+and\s+pepper|mac\s+and\s+cheese|fish\s+and\s+chips)\b/i.test(strippedConjunction);
      if (!isFixedIdiom && /\s+and\s+/i.test(strippedConjunction)) {
        const subParts = strippedConjunction.split(/\s+and\s+/i);
        rawList.push(...subParts);
      } else {
        rawList.push(strippedConjunction);
      }
    }
  }
  // Case 5: "then" separated list (e.g. "buy apples then bananas then milk")
  else if (/\s+then\s+/i.test(text)) {
    rawList = text.split(/\s+then\s+/i);
  }
  // Case 6: Multiple "and"s without commas: "apples and bananas and oranges and milk"
  else if ((text.match(/\s+and\s+/gi) || []).length >= 2) {
    rawList = text.split(/\s+and\s+/i);
  }
  // Case 7: Single item
  else {
    rawList = [text];
  }

  // Clean each item
  const cleaned = rawList
    .map((item) => {
      let str = item.trim();
      // Remove leading bullet symbols, numbers, or introductory words
      str = str.replace(/^(?:[-*•]|\d+[\.\)]|\b(?:and|then|also|plus|item|task)\b)\s*/i, '').trim();
      // Remove trailing punctuation (. , ;)
      str = str.replace(/[.,;]+$/, '').trim();
      if (!str) return '';

      // Capitalize first letter of each item
      return str.charAt(0).toUpperCase() + str.slice(1);
    })
    .filter((str) => str.length > 0);

  return cleaned.length > 0 ? cleaned : [text];
}
