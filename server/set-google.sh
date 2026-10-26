#!/usr/bin/env bash
# Configura il collegamento a Gmail (Google OAuth). Il segreto non viene mostrato a schermo.
set -euo pipefail
DEST=/opt/ollama-web
cd "$DEST"

echo "URI di reindirizzamento da mettere in Google Cloud: $(grep -oP '^PUBLIC_URL=\K.*' .env || echo https://assistente.example.com)/api/gmail/callback"
read -rp "ID client (finisce con .apps.googleusercontent.com): " ID
read -rsp "Client secret: " SECRET; echo
[ -n "$ID" ] && [ -n "$SECRET" ] || { echo "Servono entrambi."; exit 1; }

sed -i '/^GOOGLE_CLIENT_/d' .env
cat >> .env <<EOF
GOOGLE_CLIENT_ID=$ID
GOOGLE_CLIENT_SECRET=$SECRET
EOF
chmod 640 .env
systemctl restart ollama-web
echo "Fatto. Ora nel pannello: Impostazioni → Account → Gmail → Collega Gmail."
