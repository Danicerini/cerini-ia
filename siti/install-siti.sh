#!/usr/bin/env bash
# Prepara il server dei siti (un CT Debian) per i progetti dei clienti. Da lanciare come root, si può rilanciare.
# Uso: bash install-siti.sh "<chiave pubblica SSH di Aura>"
# Prima crea /etc/siti/config.json, es.:
#   {"utenti": ["utente1", "utente2"], "proprietario": "utente1", "github_owner": "account", "github_prefix": "sito-",
#    "collaboratori": {"utente2": "account-github-2"},
#    "file": {"utente2": {"scrivi": ["/srv/siti/*/utente2"], "leggi": []}}}   <- cosa vede chi non è il proprietario
# La chiave di GitHub (token con permesso di creare repository) va in /etc/siti/github.token (la legge solo aura).
set -euo pipefail
cd "$(dirname "$0")"
KEY="${1:-}"

install -m 755 sito /usr/local/bin/sito
install -m 755 sito-aura /usr/local/bin/sito-aura
install -m 755 sito-file /usr/local/bin/sito-file

getent group dev >/dev/null || groupadd dev
id aura >/dev/null 2>&1 || useradd -m -s /bin/sh -G dev aura
usermod -aG dev aura
passwd -l aura >/dev/null

mkdir -p /srv/siti/.progetti /etc/siti
chown root:dev /srv/siti /srv/siti/.progetti; chmod 2775 /srv/siti /srv/siti/.progetti
# la guida per chi ci lavora, persona o IA: anche coi nomi che le IA cercano da sole
install -m 644 LEGGIMI.md /srv/siti/LEGGIMI.md
ln -sfn LEGGIMI.md /srv/siti/CLAUDE.md
ln -sfn LEGGIMI.md /srv/siti/AGENTS.md
# la cartella di ogni persona (il nome è in «cartelle» nella configurazione), sua e leggibile dal gruppo
python3 - <<'PY'
import json, os, pwd, grp
c = json.load(open("/etc/siti/config.json"))
for u in c.get("utenti") or []:
    d = "/srv/siti/" + ((c.get("cartelle") or {}).get(u) or u)
    os.makedirs(d, exist_ok=True)
    os.chown(d, pwd.getpwnam(u).pw_uid, grp.getgrnam("dev").gr_gid)
    os.chmod(d, 0o2755)   # ognuno scrive solo nella sua; gli altri (e Aura) leggono
PY
[ -f /etc/siti/config.json ] && chmod 644 /etc/siti/config.json
[ -f /etc/siti/github.token ] && { chown aura:aura /etc/siti/github.token; chmod 600 /etc/siti/github.token; }
chown root:root /etc/siti; chmod 755 /etc/siti   # la configurazione la leggono tutti, il token resta 600 di aura
git config --system --get-all safe.directory | grep -qx '\*' || git config --system --add safe.directory '*'

# aura può usare sudo SOLO per creare un progetto
# e per i file: come root per il proprietario, come ognuno degli utenti per gli altri (i permessi li controlla sito-file)
UTENTI=$(python3 -c 'import json; print(",".join(json.load(open("/etc/siti/config.json")).get("utenti") or []))' 2>/dev/null || true)
{
  echo 'aura ALL=(root) NOPASSWD: /usr/local/bin/sito nuovo *'
  echo 'aura ALL=(root) NOPASSWD: /usr/local/bin/sito-file *'
  [ -n "$UTENTI" ] && echo "aura ALL=($UTENTI) NOPASSWD: /usr/local/bin/sito-file *"
} > /etc/sudoers.d/aura-siti
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
