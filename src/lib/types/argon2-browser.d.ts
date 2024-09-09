// This is necessary so that we can have typesafety when utilizing argon2id
// Check node_modules/argon2-browser/lib/argon2.js if anything changes...

declare module "argon2-browser/dist/argon2-bundled.min.js" {
  export enum ArgonType {
    Argon2d = 0,
    Argon2i = 1,
    Argon2id = 2,
  }

  const argon2: {
    ArgonType: typeof ArgonType;
    hash: (options: {
      pass: string;
      salt: Uint8Array | string;
      time?: number;
      mem?: number;
      hashLen?: number;
      parallelism?: number;
      type?: ArgonType;
      version?: number;
    }) => Promise<{ encoded: string; hash: Uint8Array }>;
    verify: (encoded: string, pass: string) => Promise<boolean>;
  };
  export default argon2;
}
