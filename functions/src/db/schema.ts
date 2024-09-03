import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { createId } from "shared/lib/createId";

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
    notionPageId: text("notion_page_id").unique(),

    // added during initialization
    encryptedVaultData: text("encrypted_vault_data"),
    hdkfSalt: text("hdkf_salt"),
    // vaultSalt: text("vault_salt").$type<Uint8Array>(),
    vaultIv: text("vault_iv"),

    passwordHash: text("password_hash"),
    // passwordSalt: blob("password_salt").$type<Uint8Array>(),
  },
  (table) => {
    return {
      userIdIndex: index("vault_userId_idx").on(table.name),
    };
  },
);

export type InsertVault = typeof vaultsTable.$inferInsert;
export type SelectVault = typeof vaultsTable.$inferSelect;
