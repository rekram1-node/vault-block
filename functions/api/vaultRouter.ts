/*
  These are the "public" routes that are not guarded by Notion Oauth.
  Not to be confused with the other vault routes we have defined in 
  userRouter (I may tweak the naming down the line to avoid confusion).
  All endpoints are here to serve the End to End encrypted Rich Text Editor
  that Vault Block provides within your notion documents or as a link you
  can access outside of Notion.
*/
import { zValidator } from "@hono/zod-validator";

import { factory } from "functions/api/hono";
import { VaultSchema } from "functions/src/types/vault";
import { unauthorized } from "./authRouter";

const app = factory.createApp();

const vaults = app
  .get("/:vaultId", async (c) => {
    return c.json({});
  })

  .post(
    "/:vaultId/validate",
    zValidator("param", VaultSchema.pick({ id: true })),
    zValidator(
      "json",
      VaultSchema.pick({
        passwordHash: true,
      }),
    ),
    async (c) => {
      const id = c.req.param("vaultId");
      const vault = await c.var.db.readVault(id);
      if (!vault) {
        return c.json({ error: "vault does not exist" }, 404);
      }
      const body = c.req.valid("json");

      if (vault.passwordHash !== body.passwordHash) {
        return unauthorized(c);
      }

      return c.json({
        name: vault.name,
        encryptedContent: vault.encryptedVaultData,
        iv: vault.vaultIv,
      });
    },
  )

  // TODO: design a way to do partial updates rather
  // than replacements (potentially not necessary...)
  .put("/:vaultId", async (c) => {
    return c.json({});
  });

export const vaultRouter = vaults;
