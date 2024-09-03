import { z } from "zod";

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
  encryptedVaultData: z.string(),
  hdkfSalt: z.string().base64(),
  // vaultSalt: z.instanceof(Uint8Array),
  vaultIv: z.string().base64(),
  passwordHash: z.string().base64(),
  // passwordSalt: z.instanceof(Uint8Array),
});
