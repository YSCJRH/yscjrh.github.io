from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import xml.etree.ElementTree as ET
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_SITE_NAME = "HJR / YSCJRH"
EXPECTED_OG_LOCALE = "en_US"
EXPECTED_THEME_COLOR = "#05070d"
EXPECTED_SHARE_IMAGE_URL = "https://yscjrh.github.io/assets/og-card.png"
EXPECTED_SHARE_IMAGE_ALT = (
    "HJR / YSCJRH share card: fluorescence, methods, instruments, and open tools / "
    "荧光、方法、仪器与开放工具."
)
EXPECTED_SHARE_IMAGE_SIZE = (1200, 630)

HTML_FILES = [
    Path("index.html"),
    Path("404.html"),
    Path("projects/index.html"),
    Path("notes/index.html"),
    Path("notes/build-logs-homepage-second-pass.html"),
    Path("notes/when-a-fluorescence-signal-becomes-usable.html"),
    Path("instrument/index.html"),
]

SITEMAP_HTML = [
    Path("index.html"),
    Path("projects/index.html"),
    Path("notes/index.html"),
    Path("notes/build-logs-homepage-second-pass.html"),
    Path("notes/when-a-fluorescence-signal-becomes-usable.html"),
    Path("instrument/index.html"),
]
CSS_FILES = [Path("styles.css")]
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
    ("og:locale", 'property="og:locale"'),
    ("og:image", 'property="og:image"'),
    ("theme-color", 'name="theme-color"'),
    ("twitter:card", 'name="twitter:card"'),
    ("twitter:title", 'name="twitter:title"'),
    ("twitter:description", 'name="twitter:description"'),
    ("twitter:image", 'name="twitter:image"'),
]

EXPECTED_OG_TYPES = {
    Path("index.html"): "website",
    Path("404.html"): "website",
    Path("projects/index.html"): "website",
    Path("notes/index.html"): "website",
    Path("notes/build-logs-homepage-second-pass.html"): "article",
    Path("notes/when-a-fluorescence-signal-becomes-usable.html"): "article",
    Path("instrument/index.html"): "website",
}

ARIA_IDREF_ATTRIBUTES = {
    "aria-activedescendant",
    "aria-controls",
    "aria-describedby",
    "aria-details",
    "aria-errormessage",
    "aria-labelledby",
    "aria-owns",
}
EXTERNAL_RESOURCE_LINK_RELS = {
    "dns-prefetch",
    "modulepreload",
    "preconnect",
    "prefetch",
    "preload",
    "stylesheet",
}
MEDIA_SOURCE_ATTRIBUTES = {
    "img": ("src", "srcset"),
    "source": ("src", "srcset"),
    "video": ("src", "poster"),
    "audio": ("src",),
    "iframe": ("src",),
    "embed": ("src",),
    "object": ("data",),
}
CSS_EXTERNAL_REFERENCE_PATTERN = re.compile(
    r"@import\s+(?:url\(\s*)?['\"]?https?://|url\(\s*['\"]?https?://",
    re.IGNORECASE,
)


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tags: list[tuple[str, dict[str, str]]] = []
        self.h1_count = 0
        self.html_lang = ""
        self.has_main_id = False
        self.has_skip_to_main = False
        self.ids: list[str] = []
        self.fragment_refs: list[str] = []
        self.aria_id_refs: list[tuple[str, str]] = []
        self.local_refs: list[tuple[str, str]] = []
        self.external_scripts: list[str] = []
        self.external_resource_links: list[tuple[str, str]] = []
        self.external_media_refs: list[tuple[str, str, str]] = []
        self.image_alt_refs: list[tuple[str, bool, str, str, str]] = []
        self.private_contact_refs: list[str] = []
        self.blank_target_links: list[tuple[str, str]] = []
        self.forms = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_names = {key.lower() for key, _ in attrs}
        attrs_dict = {key.lower(): value or "" for key, value in attrs}
        tag = tag.lower()
        self.tags.append((tag, attrs_dict))
        element_id = attrs_dict.get("id")
        if element_id:
            self.ids.append(element_id)
        for attr, value in attrs_dict.items():
            if attr in ARIA_IDREF_ATTRIBUTES and value.strip():
                for target_id in value.split():
                    self.aria_id_refs.append((attr, target_id))

        if tag == "html":
            self.html_lang = attrs_dict.get("lang", "")
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "main" and attrs_dict.get("id") == "main":
            self.has_main_id = True
        elif tag == "a":
            href = attrs_dict.get("href", "")
            if href.startswith(("mailto:", "tel:")):
                self.private_contact_refs.append(href)
            if attrs_dict.get("target", "").lower() == "_blank":
                self.blank_target_links.append((attrs_dict.get("href", ""), attrs_dict.get("rel", "")))
            if href == "#main":
                classes = set(attrs_dict.get("class", "").split())
                if "skip-link" in classes:
                    self.has_skip_to_main = True
        elif tag == "link":
            href = attrs_dict.get("href", "")
            rel_tokens = set(attrs_dict.get("rel", "").lower().split())
            if href.startswith(("http://", "https://")) and rel_tokens & EXTERNAL_RESOURCE_LINK_RELS:
                self.external_resource_links.append((attrs_dict.get("rel", ""), href))
        elif tag == "form":
            self.forms += 1

        for attr in MEDIA_SOURCE_ATTRIBUTES.get(tag, ()):
            value = attrs_dict.get(attr, "")
            if value.startswith(("http://", "https://")) or " http://" in value or " https://" in value:
                self.external_media_refs.append((tag, attr, value))
        if tag == "img":
            self.image_alt_refs.append(
                (
                    attrs_dict.get("src", ""),
                    "alt" in attr_names,
                    attrs_dict.get("alt", ""),
                    attrs_dict.get("aria-hidden", ""),
                    attrs_dict.get("role", ""),
                )
            )

        for attr in ("href", "src"):
            value = attrs_dict.get(attr)
            if not value:
                continue
            if tag == "script" and value.startswith(("http://", "https://")):
                self.external_scripts.append(value)
            parsed = urlparse(value)
            if attr == "href" and parsed.scheme == "" and parsed.netloc == "" and parsed.fragment:
                self.fragment_refs.append(value)
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


