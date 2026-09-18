#!/usr/bin/env node
/**
 * Bulk Cleanup Script for Vercel Old & Preview Deployments
 * 
 * Usage:
 *   node scripts/clean-vercel-deployments.mjs <YOUR_VERCEL_TOKEN> [PROJECT_NAME]
 * 
 * How to get a Vercel Token (10 seconds):
 *   1. Visit https://vercel.com/account/tokens
 *   2. Click "Create Token" (Name: "cleaner", Scope: Full Account)
 *   3. Run: node scripts/clean-vercel-deployments.mjs vercel_tok_...
 */

const token = process.argv[2] || process.env.VERCEL_TOKEN;
const projectName = process.argv[3] || 'pakodrive';

if (!token) {
  console.log('\n❌ [Vercel Clean Error] Token missing!');
  console.log('👉 Usage: node scripts/clean-vercel-deployments.mjs <VERCEL_TOKEN> [project-name]');
  console.log('👉 Get token in 10s from: https://vercel.com/account/tokens\n');
  process.exit(1);
}

async function main() {
  console.log(`\n🔍 Connecting to Vercel API for project: "${projectName}"...`);

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Fetch deployments
    const listRes = await fetch(`https://api.vercel.com/v6/deployments?limit=100`, { headers });
    if (!listRes.ok) {
      const err = await listRes.text();
      throw new Error(`Failed to list deployments (${listRes.status}): ${err}`);
    }

    const data = await listRes.json();
    const deployments = (data.deployments || []).filter(
      (d) => !projectName || d.name?.toLowerCase() === projectName.toLowerCase()
    );

    if (deployments.length === 0) {
      console.log(`ℹ️ No deployments found matching "${projectName}". Total fetched: ${data.deployments?.length || 0}`);
      if (data.deployments?.length > 0) {
        console.log('Available project names in your account:');
        const names = [...new Set(data.deployments.map((d) => d.name))];
        names.forEach((n) => console.log(` - ${n}`));
      }
      return;
    }

    console.log(`📦 Found ${deployments.length} deployments for ${projectName}.`);

    // 2. Identify the active production deployment to NEVER delete it
    let activeProdId = null;
    for (const d of deployments) {
      if (d.target === 'production' && d.state === 'READY') {
        activeProdId = d.uid;
        console.log(`🛡️ Preserving Active Production Deployment: ${d.url} (${d.uid})`);
        break;
      }
    }

    // 3. Filter targets for deletion (all previews + older production builds)
    const toDelete = deployments.filter((d) => d.uid !== activeProdId);

    if (toDelete.length === 0) {
      console.log('✅ Nothing to clean up! Only the active production deployment exists.');
      return;
    }

    console.log(`🚀 Starting deletion of ${toDelete.length} old/preview deployments...`);

    let deletedCount = 0;
    let failedCount = 0;

    for (const dep of toDelete) {
      const isPreview = dep.target !== 'production';
      const typeLabel = isPreview ? 'PREVIEW' : 'OLD PROD';
      process.stdout.write(`⏳ Deleting [${typeLabel}] ${dep.url || dep.uid}... `);

      try {
        const delRes = await fetch(`https://api.vercel.com/v13/deployments/${dep.uid}`, {
          method: 'DELETE',
          headers,
        });

        if (delRes.ok) {
          deletedCount++;
          console.log('✅ Deleted');
        } else {
          failedCount++;
          const errText = await delRes.text();
          console.log(`❌ Failed: ${errText}`);
        }
      } catch (err) {
        failedCount++;
        console.log(`❌ Network Error: ${err.message}`);
      }

      // Small delay to be courteous to rate limits
      await new Promise((r) => setTimeout(r, 150));
    }

    console.log(`\n🎉 Cleanup Complete!`);
    console.log(`   - Deleted: ${deletedCount} deployments`);
    if (failedCount > 0) console.log(`   - Failed: ${failedCount} deployments`);
    console.log(`   - Functions Storage will drop significantly on Vercel Dashboard!\n`);
  } catch (err) {
    console.error(`\n❌ Error:`, err.message);
  }
}

main();
