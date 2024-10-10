/*
  These are the "public" routes that are not guarded by Notion Oauth.
  Not to be confused with the other vault routes we have defined in 
  userRouter (I may tweak the naming down the line to avoid confusion).
  All endpoints are here to serve the End to End encrypted Rich Text Editor
  that Vault Block provides within your notion documents or as a link you
  can access outside of Notion.
*/
import { zValidator } from "@hono/zod-validator";
import { applyPatch, type Operation } from "rfc6902";

import { factory } from "functions/src/hono/hono";
import { VaultSchema, VaultIdSchema } from "functions/src/types/vault";
import { OperationsSchema } from "functions/src/types/operation";
import { Unauthorized } from "../types/errors";
import { HTTPException } from "hono/http-exception";
import { VaultNotFoundError } from "functions/src/db/repository";

const app = factory.createApp();

const vaults = app
  .get("/:vaultId", async (c) => {
    return c.json({});
  })

  .post(
    "/:vaultId/validate",
    zValidator("param", VaultIdSchema),
    zValidator(
      "json",
      VaultSchema.pick({
        passwordHash: true,
      }),
    ),
    async (c) => {
      const vaultId = c.req.param("vaultId");
      const readResult = await c.var.db.readVault(vaultId);
      if (!readResult.ok) {
        if (readResult.error instanceof VaultNotFoundError) {
          // Even though we would normally return a 404
          // The 401 helps obfuscate if this vault even exists
          // Essentially forces an attacker to know the vaultId and password
          throw Unauthorized;
        }
        throw new HTTPException(500, { message: readResult.error.message });
      }
      const vault = readResult.data;
      const body = c.req.valid("json");

      if (vault.passwordHash !== body.passwordHash) {
        throw Unauthorized;
      }

      if (!vault.vaultData || !vault.vaultIv || !vault.hdkfSalt) {
        console.error("unexpected application state:", vault);
        throw new HTTPException(500, {
          message: "unexpected application state",
        });
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
    zValidator("param", VaultIdSchema),
    zValidator("json", OperationsSchema),
    async (c) => {
      const { vaultId } = c.req.valid("param");
      const operations = c.req.valid("json") as Operation[];

      if (operations.length === 0) {
        return c.body(null, 204);
      }

      const readResult = await c.var.db.readVaultData(vaultId);
      if (!readResult.ok) {
        if (readResult.error instanceof VaultNotFoundError) {
          // Same reasoning as previous 401 instead of 404
          throw Unauthorized;
        }
        throw new HTTPException(500, { message: readResult.error.message });
      }
      const vault = readResult.data;

      if (!vault.vaultData) {
        throw new HTTPException(500, {
          message: "invalid application state: null vaultData",
        });
      }

      // TODO: do patches in sqlite
      const patchResults = applyPatch(vault.vaultData, operations);
      for (const result of patchResults) {
        if (result !== null) {
          throw new HTTPException(400, {
            message: "failed to apply patch: " + JSON.stringify(result),
          });
        }
      }
      // TODO: error handling?
      await c.var.db.updateVault(vaultId, vault.vaultData);

      return c.body(null, 204);
    },
  );

export const vaultRouter = vaults;
