import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { handle } from "hono/cloudflare-pages";
import { trpcServer } from "@hono/trpc-server";
import { apiRouter } from "functions/src/router";

const app = new Hono().basePath("/api").use(logger()).use(requestId());

app.use("*", clerkMiddleware());

app.use("*", async (c, next) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json(
      {
        message: "You are not logged in.",
      },
      401,
    );
  }

  await next();
});

app.use(
  "/trpc/*",
  trpcServer({
    router: apiRouter,
    endpoint: "/api/trpc",
  }),
);

app.get("/", (c) => {
  const auth = getAuth(c);
  return c.json({
    message: "logged in",
    userId: auth?.userId,
  });
});

showRoutes(app);

export const onRequest = handle(app);
