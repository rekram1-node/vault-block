import { showRoutes } from "hono/dev";
import { handle } from "hono/cloudflare-pages";
import { authMiddleware, authRouter } from "functions/api/authRouter";
import { factory } from "functions/api/hono";
import { userRouter } from "./userRouter";
import { vaultRouter } from "./vaultRouter";
import { HTTPException } from "hono/http-exception";

const app = factory.createApp().basePath("/api");

const appRouter = app
  .use("/user/*", authMiddleware)

  .route("/auth", authRouter)
  .route("/user", userRouter)
  .route("/vaults", vaultRouter)
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status);
    }
    return c.json(err, 500);
  });

showRoutes(app);

export const onRequest = handle(app);

export type AppType = typeof appRouter;
