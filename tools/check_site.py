from __future__ import annotations

from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import xml.etree.ElementTree as ET
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_SITE_NAME = "HJR / YSCJRH"
EXPECTED_OG_LOCALE = "en_US"
EXPECTED_HTML_LANG = "en"
EXPECTED_THEME_COLOR = "#05070d"
EXPECTED_VIEWPORT = "width=device-width, initial-scale=1"
EXPECTED_SHARE_IMAGE_URL = "https://yscjrh.github.io/assets/og-card.png"
EXPECTED_SHARE_IMAGE_ALT = (
    "HJR / YSCJRH share card: fluorescence, methods, instruments, and open tools / "
    "荧光、方法、仪器与开放工具."
)
EXPECTED_SHARE_IMAGE_SIZE = (1200, 630)
EXPECTED_FAVICON_PATH = Path("assets/favicon.svg")
EXPECTED_STYLESHEET_PATH = Path("styles.css")
EXPECTED_SHARED_SCRIPT_PATH = Path("script.js")

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

PUBLISHED_NOTES = {
    Path("content/notes/build-logs-homepage-second-pass.md"): Path(
        "notes/build-logs-homepage-second-pass.html"
    ),
    Path("content/notes/research-reflections-signals-and-judgment.md"): Path(
        "notes/when-a-fluorescence-signal-becomes-usable.html"
    ),
}
HOME_RESEARCH_ROLES = ["published-reflection", "direction-statement", "concept-route"]
HOME_RESEARCH_EVIDENCE_HREFS = [
    "notes/when-a-fluorescence-signal-becomes-usable.html",
    "instrument/",
]
HOME_BILINGUAL_CLASS_COUNTS = {
    "workflow-copy-zh": 4,
    "project-why-copy-zh": 3,
    "about-route-copy-zh": 2,
}
HOME_BILINGUAL_CONTAINERS = {
    "workflow-copy-zh": "workflow-map",
    "project-why-copy-zh": "project-why",
    "about-route-copy-zh": "about-routes",
}
HOME_DIRECTION_STATIC_TAGS = {"div", "h3", "p", "span"}
HOME_HERO_STYLESHEET_HREF = "styles.css?v=homepage-generated-hero-20260713"
HOME_HERO_ALT = (
    "Conceptual illustration of a fluorescent sample cell and perpendicular light paths / "
    "荧光样品池与垂直光路的概念插图"
)
HOME_HERO_SOURCE_CONTRACT = [
    (
        "(max-width: 780px)",
        "assets/img/hero-fluorescence-mobile-v1.webp",
        "image/webp",
    ),
    (
        "(max-width: 1100px)",
        "assets/img/hero-fluorescence-tablet-v1.webp",
        "image/webp",
    ),
]
HOME_HERO_IMAGE_CONTRACT = {
    "src": "assets/img/hero-fluorescence-desktop-v1.webp",
    "alt": HOME_HERO_ALT,
    "width": "1200",
    "height": "960",
    "decoding": "async",
}
HOME_HERO_CAPTION_TEXT = {
    "hero-visual-note-en": "Concept illustration, not an experimental record.",
    "hero-visual-note-zh": "概念插图，非实验记录。",
}
HOME_HERO_ASSET_PATHS = [
    Path("assets/img/hero-fluorescence-desktop-v1.webp"),
    Path("assets/img/hero-fluorescence-tablet-v1.webp"),
    Path("assets/img/hero-fluorescence-mobile-v1.webp"),
]
VOID_HTML_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}
NOTE_FIELD_PATTERN = re.compile(r"^(Status|Published):\s*(.+?)\s*$", re.MULTILINE)
NOTE_PUBLISHED_DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
LATIN_LETTER_PATTERN = re.compile(r"[A-Za-z]")
HAN_CHARACTER_PATTERN = re.compile(r"[\u3400-\u9fff]")
ZH_LANG_BLOCK_PATTERN = re.compile(
    r'<(?P<tag>[a-z][\w:-]*)\b(?=[^>]*\blang="zh-CN")[^>]*>(?P<body>.*?)</(?P=tag)>',
    re.IGNORECASE | re.DOTALL,
)

