/**
 * Blog Markdown Sanitizer
 * Fixes malformed markdown artifacts emitted by AI models before rendering or saving:
 * 1. Malformed table separator lines (e.g. `|---|---|---|--->` with stray characters).
 * 2. Unbalanced pipes in table divider rows.
 * 3. Stray HTML tags or raw brackets that break remark-gfm parsing.
 */
export function sanitizeBlogMarkdown(rawContent: string): string {
  if (!rawContent || typeof rawContent !== 'string') {
    return '';
  }

  let cleaned = rawContent;

  // 1. Fix malformed table divider rows like:
  // |---|---|---|---|>
  // |:---|:---|:--->
  // | --- | --- | --- | >
  cleaned = cleaned.replace(
    /(\|(?:\s*:?-+:?\s*\|)+)(\s*>[^\n]*)/g,
    '$1'
  );

  // 2. Fix lines where divider row ends with stray characters after the last pipe
  cleaned = cleaned.replace(
    /^(\|(?:\s*:?-+:?\s*\|)+)[^|\n]+$/gm,
    '$1'
  );

  // 3. Ensure table divider rows have proper format matching column count
  const lines = cleaned.split('\n');
  const sanitizedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // If this line looks like a table separator with stray chars
    if (line.trim().startsWith('|') && line.includes('---')) {
      // Remove any trailing stray chars like '>' or non-pipe text at the end
      line = line.replace(/\|[^|\n]*>+\s*$/, '|');
      line = line.replace(/\|[^\-|:\s]+\s*$/, '|');
    }

    sanitizedLines.push(line);
  }

  return sanitizedLines.join('\n');
}

/**
 * Extracts key takeaways / summary bullet points for the "Executive Briefing" box.
 */
export function extractKeyTakeaways(content: string, maxItems: number = 3): string[] {
  if (!content) return [];

  // Look for bullet points in the first 1500 characters
  const earlyContent = content.slice(0, 1800);
  const bulletMatches = earlyContent.match(/^[-*]\s+\*{0,2}([^:\n*]+[:*]?\s*[^\n]+)/gm);

  if (bulletMatches && bulletMatches.length >= 2) {
    return bulletMatches
      .slice(0, maxItems)
      .map((b) => b.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').trim());
  }

  // Fallback: extract sentences from the first paragraph
  const paragraphs = content.split(/\n\n+/).filter((p) => !p.startsWith('#') && p.trim().length > 40);
  if (paragraphs.length > 0) {
    const sentences = paragraphs[0]
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 20)
      .slice(0, maxItems);
    if (sentences.length > 0) return sentences;
  }

  return [];
}
