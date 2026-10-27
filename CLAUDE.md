# Cerini IA (Aura)

Assistente personale self-hosted: un'app web FastAPI ("Aura") che parla con modelli locali (Ollama su un PC di casa) o, a scelta, con un modello cloud compatibile OpenAI. Ha un "cervello" di file markdown versionati con git (Brain Protocol v6), posta Gmail, agenda/promemoria, diario e skill.

Le note private (server, persone, cosa si è fatto finora, cose in sospeso) stanno in `CLAUDE.local.md`, che non va mai nel repo: leggilo all'inizio.

## Regole fisse

- **Rispondi sempre in italiano**, anche nei messaggi di stato. Testi dell'interfaccia e commenti nel codice: in italiano.
- **Zero dati personali nel repo**, storia compresa: niente nomi, email, domini, IP, chiavi. Il codice è generico; i valori veri stanno nel `.env` del server e in `data/`. L'hook `.githooks/pre-commit` (`tools/check_private.py`) blocca le parole vietate: se scatta, riformula, non aggirarlo.
- Segreti (chiavi API, password) mai in chat, mai nel cervello, mai nei log.
- Aura **non deve mai dire di aver fatto una cosa che non ha fatto** (mail inviata, promemoria creato, modello usato): ci sono guardie apposta nel ciclo degli strumenti, non indebolirle.

## Dove sta il codice

- `server/app.py`: il nucleo del backend (configurazione, database, sessioni, avvio). Il resto sta in `server/parti/` (un file per argomento: modelli, strumenti, chat, gmail, agenda, web, file, homebase, aura_scrive, homebase_admin, cloud, cervello, conversazioni, procedure). Le parti NON sono moduli: `app.py` le esegue nel proprio spazio di nomi, nell'ordine di `PARTI`, quindi si usano i nomi l'una dell'altra senza import e `import app` vede tutto. Una funzione nuova va nella parte del suo argomento.
- `server/static/app.js`: tutto il frontend in JS semplice (niente build). Helper `h(tag, attrs, ...children)`, `$()`, `api()`, `toast()`, `icon(nome)` (icone in `ICONS` in cima al file), `pref.get/set` (localStorage).
- `server/static/index.html`: HTML + tutto il CSS. Colori solo con i token (`--bg`, `--text`, `--text-2`, `--text-3`, `--border`, `--accent`, `--accent-soft`, …), tema chiaro e scuro.
- `server/brain/brain.md`: la specifica Brain Protocol v6 copiata nel cervello di ogni utente.
- `server/install-ct.sh`, `server/.env.example`: installazione sul container.
- `pc/`: script per il PC con Ollama. `homebase/`: integrazione con la Homebase (`api/aura.php`, la porta con l'elenco chiuso di azioni: va copiata a mano nel container della Homebase, vedi `install-aura-homebase.sh`). `tools/`: deploy e controllo privacy.

## Concetti chiave

- **Cervello** (`data/brains/<utente>/`, repo git): `boot/` (soul, user, domain…), `wiki/<tipo>/` (projects come cartelle `projects/<slug>/index.md`; people, companies, places, services, things come file), `diary/AAAA/AAAA-MM-GG.md` (un file per giorno: sezioni per progetto, poi `## Da fare`, poi `## Aura`), `skills/<slug>/SKILL.md`.
- **Collegamenti** nel formato Obsidian: `[[wiki/companies/acme|Acme]]` (percorso senza `.md`), nella sezione `## Collegati`. `brain_links()` legge anche il vecchio `[Nome](wiki:percorso.md)`.
- **Ricordi**: una riga `- fatto.` in UNA scheda sola (`brain_remember`). Lo smistamento lo decide il modello (`route_fact_ai`, prompt `ROUTE_PROMPT`), con riserva a regole (`_route_fact_rules`). Le schede collegate nuove nascono vuote col solo link. `same_fact()` impedisce i doppioni. L'utente e Aura non diventano mai schede di persone.
- La tabella SQLite `memories` è solo l'indice di ricerca (vettori): **i file del cervello sono la verità**; dopo aver cambiato una scheda chiama `brain_reindex`.
- **Modelli**: `DEFAULT_MODEL` (Gemma locale) all'avvio e per i lavori di sottofondo; modelli cloud con prefisso `cloud:` (`is_cloud`, `cloud_stream`, preset in `CLOUD_PRESETS`). Il prompt di sistema dice ad Aura con che modello sta girando davvero.
- **Consumi**: tabella `usage` (giorno, modello, tipo chat/sfondo, token entrata/uscita), scritta da `usage_add` in `llm_stream`/`llm_once`/chiamate dirette a Ollama; prezzi e credito in `cloud.json`; pagina Impostazioni → Consumi.
- **Grafo** del cervello: `/api/brain/graph` + `brainGraph()` in app.js (3D, canvas). Esportazione per Obsidian: `/api/brain/export` (zip).

## Come si lavora

1. Modifica nel repo. Per sostituzioni grandi in app.py/app.js e nelle parti usa piccoli script Python con `assert s.count(vecchio) == 1` (gli heredoc rovinano `\n` e `\\`).
2. Controllo sintassi: `python -c "import ast, glob; [ast.parse(open(f, encoding='utf-8').read(), f) for f in ['server/app.py', *glob.glob('server/parti/*.py')]]"` (lo fa anche il deploy). Node non è installato sul PC.
3. Prova in locale con `tools/serve_local.py` (copia dell'app su `http://127.0.0.1:8099` con una copia del cervello; venv e come prendere la copia in `CLAUDE.local.md`). Verifica nel browser integrato.
4. Commit (l'hook controlla la privacy), `git push`, poi `bash tools/deploy.sh` (legge `~/.cerini-ia/deploy.env`, fa il backup, copia `server/`, riavvia, controlla HTTP 200).
5. **Dopo ogni deploy apri la pagina vera** e controlla che l'app si carichi: una volta un errore in app.js ha lasciato la pagina nera.
6. Prima di toccare dati veri sul server (cervello, database) fai un backup in `/root/bak` sull'host.

Firma dei commit: termina con `Co-Authored-By: Claude …`.
