from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import re
import sys


ROOT = Path(__file__).resolve().parents[1]

HTML_FILES = [
    Path("index.html"),
    Path("projects/index.html"),
    Path("notes/index.html"),
    Path("notes/build-logs-homepage-second-pass.html"),
    Path("notes/when-a-fluorescence-signal-becomes-usable.html"),
    Path("instrument/index.html"),
]

PUBLIC_HTML = HTML_FILES
RETIRED_HTML = [Path("review/index.html")]

REQUIRED_META_MARKERS = [
    ("title", "<title"),
    ("description", 'name="description"'),
    ("canonical", 'rel="canonical"'),
    ("favicon", 'rel="icon"'),
    ("og:title", 'property="og:title"'),
    ("og:description", 'property="og:description"'),
    ("og:type", 'property="og:type"'),
    ("og:url", 'property="og:url"'),
    ("og:site_name", 'property="og:site_name"'),
    ("og:image", 'property="og:image"'),
    ("twitter:card", 'name="twitter:card"'),
    ("twitter:title", 'name="twitter:title"'),
    ("twitter:description", 'name="twitter:description"'),
    ("twitter:image", 'name="twitter:image"'),
]


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tags: list[tuple[str, dict[str, str]]] = []
        self.h1_count = 0
        self.html_lang = ""
        self.has_main_id = False
        self.has_skip_to_main = False
        self.local_refs: list[tuple[str, str]] = []
        self.external_scripts: list[str] = []
        self.forms = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key.lower(): value or "" for key, value in attrs}
        tag = tag.lower()
        self.tags.append((tag, attrs_dict))

        if tag == "html":
            self.html_lang = attrs_dict.get("lang", "")
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "main" and attrs_dict.get("id") == "main":
            self.has_main_id = True
        elif tag == "a" and attrs_dict.get("href") == "#main":
            classes = set(attrs_dict.get("class", "").split())
            if "skip-link" in classes:
                self.has_skip_to_main = True
        elif tag == "form":
            self.forms += 1

        for attr in ("href", "src"):
            value = attrs_dict.get(attr)
            if not value:
                continue
            if tag == "script" and value.startswith(("http://", "https://")):
                self.external_scripts.append(value)
            if is_local_reference(value):
                self.local_refs.append((attr, value))


def is_local_reference(value: str) -> bool:
    if value.startswith(("#", "mailto:", "tel:", "javascript:")):
        return False
    parsed = urlparse(value)
    return parsed.scheme == "" and parsed.netloc == ""


def resolve_local_reference(source: Path, value: str) -> Path | None:
    parsed = urlparse(value)
    if parsed.path == "":
        return None

    raw_path = unquote(parsed.path)
    if raw_path.startswith("/"):
        candidate = ROOT / raw_path.lstrip("/")
    else:
        candidate = (ROOT / source.parent / raw_path).resolve()

    try:
        candidate.relative_to(ROOT)
    except ValueError:
        return candidate

    if raw_path.endswith("/"):
        return candidate / "index.html"
    if candidate.is_dir():
        return candidate / "index.html"
    return candidate


def check_html(path: Path) -> list[str]:
    errors: list[str] = []
    full_path = ROOT / path
    if not full_path.exists():
        return [f"{path}: file missing"]

    text = full_path.read_text(encoding="utf-8")
    lower = text.lower()
    parser = SiteParser()
    parser.feed(text)

    for label, marker in REQUIRED_META_MARKERS:
        if marker not in lower:
            errors.append(f"{path}: missing {label}")

    if not parser.html_lang:
        errors.append(f"{path}: missing html lang")
    if parser.h1_count != 1:
        errors.append(f"{path}: expected one h1, found {parser.h1_count}")
    if not parser.has_main_id:
        errors.append(f"{path}: missing <main id=\"main\">")
    if not parser.has_skip_to_main:
        errors.append(f"{path}: missing skip link to #main")
    if parser.forms:
        errors.append(f"{path}: forms are not approved for v1")
    for src in parser.external_scripts:
        errors.append(f"{path}: external script is not approved: {src}")

    for attr, value in parser.local_refs:
        resolved = resolve_local_reference(path, value)
        if resolved is None:
            continue
        if not resolved.exists():
            errors.append(f"{path}: missing local {attr} target {value} -> {resolved.relative_to(ROOT)}")

    zh_pattern = re.compile(
        r'<[^>]*class="[^"]*(?:hero-title-zh|hero-lead-zh|section-copy-zh|card-copy-zh|project-copy-zh|stream-copy-zh|about-summary-zh|article-lead-zh)[^"]*"(?:(?!lang=)[^>])*?>',
        re.IGNORECASE,
    )
    if zh_pattern.search(text):
        errors.append(f"{path}: substantial Chinese text block missing lang=\"zh-CN\"")

    return errors


def main() -> int:
    errors: list[str] = []

    for path in HTML_FILES:
        errors.extend(check_html(path))

    for required in [Path(".nojekyll"), Path("robots.txt"), Path("sitemap.xml"), Path("assets/og-card.png")]:
        if not (ROOT / required).exists():
            errors.append(f"{required}: required file missing")

    for path in RETIRED_HTML:
        if (ROOT / path).exists():
            errors.append(f"{path}: retired internal review page must not be in the deployable tree")

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8") if (ROOT / "robots.txt").exists() else ""
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8") if (ROOT / "sitemap.xml").exists() else ""
    if "Disallow: /review/" not in robots:
        errors.append("robots.txt: must disallow /review/")
    if "https://yscjrh.github.io/review/" in sitemap:
        errors.append("sitemap.xml: must not include /review/")
    for path in PUBLIC_HTML:
        public_url = "https://yscjrh.github.io/"
        if path != Path("index.html"):
            public_url += path.as_posix().removesuffix("index.html")
        if public_url not in sitemap:
            errors.append(f"sitemap.xml: missing {public_url}")

    if errors:
        print("Site check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Site check passed.")
    print(f"Checked {len(HTML_FILES)} public HTML pages, robots.txt, sitemap.xml, and local references.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
