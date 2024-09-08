// need to do relative import for vite build to work
// there is prolly a cleaner fix, not worth looking into atm
// See here: https://github.com/vitejs/vite/issues/15242
import {
  deriveMasterKey,
  deriveMasterPasswordHash,
  deriveStretchedMasterKey,
} from "../encryption/encryption";

export interface PasswordBasedInput {
  password: string;
  vaultId: string;
  hdkfSalt?: Uint8Array;
}

export interface MasterKeyBasedInput {
  masterKey: Uint8Array;
  hdkfSalt: Uint8Array;
}

export type WorkerInput = PasswordBasedInput | MasterKeyBasedInput;

export interface WorkerOutput {
  masterKey?: Uint8Array;
  masterPasswordHash?: Uint8Array;
  stretchedMasterKey?: Uint8Array;
  error?: never;
}

self.onmessage = async (event: MessageEvent<WorkerInput>) => {
  if ("password" in event.data && "vaultId" in event.data) {
    const { password, vaultId, hdkfSalt } = event.data;
    const masterKey = await deriveMasterKey(password, vaultId);
    const masterPasswordHash = await deriveMasterPasswordHash(
      password,
      masterKey,
    );

    const message: WorkerOutput = { masterKey, masterPasswordHash };

    if (hdkfSalt) {
      const stretchedMasterKey = await deriveStretchedMasterKey(
        masterKey,
        hdkfSalt,
      );
      message.stretchedMasterKey = stretchedMasterKey;
    }

    self.postMessage(message);
    return;
  }

  if ("masterKey" in event.data && "hdkfSalt" in event.data) {
    const { masterKey, hdkfSalt } = event.data;
    const stretchedMasterKey = await deriveStretchedMasterKey(
      masterKey,
      hdkfSalt,
    );

    const message: WorkerOutput = { stretchedMasterKey };
    self.postMessage(message);
  }
};
