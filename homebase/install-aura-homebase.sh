#!/usr/bin/env bash
# Collega Aura (Cerini IA) alla Homebase. Da eseguire sul nodo Proxmox come root, dalla cartella homebase/ del progetto.
# 1. crea una chiave segreta nel .env di Cerini IA (se non c'è già)
# 2. salva sulla Homebase solo l'impronta della chiave (sha256), con l'IP di Cerini IA come unico mittente
# 3. installa api/aura.php (la porta d'ingresso con l'elenco chiuso di azioni) e riavvia Cerini IA
#
# Variabili (cambiale per la tua rete):
#   CT_AURA / CT_HOME   numeri dei container    AURA_IP / HOME_IP   i loro indirizzi
#   HOME_HOST           il nome con cui la Homebase risponde (es. dash.example.com)
#   HOME_DIR            dove sta la Homebase nel suo container   HOME_USER_ID   l'utente della Homebase per cui agisce Aura
set -euo pipefail
CT_AURA=${CT_AURA:-110}; CT_HOME=${CT_HOME:-104}
AURA_IP=${AURA_IP:?serve AURA_IP}; HOME_IP=${HOME_IP:?serve HOME_IP}; HOME_HOST=${HOME_HOST:?serve HOME_HOST}
HOME_DIR=${HOME_DIR:-/var/www/html}; HOME_USER_ID=${HOME_USER_ID:-1}
HERE="$(cd "$(dirname "$0")" && pwd)"

pct exec "$CT_AURA" -- bash -c "cd /opt/ollama-web && grep -q '^HOMEBASE_KEY=' .env || { K=\$(python3 -c 'import secrets; print(secrets.token_urlsafe(40))'); printf 'HOMEBASE_URL=http://$HOME_IP\nHOMEBASE_HOST=$HOME_HOST\nHOMEBASE_KEY=%s\n' \"\$K\" >> .env; chmod 640 .env; }"
HASH=$(pct exec "$CT_AURA" -- bash -c 'grep "^HOMEBASE_KEY=" /opt/ollama-web/.env | cut -d= -f2- | tr -d "\n" | sha256sum | cut -d" " -f1')

pct exec "$CT_HOME" -- bash -c "mkdir -p /etc/homebase && printf '{\"key_sha256\": \"%s\", \"user_id\": %s, \"allow_ips\": [\"%s\"]}\n' $HASH $HOME_USER_ID $AURA_IP > /etc/homebase/aura.json && chown root:www-data /etc/homebase /etc/homebase/aura.json && chmod 750 /etc/homebase && chmod 640 /etc/homebase/aura.json"
pct push "$CT_HOME" "$HERE/api/aura.php" "$HOME_DIR/api/aura.php"
pct exec "$CT_HOME" -- bash -c "chown root:www-data $HOME_DIR/api/aura.php && chmod 640 $HOME_DIR/api/aura.php && php -l $HOME_DIR/api/aura.php"

pct exec "$CT_AURA" -- systemctl restart ollama-web
sleep 3
CODE=$(pct exec "$CT_AURA" -- bash -c "curl -s -o /dev/null -w '%{http_code}' -H 'Host: $HOME_HOST' -H \"X-Aura-Key: \$(grep ^HOMEBASE_KEY= /opt/ollama-web/.env | cut -d= -f2-)\" 'http://$HOME_IP/api/aura.php?op=sezioni_list'")
[ "$CODE" = "200" ] && echo "Fatto: Aura è collegata alla Homebase." || echo "Installato, ma la prova ha risposto $CODE."
