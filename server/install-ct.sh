#!/usr/bin/env bash
# Installa (o aggiorna) Cerini IA in un CT/VM Debian. Eseguire come root, dalla cartella che contiene app.py.
# La configurazione sta in /opt/ollama-web/.env (parti da .env.example); la password si imposta con set-password.sh.
set -euo pipefail

DEST=/opt/ollama-web
SRC="$(cd "$(dirname "$0")" && pwd)"

apt-get update -qq
apt-get install -y -qq python3 python3-venv git >/dev/null   # git: il cervello di Aura e' versionato

id ollamaweb &>/dev/null || useradd --system --home "$DEST" --shell /usr/sbin/nologin ollamaweb
mkdir -p "$DEST"
install -m 644 "$SRC/app.py" "$SRC/requirements.txt" "$DEST/"
rm -rf "$DEST/static.new" && cp -r "$SRC/static" "$DEST/static.new" && rm -rf "$DEST/static" && mv "$DEST/static.new" "$DEST/static"
rm -rf "$DEST/parti" && cp -r "$SRC/parti" "$DEST/parti"
mkdir -p "$DEST/brain" && install -m 644 "$SRC/brain/brain.md" "$DEST/brain/"
install -m 755 "$SRC/set-password.sh" "$SRC/set-smtp.sh" "$SRC/set-google.sh" "$DEST/"

[ -d "$DEST/venv" ] || python3 -m venv "$DEST/venv"
"$DEST/venv/bin/pip" install --quiet --upgrade pip
"$DEST/venv/bin/pip" install --quiet -r "$DEST/requirements.txt"

if [ ! -f "$DEST/.env" ]; then
  install -m 640 "$SRC/.env.example" "$DEST/.env"
  sed -i "s|^SECRET_KEY=.*|SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')|" "$DEST/.env"
  echo "Creato $DEST/.env da .env.example: aprilo e metti i tuoi valori (almeno OLLAMA_URL)."
fi
chown -R root:ollamaweb "$DEST"; chmod 640 "$DEST/.env"
mkdir -p "$DEST/data"; chown ollamaweb:ollamaweb "$DEST/data"; chmod 750 "$DEST/data"

install -m 644 "$SRC/ollama-web.service" /etc/systemd/system/
systemctl daemon-reload

if [ -f "$DEST/data/app.db" ] || grep -q '^ADMIN_PASSWORD_HASH=.\+' "$DEST/.env"; then
  systemctl enable ollama-web
  systemctl restart ollama-web
  echo "Cerini IA aggiornato e riavviato."
else
  echo "Installato. Ora imposta utente e password con: $DEST/set-password.sh"
fi
