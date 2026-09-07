import dbConnect from './src/lib/mongodb.js';
import { executeAutoLinkedInPost } from './src/lib/socialAutoPostService.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('⚡ Starting LinkedIn Auto-Post Test...');
  const res = await executeAutoLinkedInPost();
  console.log('POST RESULT:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
