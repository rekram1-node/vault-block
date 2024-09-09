import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { createId } from "shared/lib/createId";
import { type JSONContent } from "novel";

export const usersTable = sqliteTable("users", {
  id: text("id").unique().primaryKey().notNull(),
  created_at: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updated_at: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

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
    vaultData: text("vault_data", { mode: "json" }).$type<JSONContent>(),
    hdkfSalt: text("hdkf_salt"),
    vaultIv: text("vault_iv"),

    passwordHash: text("password_hash"),
  },
  (table) => {
    return {
      userIdIndex: index("vault_userId_idx").on(table.userId),
    };
  },
);

export type InsertVault = typeof vaultsTable.$inferInsert;
export type SelectVault = typeof vaultsTable.$inferSelect;
