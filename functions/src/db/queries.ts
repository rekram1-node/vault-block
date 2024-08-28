import { type drizzle } from "drizzle-orm/libsql";
import { and, count, desc, eq } from "drizzle-orm";
import { type InsertVault, vaultsTable } from "./schema";

type DbType = ReturnType<typeof drizzle>;

export class Queries {
  db: DbType;

  constructor(db: DbType) {
    this.db = db;
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
          encryptedContent: Buffer.from(data.encryptedContent, "base64"),
          passwordHash: data.passwordHash,
          passwordSalt: data.passwordSalt,
          serverSidePasswordSalt: data.serverSidePasswordSalt,
          iv: data.iv,
          documentSalt: data.documentSalt,
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

  async readPasswordSalt(id: string) {
    return getFirstElement(
      this.db
        .select({
          passwordSalt: vaultsTable.passwordSalt,
        })
        .from(vaultsTable)
        .where(eq(vaultsTable.id, id)),
    );
  }

  async readVault(id: string) {
    return getFirstElement(
      this.db
        .select({
          name: vaultsTable.name,
          passwordHash: vaultsTable.passwordHash,
          encryptedContent: vaultsTable.encryptedContent,
          iv: vaultsTable.iv,
          documentSalt: vaultsTable.documentSalt,
          serverSidePasswordSalt: vaultsTable.serverSidePasswordSalt,
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

  async updateVault(id: string, encryptedContent: Buffer) {
    return this.db
      .update(vaultsTable)
      .set({
        encryptedContent: encryptedContent,
      })
      .where(eq(vaultsTable.id, id));
  }
}

interface InitializeData {
  encryptedContent: string;
  passwordHash: string;
  passwordSalt: string;
  serverSidePasswordSalt: Buffer;
  iv: string;
  documentSalt: string;
}

async function getFirstElement<T>(array: Promise<T[]>): Promise<T | undefined> {
  return array.then((result) => result?.[0]);
}
