# Siti dei clienti (cartella locale di Claude)

Il codice NON è su questo PC: è sul server dei siti. Si lavora lì, via SSH:
- `ssh -i CHIAVE UTENTE@SERVER` (indirizzi in `.claude/team.sh` o `.claude/team.ps1`)
- la TUA cartella è `/srv/siti/CARTELLA/`, con dentro un sito per sottocartella: `/srv/siti/CARTELLA/<sito>` (branch `UTENTE/...`)
- non scrivere mai nella cartella di un altro né in `/srv/siti/.progetti/<sito>/main`

**Le regole su come si lavora stanno in `/srv/siti/LEGGIMI.md`**: all'apertura un hook te le stampa insieme ai siti e alle
novità (messaggi, task, consegne degli altri); a ogni messaggio stampa le novità. Seguile sempre e **riferisci subito
all'umano** messaggi e task nuovi per lui.

Prima di lavorare su un sito: `sito team <sito> avvio UTENTE` (regole del sito e canale) e `git rebase main` nella tua
cartella del sito. Consegna: `sito consegna` dalla tua cartella del sito. Tutti i comandi: `sito aiuto`.
Se l'hook dice che il server non è raggiungibile, dillo all'umano e fermati.
