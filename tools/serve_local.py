"""Avvia una copia dell'app sul PC per provare le modifiche, con una copia del cervello (mai quello vero).

Uso:  python tools/serve_local.py server/ copia-cervello.tgz
- la copia del cervello e' un tar.gz della cartella data/brains/<utente> (vedi CLAUDE.local.md per come prenderla)
- l'app gira su http://127.0.0.1:8099, utente admin «root», password LOCAL_PASSWORD (default «prova-lunga-123»)
- i dati stanno in una cartella temporanea: alla chiusura non resta niente
"""
import os, sys, tarfile, tempfile
from pathlib import Path
import uvicorn

sys.path.insert(0, sys.argv[1])
data = tempfile.mkdtemp()
os.environ.update(SECRET_KEY="x" * 40, DATA_DIR=data, ADMIN_USER="root", OLLAMA_URL=os.environ.get("OLLAMA_URL", "http://127.0.0.1:11499"))
(Path(data) / "brains").mkdir(parents=True)
if len(sys.argv) > 2:
    with tarfile.open(sys.argv[2]) as t:
        t.extractall(Path(data) / "brains")
import app as w  # noqa: E402

w.ADMIN_PASSWORD_HASH = w.hash_password(os.environ.get("LOCAL_PASSWORD", "prova-lunga-123"))
print("PRONTO su http://127.0.0.1:8099", flush=True)
uvicorn.run(w.app, port=8099, log_level="warning")
