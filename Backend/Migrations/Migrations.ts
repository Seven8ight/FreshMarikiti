import fs from "fs/promises";
import path from "path";
import { connectToDatabase, pgClient } from "../Config/Db";
import { errorMsg, info, warningMsg } from "../Utils/Logger.js";

const migrationsDir = path.join(__dirname, "SQL Tables");

(async () => {
  try {
    await connectToDatabase();

    const sqlFiles = (await fs.readdir(migrationsDir))
      .sort()
      .filter((file) => file.endsWith(".sql"));

    for (let sqlFile of sqlFiles) {
      const sqlFileCommands = await fs.readFile(
        path.join(migrationsDir, sqlFile),
        {
          encoding: "utf-8",
        },
      );

      const tableExists = await pgClient.query(
        "SELECT * FROM migrations WHERE table_name=$1",
        [sqlFile],
      );

      if (tableExists.rowCount && tableExists.rowCount > 0) {
        info(`${sqlFile} already created, skipping....`);
        continue;
      }

      await pgClient.query(sqlFileCommands);

      await pgClient.query("INSERT INTO migrations(table_name) VALUES($1)", [
        sqlFile,
      ]);

      info(`${sqlFile} created successfully`);
    }

    info("Migrations complete");
    process.exit(0);
  } catch (error) {
    warningMsg("Error at creating tables");
    errorMsg((error as Error).message);

    await pgClient.query("ROLLBACK");
  }
})();
