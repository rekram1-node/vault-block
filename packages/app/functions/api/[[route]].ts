import { showRoutes } from "hono/dev";
import { handle } from "hono/cloudflare-pages";
import { authMiddleware, authRouter } from "functions/api/authRouter";
import { factory } from "functions/api/hono";
import { userRouter } from "./userRouter";
import { vaultRouter } from "./vaultRouter";

const app = factory.createApp().basePath("/api");

const appRouter = app
  .use("/user/*", authMiddleware)

  .route("/auth", authRouter)
  .route("/user", userRouter)
  .route("/vaults", vaultRouter);

showRoutes(app);

export const onRequest = handle(app);

export type AppType = typeof appRouter;
