import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { handle } from "hono/cloudflare-pages";
import { trpcServer } from "@hono/trpc-server";
import { apiRouter } from "functions/src/router";

const app = new Hono().basePath("/api").use(logger()).use(requestId());

app.use("*", (c, next) => {
  console.log(c.env.TURSO_DATABASE_URL);
  return next();
});

app.use(
  "/trpc/*",
  trpcServer({
    router: apiRouter,
    endpoint: "/api/trpc",
  }),
);

showRoutes(app);

export const onRequest = handle(app);