REQUIRED_META_MARKERS = [
    ("title", "<title"),
    ("description", 'name="description"'),
    ("canonical", 'rel="canonical"'),
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
        self.document_titles: list[str] = []
        self.in_document_title = False
        self.document_title_chunks: list[str] = []
        self.h1_count = 0
        self.html_lang = ""
        self.body_class_tokens: set[str] = set()
        self.has_main_id = False
        self.has_skip_to_main = False
        self.first_anchor_attrs: dict[str, str] | None = None
        self.ids: list[str] = []
        self.fragment_refs: list[str] = []
        self.aria_id_refs: list[tuple[str, str]] = []
        self.local_refs: list[tuple[str, str]] = []
        self.external_scripts: list[str] = []
        self.inline_event_handlers: list[tuple[str, str]] = []
        self.script_scheme_refs: list[tuple[str, str, str]] = []
        self.external_resource_links: list[tuple[str, str]] = []
        self.external_media_refs: list[tuple[str, str, str]] = []
        self.image_alt_refs: list[tuple[str, bool, str, str, str]] = []
        self.svg_accessibility_refs: list[dict[str, str | bool]] = []
        self.svg_stack: list[int] = []
        self.private_contact_refs: list[str] = []
        self.blank_target_links: list[tuple[str, str]] = []
        self.forms = 0
        self.home_elements: list[dict[str, object]] = []
        self.home_open_elements: list[dict[str, object]] = []
        self.home_event_position = 0
        self.home_research_cards: list[dict[str, object]] = []
        self.home_current_research_card: dict[str, object] | None = None
        self.home_bilingual_nodes: list[dict[str, object]] = []
        self.home_active_bilingual_nodes: list[dict[str, object]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_names = {key.lower() for key, _ in attrs}
        attrs_dict = {key.lower(): value or "" for key, value in attrs}
        tag = tag.lower()
        self.tags.append((tag, attrs_dict))
        self._capture_homepage_starttag(tag, attrs_dict)
        element_id = attrs_dict.get("id")
        if element_id:
            self.ids.append(element_id)
        for attr, value in attrs_dict.items():
            if attr.startswith("on"):
                self.inline_event_handlers.append((tag, attr))
            if value.strip().lower().startswith("javascript:"):
                self.script_scheme_refs.append((tag, attr, value))
            if attr in ARIA_IDREF_ATTRIBUTES and value.strip():
                for target_id in value.split():
                    self.aria_id_refs.append((attr, target_id))

        if tag == "html":
            self.html_lang = attrs_dict.get("lang", "")
        elif tag == "body":
            self.body_class_tokens.update(attrs_dict.get("class", "").split())
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "svg":
            self.svg_accessibility_refs.append(
                {
                    "id": attrs_dict.get("id", ""),
                    "aria-hidden": attrs_dict.get("aria-hidden", ""),
                    "role": attrs_dict.get("role", ""),
                    "aria-label": attrs_dict.get("aria-label", ""),
                    "aria-labelledby": attrs_dict.get("aria-labelledby", ""),
                    "has-title": False,
                }
            )
            self.svg_stack.append(len(self.svg_accessibility_refs) - 1)
        elif tag == "title":
            if self.svg_stack:
                self.svg_accessibility_refs[self.svg_stack[-1]]["has-title"] = True
            else:
                self.in_document_title = True
                self.document_title_chunks = []
        elif tag == "main" and attrs_dict.get("id") == "main":
            self.has_main_id = True
        elif tag == "a":
            if self.first_anchor_attrs is None:
                self.first_anchor_attrs = attrs_dict
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

    def handle_endtag(self, tag: str) -> None:
        self._capture_homepage_endtag(tag.lower())
        if tag.lower() == "title" and self.in_document_title:
            self.document_titles.append("".join(self.document_title_chunks).strip())
            self.in_document_title = False
            self.document_title_chunks = []
        if tag.lower() == "svg" and self.svg_stack:
            self.svg_stack.pop()

    def handle_data(self, data: str) -> None:
        if self.in_document_title:
            self.document_title_chunks.append(data)
        for element in self.home_open_elements:
            text_chunks = element["text"]
            assert isinstance(text_chunks, list)
            text_chunks.append(data)
        for node in self.home_active_bilingual_nodes:
            text_chunks = node["text"]
            assert isinstance(text_chunks, list)
            text_chunks.append(data)

    def _capture_homepage_starttag(self, tag: str, attrs: dict[str, str]) -> None:
        ancestor_classes: set[str] = set()
        for element in self.home_open_elements:
            classes = element["classes"]
            assert isinstance(classes, set)
            ancestor_classes.update(classes)

        element: dict[str, object] = {
            "tag": tag,
            "attrs": attrs,
            "classes": set(attrs.get("class", "").split()),
            "children": [],
            "start_position": self.home_event_position,
            "end_position": self.home_event_position if tag in VOID_HTML_TAGS else None,
            "text": [],
            "bilingual_nodes": [],
            "research_card": None,
        }
        self.home_event_position += 1
        if self.home_open_elements:
            parent_children = self.home_open_elements[-1]["children"]
            assert isinstance(parent_children, list)
            parent_children.append(element)
        self.home_elements.append(element)

        if self.home_current_research_card is not None:
            descendants = self.home_current_research_card["descendants"]
            assert isinstance(descendants, list)
            descendants.append((tag, attrs))

        role = attrs.get("data-research-role", "") if tag == "article" else ""
        if role:
            card: dict[str, object] = {
                "role": role,
                "attrs": attrs,
                "descendants": [],
            }
            self.home_research_cards.append(card)
            self.home_current_research_card = card
            element["research_card"] = card

        element_classes = element["classes"]
        assert isinstance(element_classes, set)
        for class_name in HOME_BILINGUAL_CLASS_COUNTS:
            if class_name not in element_classes:
                continue
            node: dict[str, object] = {
                "class_name": class_name,
                "attrs": attrs,
                "ancestor_classes": ancestor_classes,
                "text": [],
            }
            self.home_bilingual_nodes.append(node)
            self.home_active_bilingual_nodes.append(node)
            bilingual_nodes = element["bilingual_nodes"]
            assert isinstance(bilingual_nodes, list)
            bilingual_nodes.append(node)

        if tag in VOID_HTML_TAGS:
            for node in element["bilingual_nodes"]:
                self.home_active_bilingual_nodes.remove(node)
            return
        self.home_open_elements.append(element)

    def _capture_homepage_endtag(self, tag: str) -> None:
        end_position = self.home_event_position
        self.home_event_position += 1
        matching_index = next(
            (
                index
                for index in range(len(self.home_open_elements) - 1, -1, -1)
                if self.home_open_elements[index]["tag"] == tag
            ),
            None,
        )
        if matching_index is None:
            return

        closing_elements = self.home_open_elements[matching_index:]
        self.home_open_elements = self.home_open_elements[:matching_index]
        for element in reversed(closing_elements):
            element["end_position"] = end_position
            bilingual_nodes = element["bilingual_nodes"]
            assert isinstance(bilingual_nodes, list)
            for node in bilingual_nodes:
                if node in self.home_active_bilingual_nodes:
                    self.home_active_bilingual_nodes.remove(node)
            if element["research_card"] is self.home_current_research_card:
                self.home_current_research_card = None


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


def local_reference_matches(source: Path, value: str, expected_path: Path) -> bool:
    resolved = resolve_local_reference(source, value)
    if resolved is None:
        return False
    return resolved.resolve() == (ROOT / expected_path).resolve()


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


def require_single_nonempty(
    errors: list[str],
    path: Path,
    label: str,
    values: list[str],
) -> None:
    if len(values) != 1 or not values[0].strip():
        errors.append(f"{path}: {label} must be present exactly once and non-empty")


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


def tag_classes(attrs: dict[str, str]) -> set[str]:
    return set(attrs.get("class", "").split())


def is_home_interactive_descendant(tag: str, attrs: dict[str, str]) -> bool:
    if tag not in HOME_DIRECTION_STATIC_TAGS:
        return True
    if "role" in attrs:
        return True
    if "tabindex" in attrs:
        return True
    if "contenteditable" in attrs:
        return True
    return attrs.get("draggable", "").strip().lower() == "true"


def element_texts_by_class(text: str, class_name: str) -> list[str]:
    pattern = re.compile(
        rf'<(?P<tag>[a-z][\w:-]*)\b(?=[^>]*\bclass="[^"]*\b{re.escape(class_name)}\b[^"]*")[^>]*>'
        rf'(?P<body>.*?)</(?P=tag)>',
        re.IGNORECASE | re.DOTALL,
    )
    return [
        re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", match.group("body"))).strip()
        for match in pattern.finditer(text)
    ]


def check_homepage_hero_figure(parser: SiteParser, text: str) -> list[str]:
    errors: list[str] = []

    homepage_stylesheets = [
        attrs.get("href", "")
        for tag, attrs in parser.tags
        if tag == "link" and "stylesheet" in attrs.get("rel", "").lower().split()
    ]
    if homepage_stylesheets != [HOME_HERO_STYLESHEET_HREF]:
        errors.append("index.html: homepage stylesheet must use the generated Hero cache key")

    def node_matches(node: dict[str, object], tag: str, class_name: str) -> bool:
        classes = node["classes"]
        assert isinstance(classes, set)
        return node["tag"] == tag and class_name in classes

    def node_attrs(node: dict[str, object]) -> dict[str, str]:
        attrs = node["attrs"]
        assert isinstance(attrs, dict)
        return attrs

    def node_children(node: dict[str, object]) -> list[dict[str, object]]:
        children = node["children"]
        assert isinstance(children, list)
        return children

    def node_text(node: dict[str, object]) -> str:
        text_chunks = node["text"]
        assert isinstance(text_chunks, list)
        return re.sub(r"\s+", " ", "".join(text_chunks)).strip()

    hero_nodes = [
        node
        for node in parser.home_elements
        if "hero-visual" in node["classes"]
    ]
    figure_node = (
        hero_nodes[0]
        if len(hero_nodes) == 1 and hero_nodes[0]["tag"] == "figure"
        else None
    )
    if figure_node is None:
        errors.append("index.html: expected one semantic hero figure")

    picture_nodes = [
        node
        for node in parser.home_elements
        if node_matches(node, "picture", "hero-visual-picture")
    ]
    caption_nodes = [
        node
        for node in parser.home_elements
        if node_matches(node, "figcaption", "hero-visual-note")
    ]
    if len(picture_nodes) != 1 or len(caption_nodes) != 1:
        errors.append("index.html: hero picture and caption must each appear exactly once")

    if figure_node is not None:
        hero_copy_nodes = [
            node
            for node in parser.home_elements
            if "hero-copy" in node["classes"]
        ]
        figure_start = figure_node["start_position"]
        copy_end = hero_copy_nodes[0]["end_position"] if len(hero_copy_nodes) == 1 else None
        if (
            not isinstance(figure_start, int)
            or not isinstance(copy_end, int)
            or figure_start <= copy_end
        ):
            errors.append("index.html: hero figure must follow the complete hero copy")

        figure_children = node_children(figure_node)
        if (
            len(figure_children) != 2
            or not node_matches(figure_children[0], "picture", "hero-visual-picture")
            or not node_matches(figure_children[1], "figcaption", "hero-visual-note")
        ):
            errors.append(
                "index.html: hero picture and caption must be direct children of the hero figure in that order"
            )

        figure_attrs = node_attrs(figure_node)
        role_tokens = figure_attrs.get("role", "").lower().split()
        if (
            "data-reveal" in figure_attrs
            or "img" in role_tokens
            or "aria-label" in figure_attrs
        ):
            errors.append(
                "index.html: hero figure must not define data-reveal, role=img, or aria-label"
            )

    if len(picture_nodes) == 1:
        picture_children = node_children(picture_nodes[0])
        if (
            len(picture_children) != 3
            or not node_matches(picture_children[0], "source", "hero-visual-source")
            or not node_matches(picture_children[1], "source", "hero-visual-source")
            or not node_matches(picture_children[2], "img", "hero-illustration")
        ):
            errors.append(
                "index.html: hero picture children must be source, source, image in contract order"
            )

    if len(caption_nodes) == 1:
        caption_children = node_children(caption_nodes[0])
        if (
            len(caption_children) != 2
            or not node_matches(caption_children[0], "span", "hero-visual-note-en")
            or not node_matches(caption_children[1], "span", "hero-visual-note-zh")
            or node_attrs(caption_children[1]).get("lang", "") != "zh-CN"
        ):
            errors.append(
                "index.html: hero caption children must be English then lang=zh-CN Chinese spans"
            )
        expected_caption_text = (
            f'{HOME_HERO_CAPTION_TEXT["hero-visual-note-en"]} '
            f'{HOME_HERO_CAPTION_TEXT["hero-visual-note-zh"]}'
        )
        if node_text(caption_nodes[0]) != expected_caption_text:
            errors.append(
                "index.html: hero caption visible text must contain only the paired concept boundary"
            )

    source_contract = [
        (attrs.get("media", ""), attrs.get("srcset", ""), attrs.get("type", ""))
        for tag, attrs in parser.tags
        if tag == "source" and "hero-visual-source" in tag_classes(attrs)
    ]
    if source_contract != HOME_HERO_SOURCE_CONTRACT:
        errors.append(
            "index.html: hero responsive sources must match mobile then tablet WebP contract"
        )

    images = [
        attrs
        for tag, attrs in parser.tags
        if tag == "img" and "hero-illustration" in tag_classes(attrs)
    ]
    if len(images) != 1 or any(
        images[0].get(name, "") != expected
        for name, expected in HOME_HERO_IMAGE_CONTRACT.items()
    ):
        errors.append(
            "index.html: hero image must match the desktop asset, dimensions, decode mode, and bilingual alt"
        )
    if any("fetchpriority" in attrs for attrs in images):
        errors.append("index.html: hero image must not define fetchpriority")

    caption_en = [
        attrs
        for tag, attrs in parser.tags
        if tag == "span" and "hero-visual-note-en" in tag_classes(attrs)
    ]
    caption_zh = [
        attrs
        for tag, attrs in parser.tags
        if tag == "span" and "hero-visual-note-zh" in tag_classes(attrs)
    ]
    caption_text_matches = all(
        element_texts_by_class(text, class_name) == [expected_text]
        for class_name, expected_text in HOME_HERO_CAPTION_TEXT.items()
    )
    if (
        len(caption_en) != 1
        or len(caption_zh) != 1
        or caption_zh[0].get("lang", "") != "zh-CN"
        or not caption_text_matches
    ):
        errors.append(
            "index.html: hero concept caption must keep paired English and lang=zh-CN Chinese text"
        )

    class_tokens = [
        class_name
        for _, attrs in parser.tags
        for class_name in tag_classes(attrs)
    ]
    if any(
        class_name in {"hero-mobile-visual", "hero-lab-visual"}
        or class_name.startswith("lab-")
        or class_name.startswith("scope-")
        for class_name in class_tokens
    ):
        errors.append("index.html: legacy hero lab/mobile markup must be removed")

    for asset_path in HOME_HERO_ASSET_PATHS:
        if not (ROOT / asset_path).is_file():
            errors.append(f"index.html: missing responsive hero asset {asset_path.as_posix()}")

    return errors


def check_homepage_evidence_hierarchy(parser: SiteParser) -> list[str]:
    errors: list[str] = []
    research_link_tags = [
        (tag, attrs)
        for tag, attrs in parser.tags
        if "research-card-link" in tag_classes(attrs)
    ]
    if any(tag != "a" for tag, _ in research_link_tags):
        errors.append("index.html: every research-card-link must be an anchor")

    research_hrefs = [attrs.get("href", "") for tag, attrs in research_link_tags if tag == "a"]
    if research_hrefs != HOME_RESEARCH_EVIDENCE_HREFS:
        errors.append(
            "index.html: research evidence links must be the published reflection followed by Instrument Lab"
        )

    research_role_tags = [
        attrs
        for tag, attrs in parser.tags
        if tag == "article" and attrs.get("data-research-role")
    ]
    research_roles = [attrs.get("data-research-role", "") for attrs in research_role_tags]
    if research_roles != HOME_RESEARCH_ROLES:
        errors.append(
            "index.html: research card roles must be published-reflection, direction-statement, concept-route"
        )

    cards_by_role = {
        str(card["role"]): card
        for card in parser.home_research_cards
    }
    expected_role_links = {
        "published-reflection": HOME_RESEARCH_EVIDENCE_HREFS[0],
        "concept-route": HOME_RESEARCH_EVIDENCE_HREFS[1],
    }
    for role, expected_href in expected_role_links.items():
        card = cards_by_role.get(role)
        descendants = card.get("descendants", []) if card else []
        anchors = [
            attrs
            for tag, attrs in descendants
            if tag == "a"
        ]
        if len(anchors) != 1 or anchors[0].get("href") != expected_href or (
            "research-card-link" not in tag_classes(anchors[0])
        ):
            errors.append(
                f"index.html: {role} research card must contain exactly its declared evidence link"
            )

    direction_attrs = next(
        (
            attrs
            for attrs in research_role_tags
            if attrs.get("data-research-role") == "direction-statement"
        ),
        None,
    )
    if direction_attrs is not None and (
        "surface-interactive" in tag_classes(direction_attrs) or "data-spotlight" in direction_attrs
    ):
        errors.append("index.html: direction-statement research card must be noninteractive")

    direction_card = cards_by_role.get("direction-statement")
    direction_descendants = direction_card.get("descendants", []) if direction_card else []
    if any(
        is_home_interactive_descendant(tag, attrs)
        for tag, attrs in direction_descendants
    ):
        errors.append(
            "index.html: direction-statement research card must not contain interactive descendants"
        )

    build_grid_position = next(
        (
            index
            for index, (_, attrs) in enumerate(parser.tags)
            if "build-grid" in tag_classes(attrs)
        ),
        None,
    )
    workflow_position = next(
        (
            index
            for index, (_, attrs) in enumerate(parser.tags)
            if "workflow-map" in tag_classes(attrs)
        ),
        None,
    )
    if (
        build_grid_position is None
        or workflow_position is None
        or build_grid_position >= workflow_position
    ):
        errors.append("index.html: build-grid must precede workflow-map")

    for class_name, expected_count in HOME_BILINGUAL_CLASS_COUNTS.items():
        matching_attrs = [
            attrs
            for _, attrs in parser.tags
            if class_name in tag_classes(attrs)
        ]
        if len(matching_attrs) != expected_count or any(
            attrs.get("lang") != "zh-CN" for attrs in matching_attrs
        ):
            errors.append(
                f"index.html: expected {expected_count} lang=zh-CN elements with class {class_name}"
            )
        scoped_nodes = [
            node
            for node in parser.home_bilingual_nodes
            if node["class_name"] == class_name
        ]
        expected_container = HOME_BILINGUAL_CONTAINERS[class_name]
        if len(scoped_nodes) == expected_count and any(
            expected_container not in node["ancestor_classes"]
            or not HAN_CHARACTER_PATTERN.search("".join(node["text"]))
            for node in scoped_nodes
        ):
            errors.append(
                f"index.html: {class_name} must contain Chinese text inside the expected container {expected_container}"
            )

    return errors


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
    require_single_nonempty(errors, path, "title", parser.document_titles)
    for name in ("description", "twitter:title", "twitter:description"):
        require_single_nonempty(errors, path, name, meta_name_values(parser, name))
    for property_name in ("og:title", "og:description"):
        require_single_nonempty(errors, path, property_name, meta_property_values(parser, property_name))

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
    if meta_name_values(parser, "viewport") != [EXPECTED_VIEWPORT]:
        errors.append(f"{path}: viewport must be {EXPECTED_VIEWPORT}")
    if meta_name_values(parser, "theme-color") != [EXPECTED_THEME_COLOR]:
        errors.append(f"{path}: theme-color must be {EXPECTED_THEME_COLOR}")
    favicon_links = [
        attrs
        for tag, attrs in parser.tags
        if tag == "link" and "icon" in attrs.get("rel", "").lower().split()
    ]
    if len(favicon_links) != 1:
        errors.append(f"{path}: expected exactly one favicon link")
    else:
        favicon_href = favicon_links[0].get("href", "")
        favicon_type = favicon_links[0].get("type", "")
        resolved_favicon = resolve_local_reference(path, favicon_href)
        expected_favicon = (ROOT / EXPECTED_FAVICON_PATH).resolve()
        if resolved_favicon is None or resolved_favicon.resolve() != expected_favicon:
            errors.append(f"{path}: favicon href must resolve to {EXPECTED_FAVICON_PATH.as_posix()}")
        if favicon_type != "image/svg+xml":
            errors.append(f"{path}: favicon type must be image/svg+xml")

    stylesheet_links = [
        attrs
        for tag, attrs in parser.tags
        if tag == "link" and "stylesheet" in attrs.get("rel", "").lower().split()
    ]
    shared_stylesheet_links = [
        attrs
        for attrs in stylesheet_links
        if local_reference_matches(path, attrs.get("href", ""), EXPECTED_STYLESHEET_PATH)
    ]
    if len(shared_stylesheet_links) != 1:
        errors.append(f"{path}: expected exactly one shared stylesheet link to styles.css")
    for attrs in stylesheet_links:
        if not local_reference_matches(path, attrs.get("href", ""), EXPECTED_STYLESHEET_PATH):
            errors.append(f"{path}: stylesheet href must resolve to styles.css: {attrs.get('href', '')}")

    shared_script_tags = [
        attrs
        for tag, attrs in parser.tags
        if tag == "script"
        and local_reference_matches(path, attrs.get("src", ""), EXPECTED_SHARED_SCRIPT_PATH)
    ]
    if len(shared_script_tags) != 1:
        errors.append(f"{path}: expected exactly one shared script tag for script.js")
    for attrs in shared_script_tags:
        if "defer" not in attrs:
            errors.append(f"{path}: shared script.js must use defer")

    if parser.html_lang != EXPECTED_HTML_LANG:
        errors.append(f"{path}: html lang must be {EXPECTED_HTML_LANG}")
    if "no-js" not in parser.body_class_tokens:
        errors.append(f"{path}: body must include no-js class for progressive enhancement fallback")
    if parser.h1_count != 1:
        errors.append(f"{path}: expected one h1, found {parser.h1_count}")
    if not parser.has_main_id:
        errors.append(f"{path}: missing <main id=\"main\">")
    if not parser.has_skip_to_main:
        errors.append(f"{path}: missing skip link to #main")
    first_anchor_classes = set((parser.first_anchor_attrs or {}).get("class", "").split())
    if (parser.first_anchor_attrs or {}).get("href") != "#main" or "skip-link" not in first_anchor_classes:
        errors.append(f"{path}: first link must be the skip link to #main")
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
    for tag, attr in parser.inline_event_handlers:
        errors.append(f"{path}: inline event handler is not approved: <{tag} {attr}>")
    for tag, attr, value in parser.script_scheme_refs:
        errors.append(f"{path}: javascript: URL is not approved: <{tag} {attr}={value}>")
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
    for svg in parser.svg_accessibility_refs:
        is_decorative = (
            str(svg["aria-hidden"]).lower() == "true"
            or str(svg["role"]).lower() in {"presentation", "none"}
        )
        has_accessible_name = any(
            [
                str(svg["aria-label"]).strip(),
                str(svg["aria-labelledby"]).strip(),
                bool(svg["has-title"]),
            ]
        )
        if not is_decorative and not has_accessible_name:
            label = str(svg["id"]).strip() or "inline svg"
            errors.append(
                f"{path}: svg must be aria-hidden/role=presentation or have an accessible name: {label}"
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

    if path == Path("index.html"):
        errors.extend(check_homepage_evidence_hierarchy(parser))
        errors.extend(check_homepage_hero_figure(parser, text))

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


def markdown_section(text: str, heading: str) -> str:
    match = re.search(
        rf"^### {re.escape(heading)}\s*$\n(.*?)(?=^### |\Z)",
        text,
        re.MULTILINE | re.DOTALL,
    )
    return match.group(1).strip() if match else ""


def check_published_note(source_path: Path, html_path: Path) -> list[str]:
    errors: list[str] = []
    source_full_path = ROOT / source_path
    html_full_path = ROOT / html_path
    if not source_full_path.exists():
        return [f"{source_path}: published note source missing"]
    if not html_full_path.exists():
        return [f"{html_path}: published note page missing"]

    source_text = source_full_path.read_text(encoding="utf-8")
    html_text = html_full_path.read_text(encoding="utf-8")
    fields = dict(NOTE_FIELD_PATTERN.findall(source_text))

    if fields.get("Status", "").strip().lower() != "published":
        errors.append(f"{source_path}: published note source must use Status: published")

    published = fields.get("Published", "").strip()
    try:
        if not NOTE_PUBLISHED_DATE_PATTERN.fullmatch(published):
            raise ValueError
        date.fromisoformat(published)
    except ValueError:
        errors.append(f"{source_path}: published note source must use Published: YYYY-MM-DD")
    else:
        semantic_time = re.search(
            rf'<time\b(?=[^>]*\bdatetime="{re.escape(published)}")[^>]*>\s*{re.escape(published)}\s*</time>',
            html_text,
            re.IGNORECASE,
        )
        if not semantic_time:
            errors.append(
                f"{html_path}: published note must expose <time datetime=\"{published}\">{published}</time>"
            )

    english_section = markdown_section(source_text, "EN")
    if len(LATIN_LETTER_PATTERN.findall(english_section)) < 80:
        errors.append(f"{source_path}: published note source needs substantial English in ### EN")

    chinese_section = markdown_section(source_text, "中文")
    if len(HAN_CHARACTER_PATTERN.findall(chinese_section)) < 80:
        errors.append(f"{source_path}: published note source needs substantial Chinese in ### 中文")

    article_body_match = re.search(
        r'<div class="article-body">(.*?)</div>\s*<nav class="article-next"',
        html_text,
        re.DOTALL,
    )
    article_body = article_body_match.group(1) if article_body_match else ""
    if not article_body:
        errors.append(f"{html_path}: published note must contain an article-body before article-next")
    else:
        zh_lang_blocks = [match.group("body") for match in ZH_LANG_BLOCK_PATTERN.finditer(article_body)]
        if not zh_lang_blocks:
            errors.append(f'{html_path}: published note article body needs lang="zh-CN" Chinese blocks')
        elif len(HAN_CHARACTER_PATTERN.findall("".join(zh_lang_blocks))) < 80:
            errors.append(
                f'{html_path}: published note article body needs substantial Chinese inside lang="zh-CN" blocks'
            )

    return errors


def main() -> int:
    errors: list[str] = []

    for path in HTML_FILES:
        errors.extend(check_html(path))
    for path in CSS_FILES:
        errors.extend(check_css(path))
    for source_path, html_path in PUBLISHED_NOTES.items():
        errors.extend(check_published_note(source_path, html_path))

    for required in [
        Path(".nojekyll"),
        Path("robots.txt"),
        Path("sitemap.xml"),
        Path("assets/og-card.png"),
        EXPECTED_FAVICON_PATH,
    ]:
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
        f"robots.txt, sitemap.xml, local references, and {len(PUBLISHED_NOTES)} published-note source contracts."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
