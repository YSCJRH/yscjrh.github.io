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
  "fallback label collisions",
  "console errors",
  "mobile overflow",
  "prefers-reduced-motion",
  "keyboard",
  "no-JS fallback",
  "optional 3D scene",
  "geometry mode",
  "response-normalized view",
  "source-derived",
  "source-derived language",
  "module failure",
  "language switch",
  "language density",
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

    progress("checking fallback label collisions");
    const fallbackTextLayout = evalInPage(
      SESSION,
      `() => {
        function rectFor(selector) {
          const element = document.querySelector(selector);
          if (!element) {
            return null;
          }
          const rect = element.getBoundingClientRect();
          return {
            selector,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
          };
        }

        function overlapArea(a, b) {
          if (!a || !b) {
            return 0;
          }
          const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
          const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          return width * height;
        }

        const status = rectFor('.instrument-fallback-status');
        const emissionLabel = rectFor('.component-label-emission');
        const emissionScanBadge = rectFor('.scan-badge-emission');
        const rightAngleLabel = rectFor('.geometry-visual-right-angle .geometry-cue-label');

        return {
          status,
          emissionLabel,
          emissionScanBadge,
          rightAngleLabel,
          statusEmissionOverlap: overlapArea(status, emissionLabel),
          scanGeometryOverlap: overlapArea(emissionScanBadge, rightAngleLabel),
        };
      }`
    );
    assertCheck(
      fallbackTextLayout.statusEmissionOverlap === 0 &&
        fallbackTextLayout.scanGeometryOverlap === 0,
      "2D fallback labels overlap on first load",
      fallbackTextLayout
    );
    record("fallback label collisions");

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
        function visibleText(selector) {
          const element = document.querySelector(selector);
          return element ? element.innerText.replace(/\\s+/g, " ").trim() : "";
        }

        document.querySelector('[data-language-mode-option="zh"]').click();
        await new Promise((resolve) => setTimeout(resolve, 80));
        const zhMode = document.querySelector('[data-instrument-lab]')?.dataset.languageMode;
        const zhPressed = document.querySelector('[data-language-mode-option="zh"]')?.getAttribute('aria-pressed');
        const zhWorkbenchText = [
          visibleText('.instrument-onboarding'),
          visibleText('.instrument-control-panel'),
        ].join(" ");
        document.querySelector('[data-language-mode-option="en"]').click();
        await new Promise((resolve) => setTimeout(resolve, 80));
        const enWorkbenchText = [
          visibleText('.instrument-onboarding'),
          visibleText('.instrument-control-panel'),
        ].join(" ");
        return {
          zhMode,
          zhPressed,
          enMode: document.querySelector('[data-instrument-lab]')?.dataset.languageMode,
          stored: localStorage.getItem('instrumentLanguageMode'),
          zhWorkbenchText,
          enWorkbenchText,
        };
      }`
    );
    assertCheck(language.zhMode === "zh" && language.zhPressed === "true" && language.enMode === "en", "language switch failed", language);
    record("language switch");
    assertCheck(
      !/Explore the scan model\s*\/|Controls\s*\/|Emission scan\s*\/|Excitation wavelength\s*\/|Teaching selector; not a calibrated range/.test(language.zhWorkbenchText) &&
        /探索扫描模型|控制面板|发射扫描|激发波长|教学选通/.test(language.zhWorkbenchText) &&
        !/探索扫描模型|控制面板|发射扫描|激发波长|教学选通/.test(language.enWorkbenchText) &&
        /Explore the scan model|Controls|Emission scan|Excitation wavelength|Teaching selector; not a calibrated range/.test(language.enWorkbenchText),
      "single-language mode leaves dense bilingual workbench labels visible",
      language
    );
    record("language density");

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

    progress("checking no-JS fallback");
    const noJs = runCode(
      SESSION,
      `async (page) => {
        const browser = page.context().browser();
        const context = await browser.newContext({
          javaScriptEnabled: false,
          viewport: { width: 390, height: 900 },
        });
        try {
          const noJsPage = await context.newPage();
          await noJsPage.goto('${baseUrl}instrument/?qa=no-js', { waitUntil: 'domcontentloaded' });
          await noJsPage.waitForTimeout(300);
          const bodyText = await noJsPage.locator('body').textContent();
          const statusText = (await noJsPage.locator('[data-webgl-status]').allTextContents())
            .map((text) => text.trim())
            .join(" ");
          const languageButtons = noJsPage.locator('[data-language-mode-option]');
          const languageButtonCount = await languageButtons.count();
          let languageButtonsDisabled = languageButtonCount > 0;
          for (let index = 0; index < languageButtonCount; index += 1) {
            languageButtonsDisabled = languageButtonsDisabled && await languageButtons.nth(index).isDisabled();
          }
          return {
            hasNoscript: bodyText.includes('JavaScript is disabled') &&
              bodyText.includes('当前浏览器禁用了 JavaScript'),
            hasFallbackDiagram: await noJsPage.locator('[data-fallback-diagram] svg').count() > 0,
            canvasCount: await noJsPage.locator('[data-scene-host] canvas').count(),
            languageButtonsDisabled,
            hasCoreControls: await noJsPage.locator('[data-control="excitation-wavelength"]').count() > 0 &&
              await noJsPage.locator('[data-control="emission-wavelength"]').count() > 0,
            statusText,
          };
        } finally {
          await context.close();
        }
      }`
    );
    assertCheck(
      noJs?.hasNoscript &&
        noJs.hasFallbackDiagram &&
        noJs.canvasCount === 0 &&
        noJs.languageButtonsDisabled &&
        noJs.hasCoreControls &&
        /2D fallback active|二维备用图已启用/.test(noJs.statusText),
      "no-JS fallback did not preserve the static teaching route",
      noJs
    );
    record("no-JS fallback");

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

    progress("checking response-normalized teaching view");
    const responseNormalized = evalInPage(
      SESSION,
      `async () => {
        const select = document.querySelector('[data-control="spectrum-view"]');
        const trace = () => document.querySelector('[data-spectrum-trace]')?.getAttribute('points') || "";
        const diagnostics = () => document.querySelector('[data-diagnostics-list]')?.textContent.trim() || "";
        const helper = select?.closest('label')?.textContent.trim() || "";
        const before = {
          value: select?.value || "",
          trace: trace(),
          diagnostics: diagnostics(),
          helper,
        };
        select.value = "response-normalized";
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 120));
        const after = {
          value: select?.value || "",
          trace: trace(),
          diagnostics: diagnostics(),
          helper,
        };
        return { before, after };
      }`
    );
    assertCheck(
      responseNormalized?.before?.value === "raw" &&
        responseNormalized?.after?.value === "response-normalized" &&
        responseNormalized.before.trace &&
        responseNormalized.after.trace &&
        responseNormalized.before.trace !== responseNormalized.after.trace &&
        /Response-normalized view|响应归一化视图/.test(responseNormalized.after.diagnostics) &&
        /not a calibrated correction|不是校准校正/.test(responseNormalized.after.helper),
      "response-normalized view did not update the trace, diagnostic, and correction boundary",
      responseNormalized
    );
    record("response-normalized view");

    progress("checking optional 3D scene");
    const optional3d = runCode(
      SESSION,
      `async (page) => {
        await page.setViewportSize({ width: 1100, height: 820 });
        await page.locator('[data-action="enable-3d"]').click();
        await page.waitForTimeout(1400);
        return await page.evaluate(() => {
          const root = document.querySelector('[data-instrument-lab]');
          const statusText = [...document.querySelectorAll('[data-webgl-status]')]
            .map((entry) => entry.textContent.trim())
            .join(" ");
          return {
            canvasCount: document.querySelectorAll('[data-scene-host] canvas').length,
            hasWebglScene: root?.classList.contains('has-webgl-scene') || false,
            hasFallback: root?.classList.contains('has-2d-fallback') || false,
            statusText,
            overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
          };
        });
      }`
    );
    assertCheck(
      optional3d.overflowX === 0 &&
        (
          (optional3d.hasWebglScene && optional3d.canvasCount === 1 && /3D teaching skeleton active/.test(optional3d.statusText)) ||
          (optional3d.hasFallback && optional3d.canvasCount === 0 && /unavailable|fallback|备用|不可用/i.test(optional3d.statusText))
        ),
      "optional 3D scene did not activate or fall back cleanly",
      optional3d
    );
    record("optional 3D scene");

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

    progress("checking source-derived language mode");
    const sourceDerivedLanguage = evalInPage(
      SESSION,
      `async () => {
        function visibleLanguageText(selector) {
          const element = document.querySelector(selector);
          if (!element) return "";
          const languageSpans = [...element.querySelectorAll('[data-language]')];
          if (!languageSpans.length) return element.textContent.trim();
          return languageSpans
            .filter((span) => {
              const style = getComputedStyle(span);
              const rect = span.getBoundingClientRect();
              return style.display !== 'none' && style.visibility !== 'hidden' && rect.width >= 0 && rect.height >= 0;
            })
            .map((span) => span.textContent.trim())
            .join(" ")
            .trim();
        }

        document.querySelector('[data-language-mode-option="zh"]').click();
        await new Promise((resolve) => setTimeout(resolve, 120));
        const zh = {
          mode: document.querySelector('[data-instrument-lab]')?.dataset.languageMode,
          card: visibleLanguageText('[data-source-cards] button strong'),
          status: visibleLanguageText('[data-source-status]'),
          boundary: visibleLanguageText('[data-source-boundary]'),
        };

        document.querySelector('[data-language-mode-option="en"]').click();
        await new Promise((resolve) => setTimeout(resolve, 120));
        const en = {
          mode: document.querySelector('[data-instrument-lab]')?.dataset.languageMode,
          card: visibleLanguageText('[data-source-cards] button strong'),
          status: visibleLanguageText('[data-source-status]'),
          boundary: visibleLanguageText('[data-source-boundary]'),
        };

        return { zh, en };
      }`
    );
    assertCheck(
      sourceDerivedLanguage.zh.mode === "zh" &&
        /[\u3400-\u9fff]/.test(sourceDerivedLanguage.zh.card) &&
        /[\u3400-\u9fff]/.test(sourceDerivedLanguage.zh.status) &&
        !/Loading|Display-only source example/.test(sourceDerivedLanguage.zh.card + sourceDerivedLanguage.zh.status + sourceDerivedLanguage.zh.boundary) &&
        sourceDerivedLanguage.en.mode === "en" &&
        /Rhodamine|EGFP|Fe\\(II\\)-DOM|Reference/i.test(sourceDerivedLanguage.en.card) &&
        /Loaded local source-derived example/i.test(sourceDerivedLanguage.en.status) &&
        !/正在加载|已加载|仅作|模拟器/.test(sourceDerivedLanguage.en.card + sourceDerivedLanguage.en.status + sourceDerivedLanguage.en.boundary),
      "source-derived text did not follow the selected language mode",
      sourceDerivedLanguage
    );
    record("source-derived language");

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
