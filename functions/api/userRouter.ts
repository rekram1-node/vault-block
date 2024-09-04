import { zValidator } from "@hono/zod-validator";
import { factory } from "functions/api/hono";
import { Notion } from "functions/src/lib/notion";
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
  });

const n = factory.createApp();

const notionRoutes = n
  .get("/", async (c) => {
    const notion = new Notion(c);
    const result = await notion.ReadPages();
    if (!result.isOk) {
      console.error("failed to read pages from notion:", result.error);
      return c.json({ error: result.error }, 500);
    }

    return c.json(result.data);
  })
  .post("/:vaultId/:pageId", async (c) => {
    const vaultId = c.req.param("vaultId");
    const pageId = c.req.param("pageId");
    if (!vaultId || !pageId) {
      return c.json(
        { error: "missing a required parameter (vaultId, pageId)" },
        400,
      );
    }
    const notion = new Notion(c);
    const result = await notion.AppendEmbeddedBlock(pageId, vaultId);
    if (!result.isOk) {
      console.error("failed to append vault to notion:", result.error);
      return c.json({ error: result.error }, 500);
    }

    return c.body(null, 201);
  });

// Endpoints only visible for the user regarding vaults
// Other endpoints are available for anyone with the password
// const internalVaultEndpoints = app
const u = factory.createApp();

const users = u.route("/vaults", vaults).route("/notion", notionRoutes);

export const userRouter = users;
