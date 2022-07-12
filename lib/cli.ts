import { Crawler } from "./services/crawler";
import { Message } from "./services/message";
import { program } from "commander";
import ora from "ora";

export class CLI {
  run() {
    program
      .name("mango")
      .description("A fruity and accessible manga downloader")
      .version("0.0.1", "-v, --vers", "output the current version");

    program
      .option("-i, --interactive", "use this cli to interactive mode")
      .option("-o, --output <path>", "outputh path")
      .option(
        "-u, --url <site>",
        "chapter link (it has to be under https://mangareader.to)"
      );

    program.parse();

    const { interactive, url, output } = program.opts();

    if (interactive) {
      throw new Error("Method not Implemented");
    }

    if (!url) {
      console.log("Error: url flag is missing" + "\nPlease try again");
      return;
    }

    this.crawlerAction(url, output);
  }

  async crawlerAction(url: string, output: string) {
    const spinner = ora();
    const message = new Message(spinner);
    const crawler = new Crawler(message);

    message.startMessage();

    crawler.crawl(url, output);
  }
}
