import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const qaToolPath = resolve(repoRoot, "tools/check-instrument-browser.js");

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
