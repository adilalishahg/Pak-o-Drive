'use client';

import React, { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Zero-dependency inline markdown-to-HTML renderer.
 * Handles: **bold**, *italic*, ### headings, - bullets, numbered lists,
 * line breaks, --- horizontal rules. No external library needed.
 * Compatible with Next.js 16 Turbopack without any @swc/helpers issues.
 */
function parseMarkdown(md: string): string {
  const lines = md.split('\n');
  const output: string[] = [];
  let inUl = false;
  let inOl = false;

  const flushList = () => {
    if (inUl) { output.push('</ul>'); inUl = false; }
    if (inOl) { output.push('</ol>'); inOl = false; }
  };

  const inlineFormat = (text: string): string => {
    return text
      // **bold**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // *italic* (but not ** already matched)
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
      // `code`
      .replace(/`(.+?)`/g, '<code style="background:#f3f4f6;padding:1px 5px;border-radius:3px;font-size:0.85em">$1</code>');
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Horizontal rule ---
    if (/^[-*]{3,}$/.test(line.trim())) {
      flushList();
      output.push('<hr style="border:none;border-top:1px solid #e5e7eb;margin:0.8em 0">');
      continue;
    }

    // Headings
    const h3 = line.match(/^#{3,}\s+(.+)/);
    if (h3) { flushList(); output.push(`<h3 class="md-h3">${inlineFormat(h3[1])}</h3>`); continue; }
    const h2 = line.match(/^#{2}\s+(.+)/);
    if (h2) { flushList(); output.push(`<h2 class="md-h2">${inlineFormat(h2[1])}</h2>`); continue; }
    const h1 = line.match(/^#{1}\s+(.+)/);
    if (h1) { flushList(); output.push(`<h1 class="md-h1">${inlineFormat(h1[1])}</h1>`); continue; }

    // Unordered list item: - or *
    const ul = line.match(/^[-*]\s+(.+)/);
    if (ul) {
      if (inOl) { output.push('</ol>'); inOl = false; }
      if (!inUl) { output.push('<ul>'); inUl = true; }
      output.push(`<li>${inlineFormat(ul[1])}</li>`);
      continue;
    }

    // Ordered list item: 1. 2. etc.
    const ol = line.match(/^\d+\.\s+(.+)/);
    if (ol) {
      if (inUl) { output.push('</ul>'); inUl = false; }
      if (!inOl) { output.push('<ol>'); inOl = true; }
      output.push(`<li>${inlineFormat(ol[1])}</li>`);
      continue;
    }

    // Empty line → paragraph break
    if (line.trim() === '') {
      flushList();
      output.push('<br>');
      continue;
    }

    // Regular paragraph text
    flushList();
    output.push(`<p>${inlineFormat(line)}</p>`);
  }

  flushList();

  // Collapse multiple consecutive <br> into one
  return output.join('\n').replace(/(<br>\s*){2,}/g, '<br>');
}

export function MarkdownRenderer({ content, className = '', style }: MarkdownRendererProps) {
  const html = useMemo(() => parseMarkdown(content || ''), [content]);

  return (
    <div
      className={`markdown-body ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
