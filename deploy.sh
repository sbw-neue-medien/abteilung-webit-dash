#!/usr/bin/env bash
set -euo pipefail

FTP_HOST="palladius.sui-inter.net"
FTP_USER="ftp.webit"
FTP_REMOTE="/"   # HTTP-Root auf dem Server

# ── Build ──────────────────────────────────────────────────
echo "→ Build starten…"
npm run build

# ── Deploy via lftp ────────────────────────────────────────
echo "→ Uploade dist/ nach ${FTP_HOST}${FTP_REMOTE}…"
lftp -u "${FTP_USER}" "${FTP_HOST}" <<'LFTP'
set ftp:ssl-allow yes
set net:max-retries 3
set net:timeout 10

# Ohne --delete: api/, uploads/ und alles andere auf dem Server bleibt unangetastet
mirror --reverse --parallel=4 --verbose dist/ /

# .htaccess separat (mirror überspringt dotfiles standardmässig)
put .htaccess -o /.htaccess

quit
LFTP

echo "✓ Frontend deployed nach ${FTP_HOST}"
