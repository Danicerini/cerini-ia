# Hook di Claude Code sul PC Windows senza bash: legge dal server dei siti progetti e novità.
# Uso (da .claude/settings.json): powershell -NoProfile -File team.ps1 avvio | novita
param([string]$Fase = "novita")
$Utente = "UTENTE"
$Chiave = "CHIAVE"
$Server = @("SERVER_LAN", "SERVER_TAILSCALE")   # prima la rete di casa, poi Tailscale

$cmd = if ($Fase -eq "avvio") { "avvio-tutti" } else { "novita-tutti" }
foreach ($h in $Server) {
  $out = & ssh -o BatchMode=yes -o ConnectTimeout=4 -i $Chiave "$Utente@$h" /usr/local/bin/sito $cmd $Utente 2>$null
  if ($LASTEXITCODE -eq 0) {
    if ($out) { $out -join "`n" | Write-Output }
    exit 0
  }
}
if ($Fase -eq "avvio") { Write-Output "ATTENZIONE: server dei siti non raggiungibile (né rete di casa né Tailscale): siti NON letti. Dillo all'umano." }
exit 0
