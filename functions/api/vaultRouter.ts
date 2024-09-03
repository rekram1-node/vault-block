import { factory } from "functions/api/hono";

const app = factory.createApp();

const vaults = app
  // Rich Text Endpoints (should have separate router)
  .get("/:vaultId", async (c) => {
    return c.json({});
  })
  // TODO: design a way to do partial updates rather
  // than replacements (potentially not necessary...)
  .put("/:vaultId", async (c) => {
    return c.json({});
  });

export const vaultRouter = vaults;
