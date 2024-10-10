import { zValidator } from "@hono/zod-validator";
import { type Context, factory } from "functions/src/hono/hono";
import { Notion } from "functions/src/lib/notion";
import { VaultSchema, VaultIdSchema } from "functions/src/types/vault";
import { HTTPException } from "hono/http-exception";
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

async function readNumberOfVaults(c: Context) {
  const result = await c.var.db.readNumberOfVaults(c.var.session.userId);
  if (!result.ok) {
    throw new HTTPException(500, { message: result.error.message });
  }
  const numVaults = result.data;
  if (numVaults >= c.env.MAX_PAGES) {
    throw new HTTPException(403, {
      message: "max number of vaults reached",
    });
  }
  return numVaults;
}

const vaults = v
  .get("/", async (c) => {
    const vaultArr: Vault[] = [];
    const result = await c.var.db.readAllVaults(c.var.session.userId);
    if (!result.ok) {
      throw new HTTPException(500, { message: result.error.message });
    }
    const vaults = result.data;

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
      await readNumberOfVaults(c);

      const result = await c.var.db.createVault({
        id: body.id,
        name: body.name,
        userId: c.var.session.userId,
        vaultData: body.encryptedVaultData,
        hdkfSalt: body.hdkfSalt,
        vaultIv: body.vaultIv,
        passwordHash: body.passwordHash,
      });
      if (!result.ok) {
        throw new HTTPException(500, { message: "Failed to create vault" });
      }

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

      await readNumberOfVaults(c);

      const vaultResult = await c.var.db.activateVault(id, {
        hdkfSalt: body.hdkfSalt,
        vaultIv: body.vaultIv,
        vaultData: body.encryptedVaultData,
        passwordHash: body.passwordHash,
      });
      if (!vaultResult.ok) {
        throw new HTTPException(500, {
          message: "failed to initialize vault",
        });
      }
      const vault = vaultResult.data;

      if (vault.notionPageId) {
        const notion = new Notion(c);
        const result = await notion.AppendEmbeddedBlock(vault.notionPageId, id);
        if (!result.ok) {
          console.error("failed to append vault to notion:", result.error);
          throw new HTTPException(500, {
            message: result.error.message,
          });
        }
      }

      return c.body(null, 204);
    },
  )

  .delete("/:vaultId", async (c) => {
    const vaultId = c.req.param("vaultId");
    if (!vaultId) {
      throw new HTTPException(400, { message: "invalid or missing vaultId" });
    }
    const result = await c.var.db.deleteVault(c.var.session.userId, vaultId);
    if (!result.ok) {
      throw new HTTPException(500, { message: result.error.message });
    }
    if (!result.data.success) {
      throw new HTTPException(404, { message: "vault does not exist" });
    }

    return c.body(null, 204);
  });

const n = factory.createApp();

const notionRoutes = n
  .get("/", async (c) => {
    const notion = new Notion(c);
    const result = await notion.ReadPages();
    if (!result.ok) {
      console.error("failed to read pages from notion:", result.error);
      throw new HTTPException(500, { message: result.error.message });
    }

    return c.json(result.data);
  })

  .post("/", zValidator("json", z.array(PageSchema)), async (c) => {
    const notionPages = c.req.valid("json");

    const numVaults = await readNumberOfVaults(c);
    if (numVaults + notionPages.length >= c.env.MAX_PAGES) {
      throw new HTTPException(403, {
        message: "request exceeds max number of vaults",
      });
    }

    const createVaultPromises = notionPages.map(async (notionPage) => {
      const vault = await c.var.db.createVault({
        userId: c.var.session.userId,
        notionPageId: notionPage.id,
        name: notionPage.name,
      });

      if (!vault.ok) {
        throw new Error("Failed to create vault");
      }

      return vault;
    });
    try {
      await Promise.all(createVaultPromises);
    } catch (error) {
      throw new HTTPException(500, {
        message: "Failed to create one or more vaults",
      });
    }

    return c.body(null, 201);
  })

  .post("/:vaultId/:pageId", async (c) => {
    const vaultId = c.req.param("vaultId");
    const pageId = c.req.param("pageId");
    if (!vaultId || !pageId) {
      throw new HTTPException(400, {
        message: "missing a required parameter (vaultId, pageId)",
      });
    }
    const notion = new Notion(c);
    const result = await notion.AppendEmbeddedBlock(pageId, vaultId);
    if (!result.ok) {
      console.error("failed to append vault to notion:", result.error);
      throw new HTTPException(500, { message: result.error.message });
    }

    return c.body(null, 201);
  });

// Endpoints only visible for the user regarding vaults
// Other endpoints are available for anyone with the password
const u = factory.createApp();

const users = u.route("/vaults", vaults).route("/notion", notionRoutes);

export const userRouter = users;
