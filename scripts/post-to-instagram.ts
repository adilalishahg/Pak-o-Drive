import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('🚀 [Instagram] Initializing Auto-Post Dispatcher...');
  const { executeAutoInstagramPost } = await import('../src/lib/instagramAutoPostService');

  const result = await executeAutoInstagramPost({
    source: 'cli-script',
  });

  if (result.success) {
    console.log('\n======================================================');
    console.log('🎉 Instagram Post Published Successfully!');
    console.log(`📌 Topic:      ${result.topic}`);
    console.log(`🏷️ Category:   ${result.category}`);
    console.log(`🔗 Post ID:    ${result.postId}`);
    if (result.permalink) {
      console.log(`🌐 Live Link:  ${result.permalink}`);
    }
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.error('\n❌ Instagram Post Failed:', result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error during Instagram post:', err);
  process.exit(1);
});
