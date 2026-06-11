#!/usr/bin/env node

const { spawn, spawnSync } = require("node:child_process");
const { once } = require("node:events");
const { mkdtempSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const SESSION = `instrumentqa-${Date.now()}`;
const FAIL_SESSION = `${SESSION}-fail`;
const SERVER_READY_RE = /Serving .* at (http:\/\/127\.0\.0\.1:\d+\/)/;
const MARKERS = [
  "first viewport",
  "console errors",
  "mobile overflow",
  "prefers-reduced-motion",
  "keyboard",
  "geometry mode",
  "source-derived",
  "module failure",
  "language switch",
  "WebGL fallback",
];

let serverProcess;
let tempDirectory;

function commandName(name) {
  if (name === "python") {
    return name;
  }
  if (process.platform === "win32") {
    return `${name}.cmd`;
  }
  return name;
}

function runCli(session, args, { allowFailure = false } = {}) {
  const result = spawnSync(
    commandName("npx"),
    ["--yes", "--package", "@playwright/cli", "playwright-cli", "--json", `-s=${session}`, ...args],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      shell: process.platform === "win32",
      maxBuffer: 10 * 1024 * 1024,
    }
  );

  if (!allowFailure && result.status !== 0) {
    throw new Error(`playwright-cli ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  }

  const output = result.stdout.trim();
  if (!output) {
    return null;
  }

  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`Could not parse playwright-cli JSON for ${args.join(" ")}\n${output}`);
  }
}

async function startServer() {
  serverProcess = spawn(commandName("python"), ["tools/serve.py"], {
    cwd: process.cwd(),
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let buffered = "";
  let errorText = "";
  serverProcess.stderr.on("data", (chunk) => {
    errorText += chunk.toString();
  });

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for tools/serve.py\n${buffered}\n${errorText}`));
    }, 20000);

    serverProcess.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`tools/serve.py exited before serving, code ${code}\n${buffered}\n${errorText}`));
    });

    serverProcess.stdout.on("data", (chunk) => {
      buffered += chunk.toString();
      const match = buffered.match(SERVER_READY_RE);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
}

async function stopServer() {
  if (!serverProcess || serverProcess.killed) {
    return;
  }
  serverProcess.kill();
  try {
    await Promise.race([once(serverProcess, "exit"), new Promise((resolve) => setTimeout(resolve, 2000))]);
  } catch {
    // Best-effort cleanup only.
  }
}

function assertCheck(condition, message, details = undefined) {
  if (!condition) {
    const suffix = details === undefined ? "" : `\n${JSON.stringify(details, null, 2)}`;
    throw new Error(`${message}${suffix}`);
  }
}

function progress(message) {
  console.error(`[instrument-browser-qa] ${message}`);
}

function evalInPage(session, expression) {
  return runCode(
    session,
    `async (page) => {
      return await page.evaluate(${expression});
    }`
  );
}

function consoleMessages(session, level = "error") {
  const response = runCli(session, ["console", level]);
  return response?.result || "";
}

function runCode(session, code) {
  if (!tempDirectory) {
    tempDirectory = mkdtempSync(join(tmpdir(), "instrument-browser-qa-"));
  }
  const filename = join(tempDirectory, `step-${Date.now()}-${Math.random().toString(16).slice(2)}.js`);
  writeFileSync(filename, code, "utf8");
  const response = runCli(session, ["run-code", "--filename", filename]);
  return parseCliValue(response?.result);
}

function cleanupTempDirectory() {
  if (!tempDirectory) {
    return;
  }
  rmSync(tempDirectory, { recursive: true, force: true });
  tempDirectory = undefined;
}

function parseCliValue(value) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function main() {
  progress("starting local preview server");
  const baseUrl = await startServer();
  const checks = [];
  const record = (name) => checks.push(name);

  try {
    progress("checking first viewport");
    runCli(SESSION, ["open", `${baseUrl}instrument/?qa=browser-tool`]);
    const normal = evalInPage(
      SESSION,
      `() => {
        const rect = document.querySelector('.instrument-workstation')?.getBoundingClientRect();
        return {
          title: document.title,
          hasWorkbench: Boolean(rect),
          workbenchTop: rect ? rect.top : null,
          workbenchBottom: rect ? rect.bottom : null,
          viewportHeight: window.innerHeight,
          hasControls: Boolean(document.querySelector('[data-control="excitation-wavelength"]')),
          hasDiagnostics: Boolean(document.querySelector('[data-diagnostics-list]')),
          hasSpectrum: Boolean(document.querySelector('[data-spectrum-trace]')),
          hasTransmissionBoundary: document.body.textContent.includes('Transmission / 透射路径'),
          hasSourceBoundary: document.body.textContent.includes('Source-derived examples are display-processed'),
          hasFallbackStatus: document.querySelectorAll('[data-webgl-status]').length >= 2,
          overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        };
      }`
    );
    assertCheck(normal.hasWorkbench && normal.hasControls && normal.hasDiagnostics && normal.hasSpectrum, "first viewport workbench pieces are missing", normal);
    assertCheck(normal.workbenchTop < normal.viewportHeight && normal.workbenchBottom > 0, "first viewport does not expose the interactive workbench", normal);
    assertCheck(normal.hasTransmissionBoundary && normal.hasSourceBoundary, "boundary copy missing on normal load", normal);
    assertCheck(normal.hasFallbackStatus, "WebGL fallback status regions missing", normal);
    assertCheck(normal.overflowX === 0, "desktop horizontal overflow detected", normal);
    record("first viewport workbench");
    record("WebGL fallback status");

    progress("checking console errors");
    const consoleErrors = consoleMessages(SESSION, "error");
    assertCheck(/Total messages: 0/.test(consoleErrors), "console errors on normal load", consoleErrors);
    record("console errors");

    progress("checking mobile layout");
    runCli(SESSION, ["resize", "390", "900"]);
    const mobile = evalInPage(
      SESSION,
      `() => ({
        overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        visibleFallbackStatus: [...document.querySelectorAll('[data-webgl-status]')].some((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        }),
        shortLanguageTargets: [...document.querySelectorAll('.instrument-language-switch button')]
          .filter((button) => {
            const rect = button.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.height < 40;
          })
          .map((button) => ({ label: button.textContent.trim(), height: button.getBoundingClientRect().height })),
        onboardingColumns: getComputedStyle(document.querySelector('.instrument-onboarding')).gridTemplateColumns,
      })`
    );
    assertCheck(
      mobile.overflowX === 0 && mobile.visibleFallbackStatus && mobile.shortLanguageTargets.length === 0,
      "mobile overflow, hidden fallback status, or undersized language target",
      mobile
    );
    record("mobile overflow");

    progress("checking reduced motion");
    const reduced = runCode(
      SESSION,
      `async (page) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.reload({ waitUntil: 'networkidle' });
        return await page.evaluate(() => ({
          prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
          rootReduced: document.querySelector('[data-instrument-lab]')?.classList.contains('is-reduced-motion') || false,
        }));
      }`
    );
    assertCheck(
      reduced.prefersReducedMotion === true && reduced.rootReduced === true,
      "prefers-reduced-motion emulation did not activate page state",
      reduced
    );
    record("prefers-reduced-motion");

    progress("checking language switch");
    const language = evalInPage(
      SESSION,
      `async () => {
        document.querySelector('[data-language-mode-option="zh"]').click();
        await new Promise((resolve) => setTimeout(resolve, 80));
        const zhMode = document.querySelector('[data-instrument-lab]')?.dataset.languageMode;
        const zhPressed = document.querySelector('[data-language-mode-option="zh"]')?.getAttribute('aria-pressed');
        document.querySelector('[data-language-mode-option="en"]').click();
        await new Promise((resolve) => setTimeout(resolve, 80));
        return {
          zhMode,
          zhPressed,
          enMode: document.querySelector('[data-instrument-lab]')?.dataset.languageMode,
          stored: localStorage.getItem('instrumentLanguageMode'),
        };
      }`
    );
    assertCheck(language.zhMode === "zh" && language.zhPressed === "true" && language.enMode === "en", "language switch failed", language);
    record("language switch");

    progress("checking keyboard activation");
    runCode(
      SESSION,
      `async (page) => {
        await page.locator('[data-mode="excitation"]').focus();
        await page.keyboard.press('Space');
        await page.waitForTimeout(120);
        await page.locator('[data-part="source"]').focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(120);
        return true;
      }`
    );
    const keyboard = evalInPage(
      SESSION,
      `() => {
        const mode = document.querySelector('[data-mode="excitation"]');
        const marker = document.querySelector('[data-part="source"]');
        return {
          modePressed: mode.getAttribute('aria-pressed'),
          scanMode: document.querySelector('[data-instrument-lab]')?.dataset.scanMode,
          selectedMarker: marker.getAttribute('aria-pressed'),
          partTitle: document.querySelector('[data-part-title]')?.textContent.trim(),
        };
      }`
    );
    assertCheck(keyboard.modePressed === "true" && keyboard.scanMode === "excitation" && keyboard.selectedMarker === "true", "keyboard activation failed", keyboard);
    record("keyboard");

    progress("checking geometry mode visuals");
    const geometryMode = evalInPage(
      SESSION,
      `async () => {
        const select = document.querySelector('[data-control="geometry-mode"]');
        const modes = ["right-angle-90", "front-face", "transmission"];
        const results = [];
        for (const mode of modes) {
          select.value = mode;
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
          await new Promise((resolve) => setTimeout(resolve, 80));
          const visuals = [...document.querySelectorAll('[data-geometry-visual]')].map((visual) => {
            const rect = visual.getBoundingClientRect();
            const style = getComputedStyle(visual);
            return {
              id: visual.dataset.geometryVisual,
              visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
            };
          });
          results.push({
            mode,
            rootMode: document.querySelector('[data-instrument-lab]')?.dataset.geometryMode,
            visible: visuals.filter((visual) => visual.visible).map((visual) => visual.id),
            collection: document.querySelector('[data-readout="collection"]')?.textContent.trim(),
          });
        }
        return results;
      }`
    );
    assertCheck(
      Array.isArray(geometryMode) &&
        geometryMode.length === 3 &&
        geometryMode.every((entry) => entry.rootMode === entry.mode && entry.visible.length === 1 && entry.visible[0] === entry.mode),
      "geometry mode did not drive the fallback light-path visual",
      geometryMode
    );
    record("geometry mode");

    progress("checking source-derived panel");
    const sourceDerived = evalInPage(
      SESSION,
      `async () => {
        document.querySelector('[data-source-data-panel]').scrollIntoView();
        await new Promise((resolve) => setTimeout(resolve, 2400));
        return {
          cards: document.querySelectorAll('[data-source-cards] button').length,
          status: document.querySelector('[data-source-status]')?.textContent.trim(),
          axes: document.querySelector('[data-source-axes]')?.textContent.trim(),
          boundary: document.querySelector('[data-source-boundary]')?.textContent.trim(),
        };
      }`
    );
    assertCheck(sourceDerived.cards >= 3 && /display|显示|source/i.test(sourceDerived.boundary || ""), "source-derived display-only panel failed", sourceDerived);
    record("source-derived");

    progress("checking module failure fallback");
    runCli(FAIL_SESSION, ["open", "about:blank"]);
    const failure = runCode(
      FAIL_SESSION,
      `async (page) => {
        await page.route('**/instrument/instrument.js*', async (route) => {
          await route.fulfill({
            status: 404,
            contentType: 'text/javascript',
            body: 'blocked-for-fallback-QA',
          });
        });
        await page.goto('${baseUrl}instrument/?qa=module-failure', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(800);
        return await page.evaluate(() => ({
          rootFallback: document.querySelector('[data-instrument-lab]')?.classList.contains('has-2d-fallback') || false,
          statuses: [...document.querySelectorAll('[data-webgl-status]')].map((el) => el.textContent.trim()),
          visibleStatusCount: [...document.querySelectorAll('[data-webgl-status]')].filter((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
          }).length,
          overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        }));
      }`
    );
    assertCheck(
      failure.rootFallback &&
        failure.visibleStatusCount >= 1 &&
        failure.overflowX === 0 &&
        failure.statuses.length >= 2 &&
        failure.statuses.every((text) => text.includes("Interactive module unavailable")),
      "module failure fallback did not update every visible status",
      failure
    );
    record("module failure");

    console.log("Instrument browser QA passed.");
    console.log(`URL: ${baseUrl}instrument/`);
    console.log(`Checks: ${checks.join(", ")}`);
    console.log(`Markers: ${MARKERS.join(", ")}`);
  } finally {
    runCli(SESSION, ["close"], { allowFailure: true });
    runCli(FAIL_SESSION, ["close"], { allowFailure: true });
    cleanupTempDirectory();
    await stopServer();
  }
}

main().catch(async (error) => {
  console.error(error.message || error);
  cleanupTempDirectory();
  await stopServer();
  process.exit(1);
});
