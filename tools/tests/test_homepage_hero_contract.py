from __future__ import annotations

from pathlib import Path
import unittest

from tools.check_site import SiteParser, check_homepage_hero_figure


ROOT = Path(__file__).resolve().parents[2]
EXPECTED_ALT = (
    "Conceptual illustration of a fluorescent sample cell and perpendicular light paths / "
    "荧光样品池与垂直光路的概念插图"
)
HERO_FIGURE_OPEN = '                <figure class="hero-visual">\n'
HERO_FIGURE_CLOSE = "                </figure>\n"
HERO_COPY_OPEN = '                <article class="hero-copy" data-reveal>\n'
MOBILE_SOURCE_BLOCK = """                    <source
                      class="hero-visual-source"
                      media="(max-width: 780px)"
                      srcset="assets/img/hero-fluorescence-mobile-v1.webp"
                      type="image/webp"
                    >
"""
HERO_IMAGE_BLOCK = f"""                    <img
                      class="hero-illustration"
                      src="assets/img/hero-fluorescence-desktop-v1.webp"
                      alt="{EXPECTED_ALT}"
                      width="1200"
                      height="960"
                      decoding="async"
                    >
"""
CAPTION_EN_LINE = (
    "                    <span class=\"hero-visual-note-en\">"
    "Concept illustration, not an experimental record.</span>\n"
)
CAPTION_ZH_LINE = (
    "                    <span class=\"hero-visual-note-zh\" lang=\"zh-CN\">"
    "概念插图，非实验记录。</span>\n"
)


def hero_errors(html: str) -> list[str]:
    parser = SiteParser()
    parser.feed(html)
    return check_homepage_hero_figure(parser, html)


def hero_figure_block(html: str) -> str:
    start = html.index(HERO_FIGURE_OPEN)
    end = html.index(HERO_FIGURE_CLOSE, start) + len(HERO_FIGURE_CLOSE)
    return html[start:end]


class HomepageHeroContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.homepage = (ROOT / "index.html").read_text(encoding="utf-8")

    def test_current_homepage_satisfies_contract(self) -> None:
        self.assertEqual(hero_errors(self.homepage), [])

    def test_rejects_non_figure_hero_container(self) -> None:
        mutated = self.homepage.replace(
            '<figure class="hero-visual">',
            '<aside class="hero-visual">',
            1,
        ).replace("</figure>", "</aside>", 1)
        self.assertIn(
            "index.html: expected one semantic hero figure",
            hero_errors(mutated),
        )

    def test_rejects_wrong_mobile_source(self) -> None:
        mutated = self.homepage.replace(
            'srcset="assets/img/hero-fluorescence-mobile-v1.webp"',
            'srcset="assets/img/hero-lab.svg"',
            1,
        )
        self.assertIn(
            "index.html: hero responsive sources must match mobile then tablet WebP contract",
            hero_errors(mutated),
        )

    def test_rejects_picture_and_caption_outside_hero_figure(self) -> None:
        original = hero_figure_block(self.homepage)
        contents = original[len(HERO_FIGURE_OPEN) : -len(HERO_FIGURE_CLOSE)]
        mutated = self.homepage.replace(
            original,
            HERO_FIGURE_OPEN + HERO_FIGURE_CLOSE + contents,
            1,
        )
        self.assertIn(
            "index.html: hero picture and caption must be direct children of the hero figure in that order",
            hero_errors(mutated),
        )

    def test_rejects_hero_figure_before_hero_copy(self) -> None:
        figure = hero_figure_block(self.homepage)
        mutated = self.homepage.replace(figure, "", 1).replace(
            HERO_COPY_OPEN,
            figure + HERO_COPY_OPEN,
            1,
        )
        self.assertIn(
            "index.html: hero figure must follow the complete hero copy",
            hero_errors(mutated),
        )

    def test_rejects_media_nested_below_picture_child(self) -> None:
        wrapped_image = (
            "                    <span>\n"
            + HERO_IMAGE_BLOCK
            + "                    </span>\n"
        )
        mutated = self.homepage.replace(HERO_IMAGE_BLOCK, wrapped_image, 1)
        self.assertIn(
            "index.html: hero picture children must be source, source, image in contract order",
            hero_errors(mutated),
        )

    def test_rejects_media_order_inside_picture(self) -> None:
        mutated = self.homepage.replace(HERO_IMAGE_BLOCK, "", 1).replace(
            MOBILE_SOURCE_BLOCK,
            HERO_IMAGE_BLOCK + MOBILE_SOURCE_BLOCK,
            1,
        )
        self.assertIn(
            "index.html: hero picture children must be source, source, image in contract order",
            hero_errors(mutated),
        )

    def test_rejects_caption_nested_below_figcaption_child(self) -> None:
        wrapped_caption = (
            "                    <em>\n"
            + CAPTION_EN_LINE
            + "                    </em>\n"
        )
        mutated = self.homepage.replace(CAPTION_EN_LINE, wrapped_caption, 1)
        self.assertIn(
            "index.html: hero caption children must be English then lang=zh-CN Chinese spans",
            hero_errors(mutated),
        )

    def test_rejects_caption_order_inside_figcaption(self) -> None:
        mutated = self.homepage.replace(CAPTION_EN_LINE, "", 1).replace(
            CAPTION_ZH_LINE,
            CAPTION_ZH_LINE + CAPTION_EN_LINE,
            1,
        )
        self.assertIn(
            "index.html: hero caption children must be English then lang=zh-CN Chinese spans",
            hero_errors(mutated),
        )

    def test_rejects_extra_direct_caption_text(self) -> None:
        mutated = self.homepage.replace(
            '<figcaption class="hero-visual-note">',
            '<figcaption class="hero-visual-note">Unexpected visible claim.',
            1,
        )
        self.assertIn(
            "index.html: hero caption visible text must contain only the paired concept boundary",
            hero_errors(mutated),
        )

    def test_rejects_missing_bilingual_alt(self) -> None:
        mutated = self.homepage.replace(f'alt="{EXPECTED_ALT}"', 'alt=""', 1)
        self.assertIn(
            "index.html: hero image must match the desktop asset, dimensions, decode mode, and bilingual alt",
            hero_errors(mutated),
        )

    def test_rejects_unscoped_chinese_caption(self) -> None:
        mutated = self.homepage.replace(
            '<span class="hero-visual-note-zh" lang="zh-CN">',
            '<span class="hero-visual-note-zh">',
            1,
        )
        self.assertIn(
            "index.html: hero concept caption must keep paired English and lang=zh-CN Chinese text",
            hero_errors(mutated),
        )

    def test_rejects_changed_concept_boundary(self) -> None:
        mutated = self.homepage.replace(
            "Concept illustration, not an experimental record.",
            "Experimental record.",
            1,
        )
        self.assertIn(
            "index.html: hero concept caption must keep paired English and lang=zh-CN Chinese text",
            hero_errors(mutated),
        )

    def test_rejects_data_reveal_on_hero_figure(self) -> None:
        mutated = self.homepage.replace(
            '<figure class="hero-visual">',
            '<figure class="hero-visual" data-reveal>',
            1,
        )
        self.assertIn(
            "index.html: hero figure must not define data-reveal, role=img, or aria-label",
            hero_errors(mutated),
        )

    def test_rejects_image_role_on_hero_figure(self) -> None:
        mutated = self.homepage.replace(
            '<figure class="hero-visual">',
            '<figure class="hero-visual" role="img">',
            1,
        )
        self.assertIn(
            "index.html: hero figure must not define data-reveal, role=img, or aria-label",
            hero_errors(mutated),
        )

    def test_rejects_spaced_case_varied_image_role_on_hero_figure(self) -> None:
        mutated = self.homepage.replace(
            '<figure class="hero-visual">',
            '<figure class="hero-visual" role=" IMG ">',
            1,
        )
        self.assertIn(
            "index.html: hero figure must not define data-reveal, role=img, or aria-label",
            hero_errors(mutated),
        )

    def test_rejects_aria_label_on_hero_figure(self) -> None:
        mutated = self.homepage.replace(
            '<figure class="hero-visual">',
            '<figure class="hero-visual" aria-label="Duplicate accessible name">',
            1,
        )
        self.assertIn(
            "index.html: hero figure must not define data-reveal, role=img, or aria-label",
            hero_errors(mutated),
        )

    def test_rejects_fetchpriority_on_hero_image(self) -> None:
        mutated = self.homepage.replace(
            'decoding="async"',
            'decoding="async" fetchpriority="high"',
            1,
        )
        self.assertIn(
            "index.html: hero image must not define fetchpriority",
            hero_errors(mutated),
        )

    def test_rejects_legacy_lab_markup(self) -> None:
        mutated = self.homepage.replace(
            "</figure>",
            '<span class="lab-source" aria-hidden="true"></span></figure>',
            1,
        )
        self.assertIn(
            "index.html: legacy hero lab/mobile markup must be removed",
            hero_errors(mutated),
        )


if __name__ == "__main__":
    unittest.main()
