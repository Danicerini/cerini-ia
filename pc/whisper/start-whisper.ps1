# Avviato dall'attivita' pianificata "Whisper Serve" (utente SYSTEM) all'accensione del PC.
$dir = 'C:\ollama\whisper'
$log = Join-Path $dir 'serve.log'
for ($i = 0; $i -lt 60; $i++) {
    if (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -like '192.168.1.*' }) { break }
    Start-Sleep -Seconds 2
}
# Il log ricomincia a ogni avvio, cosi' non cresce all'infinito
"$(Get-Date -Format s) avvio Whisper" | Out-File -Encoding utf8 $log
$env:HF_HUB_OFFLINE = '1'   # il modello e' gia' scaricato: niente controlli online all'avvio
Set-Location $dir
& "$dir\venv\Scripts\python.exe" -m uvicorn whisper_server:app --host 0.0.0.0 --port 8765 --log-level warning 2>&1 |
    ForEach-Object { "$_" } | Out-File -Append -Encoding utf8 $log
