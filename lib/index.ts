import { Crawler } from "./services/crawler";

const manga = new Crawler();

const url =
  "https://mangareader.to/read/shikimoris-not-just-a-cutie-1358/en/chapter-2";

manga.crawl(url);
