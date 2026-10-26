#!/usr/bin/env bash
# Imposta la password di un utente. Prima installazione: crea l'admin nel file .env.
# Dopo (database gia' creato): aggiorna la password direttamente nel database.
set -euo pipefail
DEST=/opt/ollama-web
cd "$DEST"

read -rp "Utente [admin]: " U; U=${U:-admin}
if [ -f data/app.db ]; then
  runuser -u ollamaweb -- env DATA_DIR="$DEST/data" SECRET_KEY=x ./venv/bin/python app.py set-password "$U"
else
  H=$(./venv/bin/python app.py hash-password)
  sed -i "s|^ADMIN_USER=.*|ADMIN_USER=$U|; s|^ADMIN_PASSWORD_HASH=.*|ADMIN_PASSWORD_HASH=$H|" .env
fi
systemctl enable ollama-web >/dev/null 2>&1
systemctl restart ollama-web
echo "Fatto. Pannello su http://$(hostname -I | awk '{print $1}'):8080"
