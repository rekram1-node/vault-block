import {
  deriveMasterKey,
  deriveMasterPasswordHash,
} from "~/lib/encryption/encryption";

export interface WorkerInput {
  password: string;
  vaultId: string;
}

export interface WorkerOutput {
  masterKey: Uint8Array;
  masterPasswordHash: Uint8Array;
  error?: never;
}

self.onmessage = async (event: MessageEvent<WorkerInput>) => {
  const { password, vaultId } = event.data;
  const masterKey = await deriveMasterKey(password, vaultId);
  const masterPasswordHash = await deriveMasterPasswordHash(
    password,
    masterKey,
  );

  const message: WorkerOutput = { masterKey, masterPasswordHash };

  self.postMessage(message);
};
