#!/usr/bin/env bash
# Configura la posta in uscita (Brevo) per gli inviti. La chiave non viene mostrata a schermo.
set -euo pipefail
DEST=/opt/ollama-web
cd "$DEST"

read -rp "Login SMTP di Brevo (tipo 1234ab@smtp-brevo.example): " U
read -rsp "Chiave SMTP di Brevo: " K; echo
read -rp "Mittente [Cerini IA <noreply@example.com>]: " F; F=${F:-Cerini IA <noreply@example.com>}

sed -i '/^SMTP_/d' .env
cat >> .env <<EOF
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=$U
SMTP_PASSWORD=$K
SMTP_FROM=$F
EOF
chmod 640 .env
systemctl restart ollama-web
echo "Fatto. Prova creando un invito con la tua email dalle Impostazioni del pannello."
