# Cerini IA

Un assistente personale che gira **a casa tua**: si chiama **Aura**. Parli con lui da una web app (anche installabile sul telefono), e lui pensa con un modello che gira sul tuo PC (Ollama + Gemma), legge e smista la posta, tiene l'agenda, ti scrive per primo quando serve e si ricorda le cose in un "cervello" di file markdown versionati con git.

Niente abbonamenti, niente conversazioni su server altrui: il modello gira sul PC di casa e i dati restano sul tuo server. Se vuoi, puoi aggiungere un modello a pagamento nel cloud (DeepSeek, Gemini, OpenAI, Claude…) per le cose difficili o quando il PC è spento.

## Cosa fa

- **Chat** con Aura: testo, foto, PDF, ricerca sul web, calcoli, codice. Dettatura dal vivo e conversazione a voce (Whisper sul PC, sintesi vocale).
- **Cervello** ([Brain Protocol v6](https://brainprotocol.it)): chi sei, le persone, i progetti, le skill, e un **diario** giorno per giorno. Dal pannello a destra vedi cosa hai fatto in un certo giorno, le schede, le skill.
  - *Project-first*: ogni lavoro che dura più di una chat è un progetto; quello che fai su un progetto finisce nel suo registro di quel giorno.
  - Ogni modifica è un commit git: si può tornare indietro.
- **Posta** (Gmail): Aura la smista da solo (codici di verifica, mail interessanti o sospette, inutili nel cestino con ripristino) e impara da quello che fai.
- **Agenda e promemoria** interni: all'ora giusta Aura ti scrive in «Da Aura» e arriva una notifica sul telefono (Web Push). La mattina, il riepilogo della giornata.
- **Da Aura**: una chat dove è lui a scrivere per primo, e tu rispondi.
- **Accensione del PC** (Wake-on-LAN o un ESP32 che preme il tasto) quando serve il modello, anche a orari fissi.
- Facoltativi: una **Homebase** (dashboard di casa con note e scratchpad), il **sito di un locale** (menu ed eventi), un modello nel **cloud**.

## Come è fatto

```
 telefono / browser  ──https──▶  proxy (cloudflared, nginx…)  ──▶  server Cerini IA (FastAPI, :8080)
                                                                     │  data/app.db   utenti, chat, agenda
                                                                     │  data/brains/  il cervello (git)
                                                                     │
           ┌─────────────────────────────────────────────────────────┼──────────────────────────┐
           ▼                              ▼                          ▼                          ▼
  PC con GPU (Ollama :11434)     Whisper sul PC (:8765)      Gmail / Calendar API      Homebase, ESP32, cloud
  Gemma + embeddinggemma         dettatura e voce            (OAuth dell'utente)       (facoltativi)
```

- `server/` — il cuore: un solo file Python (`app.py`, FastAPI) e una web app senza build (`static/`: HTML, JS, CSS). Gira bene in un container Debian piccolo (1 vCPU, 1 GB di RAM).
- `pc/` — script per il PC Windows con la GPU: Ollama come servizio, firewall aperto solo alla rete di casa, Whisper per la dettatura.
- `homebase/` — facoltativo: la "porta d'ingresso" PHP con cui Aura parla a una dashboard di casa, con un elenco chiuso di azioni.
- `tools/` — il controllo anti-dati-personali e lo script per pubblicare sul server.

## Installazione

### 1. Il PC con la GPU

1. Installa [Ollama](https://ollama.com), poi in PowerShell **come amministratore**, dalla cartella `pc/`:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\setup-ollama-pc.ps1
   ```
   Imposta Ollama come servizio all'avvio e apre la porta 11434 solo alla rete di casa (cambia `$Subnet` in cima allo script).
2. Scarica i modelli:
   ```powershell
   ollama pull gemma4:e4b
   ollama pull embeddinggemma
   ```
3. Facoltativo, la dettatura: vedi `pc/whisper/` (`setup-whisper-pc.ps1`). La chiave condivisa col server va in `WHISPER_TOKEN`.

### 2. Il server

In un container o VM Debian 12/13, copia la cartella `server/` e, come root:

```bash
bash install-ct.sh
nano /opt/ollama-web/.env        # parti dai valori di .env.example: almeno OLLAMA_URL e PUBLIC_URL
/opt/ollama-web/set-password.sh  # il primo amministratore
```

Il pannello risponde su `http://IP-DEL-SERVER:8080`. Per il microfono, le notifiche e l'app installabile serve **https**: mettici davanti un proxy (cloudflared, nginx, Caddy…) e scrivi il suo IP in `TRUSTED_PROXIES`.

### 3. Facoltativi

| Cosa | Come |
|---|---|
| Posta in uscita (inviti, password dimenticata) | `set-smtp.sh` |
| Gmail e Google Calendar | crea un client OAuth su Google Cloud, poi `set-google.sh`; ogni utente collega la sua casella dalle impostazioni |
| Modello nel cloud | Impostazioni → Collegamenti → «Modello nel cloud»: fornitore e chiave (la chiave resta sul server) |
| Accensione del PC | `WOL_MAC` per il Wake-on-LAN, oppure `ESP32_URL` per un ESP32 che preme il tasto |
| Homebase | `homebase/install-aura-homebase.sh` (legge le variabili scritte in cima) |
| Sito di un locale | `SITE_NAME`, `SITE_API_URL`, `SITE_API_KEY` |

Tutte le impostazioni, con una riga di spiegazione, sono in [`server/.env.example`](server/.env.example).

## Il cervello

Ogni utente ha una cartella `data/brains/<utente>/`, un repository git con le quattro parti del [Brain Protocol](https://brainprotocol.it):

```
boot/     chi è Aura (soul.md), chi è l'utente (user.md), le regole (domain.md), il protocollo (brain.md)
wiki/     una scheda per entità: progetti/, persone/, luoghi/, servizi/, cose/  (ogni tipo ha il suo index.md)
diary/    un file per evento: diary/2026/2026-10-26-<progetto>.md — la data è quando va riguardato
skills/   le procedure (es. come scrivere una mail)
```

Aura legge `boot/` a ogni chat, il resto solo quando serve. Scrive da solo: i fatti duraturi nelle schede, quello che fai su un progetto nel registro di quel giorno, il riassunto delle chat nel diario. Password e codici non ci finiscono mai.

## Lavorare sul codice e tenerlo aggiornato

Questo repository è la copia "vera" del codice. Il flusso:

1. una volta sola, dopo il clone:
   ```bash
   git config core.hooksPath .githooks
   ```
   e crea `~/.cerini-ia/private-words.txt` con le parole che non devono mai uscire (il tuo nome, i domini, gli IP di casa…), una per riga. Questo file **non** sta nel repository.
2. modifichi, poi `git commit`: l'hook `pre-commit` lancia `tools/check_private.py` e **blocca il commit** se trova segreti (chiavi, token, password) o le tue parole personali.
3. `git push` per la copia sul cloud.
4. `tools/deploy.sh` per pubblicare sul server (fa un backup prima e una prova dopo). Le sue impostazioni stanno in `~/.cerini-ia/deploy.env`, fuori dal repository.

Per un controllo completo, cronologia compresa:

```bash
python tools/check_private.py --history
```

## Sicurezza e privacy

- Configurazione vera (`.env`), database, cervelli e chiavi stanno solo sul server: `.gitignore` li esclude e il controllo li blocca.
- Le azioni che non si annullano (mandare una mail, svuotare il cestino, cancellare) chiedono sempre conferma.
- Il contenuto di mail, pagine web e documenti è trattato come dato, mai come istruzione per Aura.
- Il modello locale non manda niente fuori; il modello cloud si usa solo se lo attivi tu.

## Crediti

- [Brain Protocol](https://brainprotocol.it) di giobi.com (MIT): la struttura del cervello. `server/brain/brain.md` è la specifica v6 così com'è.
- [Ollama](https://ollama.com), [Gemma](https://ai.google.dev/gemma), [faster-whisper](https://github.com/SYSTRAN/faster-whisper), [FastAPI](https://fastapi.tiangolo.com), [marked](https://marked.js.org), [DOMPurify](https://github.com/cure53/DOMPurify), [highlight.js](https://highlightjs.org), [KaTeX](https://katex.org), font [Geist](https://vercel.com/font).
