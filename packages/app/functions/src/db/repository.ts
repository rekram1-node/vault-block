import { type drizzle } from "drizzle-orm/d1";
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
      const err = JSON.stringify(e);
      console.error(`Failed to create user: ${err}`);
      return Err(new Error(`failed to create user: ${err}`, { cause: e }));
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
      console.error(`Failed to read user with ID ${id}:`, e);
      return Err(new Error(`Failed to read user with ID ${id}`, { cause: e }));
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
      const err = JSON.stringify(e);
      console.error(`Failed to create vault: ${err}`);
      return Err(new Error(`failed to create vault: ${err}`, { cause: e }));
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
      const err = JSON.stringify(e);
      console.error(`Failed to activate vault: ${err}`);
      return Err(new Error(`failed to activate vault: ${err}`, { cause: e }));
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
      const err = JSON.stringify(e);
      console.error(`Failed to read vaults: ${err}`);
      return Err(new Error(`failed to read vaults: ${err}`, { cause: e }));
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
      const err = JSON.stringify(e);
      console.error(`Failed to read number of vaults: ${err}`);
      return Err(
        new Error(`failed to read number of vaults: ${err}`, { cause: e }),
      );
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
      const err = JSON.stringify(e);
      console.error(`Failed to read vault ${err}`);
      return Err(new Error(`failed to read vault: ${err}`, { cause: e }));
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
      const err = JSON.stringify(e);
      console.error(`Failed to read vault data ${err}`);
      return Err(
        new Error(`failed to read vault data: ${err}`, {
          cause: e,
        }),
      );
    }
  }

  async deleteVault(userId: string, id: string) {
    try {
      const result = await this.db
        .delete(vaultsTable)
        .where(and(eq(vaultsTable.id, id), eq(vaultsTable.userId, userId)));
      return Ok(result);
    } catch (e) {
      const err = JSON.stringify(e);
      console.error(`Failed to delete vault ${err}`);
      return Err(new Error(`failed to delete vault: ${err}`, { cause: e }));
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
      const err = JSON.stringify(e);
      console.error(`Failed to update vault ${err}`);
      return Err(new Error(`failed to update vault: ${err}`, { cause: e }));
    }
  }
}

interface InitializeData {
  hdkfSalt: string;
  vaultIv: string;
  vaultData: JSONContent;
  passwordHash: string;
}
