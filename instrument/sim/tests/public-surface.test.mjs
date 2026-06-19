import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");

const publicPages = [
  ["index.html", readFileSync(resolve(repoRoot, "index.html"), "utf8")],
  ["projects/index.html", readFileSync(resolve(repoRoot, "projects/index.html"), "utf8")],
];

test("project CTA groups do not repeat the same destination", () => {
  for (const [path, html] of publicPages) {
    const groups = [...html.matchAll(/<div class="project-cta-group">([\s\S]*?)<\/div>/g)];
    assert.ok(groups.length > 0, `${path} should expose project CTA groups`);

    groups.forEach((group, index) => {
      const hrefs = [...group[1].matchAll(/\shref="([^"]+)"/g)].map((match) => match[1]);
      const duplicateHrefs = [...new Set(hrefs.filter((href, hrefIndex) => hrefs.indexOf(href) !== hrefIndex))];
      assert.deepEqual(
        duplicateHrefs,
        [],
        `${path} project CTA group ${index + 1} should not repeat destinations`
      );
    });
  }
});
