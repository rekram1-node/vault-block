import { type JSONContent } from "novel";
import { z } from "zod";

const jsonContentSchema: z.ZodSchema<JSONContent> = z.lazy(() =>
  z.record(z.any()).and(
    z.object({
      type: z.string().optional(),
      attrs: z.record(z.any()).optional(),
      content: z.array(jsonContentSchema).optional(),
      marks: z
        .array(
          z.record(z.any()).and(
            z.object({
              type: z.string(),
              attrs: z.record(z.any()).optional(),
            }),
          ),
        )
        .optional(),
      text: z.string().optional(),
    }),
  ),
);

export const VaultSchema = z.object({
  // Automatically created upon insertion
  id: z.string().cuid2(),
  createdAt: z.string().time(),
  updatedAt: z.string().time(),

  // Required Fields
  userId: z.string(),
  name: z.string().min(1).max(280),
  notionPageId: z.string(),

  // Fields added when Vault is initialized
  encryptedVaultData: jsonContentSchema,
  hdkfSalt: z.string().base64(),
  vaultIv: z.string().base64(),
  passwordHash: z.string().base64(),
});

export const VaultIdSchema = z.object({
  vaultId: VaultSchema._def.shape().id,
});
