from __future__ import annotations

from pathlib import Path
import re
import unittest

from tools.check_site import SiteParser, check_homepage_evidence_hierarchy


ROOT = Path(__file__).resolve().parents[2]


def homepage_errors(html: str) -> list[str]:
    parser = SiteParser()
    parser.feed(html)
    return check_homepage_evidence_hierarchy(parser)


class HomepageEvidenceContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.homepage = (ROOT / "index.html").read_text(encoding="utf-8")

    def test_current_homepage_satisfies_contract(self) -> None:
        self.assertEqual(homepage_errors(self.homepage), [])

    def test_rejects_direction_card_anchor_without_research_link_class(self) -> None:
        original = '<span class="research-card-state">Public example pending / 公开示例待补充</span>'
        replacement = '<a href="projects/">Public example pending / 公开示例待补充</a>'
        self.assertIn(original, self.homepage)
        mutated = self.homepage.replace(original, replacement, 1)

        self.assertIn(
            "index.html: direction-statement research card must not contain interactive descendants",
            homepage_errors(mutated),
        )

    def test_rejects_native_focusable_descendant_in_direction_card(self) -> None:
        original = '<span class="research-card-state">Public example pending / 公开示例待补充</span>'
        replacement = original + '<iframe src="projects/" title="Unexpected route"></iframe>'
        self.assertIn(original, self.homepage)
        mutated = self.homepage.replace(original, replacement, 1)

        self.assertIn(
            "index.html: direction-statement research card must not contain interactive descendants",
            homepage_errors(mutated),
        )

    def test_rejects_aria_widget_role_in_direction_card(self) -> None:
        original = '<span class="research-card-state">Public example pending / 公开示例待补充</span>'
        replacement = '<span class="research-card-state" role="combobox">Public example pending / 公开示例待补充</span>'
        self.assertIn(original, self.homepage)
        mutated = self.homepage.replace(original, replacement, 1)

        self.assertIn(
            "index.html: direction-statement research card must not contain interactive descendants",
            homepage_errors(mutated),
        )

    def test_rejects_research_link_moved_to_wrong_role(self) -> None:
        original_link = (
            '<a class="research-card-link" href="notes/when-a-fluorescence-signal-becomes-usable.html">\n'
            '                        Read published reflection / 阅读已公开反思\n'
            "                      </a>"
        )
        moved_link = (
            '<a class="research-card-link" href="notes/when-a-fluorescence-signal-becomes-usable.html">'
            "Read published reflection / 阅读已公开反思</a>"
        )
        original_state = '<span class="research-card-state">Public example pending / 公开示例待补充</span>'
        self.assertIn(original_link, self.homepage)
        self.assertIn(original_state, self.homepage)
        mutated = self.homepage.replace(
            original_link,
            "<span>Read published reflection / 阅读已公开反思</span>",
            1,
        ).replace(original_state, moved_link, 1)

        errors = homepage_errors(mutated)
        self.assertIn(
            "index.html: published-reflection research card must contain exactly its declared evidence link",
            errors,
        )
        self.assertIn(
            "index.html: direction-statement research card must not contain interactive descendants",
            errors,
        )

    def test_rejects_empty_scoped_chinese_copy(self) -> None:
        mutated = self.homepage
        for class_name in (
            "workflow-copy-zh",
            "project-why-copy-zh",
            "about-route-copy-zh",
        ):
            mutated, replacements = re.subn(
                rf'(<[^>]+class="[^"]*\b{class_name}\b[^"]*"[^>]*>).*?(</[^>]+>)',
                r"\1 \2",
                mutated,
                flags=re.DOTALL,
            )
            self.assertGreater(replacements, 0, class_name)

        errors = homepage_errors(mutated)
        self.assertTrue(
            any("must contain Chinese text inside the expected container" in error for error in errors),
            errors,
        )


if __name__ == "__main__":
    unittest.main()
