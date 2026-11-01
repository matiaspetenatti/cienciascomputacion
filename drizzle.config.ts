import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL ?? "file:./.data/local.db";
const isRemote = url.startsWith("libsql://") || url.startsWith("https://");

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  verbose: true,
  strict: true,
  ...(isRemote
    ? {
        dialect: "turso",
        dbCredentials: { url, authToken: process.env.TURSO_AUTH_TOKEN },
      }
    : {
        dialect: "sqlite",
        dbCredentials: { url },
      }),
});
