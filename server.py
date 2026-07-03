#!/usr/bin/env python3
"""Serve index.html for Connection Cards.

Usage:
    python3 server.py              # http://localhost:8000
    python3 server.py --port 3000
    python3 server.py --ngrok        # also starts an ngrok tunnel

With ngrok in a separate terminal:
    python3 server.py
    ngrok http 8000
"""

from __future__ import annotations

import argparse
import http.server
import socketserver
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEFAULT_PORT = 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format: str, *args) -> None:
        print(f"[{self.log_date_time_string()}] {args[0]}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve Connection Cards")
    parser.add_argument("-p", "--port", type=int, default=DEFAULT_PORT)
    parser.add_argument(
        "--ngrok",
        action="store_true",
        help="Start an ngrok tunnel (requires ngrok in PATH)",
    )
    args = parser.parse_args()

    ngrok_proc: subprocess.Popen | None = None
    if args.ngrok:
        try:
            ngrok_proc = subprocess.Popen(["ngrok", "http", str(args.port)])
            print("ngrok started — open http://127.0.0.1:4040 for the public URL")
        except FileNotFoundError:
            print("ngrok not found. Install from https://ngrok.com", file=sys.stderr)
            sys.exit(1)

    with socketserver.TCPServer(("", args.port), Handler) as httpd:
        print(f"Serving {ROOT / 'index.html'}")
        print(f"Local: http://localhost:{args.port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down.")
        finally:
            if ngrok_proc is not None:
                ngrok_proc.terminate()


if __name__ == "__main__":
    main()
