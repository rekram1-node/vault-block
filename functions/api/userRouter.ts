import { zValidator } from "@hono/zod-validator";
import { factory } from "functions/api/hono";
import { VaultSchema } from "functions/src/types/vault";

const v = factory.createApp();

const vaults = v
  .get("/", async (c) => {
    const vaults = await c.var.db.readAllVaults(c.var.userId);
    return c.json(vaults);
  })
  .post(
    "/",
    zValidator(
      "json",
      VaultSchema.pick({
        id: true,
        name: true,
        encryptedVaultData: true,
        hdkfSalt: true,
        vaultIv: true,
        // vaultSalt: true,
        passwordHash: true,
        // passwordSalt: true,
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");

      await c.var.db.createVault({
        id: body.id,
        name: body.name,
        userId: c.var.userId,
        encryptedVaultData: body.encryptedVaultData,
        hdkfSalt: body.hdkfSalt,
        // vaultSalt: body.vaultSalt,
        vaultIv: body.vaultIv,
        passwordHash: body.passwordHash,
        // passwordSalt: body.passwordSalt,
      });

      return c.body(null, 201);
    },
  )
  .delete("/:vaultId", async (c) => {
    const vaultId = c.req.param("vaultId");
    if (!vaultId) {
      return c.json({ error: "invalid or missing validId" }, 400);
    }
    const result = await c.var.db.deleteVault(c.var.userId, vaultId);
    if (result.rowsAffected === 0) {
      return c.json({ error: "vault does not exist" }, 404);
    }

    return c.body(null, 204);
  })
  .post("/:vaultId/notion/:pageId", async (c) => {
    const vaultId = c.req.param("vaultId");
    const pageId = c.req.param("pageId");
    return c.json({});
  });

// Endpoints only visible for the user regarding vaults
// Other endpoints are available for anyone with the password
// const internalVaultEndpoints = app
const u = factory.createApp();

const users = u
  .get("/", async (c) => {
    return c.json({
      userId: c.var.jwtPayload.sub,
    });
  })
  .route("/vaults", vaults);

export const userRouter = users;
