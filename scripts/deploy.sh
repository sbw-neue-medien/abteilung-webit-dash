#!/usr/bin/env bash
set -euo pipefail

SFTP_HOST="palladius.sui-inter.net"
SFTP_PORT="2121"
SFTP_USER="plc.sbw.media_w21zm3gj1c"

# Der SFTP-User landet im Server-Root, nicht in htdocs -- Pfad muss explizit angegeben werden.
SFTP_REMOTE="/domains/webit.sbw.media/"

# ── Management Summary ─────────────────────────────────────
echo "→ Management Summary generieren…"
pandoc management_summary.md \
  --template scripts/management-summary-template.html \
  -o public/management-summary.html

# ── Build ──────────────────────────────────────────────────
echo "→ Build starten…"
npm run build

# ── Deploy via lftp (SFTP) ─────────────────────────────────
# Passwort in ~/.netrc hinterlegen (chmod 600):
#   machine palladius.sui-inter.net login plc.sbw.media_w21zm3gj1c password <pw>

echo "→ Uploade dist/ nach ${SFTP_HOST}:${SFTP_PORT}${SFTP_REMOTE}…"
lftp -p "${SFTP_PORT}" -u "${SFTP_USER}" "sftp://${SFTP_HOST}" <<LFTP
set net:max-retries 3
set net:timeout 10

cd "${SFTP_REMOTE}"

# Alte Assets entfernen (Hashes ändern bei jedem Build)
glob rm -rf assets/*

# Ohne --delete: api/, uploads/ und alles andere auf dem Server bleibt unangetastet
mirror --reverse --parallel=4 --verbose dist/ .

# .htaccess separat (mirror überspringt dotfiles standardmässig)
put .htaccess -o .htaccess

quit
LFTP

echo "✓ Frontend deployed nach ${SFTP_HOST}"
