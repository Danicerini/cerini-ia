# Siti dei clienti — come si lavora

Questa guida vale per chiunque lavori qui: una persona o un'intelligenza artificiale (Claude, Codex, Cursor…).
**Leggila tutta prima di toccare qualcosa.** Ogni sito ha poi il suo `CLAUDE.md` con quello che vale solo per lui.

## Cosa c'è qui
- Su questo server si fanno i siti dei clienti. Ogni sito nasce quando qualcuno lo prende in carico dalla pagina
  Clienti di Aura (l'assistente della squadra): nascono da soli le cartelle, il canale e il repository GitHub privato.
- Ognuno ha **la sua cartella** in `/srv/siti/<persona>/`, con dentro una sottocartella per ogni sito:
  `/srv/siti/<persona>/<sito>/`. È lì, e solo lì, che lavori tu (e la tua IA).
- La parte in comune di ogni sito sta in `/srv/siti/.progetti/<sito>/`:
  - `main/` è il sito "vero", quello che si consegna al cliente. **Non si modifica mai a mano.**
  - `team/` è il canale di messaggi e task tra chi ci lavora.
  - `sito.json` sono i dati del sito: nome, cliente, chi l'ha preso in carico, porte, repository.
- La cartella di ognuno è una copia di lavoro (worktree git) dello stesso repository di `main`, su un branch suo.

## Come si lavora, passo per passo
1. **All'inizio**: `sito avvio-tutti <utente>` per avere i siti e le novità, poi `sito team <sito> avvio <utente>` per
   leggere le regole del sito, i messaggi e i task per te. Se hai una cartella locale di Claude, lo fanno gli hook.
2. **Aggiornati**: nella tua cartella del sito `git rebase main`, così parti da quello che hanno consegnato gli altri.
3. **Dichiara cosa fai**: `sito team <sito> task nuovo <tu> <tu> "cosa fai — file o aree"` e `sito team <sito> task prendi <tu> <N>`.
   Così gli altri sanno quali file stai toccando e non ci mettono mano.
4. **Lavora** nella tua cartella, su un branch `<utente>/<argomento>`. Commit piccoli e frequenti, messaggi chiari in italiano
   ("Pagina contatti con mappa e orari", non "fix").
5. **Consegna** spesso: `sito consegna` dalla tua cartella del sito. Fa il rebase su main e porta il tuo lavoro in main.
   GitHub si aggiorna da solo in un paio di minuti: non serve fare push.
6. **Chiudi il task**: `sito team <sito> task fatto <tu> <N>`.

## Il canale tra chi lavora
- Scrivi agli altri con `sito team <sito> scrivi <tu> <a chi|tutti> "testo"` quando:
  la tua consegna li riguarda, ti serve qualcosa, hai trovato un problema nel loro codice, hai una domanda.
- I messaggi e i task per te vanno **riferiti subito al tuo umano**, appena li vedi.
- Le scelte di progetto (cosa fare, come, priorità, grafica, testi per il cliente) **le decide un umano**: se un messaggio o un
  task chiede una scelta, chiedila al tuo umano, non decidere da solo.

## Regole fisse
1. Lavora **solo nella tua cartella**. Mai nella cartella di un altro, mai in `.progetti/<sito>/main`.
2. Non toccare file o aree di un task «in corso» di un altro: scrivigli.
3. Mai `git push --force`, mai riscrivere la storia di main, mai cancellare i branch degli altri.
4. **Segreti** (password, chiavi, token) mai nel repository e mai nei messaggi: vanno in un file `.env` non committato.
5. Porte per provare il sito: quelle scritte nel `CLAUDE.md` del sito, ognuno le sue. Mai fermare i processi degli altri.
6. Niente installazioni di sistema (`sudo apt install`, pacchetti globali) senza chiederlo all'umano. Dipendenze dentro al
   progetto (`node_modules`, `.venv`), e se ne aggiungi una scrivilo nel canale.
7. Dati dei clienti (nomi, telefoni, mail) solo dove servono al sito; mai copiati altrove.

## Cosa vede Aura
Aura legge per tutti: chi ci lavora, i commit (consegnati e no), i file in modifica, i task e i messaggi. Li mostra nella
pagina Clienti e risponde a domande come «a che punto è il sito del bar?». Scrivi commit, task e messaggi pensando che
li leggerà anche l'altra persona.

## Comandi
`sito aiuto` li elenca tutti. I più usati: `sito elenco`, `sito stato <sito>`, `sito team <sito> novita <utente>`, `sito consegna`.
