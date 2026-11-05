#!/usr/bin/env bash
# Una volta sola: crea la chiave di firma dell'app (fuori dal repo) e mette chiave e indirizzo del server nei segreti del repo su GitHub.
# Uso: bash tools/android_secrets.sh https://indirizzo-del-tuo-aura
# Da conservare: ~/.cerini-ia/android/. Senza quella chiave l'app non si può aggiornare, solo disinstallare e rimettere.
set -euo pipefail
URL="${1:?Scrivi indirizzo di Aura, es. https://aura.esempio.it}"
D="$HOME/.cerini-ia/android"
mkdir -p "$D"; chmod 700 "$D"
KEYTOOL="$(command -v keytool || ls /c/Program\ Files/Java/*/bin/keytool.exe 2>/dev/null | head -1)"
P12="$(cygpath -w "$D/aura.p12" 2>/dev/null || echo "$D/aura.p12")"
if [ ! -f "$D/aura.p12" ]; then
  PASS=$(python -c "import secrets; print(secrets.token_urlsafe(24))")
  "$KEYTOOL" -genkeypair -noprompt -alias aura -keyalg RSA -keysize 2048 -validity 11000 -storetype PKCS12 \
    -keystore "$P12" -storepass "$PASS" -keypass "$PASS" -dname "CN=Aura" 2>/dev/null
  printf '%s' "$PASS" > "$D/pass.txt"; chmod 600 "$D/pass.txt"
  echo "Chiave creata in $D"
fi
python -c "import base64,sys; print(base64.b64encode(open(sys.argv[1],'rb').read()).decode())" "$P12" | gh secret set AURA_KEY_B64
gh secret set AURA_KEY_PASS < "$D/pass.txt"
printf '%s' "$URL" | gh secret set AURA_URL
echo "Fatto. Segreti su GitHub:"
gh secret list
