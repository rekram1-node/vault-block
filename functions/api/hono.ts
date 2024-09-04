import { type Context as HonoContext } from "hono";
import { createFactory } from "hono/factory";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { Queries } from "functions/src/db/queries";
import { type JwtHeader, type JwtPayload } from "shared/types/jwt";
import * as schema from "functions/src/db/schema";

export type Env = {
  Bindings: {
    VAULT_BLOCK: KVNamespace;
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN?: string;
    MAX_PAGES: number;
    NOTION_CLIENT_ID: string;
    NOTION_CLIENT_SECRET: string;
    REDIRECT_URL?: string;
    CF_PAGES_URL?: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    NOTION_API_VERSION?: string;
    VAULT_BLOCK_URL?: string;
  };
  Variables: {
    jwtHeader: JwtHeader;
    jwtPayload: JwtPayload;
    userId: string;
    token: string;
    db: Queries;
  };
};

export type Context = HonoContext<Env>;

export const factory = createFactory<Env>({
  initApp: (app) => {
    app.use(logger()).use(requestId());

    app.use(async (c, next) => {
      const url = c.env.TURSO_DATABASE_URL?.trim();
      if (url === undefined) {
        throw new Error("TURSO_DATABASE_URL env var is not defined");
      }

      const authToken = c.env.TURSO_AUTH_TOKEN?.trim();
      if (authToken == undefined) {
        throw new Error("TURSO_AUTH_TOKEN env var is not defined");
      }

      const client = createClient({ url, authToken });
      c.set("db", new Queries(drizzle(client, { schema })));

      await next();
    });
  },
});
