from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import mimetypes
import os
from pathlib import Path


DEFAULT_PORT = 4173
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

    def guess_type(self, path):
        suffix = Path(path).suffix.lower()
        if suffix in self.extensions_map:
            return self.extensions_map[suffix]
        return super().guess_type(path)


def main():
    mimetypes.add_type("image/svg+xml", ".svg")
    mimetypes.add_type("application/javascript", ".mjs")
    os.chdir(ROOT)

    preferred_port = int(os.environ.get("PORT", DEFAULT_PORT))
    candidate_ports = [preferred_port]
    if "PORT" not in os.environ:
        candidate_ports.extend(port for port in range(DEFAULT_PORT + 1, DEFAULT_PORT + 21) if port != preferred_port)

    last_error = None
    for port in candidate_ports:
        try:
            server = ThreadingHTTPServer((HOST, port), StaticHandler)
            break
        except OSError as error:
            last_error = error
    else:
        raise last_error

    print(f"Serving {ROOT} at http://127.0.0.1:{port}/", flush=True)
    print(f"Localhost alias: http://localhost:{port}/", flush=True)
    if port != DEFAULT_PORT:
        print(f"Default port {DEFAULT_PORT} was unavailable; using {port}.", flush=True)
    print("Prefer 127.0.0.1 for Codex browser QA of local ES modules.", flush=True)
    print("Press Ctrl+C to stop.", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
