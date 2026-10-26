# Configura Ollama su cerini-pc come server di rete che parte all'avvio (anche senza login).
# Eseguire in PowerShell come Amministratore, DOPO aver installato Ollama:
#   powershell -ExecutionPolicy Bypass -File .\setup-ollama-pc.ps1

#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

$ModelsDir = 'C:\ollama\models'
$Subnet    = '192.168.1.0/24'
$Port      = 11434
$TaskName  = 'Ollama Serve'

# --- 1. Trova ollama.exe -----------------------------------------------------
$candidates = @(
    "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe",
    "$env:ProgramFiles\Ollama\ollama.exe"
)
$OllamaExe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $OllamaExe) {
    $cmd = Get-Command ollama.exe -ErrorAction SilentlyContinue
    if ($cmd) { $OllamaExe = $cmd.Source }
}
if (-not $OllamaExe) { throw "ollama.exe non trovato: l'installazione e' finita?" }
Write-Host "ollama.exe: $OllamaExe"

# --- 2. Ferma l'app Ollama e il server avviato dall'utente -------------------
Get-Process -Name 'ollama app', 'ollama' -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# --- 3. Variabili d'ambiente di SISTEMA (servono all'utente SYSTEM) ----------
$vars = @{
    OLLAMA_HOST              = "0.0.0.0:$Port"
    OLLAMA_MAX_LOADED_MODELS = '1'
    OLLAMA_KEEP_ALIVE        = '15m'
    OLLAMA_MODELS            = $ModelsDir
}
foreach ($k in $vars.Keys) {
    [Environment]::SetEnvironmentVariable($k, $vars[$k], 'Machine')
    Set-Item -Path "Env:$k" -Value $vars[$k]
    Write-Host "  $k = $($vars[$k])"
}

# --- 4. Cartella modelli (sposta quelli gia' scaricati, se ce ne sono) --------
New-Item -ItemType Directory -Force -Path $ModelsDir | Out-Null
$oldModels = "$env:USERPROFILE\.ollama\models"
if ((Test-Path $oldModels) -and (Get-ChildItem $oldModels -Recurse -File -ErrorAction SilentlyContinue)) {
    Write-Host "Sposto i modelli da $oldModels a $ModelsDir ..."
    robocopy $oldModels $ModelsDir /E /MOVE /NFL /NDL /NJH /NJS | Out-Null
}
# SYSTEM ha gia' accesso a C:\; diamo anche all'utente corrente il controllo completo
icacls $ModelsDir /grant "${env:USERNAME}:(OI)(CI)F" /T /Q | Out-Null

# --- 5. Firewall: 11434 solo dalla LAN ---------------------------------------
Get-NetFirewallRule -DisplayName 'Ollama*' -ErrorAction SilentlyContinue | Remove-NetFirewallRule
# L'installer/primo avvio puo' aver creato regole per ollama.exe: le togliamo sopra (match 'Ollama*')
Get-NetFirewallApplicationFilter -Program $OllamaExe -ErrorAction SilentlyContinue |
    Get-NetFirewallRule -ErrorAction SilentlyContinue | Remove-NetFirewallRule
New-NetFirewallRule -DisplayName 'Ollama API (LAN)' -Direction Inbound -Action Allow `
    -Protocol TCP -LocalPort $Port -RemoteAddress $Subnet -Profile Any | Out-Null
Write-Host "Firewall: TCP $Port consentita solo da $Subnet"

# La rete Wi-Fi deve essere 'Privata' perche' molte regole di default (e il WoL) si comportino bene
Get-NetConnectionProfile | Where-Object NetworkCategory -eq 'Public' | ForEach-Object {
    Write-Host "Rete '$($_.Name)' impostata come Privata"
    Set-NetConnectionProfile -InterfaceIndex $_.InterfaceIndex -NetworkCategory Private
}

# --- 6. Togli l'avvio automatico dell'app Ollama -----------------------------
$startupLnk = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\Ollama.lnk"
if (Test-Path $startupLnk) { Remove-Item $startupLnk -Force; Write-Host "Rimosso $startupLnk" }
foreach ($runKey in 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run',
                    'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run') {
    $props = Get-ItemProperty $runKey -ErrorAction SilentlyContinue
    if ($props) {
        $props.PSObject.Properties | Where-Object { $_.Name -like '*ollama*' } | ForEach-Object {
            Remove-ItemProperty -Path $runKey -Name $_.Name; Write-Host "Rimosso Run\$($_.Name)"
        }
    }
}

# --- 7. Attivita' pianificata: 'ollama serve' all'avvio come SYSTEM -----------
# Un piccolo wrapper che aspetta la rete e scrive un log (utile per capire problemi post-WoL)
$wrapperDir = 'C:\ollama'
$wrapper    = Join-Path $wrapperDir 'start-ollama.ps1'
@"
`$log = 'C:\ollama\serve.log'
for (`$i = 0; `$i -lt 60; `$i++) {
    if (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { `$_.IPAddress -like '192.168.1.*' }) { break }
    Start-Sleep -Seconds 2
}
"`$(Get-Date -Format s) avvio ollama serve" | Out-File -Append -Encoding utf8 `$log
& '$OllamaExe' serve 2>&1 | ForEach-Object { "`$_" } | Out-File -Append -Encoding utf8 `$log
"@ | Set-Content -Encoding utf8 $wrapper

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
$action    = New-ScheduledTaskAction -Execute 'powershell.exe' `
             -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$wrapper`""
$trigger   = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings  = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
             -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) `
             -StartWhenAvailable -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
    -Principal $principal -Settings $settings | Out-Null
Write-Host "Attivita' pianificata '$TaskName' registrata"

# --- 8. Avvio subito e verifica ----------------------------------------------
Start-ScheduledTask -TaskName $TaskName
Write-Host 'Attendo che Ollama risponda...'
$ok = $false
for ($i = 0; $i -lt 30; $i++) {
    try { $v = Invoke-RestMethod "http://127.0.0.1:$Port/api/version" -TimeoutSec 2; $ok = $true; break } catch { Start-Sleep 1 }
}
if ($ok) { Write-Host "OK: Ollama $($v.version) in ascolto su 0.0.0.0:$Port" -ForegroundColor Green }
else     { Write-Warning "Ollama non risponde: guarda C:\ollama\serve.log" }

$ip  = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -like '192.168.1.*' | Select-Object -First 1)
$mac = (Get-NetAdapter -InterfaceIndex $ip.InterfaceIndex).MacAddress
Write-Host ""
Write-Host "Per il sito:  OLLAMA_URL=http://$($ip.IPAddress):$Port   WOL_MAC=$($mac -replace '-',':')"
Write-Host "Consiglio: riserva questo IP nel DHCP del router per il MAC sopra."
