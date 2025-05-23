/*
 * puppeteer.ts
 *
 * Copyright (C) 2020-2022 Posit Software, PBC
 */

import { readRegistryKey } from "./windows.ts";
import { safeExistsSync, which } from "./path.ts";
import { debug, error, info } from "../deno_ral/log.ts";
import { existsSync } from "../deno_ral/fs.ts";
import { UnreachableError } from "./lib/error.ts";
import { quartoDataDir } from "./appdirs.ts";
import { isMac, isWindows } from "../deno_ral/platform.ts";
import puppeteer from "puppeteer";

// deno-lint-ignore no-explicit-any
// let puppeteerImport: any = undefined;
// deno-lint-ignore prefer-const
// let puppeteerUrl = "puppeteer";
export async function getPuppeteer() {
  return puppeteer;
  // if (puppeteerImport !== undefined) {
  //   return puppeteerImport;
  // }
  // puppeteerImport = (await import(puppeteerUrl)).default;
  // return puppeteerImport;
}

/**
 * Extracts images and elements from an URL
 *
 * @param urlOrOptions webpage url or page options
 * @param selector css selector
 * @param filenames filenames to write screenshots to
 * @returns html content of selected results
 */
export async function extractImagesFromElements(
  urlOrOptions: string | PageOptions,
  selector: string,
  filenames: string[],
): Promise<string[]> {
  return await withPuppeteerBrowserAndPage(
    urlOrOptions,
    // deno-lint-ignore no-explicit-any
    async (_browser: any, page: any) => {
      const elements = await page.$$(selector);
      if (elements.length !== filenames.length) {
        throw new Error(
          `extractImagesFromElements was given ${filenames.length} filenames, but selector yielded ${elements.length} elements.`,
        );
      }
      for (let i = 0; i < elements.length; ++i) {
        await elements[i].screenshot({ path: filenames[i] });
      }

      // deno-lint-ignore no-explicit-any
      const document = undefined as any;
      const clientSideResult = await page.evaluate((selector: string) => {
        // deno-lint-ignore no-explicit-any
        return Array.from(document.querySelectorAll(selector)).map((n: any) =>
          n.outerHTML
        );
      }, selector);
      return clientSideResult;
    },
  );
}

export function extractHtmlFromElements(
  url: string,
  selector: string,
): Promise<string[]> {
  // deno-lint-ignore no-explicit-any
  const document = undefined as any;
  return inPuppeteer(url, (selector: string) => {
    // deno-lint-ignore no-explicit-any
    return Array.from(document.querySelectorAll(selector)).map((n: any) =>
      n.outerHTML
    );
  }, selector);
}

