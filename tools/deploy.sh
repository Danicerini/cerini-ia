#!/usr/bin/env bash
# Pubblica server/ sul container dove gira Cerini IA (Proxmox), con un backup prima e una prova dopo.
# Le impostazioni stanno FUORI dal repository, in ~/.cerini-ia/deploy.env:
#   PROXMOX_HOST=root@192.168.1.10     # il nodo Proxmox
#   SSH_KEY=~/.ssh/id_ed25519           # la chiave per entrarci
#   CT_ID=110                           # il container di Cerini IA
# Uso (da Git Bash, nella cartella del repository):  tools/deploy.sh
set -euo pipefail
CONF="$HOME/.cerini-ia/deploy.env"
[ -f "$CONF" ] || { echo "Manca $CONF (vedi le prime righe di questo script)"; exit 1; }
# shellcheck disable=SC1090
. "$CONF"
: "${PROXMOX_HOST:?}" "${CT_ID:?}"
SSH=(ssh ${SSH_KEY:+-i "$SSH_KEY"}); SCP=(scp -q ${SSH_KEY:+-i "$SSH_KEY"})
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python "$ROOT/tools/check_private.py" --all >/dev/null || { echo "Prima togli i dati personali (tools/check_private.py --all)"; exit 1; }
# niente pubblicazione se il Python ha errori di sintassi (app.py e le parti)
(cd "$ROOT/server" && python -c "import ast, glob; [ast.parse(open(f, encoding='utf-8').read(), f) for f in ['app.py'] + glob.glob('parti/*.py')]") || { echo "Errore di sintassi nel Python: non pubblico"; exit 1; }
PKG=$(mktemp -t cerini-ia-XXXX.tgz)
tar -czf "$PKG" -C "$ROOT/server" app.py parti requirements.txt static brain set-password.sh set-smtp.sh set-google.sh
"${SCP[@]}" "$PKG" "$PROXMOX_HOST:/tmp/cerini-ia.tgz"
rm -f "$PKG"
"${SSH[@]}" "$PROXMOX_HOST" "pct push $CT_ID /tmp/cerini-ia.tgz /tmp/cerini-ia.tgz && pct exec $CT_ID -- bash -c '
  set -e; cd /opt/ollama-web; mkdir -p /root/bak
  tar -czf /root/bak/cerini-ia-\$(date +%Y%m%d%H%M).tgz app.py parti static brain 2>/dev/null || true
  tar --no-same-owner -xzf /tmp/cerini-ia.tgz && chown -R root:ollamaweb app.py parti static brain
  ./venv/bin/pip install --quiet -r requirements.txt
  systemctl restart ollama-web; sleep 4; systemctl is-active ollama-web
  curl -s -o /dev/null -w \"pagina: %{http_code}\n\" http://127.0.0.1:8080/'"
echo "Pubblicato. Ricordati di aprire l'app e controllare che si veda bene."
