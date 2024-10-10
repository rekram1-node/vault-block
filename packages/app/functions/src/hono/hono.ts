import { type Context as HonoContext } from "hono";
import { createFactory } from "hono/factory";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { drizzle } from "drizzle-orm/d1";
import { csrf } from "hono/csrf";

import { Repository } from "functions/src/db/repository";
import * as schema from "functions/src/db/schema";
import { HTTPException } from "hono/http-exception";
import { type Session } from "functions/src/hono/sessionMgmt";

export type Env = {
  Bindings: CloudflareEnv & {
    VAULT_BLOCK_URL?: string;
    REDIRECT_URL?: string;
    CF_PAGES_URL?: string;
    DRIZZLE_LOG?: boolean;
    NODE_ENV?: string;
  };
  Variables: {
    session: Session;
    db: Repository;
  };
};

export type Context = HonoContext<Env>;

export const factory = createFactory<Env>({
  initApp: (app) => {
    app.use(logger()).use(requestId()).use(csrf());

    app.use(async (c, next) => {
      c.set("db", new Repository(drizzle(c.env.DB, { schema })));

      await next();
    });

    app.onError((err, c) => {
      if (err instanceof HTTPException) {
        return err.getResponse();
      }
      return c.json(
        {
          error: `Encountered error: ${err.message}`,
          stack: err.stack,
        },
        500,
      );
    });

    app.notFound((c) => {
      return c.json(
        {
          error: `Not Found: ${c.req.path}`,
        },
        404,
      );
    });
  },
});
