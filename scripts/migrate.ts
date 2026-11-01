import { migrate } from "drizzle-orm/libsql/migrator";

import { client, db } from "../db";

async function main() {
  console.log("Aplicando migraciones…");
  await migrate(db, { migrationsFolder: "./db/migrations" });
  console.log("Listo.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.close());
