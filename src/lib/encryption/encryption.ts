import { randomBytes, createCipheriv, createDecipheriv, subtle } from "crypto";
import * as argon2 from "argon2-browser";

export function createSalt(size = 16) {
  return randomBytes(size);
}

export async function deriveMasterKey(masterPassword: string, vaultId: string) {
  const result = await argon2.hash({
    pass: masterPassword,
    salt: vaultId,
    time: 2,
    mem: 2 ** 17,
    parallelism: 1,
    hashLen: 32,
    type: argon2.ArgonType.Argon2id,
  });
  return result.hash;
}

export async function deriveMasterPasswordHash(
  masterPassword: string,
  masterKey: Uint8Array,
) {
  const result = await argon2.hash({
    pass: masterPassword,
    salt: masterKey,
    time: 2,
    mem: 2 ** 17,
    parallelism: 1,
    hashLen: 32,
    type: argon2.ArgonType.Argon2id,
  });
  return result.hash;
}

export async function deriveStretchedMasterKey(masterKey: Uint8Array) {
  const keyMaterial = await subtle.importKey(
    "raw",
    masterKey,
    { name: "HKDF" },
    false,
    ["deriveBits"],
  );

  const rawKey = await subtle.deriveBits(
    {
      name: "HKDF",
      salt: createSalt(),
      hash: "SHA-256",
      info: new Uint8Array(),
    },
    keyMaterial,
    256, // 32 byte
  );

  return new Uint8Array(rawKey);
}

export async function encryptData(data: string, iv: Buffer, key: Uint8Array) {
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = cipher.update(data, "utf8", "hex");

  return encrypted;
}

export async function decryptData(
  encryptedData: string,
  iv: Buffer,
  key: Uint8Array,
) {
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  const decrypted = decipher.update(encryptedData, "hex", "utf8");

  return decrypted;
}