export interface PageOptions {
  url: string;
  viewport?: {
    // https://github.com/puppeteer/puppeteer/blob/v0.12.0/docs/api.md#pagesetviewportviewport
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
}
export async function withPuppeteerBrowserAndPage<T>(
  url: string | PageOptions,
  // deno-lint-ignore no-explicit-any
  f: (b: any, p: any) => Promise<T>,
): Promise<T> {
  const allowedErrorMessages = [
    "Navigation failed because browser has disconnected!",
    "Navigation timeout of 30000 ms exceeded",
    "Evaluation failed: undefined",
  ];

  let attempts = 0;
  const maxAttempts = 5;
  while (attempts++ < maxAttempts) {
    try {
      let finished = false;
      let result: T;
      // deno-lint-ignore no-explicit-any
      await withHeadlessBrowser(async (browser: any) => {
        const page = await browser.newPage();
        if (typeof url === "string") {
          await page.goto(url);
        } else {
          if (url.viewport) {
            page.setViewport(url.viewport);
          }
          await page.goto(url.url);
        }
        result = await f(browser, page);
        finished = true;
      });
      if (finished) {
        return result!;
      }
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      if (
        (allowedErrorMessages.indexOf(error.message) !== -1) &&
        (attempts < maxAttempts)
      ) {
        console.log(
          `\nEncountered a bad error message from puppeteer: "${error.message}"\n Retrying ${attempts}/${maxAttempts}`,
        );
      } else {
        throw error;
      }
    }
  }
  throw new UnreachableError();
}

export async function inPuppeteer(
  url: string,
  // deno-lint-ignore no-explicit-any
  f: any,
  // deno-lint-ignore no-explicit-any
  ...params: any[]
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  const allowedErrorMessages = [
    "Navigation failed because browser has disconnected!",
    "Navigation timeout of 30000 ms exceeded",
    "Evaluation failed: undefined",
  ];

  let attempts = 0;
  const maxAttempts = 5;
  while (attempts++ < maxAttempts) {
    try {
      // deno-lint-ignore no-explicit-any
      return await withHeadlessBrowser(async (browser: any) => {
        const page = await browser.newPage();
        await page.goto(url);
        const clientSideResult = await page.evaluate(f, ...params);
        return clientSideResult;
      });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      if (
        (allowedErrorMessages.indexOf(error.message) !== -1) &&
        (attempts < maxAttempts)
      ) {
        console.log(
          `\nEncountered a bad error message from puppeteer: "${error.message}"\n Retrying ${attempts}/${maxAttempts}`,
        );
      } else {
        throw error;
      }
    }
  }
  throw new UnreachableError();
}

export async function withHeadlessBrowser<T>(
  // deno-lint-ignore no-explicit-any
  fn: (browser: any) => Promise<T>,
) {
  const browser = await fetchBrowser();
  if (browser !== undefined) {
    try {
      const result = await fn(browser);
      await browser.close();
      return result;
    } catch (e) {
      // we can't try ... finally here because it plays badly with async
      // and return values.
      await browser.close();
      throw e;
    }
  }
}

interface ChromeInfo {
  path: string | undefined;
  source: string | undefined;
}

export async function findChrome(): Promise<ChromeInfo> {
  let path;
  let source;
  // First check env var and use this path if specified
  const envPath = Deno.env.get("QUARTO_CHROMIUM");
  if (envPath) {
    debug("[CHROMIUM] Using path specified in QUARTO_CHROMIUM");
    if (safeExistsSync(envPath)) {
      debug(`[CHROMIUM] Found at ${envPath}, and will be used.`);
      return { path: envPath, source: "QUARTO_CHROMIUM" };
    } else {
      debug(
        `[CHROMIUM] Not found at ${envPath}. Check your environment variable valye. Searching now for another binary.`,
      );
    }
  }
  // Otherwise, try to find the path based on OS.
  if (isMac) {
    const programs = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];
    path = programs.find(safeExistsSync);
    source = "MacOS known location";
  } else if (isWindows) {
    // Try the HKLM key
    const programs = ["chrome.exe", "msedge.exe"];
    for (let i = 0; i < programs.length; i++) {
      path = await readRegistryKey(
        "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\" +
          programs[i],
        "(Default)",
      );
      if (path && safeExistsSync(path)) {
        source = "Windows Registry";
        break;
      }
    }

    // Try the HKCR key
    if (!path) {
      const regKeys = ["ChromeHTML", "MSEdgeHTM"];
      for (let i = 0; i < regKeys.length; i++) {
        path = await readRegistryKey(
          `HKCR\\${regKeys[i]}\\shell\\open\\command`,
          "(Default)",
        );
        path = path?.match(/"(.*)"/);
        path = path ? path[1] : undefined;
        if (path && existsSync(path)) {
          source = "Windows Registry";
          break;
        }
      }
    }
  } else {
    // in 1.28.2, this is (isLinux)
    // in 1.32, there's other non-linux unixes
    path = await which("google-chrome");
    if (!path) {
      path = await which("chromium-browser");
    }
    if (path && existsSync(path)) {
      source = "PATH";
    }
  }
  if (path) {
    debug("[CHROMIUM] Found Chromium on OS known location");
    debug(`[CHROMIUM] Path: ${path}`);
  } else {
    debug("[CHROMIUM] Chromium not found on OS known location");
  }
  return { path: path, source: source };
}

export async function getBrowserExecutablePath() {
  // Cook up a new instance
  const browserFetcher = await fetcher();
  const availableRevisions = await browserFetcher.localRevisions();

  let executablePath: string | undefined = undefined;

  if (executablePath === undefined) {
    executablePath = (await findChrome()).path;
  }

  if (executablePath === undefined && availableRevisions.length > 0) {
    // get the latest available revision
    availableRevisions.sort((a: string, b: string) => Number(b) - Number(a));
    const revision = availableRevisions[0];
    const revisionInfo = browserFetcher.revisionInfo(revision);
    executablePath = revisionInfo.executablePath;
  }

  if (executablePath === undefined) {
    error("Chrome not found");
    info(
      "\nNo Chrome or Chromium installation was detected.\n\nPlease run 'quarto install chromium' to install Chromium.\n",
    );
    throw new Error();
  }

  return executablePath;
}

async function fetchBrowser() {
  const executablePath = await getBrowserExecutablePath();
  const puppeteer = await getPuppeteer();
  return await puppeteer.launch({
    product: "chrome",
    executablePath,
  });
}

export async function fetcher() {
  const options = {
    path: chromiumInstallDir(),
  };
  const fetcher = (await getPuppeteer()).createBrowserFetcher(options);
  return fetcher;
}

export function chromiumInstallDir(): string | undefined {
  return quartoDataDir("chromium");
}
