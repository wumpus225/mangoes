import { PuppeteerLaunchOptions } from "puppeteer";

export const BROWSER_LAUNCH_SETTINGS: PuppeteerLaunchOptions = {
  headless: true,
  args: [
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-setuid-sandbox",
    "--no-first-run",
    "--no-sandbox",
    "--no-zygote",
    "--deterministic-fetch",
    "--disable-features=IsolateOrigins",
    "--disable-site-isolation-trials",
  ],
};

export const MANGAREADER_SITE_SETTINGS = {
  readingMode: "vertical",
  readingDirection: "rtl",
  quality: "medium",
  hozPageSize: 1,
};
