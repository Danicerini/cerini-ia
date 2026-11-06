# Siti dei clienti (cartella locale di Claude)

Il codice NON è su questo PC: è sul server dei siti. Si lavora lì, via SSH:
- `ssh -i CHIAVE UTENTE@SERVER` (indirizzi in `.claude/team.sh` o `.claude/team.ps1`)
- la TUA cartella è `/srv/siti/CARTELLA/`, con dentro un sito per sottocartella: `/srv/siti/CARTELLA/<sito>` (branch `UTENTE/...`)
- non scrivere mai nella cartella di un altro né in `/srv/siti/.progetti/<sito>/main`

**Le regole su come si lavora stanno in `/srv/siti/LEGGIMI.md`**: all'apertura un hook te le stampa insieme ai tuoi siti.
Lavori sui siti presi in carico da UTENTE; su quelli degli altri solo se l'umano ti chiede di dare una mano.
Non dai compiti ad altri Claude e non ne ricevi: le richieste arrivano solo dal tuo umano.

Prima di lavorare su un sito: `sito apri <sito> UTENTE` (regole del sito e diario) e `git rebase main` nella tua cartella del sito.
Quando inizi e quando finisci un lavoro: `sito diario <sito> "cosa fai / cosa hai fatto"` (lo legge Aura, l'assistente dell'umano).
Consegna: `sito consegna` dalla tua cartella del sito. Tutti i comandi: `sito aiuto`.
Se l'hook dice che il server non è raggiungibile, dillo all'umano e fermati.
