# Ollama (11434) e Whisper (8765) non hanno password: li lasciamo raggiungere SOLO dal CT del pannello.
# Gli altri dispositivi della rete di casa (ospiti sul Wi-Fi, TV, telefoni...) non possono piu' usarli.
# Sul PC stesso continuano a funzionare (localhost non passa dal firewall).
# Eseguire in PowerShell come Amministratore:
#   powershell -ExecutionPolicy Bypass -File C:\ollama\secure-pc-firewall.ps1

#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
$Panel = '192.168.1.150'   # IP del server dove gira il pannello (cambialo)

foreach ($r in @(@{ Name = 'Ollama API (LAN)'; Port = 11434 }, @{ Name = 'Whisper trascrizione (LAN)'; Port = 8765 })) {
    $rule = Get-NetFirewallRule -DisplayName $r.Name -ErrorAction SilentlyContinue
    if (-not $rule) {
        New-NetFirewallRule -DisplayName $r.Name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $r.Port `
            -RemoteAddress $Panel -Profile Any | Out-Null
    } else {
        $rule | Set-NetFirewallRule -RemoteAddress $Panel
    }
    Write-Host "Porta $($r.Port): consentita solo da $Panel"
}

# Eventuali regole create da Windows per ollama.exe / python.exe (finestra "consenti accesso") aprirebbero
# le porte a tutti: le disattiviamo, restano solo le due regole sopra.
$progs = @("$env:LOCALAPPDATA\Programs\Ollama\ollama.exe", 'C:\ollama\whisper\venv\Scripts\python.exe')
Get-NetFirewallApplicationFilter -ErrorAction SilentlyContinue |
    Where-Object { $progs -contains $_.Program } |
    Get-NetFirewallRule -ErrorAction SilentlyContinue | Where-Object { $_.Direction -eq 'Inbound' -and $_.Action -eq 'Allow' -and $_.Enabled -eq 'True' } |
    ForEach-Object { Disable-NetFirewallRule -Name $_.Name; Write-Host "Disattivata regola automatica: $($_.DisplayName)" }

Write-Host 'Fatto.' -ForegroundColor Green
