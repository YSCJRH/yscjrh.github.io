import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const qaToolPath = resolve(repoRoot, "tools/check-instrument-browser.js");
const publicQaToolPath = resolve(repoRoot, "tools/check-public-browser.js");

test("instrument browser QA tool exists and covers refine DoD browser gates", () => {
  assert.equal(existsSync(qaToolPath), true, "expected tools/check-instrument-browser.js");

  const script = readFileSync(qaToolPath, "utf8");
  for (const marker of [
    "first viewport",
    "fallback label collisions",
    "console errors",
    "mobile overflow",
    "prefers-reduced-motion",
    "keyboard",
    "no-JS fallback",
    "default 3D scene",
    "geometry mode",
    "response-normalized view",
    "source-derived",
    "source-derived language",
    "module failure",
    "language switch",
    "language density",
    "scene overlay language",
    "classic samples",
    "sample picker",
    "WebGL fallback",
  ]) {
    assert.match(script, new RegExp(marker, "i"), `missing browser QA marker: ${marker}`);
  }

  assert.match(
    script,
    /page\.keyboard\.press/,
    "keyboard QA should use browser-level key presses, not synthetic KeyboardEvent dispatch"
  );
  assert.match(
    script,
    /javaScriptEnabled:\s*false/,
    "no-JS fallback QA should disable JavaScript in a separate browser context before loading the page"
  );
  assert.doesNotMatch(
    script,
    /"--body",\s*""/,
    "module-failure route should not pass an empty --body value because playwright-cli parses it as boolean"
  );
  assert.match(
    script,
    /spawn\(commandName\("python"\), \["tools\/serve\.py"\], \{[\s\S]*?shell:\s*false/,
    "browser QA server should launch python directly so cleanup kills the server process on Windows"
  );
});

test("public browser QA tool samples the documented mobile viewport widths", () => {
  assert.equal(existsSync(publicQaToolPath), true, "expected tools/check-public-browser.js");

  const script = readFileSync(publicQaToolPath, "utf8");
  assert.match(
    script,
    /PUBLIC_MOBILE_VIEWPORT_WIDTHS\s*=\s*\[\s*320,\s*375,\s*390,\s*414,\s*768\s*\]/,
    "public browser QA should declare the documented mobile widths"
  );
  assert.match(
    script,
    /for\s*\(\s*const\s+width\s+of\s+PUBLIC_MOBILE_VIEWPORT_WIDTHS\s*\)/,
    "public browser QA should run the mobile route scan across every documented width"
  );
  assert.match(
    script,
    /mobile structure \$\{route\} \$\{width\}px/,
    "public browser QA output should expose width-specific mobile structure checks"
  );
});

test("public browser QA verifies responsive homepage hero delivery", () => {
  assert.equal(existsSync(publicQaToolPath), true, "expected tools/check-public-browser.js");

  const script = readFileSync(publicQaToolPath, "utf8");
  assert.match(
    script,
    /HERO_RESPONSIVE_VIEWPORTS\s*=\s*\[[\s\S]*?1280[\s\S]*?1024[\s\S]*?390[\s\S]*?\]/,
    "public browser QA should declare desktop, tablet, and mobile Hero viewports"
  );
  for (const asset of [
    "hero-fluorescence-desktop-v1.webp",
    "hero-fluorescence-tablet-v1.webp",
    "hero-fluorescence-mobile-v1.webp",
  ]) {
    assert.match(script, new RegExp(asset.replaceAll(".", "\\.")), `missing Hero asset check: ${asset}`);
  }
  assert.match(script, /currentSrc/, "Hero QA should verify the selected responsive source");
  assert.match(script, /captionAfterImage/, "Hero QA should verify that the caption stays outside the image");
  assert.match(
    script,
    /renderedCopyBeforeFigure/,
    "Hero QA should verify rendered mobile copy order in addition to DOM order"
  );
  assert.match(script, /afterScrollFullyVisible/, "Hero QA should verify full figure visibility after scroll");
  assert.match(
    script,
    /const previousRootScrollBehavior = document\.documentElement\.style\.scrollBehavior;/,
    "Hero QA should preserve the page's inline scroll behavior before forcing a deterministic scroll"
  );
  assert.match(
    script,
    /document\.documentElement\.style\.scrollBehavior = ['"]auto['"];/,
    "Hero QA should disable smooth scrolling before measuring the scrolled figure"
  );
  assert.match(
    script,
    /document\.documentElement\.style\.scrollBehavior = previousRootScrollBehavior;/,
    "Hero QA should restore the page's inline scroll behavior after measurement"
  );
  assert.match(script, /responsive hero image/i, "Hero QA should expose a stable result marker");
});
