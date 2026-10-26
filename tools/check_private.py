#!/usr/bin/env python3
"""Blocca i commit che contengono segreti o dati personali.

Cerca due cose nei file che stanno per entrare nel repository:
1. segreti riconoscibili da soli (chiavi private, token di Google/GitHub/OpenAI, password scritte nel codice…);
2. le parole personali elencate in un file FUORI dal repository (nomi, indirizzi, domini, IP di casa):
   ~/.cerini-ia/private-words.txt, una per riga (le righe che iniziano con # sono commenti).
   Quel file non va mai committato: e' l'elenco di quello che non deve uscire.

Uso:
    python tools/check_private.py            # i file in stage (lo usa l'hook pre-commit)
    python tools/check_private.py --all      # tutti i file del repository
    python tools/check_private.py --history  # anche tutta la cronologia git
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORDS_FILE = Path.home() / ".cerini-ia" / "private-words.txt"
SKIP = re.compile(r"\.(png|jpe?g|ico|woff2?|ttf|mp3|pdf|gif|webp)$|(^|/)vendor/", re.I)
ALLOWED_EMAIL = re.compile(r"@(example\.(com|org|net)|[\w.-]+\.example|users\.noreply\.github\.com|cerini\.ia|anthropic\.com)$|^(noreply|no-reply)@", re.I)

SECRETS = [
    ("chiave privata", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("segreto client Google", re.compile(r"GOCSPX-[\w-]{20,}")),
    ("chiave API Google", re.compile(r"AIza[0-9A-Za-z_-]{35}")),
    ("token GitHub", re.compile(r"\b(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_\w{40,})")),
    ("chiave OpenAI/Anthropic", re.compile(r"\bsk-(ant-)?[A-Za-z0-9_-]{24,}")),
    ("token Slack", re.compile(r"\bxox[abpr]-[A-Za-z0-9-]{10,}")),
    ("chiave AWS", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("JWT", re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}")),
    ("valore segreto scritto nel codice", re.compile(
        r"(?i)\b(password|passwd|secret|api_?key|token|client_secret)\w*['\"]?\s*[=:]\s*['\"](?!cambiami|your|xxx|example)[A-Za-z0-9+/_=.-]{16,}['\"]")),
]
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def words() -> list[str]:
    if not WORDS_FILE.exists():
        return []
    return [w.strip() for w in WORDS_FILE.read_text(encoding="utf-8").splitlines() if w.strip() and not w.startswith("#")]


def git(*args: str) -> str:
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True, encoding="utf-8", errors="replace").stdout


def scan(name: str, text: str, private: list[str]) -> list[str]:
    out = []
    for n, line in enumerate(text.splitlines(), 1):
        for label, rx in SECRETS:
            if rx.search(line):
                out.append(f"{name}:{n}: {label}")
        for m in EMAIL.finditer(line):
            if not ALLOWED_EMAIL.search(m.group(0)):
                out.append(f"{name}:{n}: indirizzo email «{m.group(0)}»")
        low = line.lower()
        for w in private:
            if w.lower() in low:
                out.append(f"{name}:{n}: parola personale «{w}»")
    return out


def main() -> int:
    private = words()
    if not private:
        print(f"Attenzione: {WORDS_FILE} non c'e' o e' vuoto, controllo solo i segreti.", file=sys.stderr)
    problems = []
    if "--history" in sys.argv:
        problems += scan("cronologia", git("log", "-p", "--all", "--no-color"), private)
    files = git("ls-files") if "--all" in sys.argv or "--history" in sys.argv else git("diff", "--cached", "--name-only", "--diff-filter=ACMR")
    for rel in [f for f in files.splitlines() if f and not SKIP.search(f)]:
        p = ROOT / rel
        if p.is_file():
            problems += scan(rel, p.read_text(encoding="utf-8", errors="replace"), private)
    for path in ("server/.env", "data/", "token.txt", ".pem"):
        if any(path in f for f in files.splitlines() if not f.endswith(".example")):
            problems.append(f"file che non deve stare nel repository: {path}")
    if problems:
        print("Fermo: ho trovato cose che non devono finire nel repository:\n  " + "\n  ".join(sorted(set(problems))), file=sys.stderr)
        return 1
    print("Nessun segreto o dato personale trovato.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
