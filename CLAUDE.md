# Cerini IA (Aura)

Assistente personale self-hosted: un'app web FastAPI ("Aura") che parla con modelli locali (Ollama su un PC di casa) o, a scelta, con un modello cloud compatibile OpenAI. Ha un "cervello" di file markdown versionati con git (Brain Protocol v6), posta Gmail, agenda/promemoria, diario e skill.

Le note private (server, persone, cosa si è fatto finora, cose in sospeso) stanno in `CLAUDE.local.md`, che non va mai nel repo: leggilo all'inizio.

## Regole fisse

- **Rispondi sempre in italiano**, anche nei messaggi di stato. Testi dell'interfaccia e commenti nel codice: in italiano.
- **Zero dati personali nel repo**, storia compresa: niente nomi, email, domini, IP, chiavi. Il codice è generico; i valori veri stanno nel `.env` del server e in `data/`. L'hook `.githooks/pre-commit` (`tools/check_private.py`) blocca le parole vietate: se scatta, riformula, non aggirarlo.
- Segreti (chiavi API, password) mai in chat, mai nel cervello, mai nei log.
- Aura **non deve mai dire di aver fatto una cosa che non ha fatto** (mail inviata, promemoria creato, modello usato): ci sono guardie apposta nel ciclo degli strumenti, non indebolirle.

## Dove sta il codice

