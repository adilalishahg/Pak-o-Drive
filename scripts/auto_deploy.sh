#!/bin/bash
# Pak-o-Drive Alwaysdata Auto-Deploy Script
echo "🚀 [Pak-o-Drive] Pulling latest code from GitHub..."
cd /home/adilalishahg/Pak-o-Drive || exit
git pull origin main

echo "📦 [Pak-o-Drive] Syncing bot worker..."
cp src/worker/bot.mjs /home/adilalishahg/bot/bot.mjs 2>/dev/null || true

echo "🔄 [Pak-o-Drive] Restarting WhatsApp Bot..."
pkill -f "bot.mjs" || true

echo "✅ [Pak-o-Drive] Deployment finished successfully!"
