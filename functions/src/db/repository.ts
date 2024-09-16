import { type drizzle } from "drizzle-orm/libsql";
import { and, count, desc, eq } from "drizzle-orm";
import { type JSONContent } from "novel";

import {
  type InsertVault,
  type InsertUser,
  vaultsTable,
  usersTable,
} from "./schema";
import { Ok, Err } from "shared/types/result";

type DbType = ReturnType<typeof drizzle>;

export class VaultNotFoundError extends Error {
  constructor(message = "Vault does not exist") {
    super(message);
    this.name = "VaultNotFoundError";
  }
}

export class Repository {
  db: DbType;

  constructor(db: DbType) {
    this.db = db;
  }

  async createUser(data: InsertUser) {
    try {
      const result = await this.db
        .insert(usersTable)
        .values(data)
        .returning()
        .get();
      return Ok(result);
    } catch (e) {
      console.error(`Failed to create user: ${JSON.stringify(e)}`);
      return Err(new Error("failed to create user", { cause: e }));
    }
  }

  async readUser(id: string) {
    try {
      const result = await this.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .get();
      return Ok(result);
    } catch (e) {
      console.error(`Failed to read user: ${JSON.stringify(e)}`);
      return Err(new Error("failed to read user", { cause: e }));
    }
  }

  async createVault(data: InsertVault) {
    try {
      const result = await this.db
        .insert(vaultsTable)
        .values(data)
        .returning()
        .get();
      return Ok(result);
    } catch (e) {
      console.error(`Failed to create vault: ${JSON.stringify(e)}`);
      return Err(new Error("failed to create vault", { cause: e }));
    }
  }

  async activateVault(id: string, data: InitializeData) {
    try {
      const result = await this.db
        .update(vaultsTable)
        .set({
          hdkfSalt: data.hdkfSalt,
          vaultIv: data.vaultIv,
          vaultData: data.vaultData,
          passwordHash: data.passwordHash,
        })
        .where(eq(vaultsTable.id, id))
        .returning()
        .get();
      return Ok(result);
    } catch (e) {
      console.error(`Failed to activate vault: ${JSON.stringify(e)}`);
      return Err(new Error("failed to activate vault", { cause: e }));
    }
  }

  async readAllVaults(userId: string) {
    try {
      const result = await this.db
        .select({
          id: vaultsTable.id,
          name: vaultsTable.name,
          notionPageId: vaultsTable.notionPageId,
          updatedAt: vaultsTable.updated_at,
          hdkfSalt: vaultsTable.hdkfSalt,
        })
        .from(vaultsTable)
        .where(eq(vaultsTable.userId, userId))
        .orderBy(desc(vaultsTable.updated_at))
        .all();
      return Ok(result);
    } catch (e) {
      console.error(`Failed to read vaults: ${JSON.stringify(e)}`);
      return Err(new Error("failed to read vaults", { cause: e }));
    }
  }

  async readNumberOfVaults(userId: string) {
    try {
      const result = await this.db
        .select({
          value: count(),
        })
        .from(vaultsTable)
        .where(eq(vaultsTable.userId, userId))
        .get();

      return Ok(result?.value ?? 0);
    } catch (e) {
      console.error(`Failed to read number of vaults: ${JSON.stringify(e)}`);
      return Err(new Error("failed to read number of vaults", { cause: e }));
    }
  }

  async readVault(id: string) {
    try {
      const result = await this.db
        .select({
          name: vaultsTable.name,
          passwordHash: vaultsTable.passwordHash,

          vaultData: vaultsTable.vaultData,
          vaultIv: vaultsTable.vaultIv,
          hdkfSalt: vaultsTable.hdkfSalt,
        })
        .from(vaultsTable)
        .where(eq(vaultsTable.id, id))
        .get();
      if (!result) throw new VaultNotFoundError();

      return Ok(result);
    } catch (e) {
      console.error(`Failed to read vault ${JSON.stringify(e)}`);
      return Err(new Error("failed to read vault", { cause: e }));
    }
  }

  async readVaultData(id: string) {
    try {
      const result = await this.db
        .select({
          vaultData: vaultsTable.vaultData,
        })
        .from(vaultsTable)
        .where(eq(vaultsTable.id, id))
        .get();
      if (!result) throw new VaultNotFoundError();
      return Ok(result);
    } catch (e) {
      console.error(`Failed to read vault data ${JSON.stringify(e)}`);
      return Err(new Error("failed to read vault data", { cause: e }));
    }
  }

  async deleteVault(userId: string, id: string) {
    try {
      const result = await this.db
        .delete(vaultsTable)
        .where(and(eq(vaultsTable.id, id), eq(vaultsTable.userId, userId)));
      return Ok(result);
    } catch (e) {
      console.error(`Failed to delete vault ${JSON.stringify(e)}`);
      return Err(new Error("failed to delete vault", { cause: e }));
    }
  }

  async updateVault(id: string, data: JSONContent) {
    try {
      const result = await this.db
        .update(vaultsTable)
        .set({
          vaultData: data,
        })
        .where(eq(vaultsTable.id, id));
      return Ok(result);
    } catch (e) {
      console.error(`Failed to update vault ${JSON.stringify(e)}`);
      return Err(new Error("failed to update vault", { cause: e }));
    }
  }
}

interface InitializeData {
  hdkfSalt: string;
  vaultIv: string;
  vaultData: JSONContent;
  passwordHash: string;
}
