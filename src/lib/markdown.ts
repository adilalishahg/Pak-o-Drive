/**
 * A safe and simple Markdown-to-HTML parser for policy page text fields.
 * Supports headings, bold text, bullet items, italics, paragraphs, and line breaks.
 */
export function parseMarkdown(md: string): string {
  if (!md) return '';

  // Escape HTML tags to prevent XSS
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^## (.*$)/gim, '<h3 class="fw-bold mt-4 mb-3 text-secondary">$1</h3>');
  html = html.replace(/^### (.*$)/gim, '<h4 class="fw-bold mt-3 mb-2 text-secondary">$1</h4>');

  // Bullet items
  html = html.replace(/^\* (.*$)/gim, '<li class="mb-2">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="mb-2">$1</li>');

  // Wrap consecutive list items in <ul>
  // A simple regex match for adjacent <li> tags
  html = html.replace(/((?:<li.*?>.*?<\/li>\s*)+)/g, '<ul class="ps-4 mb-4">$1</ul>');

  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italics
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Paragraphs (split by double newlines)
  const paragraphs = html.split(/\n{2,}/g);
  return paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      // If it already has block formatting, don't wrap in <p>
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<div')) {
        return trimmed;
      }
      // Otherwise replace single newlines with <br /> and wrap in <p>
      return `<p class="mb-3 text-muted" style="line-height: 1.7; font-size: 0.95rem;">${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}
