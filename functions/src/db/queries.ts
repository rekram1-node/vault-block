import { type drizzle } from "drizzle-orm/libsql";
import { and, count, desc, eq } from "drizzle-orm";
import {
  type InsertVault,
  type InsertUser,
  vaultsTable,
  usersTable,
} from "./schema";
import { type JSONContent } from "novel";

// TODO: refactor this to be more professional

type DbType = ReturnType<typeof drizzle>;

export class Queries {
  db: DbType;

  constructor(db: DbType) {
    this.db = db;
  }

  async createUser(data: InsertUser) {
    return getFirstElement(this.db.insert(usersTable).values(data).returning());
  }

  async readUser(id: string) {
    return getFirstElement(
      this.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(vaultsTable.id, id)),
    );
  }

  async createVault(data: InsertVault) {
    return getFirstElement(
      this.db.insert(vaultsTable).values(data).returning(),
    );
  }

  async activateVault(id: string, data: InitializeData) {
    return getFirstElement(
      this.db
        .update(vaultsTable)
        .set({
          hdkfSalt: data.hdkfSalt,
          vaultIv: data.vaultIv,
          vaultData: data.vaultData,
          passwordHash: data.passwordHash,
        })
        .where(eq(vaultsTable.id, id))
        .returning(),
    );
  }

  async readAllVaults(userId: string) {
    return this.db
      .select({
        id: vaultsTable.id,
        name: vaultsTable.name,
        notionPageId: vaultsTable.notionPageId,
        updatedAt: vaultsTable.updated_at,
        hdkfSalt: vaultsTable.hdkfSalt,
      })
      .from(vaultsTable)
      .where(eq(vaultsTable.userId, userId))
      .orderBy(desc(vaultsTable.updated_at));
  }

  async readNumberOfVaults(userId: string) {
    const result = await getFirstElement(
      this.db
        .select({
          value: count(),
        })
        .from(vaultsTable)
        .where(eq(vaultsTable.userId, userId)),
    );
    return result?.value ?? 0;
  }

  async readVault(id: string) {
    return getFirstElement(
      this.db
        .select({
          name: vaultsTable.name,
          passwordHash: vaultsTable.passwordHash,

          vaultData: vaultsTable.vaultData,
          vaultIv: vaultsTable.vaultIv,
          hdkfSalt: vaultsTable.hdkfSalt,
        })
        .from(vaultsTable)
        .where(eq(vaultsTable.id, id)),
    );
  }

  async readVaultData(id: string) {
    return getFirstElement(
      this.db
        .select({
          vaultData: vaultsTable.vaultData,
        })
        .from(vaultsTable)
        .where(eq(vaultsTable.id, id)),
    );
  }

  async deleteVault(userId: string, id: string) {
    return this.db
      .delete(vaultsTable)
      .where(and(eq(vaultsTable.id, id), eq(vaultsTable.userId, userId)));
  }

  async updateVault(id: string, data: JSONContent) {
    return this.db
      .update(vaultsTable)
      .set({
        vaultData: data,
      })
      .where(eq(vaultsTable.id, id));
  }
}

interface InitializeData {
  hdkfSalt: string;
  vaultIv: string;
  vaultData: JSONContent;
  passwordHash: string;
}

async function getFirstElement<T>(array: Promise<T[]>): Promise<T | undefined> {
  return array.then((result) => result?.[0]);
}
