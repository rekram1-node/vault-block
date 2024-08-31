import argon2 from "argon2";

export async function hashPassword(password: string, salt: Buffer) {
  const hashedPassword = await argon2.hash(password, {
    type: 2,
    salt,
    timeCost: 2,
    memoryCost: 2 ** 17,
    hashLength: 32,
    parallelism: 1,
  });

  return hashedPassword;
}
