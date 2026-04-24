#!/usr/bin/env bash
set -euo pipefail

# ── Konfiguration ──────────────────────────────────────────
# Ziel-Verzeichnis anpassen (lokaler Pfad oder user@host:/pfad)
# WICHTIG: Darf NICHT das Projektverzeichnis selbst sein!
DEPLOY_TARGET="/var/www/html/webit"

# ── Sicherheitscheck ───────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESOLVED_TARGET="$(realpath -m "${DEPLOY_TARGET}")"

if [[ "${RESOLVED_TARGET}" == "${SCRIPT_DIR}" || "${SCRIPT_DIR}" == "${RESOLVED_TARGET}"* ]]; then
  echo "FEHLER: DEPLOY_TARGET darf nicht das Projektverzeichnis sein!" >&2
  exit 1
fi

# ── Build ──────────────────────────────────────────────────
echo "→ Build starten…"
npm run build

# ── Deploy ────────────────────────────────────────────────
echo "→ Deploye dist/ nach ${DEPLOY_TARGET}…"
rsync -av \
  --exclude='.htaccess' \
  --exclude='api/' \
  --exclude='uploads/' \
  dist/ "${DEPLOY_TARGET}/"

# .htaccess separat (nur wenn noch nicht vorhanden oder explizit gewollt)
rsync -av .htaccess "${DEPLOY_TARGET}/.htaccess"

echo "✓ Frontend deployed nach ${DEPLOY_TARGET}"
