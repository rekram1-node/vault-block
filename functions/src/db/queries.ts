import { and, count, desc, eq } from "drizzle-orm";
import { type DbType } from "./db";
import {
  type InsertEncryptedDocument,
  encryptedDocumentsTable,
} from "./schema";

export class Queries {
  db: DbType;

  constructor(db: DbType) {
    this.db = db;
  }

  async createEncryptedDocument(data: InsertEncryptedDocument) {
    return getFirstElement(
      this.db.insert(encryptedDocumentsTable).values(data).returning(),
    );
  }

  async activateEncryptedDocument(id: string, data: InitializeData) {
    return getFirstElement(
      this.db
        .update(encryptedDocumentsTable)
        .set({
          encryptedContent: Buffer.from(data.encryptedContent, "base64"),
          passwordHash: data.passwordHash,
          passwordSalt: data.passwordSalt,
          serverSidePasswordSalt: data.serverSidePasswordSalt,
          iv: data.iv,
          documentSalt: data.documentSalt,
        })
        .where(eq(encryptedDocumentsTable.id, id))
        .returning(),
    );
  }

  async readAllEncryptedDocuments(userId: string) {
    return this.db
      .select({
        id: encryptedDocumentsTable.id,
        name: encryptedDocumentsTable.name,
        notionPageId: encryptedDocumentsTable.notionPageId,
      })
      .from(encryptedDocumentsTable)
      .where(eq(encryptedDocumentsTable.userId, userId))
      .orderBy(desc(encryptedDocumentsTable.updated_at));
  }

  async readNumberOfEncryptedDocuments(userId: string) {
    const result = await getFirstElement(
      this.db
        .select({
          value: count(),
        })
        .from(encryptedDocumentsTable)
        .where(eq(encryptedDocumentsTable.userId, userId)),
    );
    return result?.value ?? 0;
  }

  async readPasswordSalt(id: string) {
    return getFirstElement(
      this.db
        .select({
          passwordSalt: encryptedDocumentsTable.passwordSalt,
        })
        .from(encryptedDocumentsTable)
        .where(eq(encryptedDocumentsTable.id, id)),
    );
  }

  async readEncryptedDocument(id: string) {
    return getFirstElement(
      this.db
        .select({
          name: encryptedDocumentsTable.name,
          passwordHash: encryptedDocumentsTable.passwordHash,
          encryptedContent: encryptedDocumentsTable.encryptedContent,
          iv: encryptedDocumentsTable.iv,
          documentSalt: encryptedDocumentsTable.documentSalt,
          serverSidePasswordSalt:
            encryptedDocumentsTable.serverSidePasswordSalt,
        })
        .from(encryptedDocumentsTable)
        .where(eq(encryptedDocumentsTable.id, id)),
    );
  }

  async deleteEncryptedDocument(userId: string, id: string) {
    return this.db
      .delete(encryptedDocumentsTable)
      .where(
        and(
          eq(encryptedDocumentsTable.id, id),
          eq(encryptedDocumentsTable.userId, userId),
        ),
      );
  }

  async updateEncryptedDocument(id: string, encryptedContent: Buffer) {
    return this.db
      .update(encryptedDocumentsTable)
      .set({
        encryptedContent: encryptedContent,
      })
      .where(eq(encryptedDocumentsTable.id, id));
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