def robots_meta_contents(parser: SiteParser) -> list[str]:
    return [
        attrs.get("content", "").lower()
        for tag, attrs in parser.tags
        if tag == "meta" and attrs.get("name", "").lower() == "robots"
    ]


def expected_public_url(path: Path) -> str:
    if path == Path("index.html"):
        return "https://yscjrh.github.io/"
    if path == Path("404.html"):
        return "https://yscjrh.github.io/404.html"
    suffix = path.as_posix()
    if suffix.endswith("index.html"):
        suffix = suffix.removesuffix("index.html")
    return f"https://yscjrh.github.io/{suffix}"


def link_values(parser: SiteParser, rel: str) -> list[str]:
    return [
        attrs.get("href", "")
        for tag, attrs in parser.tags
        if tag == "link" and attrs.get("rel", "").lower() == rel
    ]


def meta_property_values(parser: SiteParser, property_name: str) -> list[str]:
    return [
        attrs.get("content", "")
        for tag, attrs in parser.tags
        if tag == "meta" and attrs.get("property", "").lower() == property_name
    ]


def meta_name_values(parser: SiteParser, name: str) -> list[str]:
    return [
        attrs.get("content", "")
        for tag, attrs in parser.tags
        if tag == "meta" and attrs.get("name", "").lower() == name
    ]


def expected_sitemap_urls() -> list[str]:
    return [expected_public_url(path) for path in SITEMAP_HTML]


def sitemap_locations(text: str) -> list[str]:
    try:
        root = ET.fromstring(text)
    except ET.ParseError as error:
        raise ValueError(f"sitemap.xml: invalid XML: {error}") from error

    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locations = [
        (element.text or "").strip()
        for element in root.findall("sm:url/sm:loc", namespace)
    ]
    if not locations:
        raise ValueError("sitemap.xml: no sitemap loc entries found")
    return locations


def png_dimensions(path: Path) -> tuple[int, int] | None:
    header = path.read_bytes()[:24]
    if len(header) < 24 or not header.startswith(b"\x89PNG\r\n\x1a\n"):
        return None
    return (int.from_bytes(header[16:20], "big"), int.from_bytes(header[20:24], "big"))


def html_ids(path: Path) -> set[str]:
    parser = SiteParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return set(parser.ids)


