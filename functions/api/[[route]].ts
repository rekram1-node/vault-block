import { showRoutes } from "hono/dev";
import { handle } from "hono/cloudflare-pages";
// import { validator } from "hono/validator";
import { authMiddleware, authRouter } from "functions/api/authRouter";
import { factory } from "functions/api/hono";
import cuid2 from "@paralleldrive/cuid2";
import { userRouter } from "./userRouter";
import { vaultRouter } from "./vaultRouter";

const app = factory.createApp().basePath("/api");

const appRouter = app
  .use("/user/*", authMiddleware)

  .route("/auth", authRouter)
  .route("/user", userRouter)
  .route("/vaults", vaultRouter)

  // TODO: Remove all KV endpoints
  .get("/kv", async (c) => {
    const items = await c.env.VAULT_BLOCK.list();
    return c.json({ items });
  })
  .put("/kv", async (c) => {
    await c.env.VAULT_BLOCK.put(cuid2.createId(), "I got put");
    return c.text("", 200);
  })
  .delete("/kv/:uuid", async (c) => {
    const uuid = c.req.param("uuid");
    if (uuid) await c.env.VAULT_BLOCK.delete(uuid);

    return c.text("", 200);
  });

showRoutes(app);

export const onRequest = handle(app);

export type AppType = typeof appRouter;
