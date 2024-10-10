import { showRoutes } from "hono/dev";
import { handle } from "hono/cloudflare-pages";
import { authMiddleware, authRouter } from "functions/src/routes/authRouter";
import { factory } from "functions/src/hono/hono";
import { userRouter } from "../src/routes/userRouter";
import { vaultRouter } from "../src/routes/vaultRouter";

const app = factory.createApp().basePath("/api");

const appRouter = app
  .route("/auth", authRouter)
  .route("/vaults", vaultRouter)

  .use("/user/*", authMiddleware)
  .route("/user", userRouter);

showRoutes(app);

export const onRequest = handle(app);

export type AppType = typeof appRouter;