def check_html(path: Path) -> list[str]:
    errors: list[str] = []
    full_path = ROOT / path
    if not full_path.exists():
        return [f"{path}: file missing"]

    text = full_path.read_text(encoding="utf-8")
    lower = text.lower()
    parser = SiteParser()
    parser.feed(text)
    current_ids = set(parser.ids)

    for label, marker in REQUIRED_META_MARKERS:
        if marker not in lower:
            errors.append(f"{path}: missing {label}")

    expected_url = expected_public_url(path)
    canonical_values = link_values(parser, "canonical")
    if canonical_values != [expected_url]:
        errors.append(f"{path}: canonical must be {expected_url}")
    og_url_values = meta_property_values(parser, "og:url")
    if og_url_values != [expected_url]:
        errors.append(f"{path}: og:url must be {expected_url}")
    expected_identity_property_values = {
        "og:site_name": EXPECTED_SITE_NAME,
        "og:locale": EXPECTED_OG_LOCALE,
    }
    for property_name, expected_value in expected_identity_property_values.items():
        if meta_property_values(parser, property_name) != [expected_value]:
            errors.append(f"{path}: {property_name} must be {expected_value}")
    expected_og_type = EXPECTED_OG_TYPES.get(path)
    if expected_og_type and meta_property_values(parser, "og:type") != [expected_og_type]:
        errors.append(f"{path}: og:type must be {expected_og_type}")
    expected_property_values = {
        "og:image": EXPECTED_SHARE_IMAGE_URL,
        "og:image:width": str(EXPECTED_SHARE_IMAGE_SIZE[0]),
        "og:image:height": str(EXPECTED_SHARE_IMAGE_SIZE[1]),
        "og:image:alt": EXPECTED_SHARE_IMAGE_ALT,
    }
    for property_name, expected_value in expected_property_values.items():
        if meta_property_values(parser, property_name) != [expected_value]:
            errors.append(f"{path}: {property_name} must be {expected_value}")
    expected_name_values = {
        "twitter:card": "summary_large_image",
        "twitter:image": EXPECTED_SHARE_IMAGE_URL,
        "twitter:image:alt": EXPECTED_SHARE_IMAGE_ALT,
    }
    for name, expected_value in expected_name_values.items():
        if meta_name_values(parser, name) != [expected_value]:
            errors.append(f"{path}: {name} must be {expected_value}")
    if meta_name_values(parser, "theme-color") != [EXPECTED_THEME_COLOR]:
        errors.append(f"{path}: theme-color must be {EXPECTED_THEME_COLOR}")

    if not parser.html_lang:
        errors.append(f"{path}: missing html lang")
    if parser.h1_count != 1:
        errors.append(f"{path}: expected one h1, found {parser.h1_count}")
    if not parser.has_main_id:
        errors.append(f"{path}: missing <main id=\"main\">")
    if not parser.has_skip_to_main:
        errors.append(f"{path}: missing skip link to #main")
    duplicate_ids = sorted({element_id for element_id in parser.ids if parser.ids.count(element_id) > 1})
    for element_id in duplicate_ids:
        errors.append(f"{path}: duplicate id {element_id}")
    for attr, target_id in parser.aria_id_refs:
        if target_id not in current_ids:
            errors.append(f"{path}: {attr} references missing id {target_id}")
    robots_meta = robots_meta_contents(parser)
    if path == Path("404.html"):
        if not any("noindex" in content for content in robots_meta):
            errors.append(f"{path}: custom 404 must include robots noindex")
    elif path in SITEMAP_HTML and any("noindex" in content for content in robots_meta):
        errors.append(f"{path}: sitemap page must not include robots noindex")
    if parser.forms:
        errors.append(f"{path}: forms are not approved for v1")
    for src in parser.external_scripts:
        errors.append(f"{path}: external script is not approved: {src}")
    for rel, href in parser.external_resource_links:
        errors.append(f"{path}: external resource link is not approved: rel={rel} href={href}")
    for tag, attr, value in parser.external_media_refs:
        errors.append(f"{path}: external {tag} {attr} is not approved: {value}")
    for src, has_alt, alt_text, aria_hidden, role in parser.image_alt_refs:
        if not has_alt:
            errors.append(f"{path}: image missing alt text: {src}")
        elif not alt_text.strip() and aria_hidden.lower() != "true" and role.lower() not in {"presentation", "none"}:
            errors.append(
                f"{path}: empty image alt must be marked decorative with aria-hidden=\"true\" "
                f"or role=\"presentation\": {src}"
            )
    for href in parser.private_contact_refs:
        errors.append(f"{path}: private contact link is not approved: {href}")
    for href, rel in parser.blank_target_links:
        rel_tokens = set(rel.lower().split())
        if not {"noopener", "noreferrer"}.issubset(rel_tokens):
            errors.append(
                f"{path}: target=\"_blank\" link must use rel=\"noopener noreferrer\": {href}"
            )

    for attr, value in parser.local_refs:
        resolved = resolve_local_reference(path, value)
        if resolved is None:
            continue
        if not resolved.exists():
            errors.append(f"{path}: missing local {attr} target {value} -> {resolved.relative_to(ROOT)}")
        if path == Path("404.html") and not urlparse(value).path.startswith("/"):
            errors.append(f"{path}: custom 404 local {attr} must be root-relative: {value}")

    fragment_target_cache: dict[Path, set[str]] = {full_path: current_ids}
    for value in parser.fragment_refs:
        parsed = urlparse(value)
        target_id = unquote(parsed.fragment)
        if not target_id:
            continue
        resolved = full_path if parsed.path == "" else resolve_local_reference(path, value)
        if resolved is None or not resolved.exists() or resolved.suffix.lower() not in {".html", ".htm"}:
            continue
        if resolved not in fragment_target_cache:
            fragment_target_cache[resolved] = html_ids(resolved)
        if target_id not in fragment_target_cache[resolved]:
            errors.append(f"{path}: missing fragment target {value} -> #{target_id}")

    zh_pattern = re.compile(
        r'<[^>]*class="[^"]*(?:hero-title-zh|hero-lead-zh|section-copy-zh|card-copy-zh|project-copy-zh|stream-copy-zh|about-summary-zh|article-lead-zh)[^"]*"(?:(?!lang=)[^>])*?>',
        re.IGNORECASE,
    )
    if zh_pattern.search(text):
        errors.append(f"{path}: substantial Chinese text block missing lang=\"zh-CN\"")

    return errors


