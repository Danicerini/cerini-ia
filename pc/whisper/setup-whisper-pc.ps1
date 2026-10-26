# Ultimo passo per la dettatura vocale: apre la porta 8765 solo alla rete di casa e fa partire
# Whisper all'accensione del PC (utente SYSTEM, anche senza login, come Ollama).
# Eseguire in PowerShell come Amministratore:
#   powershell -ExecutionPolicy Bypass -File C:\ollama\whisper\setup-whisper-pc.ps1

#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
$Dir      = 'C:\ollama\whisper'
$Port     = 8765
$Subnet   = '192.168.1.0/24'
$TaskName = 'Whisper Serve'

foreach ($f in 'venv\Scripts\python.exe', 'whisper_server.py', 'start-whisper.ps1', 'token.txt') {
    if (-not (Test-Path (Join-Path $Dir $f))) { throw "Manca $Dir\${f}: l'installazione non e' completa" }
}

# --- Firewall: 8765 solo dalla LAN ------------------------------------------
Get-NetFirewallRule -DisplayName 'Whisper*' -ErrorAction SilentlyContinue | Remove-NetFirewallRule
New-NetFirewallRule -DisplayName 'Whisper trascrizione (LAN)' -Direction Inbound -Action Allow `
    -Protocol TCP -LocalPort $Port -RemoteAddress $Subnet -Profile Any | Out-Null
Write-Host "Firewall: TCP $Port consentita solo da $Subnet"

# --- Ferma un'eventuale copia avviata a mano --------------------------------
Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
    Where-Object { $_.CommandLine -like '*whisper_server*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

# --- Attivita' pianificata ---------------------------------------------------
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
$action    = New-ScheduledTaskAction -Execute 'powershell.exe' `
             -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Dir\start-whisper.ps1`""
$trigger   = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings  = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
             -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) `
             -StartWhenAvailable -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings | Out-Null
Start-ScheduledTask -TaskName $TaskName
Write-Host "Attivita' pianificata '$TaskName' registrata e avviata"

# --- Verifica ------------------------------------------------------------------
$token = (Get-Content "$Dir\token.txt" -Raw).Trim()
Write-Host 'Attendo che Whisper carichi il modello...'
$ok = $false
for ($i = 0; $i -lt 90; $i++) {
    try {
        $h = Invoke-RestMethod "http://127.0.0.1:$Port/health" -Headers @{ 'X-Token' = $token } -TimeoutSec 2
        if ($h.loaded) { $ok = $true; break }
    } catch {}
    Start-Sleep 2
}
if ($ok) { Write-Host "OK: Whisper ($($h.model)) pronto sulla porta $Port" -ForegroundColor Green }
else     { Write-Warning "Whisper non risponde ancora: guarda $Dir\serve.log" }

