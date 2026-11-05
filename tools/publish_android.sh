#!/usr/bin/env bash
# Prende l'ultimo APK compilato da GitHub e lo mette sul server: da lì si scarica in Impostazioni → Aura.
set -euo pipefail
source "$HOME/.cerini-ia/deploy.env"
: "${PROXMOX_HOST:?}" "${CT_ID:?}"
SSH=(ssh ${SSH_KEY:+-i "$SSH_KEY"}); SCP=(scp -q ${SSH_KEY:+-i "$SSH_KEY"})
RUN=$(gh run list --workflow android.yml --status success --limit 1 --json databaseId --jq '.[0].databaseId')
[ -n "$RUN" ] || { echo "Nessuna compilazione riuscita"; exit 1; }
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
gh run download "$RUN" --name aura-android --dir "$TMP" || { echo "Questa compilazione non ha un APK: mancano i segreti (tools/android_secrets.sh)"; exit 1; }
"${SCP[@]}" "$TMP/aura.apk" "$TMP/aura.version" "$PROXMOX_HOST:/tmp/"
"${SSH[@]}" "$PROXMOX_HOST" "pct exec $CT_ID -- mkdir -p /opt/ollama-web/data/app && pct push $CT_ID /tmp/aura.apk /opt/ollama-web/data/app/aura.apk && pct push $CT_ID /tmp/aura.version /opt/ollama-web/data/app/aura.version && pct exec $CT_ID -- chown -R ollamaweb:ollamaweb /opt/ollama-web/data/app; rm -f /tmp/aura.apk /tmp/aura.version"
echo "Pubblicata la versione $(tr -d '\r\n' < "$TMP/aura.version")"
