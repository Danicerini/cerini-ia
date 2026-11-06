#!/usr/bin/env bash
# Hook di Claude Code sul PC (Mac, Linux o Windows con Git Bash): legge dal server dei siti progetti e novità.
# Uso (da .claude/settings.json): team.sh avvio | team.sh novita
UTENTE=UTENTE
CHIAVE=CHIAVE
SERVER=(SERVER_LAN SERVER_TAILSCALE)   # prima la rete di casa, poi Tailscale

cmd=novita-tutti; [ "$1" = avvio ] && cmd=avvio-tutti
for h in "${SERVER[@]}"; do
  if out=$(ssh -o BatchMode=yes -o ConnectTimeout=4 -i "$CHIAVE" "$UTENTE@$h" /usr/local/bin/sito "$cmd" "$UTENTE" 2>/dev/null); then
    [ -n "$out" ] && printf '%s\n' "$out"
    exit 0
  fi
done
[ "$1" = avvio ] && echo "ATTENZIONE: server dei siti non raggiungibile (né rete di casa né Tailscale): progetti e messaggi NON letti. Dillo all'umano."
exit 0
