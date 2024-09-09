import { zValidator } from "@hono/zod-validator";
import { factory } from "functions/api/hono";
import { Notion } from "functions/src/lib/notion";
import { VaultSchema, VaultIdSchema } from "functions/src/types/vault";
import { PageSchema } from "shared/types/Page";
import { z } from "zod";

const v = factory.createApp();

interface Vault {
  id: string;
  name: string;
  notionPageId: string | null;
  updatedAt: Date;
  initialized: boolean;
}

const vaults = v
  .get("/", async (c) => {
    const vaultArr: Vault[] = [];
    const vaults = await c.var.db.readAllVaults(c.var.userId);
    for (const vault of vaults) {
      vaultArr.push({
        id: vault.id,
        name: vault.name,
        notionPageId: vault.notionPageId,
        updatedAt: vault.updatedAt,
        initialized: vault.hdkfSalt !== null,
      });
    }
    return c.json(vaultArr);
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
        passwordHash: true,
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");

      const numVaults = await c.var.db.readNumberOfVaults(c.var.userId);
      if (numVaults >= c.env.MAX_PAGES) {
        return c.json({ error: "max number of vaults reached" }, 403);
      }

      await c.var.db.createVault({
        id: body.id,
        name: body.name,
        userId: c.var.userId,
        vaultData: body.encryptedVaultData,
        hdkfSalt: body.hdkfSalt,
        vaultIv: body.vaultIv,
        passwordHash: body.passwordHash,
      });

      return c.body(null, 201);
    },
  )

  .post(
    "/:vaultId/initialize",
    zValidator("param", VaultIdSchema),
    zValidator(
      "json",
      VaultSchema.pick({
        encryptedVaultData: true,
        hdkfSalt: true,
        vaultIv: true,
        passwordHash: true,
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      const id = c.req.param("vaultId");

      const numVaults = await c.var.db.readNumberOfVaults(c.var.userId);
      if (numVaults >= c.env.MAX_PAGES) {
        return c.json({ error: "max number of vaults reached" }, 403);
      }

      const vault = await c.var.db.activateVault(id, {
        hdkfSalt: body.hdkfSalt,
        vaultIv: body.vaultIv,
        vaultData: body.encryptedVaultData,
        passwordHash: body.passwordHash,
      });
      if (!vault) {
        return c.json({ error: "failed to initialize vault" }, 500);
      }

      if (vault.notionPageId) {
        const notion = new Notion(c);
        const result = await notion.AppendEmbeddedBlock(vault.notionPageId, id);
        if (!result.isOk) {
          console.error("failed to append vault to notion:", result.error);
          return c.json({ error: result.error }, 500);
        }
      }

      return c.body(null, 204);
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

  .post("/", zValidator("json", z.array(PageSchema)), async (c) => {
    const notionPages = c.req.valid("json");
    const createVaultPromises = notionPages.map(async (notionPage) => {
      const vault = await c.var.db.createVault({
        userId: c.var.userId,
        notionPageId: notionPage.id,
        name: notionPage.name,
      });

      if (!vault) {
        throw new Error("Failed to create vault");
      }

      return vault;
    });
    try {
      await Promise.all(createVaultPromises);
    } catch (error) {
      return c.json({ error: "Failed to create one or more vaults" }, 500);
    }

    return c.body(null, 201);
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
const u = factory.createApp();

const users = u.route("/vaults", vaults).route("/notion", notionRoutes);

export const userRouter = users;
