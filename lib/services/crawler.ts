import {
  BROWSER_LAUNCH_SETTINGS,
  MANGAREADER_SITE_SETTINGS,
} from "../utils/config";
import { generateTempDirectory, convertFolderToPDF } from "../utils/utils";
import { Message } from "./message";
import puppeteer from "puppeteer";
import path from "path";
import he from "he";
import os from "os";

// mangareader.to web-crawler module
export class Crawler {
  message: Message;
  outputDir: string = path.join(os.homedir(), "Desktop");
  baseUrl: string = "https://mangareader.to";

  constructor(message: Message) {
    this.message = message;
  }

  private validateURL(site: string): boolean {
    const url = new URL(site);

    const statement =
      url.hostname == "mangareader.to" &&
      url.pathname.split("/").includes("read");

    return statement;
  }

  private async setLocalStorage(
    browserPage: puppeteer.Page,
    kv: [string, string]
  ) {
    await browserPage.evaluate((kv: string[]) => {
      localStorage.setItem(kv[0], kv[1]);
    }, kv);
  }

  private async setCrawlSettings(browserPage: puppeteer.Page) {
    await browserPage.setViewport({
      height: 1080,
      width: 1920,
      deviceScaleFactor: 2,
    });

    await browserPage.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36"
    );
  }

  crawl(site: string, outputDir?: string) {
    const isValid = this.validateURL(site);

    if (!isValid) {
      throw new Error(
        "The link should be under 'https://mangareader.to/read' :3"
      );
    }

    if (outputDir) {
      this.outputDir = outputDir;
    }

    (async () => {
      this.message.emit("spin", 1);

      const browser = await puppeteer.launch(BROWSER_LAUNCH_SETTINGS);

      const browserPage = await browser.newPage();

      await this.setCrawlSettings(browserPage);

      await browserPage.goto(this.baseUrl);

      await this.setLocalStorage(browserPage, [
        "settings",
        JSON.stringify(MANGAREADER_SITE_SETTINGS),
      ]);

      await browserPage.goto(site);

      await this.crawlInternal(browserPage);

      this.message.emit("spin", 5);

      browser.close();
    })();
  }

  async crawlInternal(browserPage: puppeteer.Page) {
    this.message.emit("spin", 2);

    const siteData = await browserPage.evaluate(() => {
      const chapter = document.querySelector(".container-reader-chapter");
      const payload = document.querySelector("#syncData");

      if (chapter != null && payload != null) {
        const data = JSON.parse(payload?.textContent as string);
        const pageLength = Array.from(chapter.children).length;

        Object.assign(data, { pageLength });

        return data;
      }
    });

    await this.deleteHTMLParentNode(browserPage, ["#header"]);

    await this.scrollToBottom(browserPage);

    this.message.emit("spin", 3);

    await this.screenshotPages(browserPage, siteData);
  }

  async screenshotPages(
    browserPage: puppeteer.Page,
    mangaData: Record<string, number | string>
  ) {
    const folderDir = await generateTempDirectory();

    mangaData.name = he.decode(mangaData.name as string);

    const filename = `${mangaData.name} Chapter ${mangaData.chapter}`.concat(
      ".pdf"
    );

    for (let i = 1; i < (mangaData.pageLength as number) + 1; i++) {
      const tempFilename = `${mangaData.name} (Chapter ${mangaData.chapter}) (Page ${i})`;
      const tempDir = path.join(folderDir, tempFilename.concat(".jpeg"));

      const element = await browserPage.$(
        `div.iv-card:nth-child(${i}) > canvas:nth-child(2)`
      );

      if (element != null) {
        await element.screenshot({ path: tempDir, quality: 100, type: "jpeg" });
      }
    }

    this.message.emit("spin", 4);

    convertFolderToPDF(folderDir, path.join(this.outputDir, filename));
  }

  async scrollToBottom(browserPage: puppeteer.Page) {
    await browserPage.evaluate(async () => {
      await new Promise<void>(function (resolve): void {
        let totalHeight = 0;
        let distance = 100;
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  async deleteHTMLParentNode(browserPage: puppeteer.Page, selectors: string[]) {
    await browserPage.evaluate((selectors: string[]) => {
      for (let i = 0; i < selectors.length; i++) {
        const parentEl = document.querySelectorAll(selectors[i]);

        for (let j = 0; j < parentEl.length; j++) {
          parentEl[j].outerHTML = "";
        }
      }

      return document.documentElement.outerHTML;
    }, selectors);
  }
}
