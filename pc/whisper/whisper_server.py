"""Servizio di trascrizione vocale (Whisper) che gira sul PC, nella RAM e sul processore.

Il pannello nel CT gli manda l'audio registrato nel browser e riceve il testo.
Avvio:  uvicorn whisper_server:app --host 0.0.0.0 --port 8765
"""
import asyncio
import hmac
import os
import tempfile
import threading
import time
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException, Request
from faster_whisper import WhisperModel

BASE = Path(__file__).parent
MODEL_NAME = os.environ.get("WHISPER_MODEL", "large-v3-turbo")
MODELS_DIR = os.environ.get("WHISPER_MODELS", str(BASE / "models"))
THREADS = int(os.environ.get("WHISPER_THREADS", "8"))   # i9-11900K: 8 core fisici
MAX_BYTES = 25 * 1024 * 1024                              # ~ qualche minuto di audio compresso
# Chiave condivisa col pannello: senza, qualunque dispositivo della LAN potrebbe usare il servizio
TOKEN = (BASE / "token.txt").read_text().strip() if (BASE / "token.txt").exists() else os.environ.get("WHISPER_TOKEN", "")

EXT = {"audio/webm": ".webm", "audio/ogg": ".ogg", "audio/mp4": ".mp4", "audio/mpeg": ".mp3", "audio/wav": ".wav", "audio/x-wav": ".wav"}

_model: WhisperModel | None = None
_load_lock = threading.Lock()
_run_lock = threading.Lock()   # una trascrizione alla volta: le altre aspettano (il processore e' uno)


def get_model() -> WhisperModel:
    global _model
    with _load_lock:
        if _model is None:
            t = time.time()
            _model = WhisperModel(MODEL_NAME, device="cpu", compute_type="int8", cpu_threads=THREADS, download_root=MODELS_DIR)
            print(f"Modello {MODEL_NAME} caricato in {time.time() - t:.1f} s", flush=True)
    return _model


app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)


@app.on_event("startup")
async def preload():
    # Carica il modello subito, cosi' la prima dettatura non aspetta
    threading.Thread(target=get_model, daemon=True).start()


def check_token(token: str | None):
    if not TOKEN or not hmac.compare_digest(token or "", TOKEN):
        raise HTTPException(401, "Chiave non valida")


@app.get("/health")
async def health(x_token: str | None = Header(None)):
    check_token(x_token)
    return {"ok": True, "model": MODEL_NAME, "loaded": _model is not None}


def _transcribe(path: str, language: str | None) -> dict:
    model = get_model()
    with _run_lock:
        t = time.time()
        segments, info = model.transcribe(path, language=language, beam_size=5, vad_filter=True,
                                          vad_parameters={"min_silence_duration_ms": 500})
        text = " ".join(s.text.strip() for s in segments).strip()
        return {"text": text, "language": info.language, "duration": round(info.duration, 2),
                "elapsed": round(time.time() - t, 2)}


@app.post("/transcribe")
async def transcribe(request: Request, x_token: str | None = Header(None), lang: str = "it"):
    check_token(x_token)
    data = await request.body()
    if not data:
        raise HTTPException(400, "Audio vuoto")
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Registrazione troppo lunga")
    ctype = (request.headers.get("content-type") or "").split(";")[0].strip()
    fd, path = tempfile.mkstemp(suffix=EXT.get(ctype, ".webm"))
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        # lang vuoto = riconoscimento automatico della lingua
        return await asyncio.to_thread(_transcribe, path, lang or None)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(422, f"Non riesco a leggere l'audio ({type(e).__name__}): formato non riconosciuto o registrazione rovinata")
    finally:
        try:
            os.remove(path)
        except OSError:
            pass
