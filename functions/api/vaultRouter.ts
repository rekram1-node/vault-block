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
import { z } from "zod";

const app = factory.createApp();

const vaults = app
  .get("/:vaultId", async (c) => {
    return c.json({});
  })

  .post(
    "/:vaultId/validate",
    zValidator(
      "param",
      z.object({
        vaultId: VaultSchema._def.shape().id,
      }),
    ),
    zValidator(
      "json",
      VaultSchema.pick({
        passwordHash: true,
      }),
    ),
    async (c) => {
      const vaultId = c.req.param("vaultId");
      const vault = await c.var.db.readVault(vaultId);
      if (!vault) {
        // Even though we would normally return a 404
        // The 401 helps obfuscate if this vault even exists
        // Essentially forces an attacker to know the vaultId and password
        return unauthorized(c);
      }
      const body = c.req.valid("json");

      if (vault.passwordHash !== body.passwordHash) {
        return unauthorized(c);
      }

      if (!vault.encryptedVaultData || !vault.vaultIv || !vault.hdkfSalt) {
        console.error("unexpected application state:", vault);
        return c.json({ error: "unexpected application state" }, 500);
      }

      return c.json({
        name: vault.name,
        encryptedContent: vault.encryptedVaultData,
        iv: vault.vaultIv,
        hdkfSalt: vault.hdkfSalt,
      });
    },
  )

  // TODO: design a way to do partial updates rather
  // than replacements (potentially not necessary...)
  .put("/:vaultId/content", async (c) => {
    return c.json({});
  });

export const vaultRouter = vaults;
