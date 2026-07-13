#!/usr/bin/env node

const { spawn, spawnSync } = require("node:child_process");
const { once } = require("node:events");
const { mkdtempSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const SESSION = `publicqa-${Date.now()}`;
const SERVER_READY_RE = /Serving .* at (http:\/\/127\.0\.0\.1:\d+\/)/;
const PUBLIC_ROUTES = [
  "/",
  "/404.html",
  "/projects/",
  "/notes/",
  "/notes/build-logs-homepage-second-pass.html",
  "/notes/when-a-fluorescence-signal-becomes-usable.html",
];
const PUBLIC_MOBILE_VIEWPORT_WIDTHS = [320, 375, 390, 414, 768];
const PUBLIC_MOBILE_VIEWPORT_HEIGHT = 900;
const HERO_RESPONSIVE_VIEWPORTS = [
  {
    name: "desktop",
    width: 1280,
    height: 900,
    expectedPath: "/assets/img/hero-fluorescence-desktop-v1.webp",
    requiresInitialVisibility: true,
    requiresCopyBeforeFigure: false,
  },
  {
    name: "tablet",
    width: 1024,
    height: 900,
    expectedPath: "/assets/img/hero-fluorescence-tablet-v1.webp",
    requiresInitialVisibility: true,
    requiresCopyBeforeFigure: false,
  },
  {
    name: "mobile",
    width: 390,
    height: 900,
    expectedPath: "/assets/img/hero-fluorescence-mobile-v1.webp",
    requiresInitialVisibility: false,
    requiresCopyBeforeFigure: true,
  },
];
const MARKERS = [
  "desktop structure",
  "desktop console",
  "mobile structure",
  "mobile overflow",
  "mobile touch targets",
  "custom 404 content",
  "no-JS mobile navigation",
  "mobile menu keyboard",
  "responsive hero image",
  "reduced motion",
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

function runCli(args, { allowFailure = false } = {}) {
  const result = spawnSync(
    commandName("npx"),
    ["--yes", "--package", "@playwright/cli", "playwright-cli", "--json", `-s=${SESSION}`, ...args],
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
  } catch {
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

function runCode(code) {
  if (!tempDirectory) {
    tempDirectory = mkdtempSync(join(tmpdir(), "public-browser-qa-"));
  }
  const filename = join(tempDirectory, `step-${Date.now()}-${Math.random().toString(16).slice(2)}.js`);
  writeFileSync(filename, code, "utf8");
  const response = runCli(["run-code", "--filename", filename]);
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

function assertCheck(condition, message, details = undefined) {
  if (!condition) {
    const suffix = details === undefined ? "" : `\n${JSON.stringify(details, null, 2)}`;
    throw new Error(`${message}${suffix}`);
  }
}

function consoleMessages(level = "error") {
  const response = runCli(["console", level]);
  return response?.result || "";
}

function progress(message) {
  console.error(`[public-browser-qa] ${message}`);
}

async function main() {
  progress("starting local preview server");
  const baseUrl = await startServer();
  const checks = [];
  const record = (name) => checks.push(name);

  try {
    runCli(["open", baseUrl]);

    for (const route of PUBLIC_ROUTES) {
      progress(`checking desktop ${route}`);
      const desktop = runCode(
        `async (page) => {
          await page.setViewportSize({ width: 1366, height: 900 });
          await page.goto('${baseUrl}${route.slice(1)}', { waitUntil: 'networkidle' });
          return await page.evaluate(() => {
            const main = document.querySelector('#main');
            const skip = document.querySelector('.skip-link[href="#main"]');
            const h1 = [...document.querySelectorAll('h1')].map((heading) => heading.textContent.trim());
            return {
              title: document.title,
              bodyText: document.body.textContent.replace(/\s+/g, ' '),
              h1,
              hasMain: Boolean(main),
              hasSkip: Boolean(skip),
              skipTargetMatches: Boolean(skip && main && skip.getAttribute('href') === '#main'),
              overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
              navLinks: [...document.querySelectorAll('.site-nav a')].map((link) => link.textContent.trim()),
            };
          });
        }`
      );
      assertCheck(
        desktop.title &&
          desktop.h1.length === 1 &&
          desktop.hasMain &&
          desktop.hasSkip &&
          desktop.skipTargetMatches &&
          desktop.overflowX === 0 &&
          desktop.navLinks.length >= 4,
        `desktop public-page structure failed for ${route}`,
        desktop
      );
      record(`desktop structure ${route}`);

      if (route === "/404.html") {
        assertCheck(
          desktop.h1[0].includes("not part of the site map") &&
            desktop.bodyText.includes("这个地址不在当前站点地图中。"),
          "custom 404 route bilingual headline is missing",
          desktop
        );
        record("custom 404 content");
      }

      const consoleErrors = consoleMessages("error");
      assertCheck(/Total messages: 0/.test(consoleErrors), `console errors on ${route}`, consoleErrors);
      record(`desktop console ${route}`);

      for (const width of PUBLIC_MOBILE_VIEWPORT_WIDTHS) {
        progress(`checking mobile ${route} ${width}px`);
        const mobile = runCode(
          `async (page) => {
            await page.setViewportSize({ width: ${width}, height: ${PUBLIC_MOBILE_VIEWPORT_HEIGHT} });
            await page.goto('${baseUrl}${route.slice(1)}', { waitUntil: 'networkidle' });
            return await page.evaluate((viewportWidth) => {
              const interactiveSelector = [
                '.nav-toggle',
                '.button',
                '.hero-shortcut',
                '.supporting-project-card',
                '.project-card .project-cta-group a',
                '.stream-meta .stream-link',
                '.research-card-link',
                '.article-actions a',
                '.article-card a',
                '.project-detail-card a',
                '.project-repo-link'
              ].join(',');
              const smallTargets = [...document.querySelectorAll(interactiveSelector)]
                .filter((element) => {
                  const rect = element.getBoundingClientRect();
                  const style = getComputedStyle(element);
                  return rect.width > 0 &&
                    rect.height > 0 &&
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    (rect.width < 40 || rect.height < 40);
                })
                .map((element) => {
                  const rect = element.getBoundingClientRect();
                  return {
                    text: element.textContent.trim().replace(/\\s+/g, ' ').slice(0, 80),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                  };
                });
              return {
                viewportWidth,
                h1Count: document.querySelectorAll('h1').length,
                hasSkip: Boolean(document.querySelector('.skip-link[href="#main"]')),
                overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
                smallTargets,
              };
            }, ${width});
          }`
        );
        assertCheck(
          mobile.h1Count === 1 &&
            mobile.hasSkip &&
            mobile.overflowX === 0 &&
            mobile.smallTargets.length === 0,
          `mobile public-page structure failed for ${route} at ${width}px`,
          mobile
        );
        record(`mobile structure ${route} ${width}px`);
      }
    }

    progress("checking responsive hero image");
    const heroResponsive = runCode(
      `async (page) => {
        const scenarios = ${JSON.stringify(HERO_RESPONSIVE_VIEWPORTS)};
        const results = [];
        for (const scenario of scenarios) {
          await page.setViewportSize({ width: scenario.width, height: scenario.height });
          await page.goto('${baseUrl}', { waitUntil: 'networkidle' });
          await page.waitForFunction(() => {
            const image = document.querySelector('.hero-illustration');
            return Boolean(image && image.complete && image.naturalWidth > 0);
          });
          results.push(await page.evaluate(async (currentScenario) => {
            const figure = document.querySelector('figure.hero-visual');
            const picture = document.querySelector('.hero-visual-picture');
            const image = document.querySelector('.hero-illustration');
            const caption = document.querySelector('figcaption.hero-visual-note');
            const copy = document.querySelector('.hero-copy');
            if (!figure || !picture || !image || !caption || !copy) {
              return { ...currentScenario, missing: true };
            }

            const initialFigureRect = figure.getBoundingClientRect();
            const pictureRect = picture.getBoundingClientRect();
            const captionRect = caption.getBoundingClientRect();
            const copyRect = copy.getBoundingClientRect();
            const copyBeforeFigure = Boolean(
              copy.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING
            );
            const result = {
              ...currentScenario,
              missing: false,
              currentPath: new URL(image.currentSrc).pathname,
              imageLoaded: image.complete && image.naturalWidth > 0,
              initialInViewport:
                initialFigureRect.top < window.innerHeight && initialFigureRect.bottom > 0,
              captionAfterImage: captionRect.top >= pictureRect.bottom - 1,
              captionPosition: getComputedStyle(caption).position,
              staticFigure: getComputedStyle(figure).transform === 'none',
              copyBeforeFigure,
              renderedCopyBeforeFigure: copyRect.bottom <= initialFigureRect.top + 1,
              overflowX: Math.max(
                0,
                document.documentElement.scrollWidth - document.documentElement.clientWidth
              ),
            };

            const centeredTop =
              initialFigureRect.top +
              window.scrollY -
              Math.max(0, (window.innerHeight - initialFigureRect.height) / 2);
            const previousRootScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, Math.max(0, centeredTop));
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const scrolledFigureRect = figure.getBoundingClientRect();
            result.afterScrollFullyVisible =
              scrolledFigureRect.top >= -1 && scrolledFigureRect.bottom <= window.innerHeight + 1;
            document.documentElement.style.scrollBehavior = previousRootScrollBehavior;
            return result;
          }, scenario));
        }
        return results;
      }`
    );
    assertCheck(
      Array.isArray(heroResponsive) &&
        heroResponsive.length === HERO_RESPONSIVE_VIEWPORTS.length &&
        heroResponsive.every((entry) =>
          entry.missing === false &&
          entry.currentPath === entry.expectedPath &&
          entry.imageLoaded === true &&
          entry.captionAfterImage === true &&
          entry.captionPosition === "static" &&
          entry.staticFigure === true &&
          entry.afterScrollFullyVisible === true &&
          entry.overflowX === 0 &&
          (!entry.requiresInitialVisibility || entry.initialInViewport === true) &&
          (!entry.requiresCopyBeforeFigure || (
            entry.copyBeforeFigure === true && entry.renderedCopyBeforeFigure === true
          ))
        ),
      "responsive hero image delivery failed",
      heroResponsive
    );
    record("responsive hero image");

    progress("checking mobile menu keyboard");
    const mobileMenu = runCode(
      `async (page) => {
        await page.setViewportSize({ width: 390, height: 900 });
        await page.goto('${baseUrl}', { waitUntil: 'networkidle' });
        await page.locator('[data-nav-toggle]').focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(120);
        const opened = await page.evaluate(() => ({
          expanded: document.querySelector('[data-nav-toggle]')?.getAttribute('aria-expanded') || '',
          hidden: document.querySelector('[data-mobile-menu]')?.hidden ?? true,
          activeText: document.activeElement?.textContent?.trim().replace(/\\s+/g, ' ') || '',
          locked: document.body.classList.contains('is-scroll-locked'),
        }));
        await page.keyboard.press('Escape');
        await page.waitForTimeout(260);
        const closed = await page.evaluate(() => ({
          expanded: document.querySelector('[data-nav-toggle]')?.getAttribute('aria-expanded') || '',
          hidden: document.querySelector('[data-mobile-menu]')?.hidden ?? false,
          activeIsToggle: document.activeElement === document.querySelector('[data-nav-toggle]'),
          locked: document.body.classList.contains('is-scroll-locked'),
        }));
        return { opened, closed };
      }`
    );
    assertCheck(
      mobileMenu.opened.expanded === "true" &&
        mobileMenu.opened.hidden === false &&
        /Research|Projects|Notes|About/.test(mobileMenu.opened.activeText) &&
        mobileMenu.opened.locked === true &&
        mobileMenu.closed.expanded === "false" &&
        mobileMenu.closed.hidden === true &&
        mobileMenu.closed.activeIsToggle === true &&
        mobileMenu.closed.locked === false,
      "mobile menu keyboard path failed",
      mobileMenu
    );
    record("mobile menu keyboard");

    progress("checking no-JS mobile navigation");
    const noJsNavigation = runCode(
      `async (page) => {
        const browser = page.context().browser();
        const widths = ${JSON.stringify(PUBLIC_MOBILE_VIEWPORT_WIDTHS)};
        const routes = ${JSON.stringify(PUBLIC_ROUTES)};
        const results = [];
        for (const width of widths) {
          const context = await browser.newContext({
            javaScriptEnabled: false,
            viewport: { width, height: ${PUBLIC_MOBILE_VIEWPORT_HEIGHT} },
          });
          try {
            for (const route of routes) {
              const noJsPage = await context.newPage();
              await noJsPage.goto('${baseUrl}' + route.slice(1), { waitUntil: 'domcontentloaded' });
              await noJsPage.waitForTimeout(300);
              results.push(await noJsPage.evaluate(({ currentRoute, viewportWidth }) => {
                const links = [...document.querySelectorAll('.site-nav a')].map((link) => {
                  const rect = link.getBoundingClientRect();
                  const style = getComputedStyle(link);
                  return {
                    text: link.textContent.trim().replace(/\\s+/g, ' '),
                    visible: rect.width > 0 &&
                      rect.height > 0 &&
                      style.display !== 'none' &&
                      style.visibility !== 'hidden',
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                  };
                });
                const toggle = document.querySelector('[data-nav-toggle]');
                const toggleRect = toggle?.getBoundingClientRect();
                const toggleStyle = toggle ? getComputedStyle(toggle) : null;
                const toggleVisible = Boolean(toggle && toggleRect && toggleRect.width > 0 && toggleRect.height > 0 && toggleStyle.display !== 'none' && toggleStyle.visibility !== 'hidden');
                return {
                  route: currentRoute,
                  viewportWidth,
                  bodyClass: document.body.className,
                  overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
                  links,
                  visibleLinks: links.filter((link) => link.visible).map((link) => link.text),
                  undersizedLinks: links.filter((link) => link.visible && (link.width < 40 || link.height < 40)),
                  toggleVisible,
                };
              }, { currentRoute: route, viewportWidth: width }));
            }
          } finally {
            await context.close();
          }
        }
        return results;
      }`
    );
    assertCheck(
      Array.isArray(noJsNavigation) &&
        noJsNavigation.length === PUBLIC_ROUTES.length * PUBLIC_MOBILE_VIEWPORT_WIDTHS.length &&
        noJsNavigation.every((entry) =>
          /no-js/.test(entry.bodyClass) &&
            entry.overflowX === 0 &&
            entry.toggleVisible === false &&
            entry.visibleLinks.length >= 4 &&
            entry.undersizedLinks.length === 0
        ),
      "no-JS mobile navigation is not usable",
      noJsNavigation
    );
    record("no-JS mobile navigation");

    progress("checking reduced motion");
    const reduced = runCode(
      `async (page) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('${baseUrl}', { waitUntil: 'networkidle' });
        return await page.evaluate(() => ({
          prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
          heroCopyTranslate: getComputedStyle(document.querySelector('[data-parallax-hero]')).getPropertyValue('--hero-copy-translate').trim(),
          heroPanelTranslate: getComputedStyle(document.querySelector('[data-parallax-hero]')).getPropertyValue('--hero-panel-translate').trim(),
        }));
      }`
    );
    assertCheck(
      reduced.prefersReducedMotion === true &&
        reduced.heroCopyTranslate === "0px" &&
        reduced.heroPanelTranslate === "0px",
      "reduced-motion parallax guard failed",
      reduced
    );
    record("reduced motion");

    console.log("Public browser QA passed.");
    console.log(`URL: ${baseUrl}`);
    console.log(`Routes: ${PUBLIC_ROUTES.join(", ")}`);
    console.log(`Checks: ${checks.join(", ")}`);
    console.log(`Markers: ${MARKERS.join(", ")}`);
  } finally {
    runCli(["close"], { allowFailure: true });
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
