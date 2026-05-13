#!/usr/bin/env bash
set -euo pipefail

FTP_HOST="palladius.sui-inter.net"
FTP_USER="ftp.webit"

FTP_REMOTE="/"   # HTTP-Root auf dem Server

# ── Management Summary ─────────────────────────────────────
echo "→ Management Summary generieren…"
pandoc management_summary.md \
  --template scripts/management-summary-template.html \
  -o public/management-summary.html

# ── Build ──────────────────────────────────────────────────
echo "→ Build starten…"
npm run build

# ── Deploy via lftp ────────────────────────────────────────
# store password in .netrc for lftp
# echo "machine ${FTP_HOST} login ${FTP_USER} password ${FTP_PASSWORD}" > ~/.netrc
# chmod 600 ~/.netrc

echo "→ Uploade dist/ nach ${FTP_HOST}${FTP_REMOTE}…"
lftp -u "${FTP_USER}" "${FTP_HOST}" <<'LFTP'
set ftp:ssl-allow yes
set net:max-retries 3
set net:timeout 10

# Alte Assets entfernen (Hashes ändern bei jedem Build)
glob rm -rf /assets/*

# Ohne --delete: api/, uploads/ und alles andere auf dem Server bleibt unangetastet
mirror --reverse --parallel=4 --verbose dist/ /

# .htaccess separat (mirror überspringt dotfiles standardmässig)
put .htaccess -o /.htaccess

quit
LFTP

echo "✓ Frontend deployed nach ${FTP_HOST}"
