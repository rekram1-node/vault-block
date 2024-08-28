/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const argon2 = require("argon2-browser");

export const createSalt = () => {
  return randomBytes(16);
};

interface Argon2HashResult {
  hash: Buffer;
  hashHex: string;
  encoded: string;
}

export const deriveDocumentKey = async (
  password: string,
  salt: Buffer | string,
) => {
  const saltBuffer =
    typeof salt === "string" ? Buffer.from(salt, "base64") : salt;
  const hashResult = (await argon2.hash({
    pass: password,
    salt: saltBuffer,
    time: 2,
    mem: 2 ** 17,
    parallelism: 1,
    hashLen: 32,
    type: argon2.ArgonType.Argon2id,
  })) as Argon2HashResult;

  return hashResult?.hash;
};

export const hashPassword = async (password: string, salt: Buffer | string) => {
  const saltBuffer =
    typeof salt === "string" ? Buffer.from(salt, "base64") : salt;
  const hashResult = (await argon2.hash({
    pass: password,
    salt: saltBuffer,
    time: 2,
    mem: 2 ** 17,
    parallelism: 1,
    hashLen: 32,
    type: argon2.ArgonType.Argon2id,
  })) as Argon2HashResult;

  return hashResult?.encoded;
};

export const encryptData = async (
  data: string,
  iv: Buffer | string,
  key: Buffer | string,
) => {
  const ivBuffer = typeof iv === "string" ? Buffer.from(iv, "base64") : iv;
  const keyBuffer = typeof key === "string" ? Buffer.from(key, "base64") : key;
  const cipher = createCipheriv("aes-256-cbc", keyBuffer, ivBuffer);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};

export const decryptData = async (
  encryptedData: string,
  iv: Buffer | string,
  key: Buffer | string,
) => {
  const ivBuffer = typeof iv === "string" ? Buffer.from(iv, "base64") : iv;
  const keyBuffer = typeof key === "string" ? Buffer.from(key, "base64") : key;
  const decipher = createDecipheriv("aes-256-cbc", keyBuffer, ivBuffer);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
