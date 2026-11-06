# Siti dei clienti (cartella locale di Claude)

Il codice NON è su questo PC: è sul server dei siti. Si lavora lì, via SSH:
- `ssh -i CHIAVE UTENTE@SERVER` (indirizzi in `.claude/team.sh` o `.claude/team.ps1`)
- ogni sito è un progetto in `/srv/siti/<slug>/`; la TUA cartella è `/srv/siti/<slug>/UTENTE` (branch `UTENTE/...`)
- non scrivere mai in `/srv/siti/<slug>/main` né nella cartella di un altro

All'apertura un hook stampa i progetti e le novità (messaggi, task, consegne degli altri); a ogni messaggio ne stampa
le novità. **Riferisci subito all'umano** messaggi e task nuovi per lui.

Prima di lavorare su un progetto: `sito team <slug> avvio UTENTE` (regole del progetto dal suo CLAUDE.md e il canale)
e `git rebase main` nella tua cartella. Consegna: `sito consegna` dalla tua cartella. Tutti i comandi: `sito aiuto`.
Quello che fai lo vedono i colleghi e Aura (commit, task, messaggi): scrivili chiari e in italiano.
Se l'hook dice che il server non è raggiungibile, dillo all'umano e fermati.
