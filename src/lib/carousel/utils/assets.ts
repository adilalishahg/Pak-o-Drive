import fs from 'fs';
import path from 'path';

/**
 * Resolves dedicated high-resolution 3D isometric octane graphics for specific tech topics
 */
export function getTopicImage(topic: string): Buffer | null {
  try {
    const topicLower = topic.toLowerCase();
    let fileName: string | null = null;
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
    } else if (
      topicLower.includes('microservice') ||
      topicLower.includes('monolith')
    ) {
      fileName = 'microservices.jpg';
    }

    if (!fileName) {
      return null;
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
