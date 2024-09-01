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

export const vaultsTable = sqliteTable(
  "vaults",
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
    encryptedVaultData: text("encrypted_vault_data"),
    vaultSalt: blob("vault_salt").$type<Buffer>(),
    vaultIv: blob("vault_iv").$type<Buffer>(),

    passwordHash: blob("password_hash").$type<Buffer>(),
    passwordSalt: blob("password_salt").$type<Buffer>(),
  },
  (table) => {
    return {
      userIdIndex: index("encrypted_document_userId_idx").on(table.name),
    };
  },
);

export type InsertVault = typeof vaultsTable.$inferInsert;
export type SelectVault = typeof vaultsTable.$inferSelect;
