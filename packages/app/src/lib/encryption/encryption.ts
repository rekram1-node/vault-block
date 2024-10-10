import argon2 from "argon2-browser/dist/argon2-bundled.min.js";

export function createSalt(size = 16) {
  return crypto.getRandomValues(new Uint8Array(size));
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

export async function deriveStretchedMasterKey(
  masterKey: Uint8Array,
  hdkfSalt: Uint8Array,
) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    masterKey,
    { name: "HKDF" },
    false,
    ["deriveBits"],
  );

  const rawKey = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      salt: hdkfSalt,
      hash: "SHA-256",
      info: new Uint8Array(),
    },
    keyMaterial,
    256,
  );

  return new Uint8Array(rawKey);
}

export async function encryptData(
  data: string,
  iv: Uint8Array,
  key: Uint8Array,
) {
  const encoded = new TextEncoder().encode(data);
  const secret = await crypto.subtle.importKey(
    "raw",
    key,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    secret,
    encoded,
  );

  return Uint8ArrayToBase64(new Uint8Array(ciphertext));
  // return Buffer.from(ciphertext).toString("base64");
  // const cipher = createCipheriv("aes-256-gcm", key, iv);
  // const encrypted = cipher.update(data, "utf8", "hex");
  // return encrypted
}

export async function decryptData(
  encryptedData: string,
  iv: Uint8Array,
  key: Uint8Array,
) {
  const secretKey = await crypto.subtle.importKey(
    "raw",
    key,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  const ciphertext = Base64ToUint8Array(encryptedData);

  const cleartext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    secretKey,
    ciphertext,
  );

  return new TextDecoder().decode(cleartext);
  // const decipher = createDecipheriv("aes-256-gcm", key, iv);
  // const decrypted = decipher.update(encryptedData, "hex", "utf8");
  // return decrypted;
}

export function Uint8ArrayToBase64(a: Uint8Array) {
  return btoa(String.fromCharCode(...a));
}

export function Base64ToUint8Array(s: string) {
  const binaryString = atob(s);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
