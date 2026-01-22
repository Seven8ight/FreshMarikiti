import chalk from "chalk";

const date = new Date();

export const errorMsg = (error: string) =>
    process.stdout.write(
      `${chalk.redBright.underline("Error")} [${chalk.grey(
        date.toUTCString(),
      )}]: ${chalk.whiteBright(error)}\n`,
    ),
  warningMsg = (message: string) =>
    process.stdout.write(
      `${chalk.yellowBright.underline("Warning")} [${chalk.grey(
        date.toUTCString(),
      )}]: ${chalk.whiteBright(message)}\n`,
    ),
  info = (message: string) =>
    process.stdout.write(
      `${chalk.blueBright.underline("Info")} [${chalk.grey(
        date.toUTCString(),
      )}]: ${chalk.whiteBright(message)}\n`,
    );
