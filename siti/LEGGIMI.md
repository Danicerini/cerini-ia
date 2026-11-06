# Siti dei clienti — come si lavora

Questa guida vale per chiunque lavori qui: una persona o un'intelligenza artificiale (Claude, Codex, Cursor…).
**Leggila tutta prima di toccare qualcosa.** Ogni sito ha poi il suo `CLAUDE.md` con quello che vale solo per lui.

## Cosa c'è qui
- Su questo server si fanno i siti dei clienti. Ogni sito nasce quando qualcuno lo prende in carico dalla pagina
  Clienti di Aura (l'assistente delle persone): nascono da soli le cartelle e il repository GitHub privato.
- **Ognuno lavora sui siti che ha preso in carico.** Sui siti degli altri si mette mano solo per dare una mano, e solo se
  il tuo umano te lo chiede. I Claude non si danno compiti tra loro e non si scrivono: le richieste passano dagli umani.
- Ognuno ha **la sua cartella** in `/srv/siti/<persona>/`, con dentro una sottocartella per ogni sito:
  `/srv/siti/<persona>/<sito>/`. È lì, e solo lì, che lavori tu (e la tua IA).
- La parte in comune di ogni sito sta in `/srv/siti/.progetti/<sito>/` (nascosta, non ci si lavora dentro):
  - `main/` è il sito "vero", quello che si consegna al cliente. **Non si modifica mai a mano.**
  - `diario.jsonl` è il diario di Claude: cosa sta facendo e cosa ha fatto. Lo legge Aura.
  - `sito.json` sono i dati del sito: nome, cliente, chi l'ha preso in carico, porte, repository.
- La cartella di ognuno è una copia di lavoro (worktree git) dello stesso repository di `main`, su un branch suo.

## Come si lavora, passo per passo
1. **All'inizio**: `sito avvio-tutti <utente>` per avere la guida e i tuoi siti, poi `sito apri <sito> <utente>` per leggere
   le regole del sito e le ultime righe del diario. Se hai una cartella locale di Claude, il primo lo fa l'hook.
2. **Aggiornati**: nella tua cartella del sito `git rebase main`.
3. **Scrivi nel diario cosa fai**: `sito diario <sito> "cosa stai facendo, in parole semplici"`.
4. **Lavora** nella tua cartella, su un branch `<utente>/<argomento>`. Commit piccoli e frequenti, messaggi chiari in italiano
   ("Pagina contatti con mappa e orari", non "fix").
5. **Consegna** spesso: `sito consegna` dalla tua cartella del sito. Fa il rebase su main e porta il tuo lavoro in main.
   GitHub si aggiorna da solo in un paio di minuti: non serve fare push.
6. **A lavoro finito**, di nuovo nel diario: `sito diario <sito> "fatto: …; resta da fare: …"`.

## Regole fisse
1. Lavora **solo nella tua cartella**. Mai nella cartella di un altro, mai in `.progetti/<sito>/main`.
2. Le scelte di progetto (cosa fare, come, priorità, grafica, testi per il cliente) **le decide un umano**: chiedi al tuo.
3. Mai `git push --force`, mai riscrivere la storia di main, mai cancellare i branch degli altri.
4. **Segreti** (password, chiavi, token) mai nel repository e mai nel diario: vanno in un file `.env` non committato.
5. Porte per provare il sito: quelle scritte nel `CLAUDE.md` del sito, ognuno le sue. Mai fermare i processi degli altri.
6. Niente installazioni di sistema (`sudo apt install`, pacchetti globali) senza chiederlo all'umano. Dipendenze dentro al
   progetto (`node_modules`, `.venv`).
7. Dati dei clienti (nomi, telefoni, mail) solo dove servono al sito; mai copiati altrove.

## Cosa vede Aura
Aura è l'assistente delle persone: legge chi ha preso in carico il sito, i commit (consegnati e no), i file in modifica e il
diario. Li mostra nella pagina Clienti e risponde a domande come «cosa sta facendo Claude sul sito del bar?» o «cosa ha
fatto ieri?». Scrivi commit e diario pensando che li leggerà una persona.

## Comandi
`sito aiuto` li elenca tutti. I più usati: `sito elenco`, `sito apri <sito>`, `sito diario <sito> "…"`, `sito stato <sito>`, `sito consegna`.
