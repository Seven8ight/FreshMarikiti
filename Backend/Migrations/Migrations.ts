import fs from "fs/promises";
import path from "path";
import { connectToDatabase, pgClient } from "../Config/Db.js";
import { errorMsg, info, warningMsg } from "../Utils/Logger.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "SQL Tables");

(async () => {
  try {
    await connectToDatabase();
    console.log(pgClient);
    try {
      await pgClient.query("SELECT * FROM migrations");

      info("Migrations table exists, moving to the next");
    } catch (error) {
      const migrationsSql = await fs.readFile(
        path.join(migrationsDir, "000_create_migrations_table.sql"),
        "utf-8",
      );

      await pgClient.query(migrationsSql);

      info("Migrations table created");
    }

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
    console.log(error);

    await pgClient.query("ROLLBACK");
    process.exit(1);
  }
})();
