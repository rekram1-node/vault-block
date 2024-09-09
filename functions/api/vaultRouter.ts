/*
  These are the "public" routes that are not guarded by Notion Oauth.
  Not to be confused with the other vault routes we have defined in 
  userRouter (I may tweak the naming down the line to avoid confusion).
  All endpoints are here to serve the End to End encrypted Rich Text Editor
  that Vault Block provides within your notion documents or as a link you
  can access outside of Notion.
*/
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { applyPatch, type Operation } from "rfc6902";

import { factory } from "functions/api/hono";
import { VaultSchema } from "functions/src/types/vault";
import { OperationsSchema } from "functions/src/types/operation";
import { unauthorized } from "./authRouter";

const vaultIdSchema = z.object({
  vaultId: VaultSchema._def.shape().id,
});

const app = factory.createApp();

const vaults = app
  .get("/:vaultId", async (c) => {
    return c.json({});
  })

  .post(
    "/:vaultId/validate",
    zValidator("param", vaultIdSchema),
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

      if (!vault.vaultData || !vault.vaultIv || !vault.hdkfSalt) {
        console.error("unexpected application state:", vault);
        return c.json({ error: "unexpected application state" }, 500);
      }

      return c.json({
        name: vault.name,
        encryptedContent: vault.vaultData,
        iv: vault.vaultIv,
        hdkfSalt: vault.hdkfSalt,
      });
    },
  )

  .post(
    "/:vaultId/content",
    zValidator("param", vaultIdSchema),
    zValidator("json", OperationsSchema),
    async (c) => {
      const { vaultId } = c.req.valid("param");
      const operations = c.req.valid("json") as Operation[];

      if (operations.length === 0) {
        return c.body(null, 204);
      }

      const vault = await c.var.db.readVaultData(vaultId);
      if (!vault) {
        // Same reasoning as previous 401 instead of 404
        return unauthorized(c);
      }

      if (!vault.vaultData) {
        return c.json(
          { error: "invalid application state: null vaultData" },
          500,
        );
      }

      // TODO: do patches in sqlite
      const patchResults = applyPatch(vault.vaultData, operations);
      for (const result of patchResults) {
        if (result !== null) {
          return c.json(
            {
              error: "failed to apply patch: " + JSON.stringify(result),
            },
            400,
          );
        }
      }
      // TODO: error handling?
      await c.var.db.updateVault(vaultId, vault.vaultData);

      return c.body(null, 204);
    },
  );

export const vaultRouter = vaults;
