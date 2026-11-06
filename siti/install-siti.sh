#!/usr/bin/env bash
# Prepara il server dei siti (un CT Debian) per i progetti dei clienti. Da lanciare come root, si può rilanciare.
# Uso: bash install-siti.sh "<chiave pubblica SSH di Aura>"
# Prima crea /etc/siti/config.json, es.:
#   {"utenti": ["utente1", "utente2"], "github_owner": "account", "github_prefix": "sito-", "collaboratori": {"utente2": "account-github-2"}}
# La chiave di GitHub (token con permesso di creare repository) va in /etc/siti/github.token (la legge solo aura).
set -euo pipefail
cd "$(dirname "$0")"
KEY="${1:-}"

install -m 755 sito /usr/local/bin/sito
install -m 755 sito-aura /usr/local/bin/sito-aura

getent group dev >/dev/null || groupadd dev
id aura >/dev/null 2>&1 || useradd -m -s /bin/sh -G dev aura
usermod -aG dev aura
passwd -l aura >/dev/null

mkdir -p /srv/siti /etc/siti
chown root:dev /srv/siti; chmod 2775 /srv/siti
[ -f /etc/siti/config.json ] && chmod 644 /etc/siti/config.json
[ -f /etc/siti/github.token ] && { chown aura:aura /etc/siti/github.token; chmod 600 /etc/siti/github.token; }
chown root:root /etc/siti; chmod 755 /etc/siti   # la configurazione la leggono tutti, il token resta 600 di aura
git config --system --get-all safe.directory | grep -qx '\*' || git config --system --add safe.directory '*'

# aura può usare sudo SOLO per creare un progetto
echo 'aura ALL=(root) NOPASSWD: /usr/local/bin/sito nuovo *' > /etc/sudoers.d/aura-siti
chmod 440 /etc/sudoers.d/aura-siti
visudo -cf /etc/sudoers.d/aura-siti >/dev/null

# la chiave di Aura: solo la porta, niente terminale né inoltri
if [ -n "$KEY" ]; then
  install -d -m 700 -o aura -g aura /home/aura/.ssh
  echo "command=\"/usr/local/bin/sito-aura\",no-pty,no-port-forwarding,no-agent-forwarding,no-X11-forwarding $KEY" > /home/aura/.ssh/authorized_keys
  chown aura:aura /home/aura/.ssh/authorized_keys; chmod 600 /home/aura/.ssh/authorized_keys
fi

# GitHub: ogni 2 minuti aura crea i repository mancanti e manda main e i branch
cat > /etc/systemd/system/siti-github.service <<'EOF'
[Unit]
Description=Siti dei clienti: repository e invio su GitHub
[Service]
Type=oneshot
User=aura
ExecStart=/usr/local/bin/sito github
EOF
cat > /etc/systemd/system/siti-github.timer <<'EOF'
[Unit]
Description=Siti dei clienti: GitHub ogni 2 minuti
[Timer]
OnBootSec=2min
OnUnitActiveSec=2min
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now siti-github.timer >/dev/null
echo "Pronto: /srv/siti, comando sito, utente aura, invio su GitHub ogni 2 minuti."
