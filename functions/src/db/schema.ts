import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  blob,
  index,
} from "drizzle-orm/sqlite-core";
import { init } from "@paralleldrive/cuid2";

const createId = init({
  length: 32,
});

export const encryptedDocumentsTable = sqliteTable(
  "encrypted_documents",
  {
    // automatically created
    id: text("id")
      .unique()
      .primaryKey()
      .$defaultFn(() => createId()),
    created_at: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$onUpdate(() => new Date()),

    // required fields
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    notionPageId: text("notion_page_id").unique().notNull(),

    // added during initialization
    encryptedContent: blob("encrypted_content").$type<Buffer>(),
    passwordHash: text("password_hash"),
    serverSidePasswordSalt: blob("serverside_password_salt").$type<Buffer>(),
    documentSalt: text("document_salt"),
    iv: text("iv"),
    passwordSalt: text("password_salt"),
  },
  (table) => {
    return {
      userIdIndex: index("encrypted_document_userId_idx").on(table.name),
    };
  },
);

export type InsertEncryptedDocument =
  typeof encryptedDocumentsTable.$inferInsert;
export type SelectEncryptedDocument =
  typeof encryptedDocumentsTable.$inferSelect;
