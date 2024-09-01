import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "functions/src/db/schema.ts",
  out: "functions/src/db/migrations",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
