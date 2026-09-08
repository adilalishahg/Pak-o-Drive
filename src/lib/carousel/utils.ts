import fs from 'fs';
import path from 'path';

/**
 * Sanitizes input string for standard PDF font rendering (ASCII only, no unmapped Unicode glyphs)
 */
export function cleanAscii(str?: string): string {
  if (!str) return '';
  return str
    .replace(/[➔➜➝]/g, '->')
    .replace(/[•●]/g, '-')
    .replace(/[⚡★☆]/g, '>')
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
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
 * Resolves dedicated high-resolution 3D isometric octane graphics for specific tech topics
 */
export function getTopicImage(topic: string): Buffer | null {
  try {
    const topicLower = topic.toLowerCase();
    let fileName = 'microservices.jpg';
    if (
      topicLower.includes('render') ||
      topicLower.includes('ssr') ||
      topicLower.includes('csr') ||
      topicLower.includes('ssg') ||
      topicLower.includes('isr')
    ) {
      fileName = 'rendering.jpg';
    } else if (
      topicLower.includes('database') ||
      topicLower.includes('index') ||
      topicLower.includes('sql') ||
      topicLower.includes('mongo') ||
      topicLower.includes('query')
    ) {
      fileName = 'database.jpg';
    } else if (
      topicLower.includes('react') ||
      topicLower.includes('next') ||
      topicLower.includes('compiler') ||
      topicLower.includes('component')
    ) {
      fileName = 'react19.jpg';
    }
    const fullPath = path.join(process.cwd(), 'public/img/tech-carousel', fileName);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath);
    }
  } catch (err) {
    console.warn('⚠️ Could not load local topic image:', err);
  }
  return null;
}
