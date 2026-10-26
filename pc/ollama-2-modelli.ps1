# Permette a Ollama di tenere 2 modelli insieme: Gemma (chat) + embeddinggemma (memoria, ~600 MB).
# Senza, ogni ricerca nella memoria scaccerebbe Gemma dalla GPU.
# Eseguire in PowerShell come Amministratore:
#   powershell -ExecutionPolicy Bypass -File C:\ollama\ollama-2-modelli.ps1

#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Environment]::SetEnvironmentVariable('OLLAMA_MAX_LOADED_MODELS', '2', 'Machine')
Write-Host 'OLLAMA_MAX_LOADED_MODELS = 2'

# Riavvio del servizio Ollama (attivita' "Ollama Serve") per leggere il nuovo valore
Stop-ScheduledTask -TaskName 'Ollama Serve' -ErrorAction SilentlyContinue
Get-Process -Name 'ollama', 'ollama app', 'llama-server' -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Start-ScheduledTask -TaskName 'Ollama Serve'
for ($i = 0; $i -lt 30; $i++) {
    try { $v = Invoke-RestMethod 'http://127.0.0.1:11434/api/version' -TimeoutSec 2; break } catch { Start-Sleep 1 }
}
if ($v) { Write-Host "OK: Ollama $($v.version) riavviato con 2 modelli" -ForegroundColor Green }
else    { Write-Warning 'Ollama non risponde: guarda C:\ollama\serve.log' }