def check_css(path: Path) -> list[str]:
    full_path = ROOT / path
    if not full_path.exists():
        return [f"{path}: file missing"]

    errors: list[str] = []
    text = full_path.read_text(encoding="utf-8")
    for line_number, line in enumerate(text.splitlines(), start=1):
        if CSS_EXTERNAL_REFERENCE_PATTERN.search(line):
            errors.append(f"{path}:{line_number}: external CSS reference is not approved")
    return errors


def main() -> int:
    errors: list[str] = []

    for path in HTML_FILES:
        errors.extend(check_html(path))
    for path in CSS_FILES:
        errors.extend(check_css(path))

    for required in [Path(".nojekyll"), Path("robots.txt"), Path("sitemap.xml"), Path("assets/og-card.png")]:
        if not (ROOT / required).exists():
            errors.append(f"{required}: required file missing")
    share_image = ROOT / "assets/og-card.png"
    if share_image.exists() and png_dimensions(share_image) != EXPECTED_SHARE_IMAGE_SIZE:
        errors.append(
            "assets/og-card.png: must be "
            f"{EXPECTED_SHARE_IMAGE_SIZE[0]}x{EXPECTED_SHARE_IMAGE_SIZE[1]} PNG"
        )

    for path in RETIRED_HTML:
        if (ROOT / path).exists():
            errors.append(f"{path}: retired internal review page must not be in the deployable tree")

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8") if (ROOT / "robots.txt").exists() else ""
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8") if (ROOT / "sitemap.xml").exists() else ""
    if "Disallow: /review/" not in robots:
        errors.append("robots.txt: must disallow /review/")
    if "Sitemap: https://yscjrh.github.io/sitemap.xml" not in robots:
        errors.append("robots.txt: must declare the public sitemap URL")
    if sitemap:
        try:
            sitemap_urls = sitemap_locations(sitemap)
        except ValueError as error:
            errors.append(str(error))
        else:
            expected_urls = expected_sitemap_urls()
            duplicate_urls = sorted({
                public_url for public_url in sitemap_urls if sitemap_urls.count(public_url) > 1
            })
            for public_url in duplicate_urls:
                errors.append(f"sitemap.xml: duplicate public URL {public_url}")
            for public_url in expected_urls:
                if public_url not in sitemap_urls:
                    errors.append(f"sitemap.xml: missing {public_url}")
            for public_url in sitemap_urls:
                if public_url not in expected_urls:
                    errors.append(f"sitemap.xml: unexpected public URL {public_url}")

    if errors:
        print("Site check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Site check passed.")
    print(
        f"Checked {len(HTML_FILES)} HTML pages, {len(CSS_FILES)} CSS files, "
        "robots.txt, sitemap.xml, and local references."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
