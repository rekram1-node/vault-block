import { showRoutes } from "hono/dev";
import { handle } from "hono/cloudflare-pages";
// import { validator } from "hono/validator";
import { authMiddleware, authRouter } from "functions/api/auth";
import { factory } from "functions/api/hono";
import cuid2 from "@paralleldrive/cuid2";

const app = factory.createApp().basePath("/api");

app.use("*", async (c, next) => {
  console.log(c.env);
  console.log(c.var);

  await next();
});

const appRouter = app
  .use("/vaults/*", authMiddleware)
  .use("/user/*", authMiddleware)
  .route("/auth/", authRouter)
  .get("/kv", async (c) => {
    const items = await c.env.VAULT_BLOCK.list();
    return c.json({ items });
  })
  .put("/kv", async (c) => {
    await c.env.VAULT_BLOCK.put(cuid2.createId(), "I got put");
    return c.text("", 200);
  })
  .get("/user", authMiddleware, async (c) => {
    return c.json({ userId: c.var.jwtPayload.sub });
  });

showRoutes(app);

export const onRequest = handle(app);

export type AppType = typeof appRouter;
