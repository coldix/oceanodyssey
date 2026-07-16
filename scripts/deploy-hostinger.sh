#!/usr/bin/env bash
# Ocean Odyssey v1.0.0 | Designed by Colin Dixon + Grok | 2026-07-16 10:32:00 AEST (Melbourne) | Website by https://oze.au
# Deploy dist/ to Hostinger, preserving /old/
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
REMOTE="${HOSTINGER_REMOTE:-hsa:domains/oceanodyssey.net/public_html}"
rsync -avz --delete \
  --exclude 'old/' \
  --exclude 'old.zip' \
  --exclude '.private/' \
  dist/ "$REMOTE/"
ssh hsa 'chmod 775 domains/oceanodyssey.net/public_html/data 2>/dev/null || true'
echo "Deployed to $REMOTE"
