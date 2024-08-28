import { showRoutes } from "hono/dev";
import { handle } from "hono/cloudflare-pages";
// import { validator } from "hono/validator";
import { authMiddleware, authRouter } from "functions/api/auth";
import { factory } from "functions/api/hono";

const app = factory.createApp().basePath("/api");

const appRouter = app
  .use("/vaults/*", authMiddleware)
  .use("/user/*", authMiddleware)
  .route("/auth/", authRouter)
  .get("/user", authMiddleware, async (c) => {
    return c.json({ userId: c.var.jwtPayload.sub });
  });

showRoutes(app);

export const onRequest = handle(app);

export type AppType = typeof appRouter;
