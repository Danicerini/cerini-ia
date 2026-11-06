# Cartella locale di Claude per i siti dei clienti

Una cartella sola per tutti i progetti: all'apertura Claude vede i progetti e le novità, a ogni messaggio le novità.

Installazione sul proprio PC (una volta):
1. Crea una cartella, es. `~/Progetti/siti`, con dentro:
   - `CLAUDE.md` (copia di questo `CLAUDE.md`, con il tuo utente al posto di UTENTE)
   - `.claude/settings.json`: `settings.sh.json` (Mac, Linux, Windows con Git Bash) o `settings.ps1.json` (Windows con PowerShell)
   - `.claude/team.sh` o `.claude/team.ps1`, con UTENTE, CHIAVE (la tua chiave SSH per il server) e i due indirizzi del server
2. Apri Claude Code in quella cartella: all'avvio deve comparire la «situazione per <utente>».

Prova a mano: `bash .claude/team.sh avvio` (o `powershell -NoProfile -File .claude/team.ps1 avvio`).