- `server/app.py`: il nucleo del backend (configurazione, database, sessioni, avvio). Il resto sta in `server/parti/` (un file per argomento: modelli, strumenti, chat, gmail, agenda, web, file, homebase, aura_scrive, homebase_admin, cloud, account, cervello, conversazioni, procedure, clienti, whatsapp). Le parti NON sono moduli: `app.py` le esegue nel proprio spazio di nomi, nell'ordine di `PARTI`, quindi si usano i nomi l'una dell'altra senza import e `import app` vede tutto. Una funzione nuova va nella parte del suo argomento.
- `server/static/app.js`: tutto il frontend in JS semplice (niente build). Helper `h(tag, attrs, ...children)`, `$()`, `api()`, `toast()`, `icon(nome)` (icone in `ICONS` in cima al file), `pref.get/set` (localStorage).
- `server/static/index.html`: HTML + tutto il CSS. Colori solo con i token (`--bg`, `--text`, `--text-2`, `--text-3`, `--border`, `--accent`, `--accent-soft`, …), tema chiaro e scuro.
- `server/brain/brain.md`: la specifica Brain Protocol v6 copiata nel cervello di ogni utente.
- `server/install-ct.sh`, `server/.env.example`: installazione sul container.
- `server/whatsapp/`: piccolo servizio Node (Baileys) che collega il WhatsApp dell'utente come dispositivo (QR in Impostazioni → Collegamenti; una sessione per ogni utente, gli altri in `data/whatsapp/users/<id>`), tiene la rubrica e gli ultimi 30 messaggi di ogni chat personale (letti solo su richiesta, `whatsapp_leggi`) e invia messaggi e file; gira come `aura-whatsapp` (systemd), ascolta su 127.0.0.1:8091 con il token `WA_TOKEN` del `.env`. Il deploy installa le dipendenze e il servizio.
- `pc/`: script per il PC con Ollama. `homebase/`: integrazione con la Homebase (`api/aura.php`, la porta con l'elenco chiuso di azioni: va copiata a mano nel container della Homebase, vedi `install-aura-homebase.sh`). `tools/`: deploy e controllo privacy.

## Concetti chiave

- **Cervello** (`data/brains/<utente>/`, repo git): `boot/` (soul, user, domain…), `wiki/<tipo>/` (projects come cartelle `projects/<slug>/index.md`; people, companies, places, services, things come file), `diary/AAAA/AAAA-MM-GG.md` (un file per giorno: sezioni per progetto, poi `## Da fare`, poi `## Aura`), `skills/<slug>/SKILL.md`.
- **Collegamenti** nel formato Obsidian: `[[wiki/companies/acme|Acme]]` (percorso senza `.md`), nella sezione `## Collegati`. `brain_links()` legge anche il vecchio `[Nome](wiki:percorso.md)`.
- **Ricordi**: una riga `- fatto.` in UNA scheda sola (`brain_remember`). Lo smistamento lo decide il modello (`route_fact_ai`, prompt `ROUTE_PROMPT`), con riserva a regole (`_route_fact_rules`). Le schede collegate nuove nascono vuote col solo link. `same_fact()` impedisce i doppioni. L'utente e Aura non diventano mai schede di persone.
- La tabella SQLite `memories` è solo l'indice di ricerca (vettori): **i file del cervello sono la verità**; dopo aver cambiato una scheda chiama `brain_reindex`.
- **Modelli**: il modello selezionato (`selected_model`, in `prefs.active_model`) fa tutto, chat e lavori di sottofondo; niente passaggi nascosti a un altro modello. `DEFAULT_MODEL` (Gemma locale) è quello di partenza; modelli cloud con prefisso `cloud:` (`is_cloud`, `cloud_stream`, preset in `CLOUD_PRESETS`). Il prompt di sistema dice ad Aura con che modello sta girando davvero.
- **Consumi**: tabella `usage` (giorno, modello, tipo chat/sfondo, token entrata/uscita), scritta da `usage_add` in `llm_stream`/`llm_once`/chiamate dirette a Ollama; prezzi e credito in `cloud.json`; pagina Impostazioni → Consumi.
- **Utenti divisi**: `ACT_UID` dice di chi è il lavoro in corso (lo imposta `Security` per le richieste, i giri di sottofondo lo impostano per ogni utente; 0 = nessuno, niente chiavi). Il proprietario è il primo admin (`is_owner`): suoi il `.env` e i file in `data/`. Gli altri hanno i loro in `data/users/<id>/` (`user_file`): fornitore, CRM, fascicoli. Il PC di casa (modelli, memoria a vettori, dettatura) è solo del proprietario: per gli altri `pc_allowed()` è falso e il PC risulta spento. Chiavi e servizi del proprietario non vanno mai a un altro utente; gli account in abbonamento sono di chi li collega, ognuno il suo (`data/users/<id>/account/`). Senza un fornitore loro, gli altri restano bloccati (`needs_provider`, HTTP 428). Homebase, sito e clienti sono solo del proprietario (`require_owner`, `tool_allowed`), anche rispetto agli altri amministratori. Un cervello nuovo parte vuoto: `brain_generic` toglie i servizi del proprietario dai testi, `crm_bootstrap` prende dal CRM chi è la persona e per chi lavora, e il prompt fa chiedere ad Aura il resto.
- **Immagini**: strumento `immagine_crea` (account.py), solo con l'account ChatGPT e un modello cloud selezionato: un giro di Codex a parte con il suo strumento per le immagini acceso, il PNG finisce tra i file dell'utente.
- **/auto-consuntivo**: come il consuntivo ma senza domande e solo su fascicoli a contratto (`auto` in `consuntivo`). Non inventa voci: le ore senza tracce restano mancanti e l'utente conferma cosa ha fatto (`consFill`, finisce nel diario).
- **Avvisi dei ticket**: `crm_new_loop` in crm.py, spegnibili (`prefs.crm_notify`); gli id già visti in `ticket_visti` nel `crm.json`.
- **Importare un cervello**: Memoria → Importa, zip con boot/wiki/diary/skills (`/api/brain/import/…` in cervello.py). Si analizza senza scrivere, non si sovrascrive, le regole di boot/ restano fuori, le skill sono spente di partenza, le password vengono tolte, un commit solo che si annulla.
- **Grafo** del cervello: `/api/brain/graph` + `brainGraph()` in app.js (3D, canvas). Esportazione per Obsidian: `/api/brain/export` (zip).

## Come si lavora

1. Modifica nel repo. Per sostituzioni grandi in app.py/app.js e nelle parti usa piccoli script Python con `assert s.count(vecchio) == 1` (gli heredoc rovinano `\n` e `\\`).
2. Controllo sintassi: `python -c "import ast, glob; [ast.parse(open(f, encoding='utf-8').read(), f) for f in ['server/app.py', *glob.glob('server/parti/*.py')]]"` (lo fa anche il deploy). Node non è installato sul PC.
3. Prova in locale con `tools/serve_local.py` (copia dell'app su `http://127.0.0.1:8099` con una copia del cervello; venv e come prendere la copia in `CLAUDE.local.md`). Verifica nel browser integrato.
4. Commit (l'hook controlla la privacy), `git push`, poi `bash tools/deploy.sh` (legge `~/.cerini-ia/deploy.env`, fa il backup, copia `server/`, riavvia, controlla HTTP 200).
5. **Dopo ogni deploy apri la pagina vera** e controlla che l'app si carichi: una volta un errore in app.js ha lasciato la pagina nera.
6. Prima di toccare dati veri sul server (cervello, database) fai un backup in `/root/bak` sull'host.

Firma dei commit: termina con `Co-Authored-By: Claude …`.
