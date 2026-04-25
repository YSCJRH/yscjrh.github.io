from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import mimetypes
import os
from pathlib import Path


PORT = 4173
HOST = "127.0.0.1"
ROOT = Path(__file__).resolve().parents[1]


class StaticHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".css": "text/css; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".mjs": "application/javascript; charset=utf-8",
        ".svg": "image/svg+xml",
    }


def main():
    mimetypes.add_type("image/svg+xml", ".svg")
    mimetypes.add_type("application/javascript", ".mjs")
    os.chdir(ROOT)
    server = ThreadingHTTPServer((HOST, PORT), StaticHandler)
    print(f"Serving {ROOT} at http://127.0.0.1:{PORT}/")
    print(f"Localhost alias: http://localhost:{PORT}/")
    print("Prefer 127.0.0.1 for Codex browser QA of local ES modules.")
    print("Press Ctrl+C to stop.")
    server.serve_forever()


if __name__ == "__main__":
    main()
