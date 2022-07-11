import chalk from "chalk";
import { Ora } from "ora";
import { EventEmitter } from "stream";

export class Message extends EventEmitter {
  spinner: Ora;

  orangeText: chalk.Chalk = chalk.hex("#FF8800");

  constructor(ora: Ora) {
    super();

    this.spinner = ora;
    this.startEvents();
  }

  startEvents() {
    this.on("spin", (num: number) => {
      const textColor = chalk.whiteBright;

      switch (num) {
        case 1:
          this.spinner.start(textColor("Picking berries, setting up blender"));
          break;
        case 2:
          this.spinner.text = textColor("Slicing berries, running the blender");
          break;
        case 3:
          this.spinner.text = textColor("Prepping the glass, pouring smoothie");
          break;
        case 4:
          this.spinner.text = textColor("Adding garnish, finishing touches");
          break;
        case 5:
          this.spinner.text = textColor("Voila, everything is set up!!!");
          this.spinner.stop();
          this.endMessage();
          break;
      }
    });
  }

  startMessage() {
    console.log(this.orangeText.bold("Mango's Command Line"));

    console.log(
      chalk.hex("50B97C")("Prepare your smoothie, its gonna take a bit 🍹")
    );
  }

  endMessage() {
    console.log("\n");
    console.log(chalk.bold("Thank you for using mango ^^"));
    console.log(chalk.bold("Make sure you hit the project with the ★"));
    console.log(this.orangeText.bold("https://github.com/yakemichi/mango"));
    console.log("\n");
    console.log(chalk.bold("Any issues or ideas? Feel free to follow up"));
    console.log(
      this.orangeText.bold("https://github.com/yakemichi/mango/issues")
    );
  }
}
