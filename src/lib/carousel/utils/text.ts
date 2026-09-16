import type { PDFFont } from 'pdf-lib';

/**
 * Sanitizes input string for standard PDF font rendering (ASCII only, no unmapped Unicode glyphs).
 * Strips markdown asterisks (* and **), backticks, hashes, and redundant leading bullets/dashes.
 */
export function cleanAscii(str?: string): string {
  if (!str) return '';
  return str
    .replace(/[➔➜➝→➤►]/g, '->')
    .replace(/[⚡★☆💎📌✨🔥]/g, ' ')
    .replace(/[*#`~]/g, '') // Strip all markdown asterisks, hashes, backticks, tildes
    .replace(/^[•●\-\*\>\s]+/, '') // Strip redundant leading bullets, dashes, asterisks
    .replace(/[•●]/g, ' ') // Mid-sentence bullets replaced with space
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Helper to wrap text into multiple lines given max characters per line
 */
export function wrapTextLines(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Wraps text strictly according to exact measured font width.
 * Prevents any text from exceeding maxWidth. Handles newlines cleanly.
 */
export function wrapTextByWidth(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  if (!text) return [];
  const clean = cleanAscii(text);
  const paragraphs = clean.split('\n');
  const resultLines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    let currentLine = '';
    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(candidate, fontSize);

      if (width <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          resultLines.push(currentLine);
          // Check if word itself exceeds maxWidth
          if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
            let chunk = '';
            for (const char of word) {
              if (font.widthOfTextAtSize(chunk + char, fontSize) <= maxWidth) {
                chunk += char;
              } else {
                if (chunk) resultLines.push(chunk);
                chunk = char;
              }
            }
            currentLine = chunk;
          } else {
            currentLine = word;
          }
        } else {
          // Single word longer than line
          let chunk = '';
          for (const char of word) {
            if (font.widthOfTextAtSize(chunk + char, fontSize) <= maxWidth) {
              chunk += char;
            } else {
              if (chunk) resultLines.push(chunk);
              chunk = char;
            }
          }
          currentLine = chunk;
        }
      }
    }
    if (currentLine) {
      resultLines.push(currentLine);
    }
  }

  return resultLines;
}
