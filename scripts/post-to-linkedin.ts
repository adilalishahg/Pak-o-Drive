import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('🚀 [LinkedIn] Initializing Auto-Post Dispatcher...');
  const { executeAutoLinkedInPost } = await import('../src/lib/socialAutoPostService');

  const result = await executeAutoLinkedInPost({
    source: 'cli-script',
    forceDynamic: true,
  });

  if (result.success) {
    console.log('\n======================================================');
    console.log('🎉 LinkedIn Post Published Successfully!');
    console.log(`📌 Topic:      ${result.topic}`);
    console.log(`🏷️ Track:      ${result.track}`);
    console.log(`📄 Format:     ${result.isCarousel ? 'Swipeable PDF Carousel' : 'Image/Text Post'}`);
    console.log(`🔗 Post ID:    ${result.postId}`);
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.error('\n❌ LinkedIn Post Failed:', result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error during LinkedIn post:', err);
  process.exit(1);
});
